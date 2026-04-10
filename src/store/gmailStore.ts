import { create } from 'zustand';
import { ref, set, update, get } from 'firebase/database';
import { db } from '../firebase';
import { suggestCategory, detectSupportTier } from '../utils/autoCategory';

// ── Broad helpdesk keyword filter ──────────────────────────────────────────
// Used ONLY after fetching to classify — not to filter API query
// We query broadly (all inbox) and filter client-side so we don't miss anything
const HELPDESK_KEYWORDS = [
  'zgłoszenie', 'problem', 'awaria', 'nie działa', 'błąd', 'usterka',
  'prośba', 'pomoc', 'wsparcie', 'naprawa', 'helpdesk', 'serwis',
  'dostęp', 'hasło', 'reset', 'instalacja', 'konfiguracja',
  'komputer', 'drukarka', 'sieć', 'internet', 'wifi', 'serwer',
  'usos', 'system', 'oprogramowanie', 'licencja', 'konto', 'ticket',
  'issue', 'request', 'support', 'broken', 'error', 'fix', 'help',
  'cannot', 'access', 'password', 'install', 'repair', 'fault',
];

function isHelpdeskRelevant(subject: string, body: string): boolean {
  const text = `${subject} ${body}`.toLowerCase();
  return HELPDESK_KEYWORDS.some((kw) => text.includes(kw));
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface ImportedTicketInfo {
  id: string;
  title: string;
  requesterEmail: string;
  createdAt: string;
}

interface GmailState {
  polling:         boolean;
  lastChecked:     string | null;
  ticketsCreated:  number;
  error:           string | null;
  errorCode:       string | null;
  scanning:        boolean;
  recentImports:   ImportedTicketInfo[];
  debugLog:        string[];   // last few API calls for diagnostics

  startPolling:  (accessToken: string, uid: string) => void;
  stopPolling:   () => void;
  checkRecent:   (accessToken: string, uid: string) => Promise<number>;
  scanFullInbox: (accessToken: string, uid: string) => Promise<number>;
  clearError:    () => void;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

// ── Helpers ────────────────────────────────────────────────────────────────
function decodeBase64Url(str: string): string {
  try {
    return decodeURIComponent(
      atob(str.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    try { return atob(str.replace(/-/g, '+').replace(/_/g, '/')); }
    catch { return ''; }
  }
}

function getHeader(headers: { name: string; value: string }[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function parseFrom(from: string): { requesterName: string; requesterEmail: string } {
  const match = from.match(/^"?([^"<]+?)"?\s*<([^>]+)>/);
  if (match) return { requesterName: match[1].trim(), requesterEmail: match[2].trim() };
  const emailOnly = from.trim();
  return { requesterName: emailOnly.split('@')[0] ?? emailOnly, requesterEmail: emailOnly };
}

interface GmailPayload {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPayload[];
  headers?: { name: string; value: string }[];
}
interface GmailMessage {
  id: string;
  internalDate?: string;
  payload: GmailPayload;
}
interface GmailListResponse {
  messages?: { id: string }[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

function extractText(payload: GmailPayload): string {
  // Prefer text/plain
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  // Recurse into parts
  for (const part of payload.parts ?? []) {
    const t = extractText(part);
    if (t) return t;
  }
  // Fallback: any part with body data
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  return '';
}

async function gmailFetch(url: string, token: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (res.status === 401) {
    const err = Object.assign(new Error('Token wygasł — kliknij "odśwież" i zaloguj się ponownie przez Google'), { code: 'auth/token-expired' });
    throw err;
  }
  if (res.status === 403) {
    const body = await res.text().catch(() => '');
    // Check if it's a scope issue
    const isScopeErr = body.includes('insufficient') || body.includes('scope') || body.includes('PERMISSION_DENIED');
    const err = Object.assign(
      new Error(isScopeErr
        ? 'Brak uprawnień do Gmail. Kliknij "odśwież token" i zaakceptuj dostęp do Gmail w oknie Google.'
        : `Gmail 403: ${body.slice(0, 100)}`),
      { code: isScopeErr ? 'auth/insufficient-scope' : 'http/403' }
    );
    throw err;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw Object.assign(new Error(`Gmail ${res.status}: ${body.slice(0, 150)}`), { code: `http/${res.status}` });
  }
  return res.json();
}

async function fetchMessageIds(token: string, query: string, maxTotal: number): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  while (ids.length < maxTotal) {
    const params = new URLSearchParams({ q: query, maxResults: String(Math.min(100, maxTotal - ids.length)) });
    if (pageToken) params.set('pageToken', pageToken);
    const data = await gmailFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
      token,
    ) as GmailListResponse;
    for (const m of data.messages ?? []) ids.push(m.id);
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return ids;
}

async function processMessage(
  msgId: string,
  token: string,
  uid: string,
  processedIds: Record<string, boolean>,
): Promise<ImportedTicketInfo | null> {
  if (processedIds[msgId]) return null;

  const msg = await gmailFetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
    token,
  ) as GmailMessage;

  const headers  = msg.payload.headers ?? [];
  const from     = getHeader(headers, 'From');
  const subject  = getHeader(headers, 'Subject') || '(bez tematu)';
  const body     = extractText(msg.payload).slice(0, 3000);

  if (!isHelpdeskRelevant(subject, body)) return null;

  const { requesterName, requesterEmail } = parseFrom(from);
  const title       = subject.startsWith('[Email]') ? subject : `[Email] ${subject}`;
  const description = body || '(brak treści)';
  const category    = suggestCategory(title, description);
  const supportTier = detectSupportTier(title, description);
  const emailDate   = msg.internalDate
    ? new Date(parseInt(msg.internalDate, 10)).toISOString()
    : new Date().toISOString();

  // unique ID: timestamp + last 6 chars of msgId
  const id  = `TKT-${Date.now().toString(36).toUpperCase().slice(-5)}-${msgId.slice(-6)}`;
  const now = new Date().toISOString();

  await set(ref(db, `tickets/${id}`), {
    id, title, description, category,
    priority: 'medium', status: 'open',
    requesterName, requesterEmail,
    supportTier, createdAt: emailDate, updatedAt: now,
    source: 'email', gmailMsgId: msgId,
  });
  await update(ref(db, `gmail/processedIds/${uid}`), { [msgId]: true });

  return { id, title, requesterEmail, createdAt: emailDate };
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useGmailStore = create<GmailState>()((setState, getState) => {

  const log = (msg: string) => {
    const entry = `[${new Date().toLocaleTimeString('pl-PL')}] ${msg}`;
    console.log('[Gmail]', msg);
    setState((s) => ({ debugLog: [entry, ...s.debugLog].slice(0, 10) }));
  };

  const runScan = async (
    token: string,
    uid: string,
    query: string,
    maxTotal: number,
    label: string,
  ): Promise<number> => {
    setState({ error: null, errorCode: null });
    log(`${label}: query="${query}" max=${maxTotal}`);
    try {
      const ids = await fetchMessageIds(token, query, maxTotal);
      log(`${label}: znaleziono ${ids.length} wiadomości`);

      if (ids.length === 0) {
        setState({ lastChecked: new Date().toISOString() });
        return 0;
      }

      const snap = await get(ref(db, `gmail/processedIds/${uid}`));
      const processedIds: Record<string, boolean> = snap.val() ?? {};
      const newIds = ids.filter((id) => !processedIds[id]);
      log(`${label}: ${newIds.length} nowych (nieprzetworzonych)`);

      const imports: ImportedTicketInfo[] = [];
      for (const msgId of newIds) {
        try {
          const info = await processMessage(msgId, token, uid, processedIds);
          if (info) {
            imports.push(info);
            processedIds[msgId] = true;
            log(`Zaimportowano: "${info.title}" od ${info.requesterEmail}`);
          } else {
            // mark as processed so we don't re-check it
            processedIds[msgId] = true;
          }
        } catch (e) {
          log(`Błąd wiadomości ${msgId}: ${(e as Error).message}`);
        }
      }

      const prev = getState().ticketsCreated;
      setState({
        lastChecked:    new Date().toISOString(),
        ticketsCreated: prev + imports.length,
        recentImports:  [...imports, ...getState().recentImports].slice(0, 50),
      });
      log(`${label}: zaimportowano ${imports.length} zgłoszeń`);
      return imports.length;
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      log(`${label} BŁĄD: ${e.message}`);
      setState({
        error:       e.message ?? 'Nieznany błąd Gmail',
        errorCode:   e.code ?? null,
        lastChecked: new Date().toISOString(),
        scanning:    false,
      });
      return 0;
    }
  };

  const checkRecent = async (token: string, uid: string): Promise<number> => {
    // Fetch last 7 days from inbox — broader than 1d to catch more
    return runScan(token, uid, 'in:inbox newer_than:7d', 200, 'checkRecent');
  };

  const scanFullInbox = async (token: string, uid: string): Promise<number> => {
    setState({ scanning: true });
    // All mail ever received, up to 500 messages
    const n = await runScan(token, uid, 'in:anywhere', 500, 'scanFullInbox');
    setState({ scanning: false });
    return n;
  };

  return {
    polling:        false,
    lastChecked:    null,
    ticketsCreated: 0,
    error:          null,
    errorCode:      null,
    scanning:       false,
    recentImports:  [],
    debugLog:       [],

    startPolling: (token, uid) => {
      if (intervalId) clearInterval(intervalId);
      setState({ polling: true });
      checkRecent(token, uid);
      intervalId = setInterval(() => checkRecent(token, uid), 300_000);
    },

    stopPolling: () => {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      setState({ polling: false });
    },

    checkRecent,
    scanFullInbox,
    clearError: () => setState({ error: null, errorCode: null }),
  };
});
