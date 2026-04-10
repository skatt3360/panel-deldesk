import { create } from 'zustand';
import { ref, set, update, get } from 'firebase/database';
import { db } from '../firebase';
import { suggestCategory, detectSupportTier } from '../utils/autoCategory';

// ── Keywords that signal a helpdesk-relevant email ─────────────────────────
const HELPDESK_SUBJECT_KEYWORDS = [
  // Polish
  'zgłoszenie', 'problem', 'awaria', 'nie działa', 'błąd', 'usterka',
  'prośba', 'pomoc', 'wsparcie', 'naprawa', 'helpdesk', 'serwis',
  'dostęp', 'hasło', 'reset', 'instalacja', 'konfiguracja',
  'komputer', 'drukarka', 'sieć', 'internet', 'wifi', 'serwer',
  'usos', 'system', 'oprogramowanie', 'licencja', 'konto',
  'ticket', 'zgłoszono', 'usterka sprzętu', 'zepsuty', 'wymiana',
  // English (some CDV staff may write in English)
  'issue', 'request', 'support', 'broken', 'error', 'fix', 'help',
  'cannot', 'access', 'password', 'install',
];

// Gmail query — helpdesk-related subjects
const HELPDESK_QUERY = HELPDESK_SUBJECT_KEYWORDS
  .slice(0, 20) // Gmail allows max ~20 OR terms in query
  .map((k) => `subject:${k}`)
  .join(' OR ');

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
  errorCode:       string | null;   // raw error code for debugging
  scanning:        boolean;         // true during full inbox scan
  recentImports:   ImportedTicketInfo[];

  startPolling:    (accessToken: string, uid: string) => void;
  stopPolling:     () => void;
  checkRecent:     (accessToken: string, uid: string) => Promise<number>;
  scanFullInbox:   (accessToken: string, uid: string) => Promise<number>;
  clearError:      () => void;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

// ── Helpers ────────────────────────────────────────────────────────────────

function decodeBase64Url(str: string): string {
  try {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return '';
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
  body?: { data?: string };
  parts?: GmailPayload[];
  headers?: { name: string; value: string }[];
}
interface GmailMessage { id: string; internalDate?: string; payload: GmailPayload; }

function extractPlainText(payload: GmailPayload): string {
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  for (const part of payload.parts ?? []) {
    const t = extractPlainText(part);
    if (t) return t;
  }
  return '';
}

/** True if subject contains any helpdesk keyword */
function isHelpdeskRelevant(subject: string, body: string): boolean {
  const text = `${subject} ${body}`.toLowerCase();
  return HELPDESK_SUBJECT_KEYWORDS.some((kw) => text.includes(kw));
}

async function gmailFetch(url: string, accessToken: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (res.status === 401) throw Object.assign(new Error('Token wygasł — zaloguj się ponownie przez Google'), { code: 'auth/token-expired' });
  if (res.status === 403) throw Object.assign(new Error('Brak uprawnień do Gmail. Zaloguj się ponownie przez Google i zezwól na dostęp do poczty.'), { code: 'auth/insufficient-scope' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw Object.assign(new Error(`Gmail API ${res.status}: ${body.slice(0, 120)}`), { code: `http/${res.status}` });
  }
  return res.json();
}

/** Fetch all message IDs matching query, following nextPageToken pagination */
async function fetchAllMessageIds(
  accessToken: string,
  query: string,
  maxTotal = 500,
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  while (ids.length < maxTotal) {
    const params = new URLSearchParams({ q: query, maxResults: '100' });
    if (pageToken) params.set('pageToken', pageToken);
    const data = await gmailFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
      accessToken,
    ) as { messages?: { id: string }[]; nextPageToken?: string };

    (data.messages ?? []).forEach((m) => ids.push(m.id));
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return ids;
}

/** Process a single message: parse, classify, create ticket if new */
async function processMessage(
  msgId: string,
  accessToken: string,
  uid: string,
  processedIds: Record<string, boolean>,
): Promise<ImportedTicketInfo | null> {
  if (processedIds[msgId]) return null;

  const msg = await gmailFetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
    accessToken,
  ) as GmailMessage;

  const headers   = msg.payload.headers ?? [];
  const from      = getHeader(headers, 'From');
  const subject   = getHeader(headers, 'Subject') || '(bez tematu)';
  const body      = extractPlainText(msg.payload).slice(0, 3000);

  // Skip if not helpdesk-related
  if (!isHelpdeskRelevant(subject, body)) return null;

  const { requesterName, requesterEmail } = parseFrom(from);
  const title       = subject.startsWith('[Email]') ? subject : `[Email] ${subject}`;
  const description = body || '(brak treści)';
  const category    = suggestCategory(title, description);
  const supportTier = detectSupportTier(title, description);

  // Use the email's own timestamp if available
  const emailDate   = msg.internalDate
    ? new Date(parseInt(msg.internalDate)).toISOString()
    : new Date().toISOString();

  const id  = `TKT-${Date.now().toString(36).toUpperCase()}-${msgId.slice(-4)}`;
  const now = new Date().toISOString();

  const ticket = {
    id, title, description, category,
    priority: 'medium', status: 'open',
    requesterName, requesterEmail,
    supportTier,
    createdAt: emailDate,
    updatedAt: now,
    source: 'email',
    gmailMsgId: msgId,
  };

  await set(ref(db, `tickets/${id}`), ticket);
  await update(ref(db, `gmail/processedIds/${uid}`), { [msgId]: true });

  return { id, title, requesterEmail, createdAt: emailDate };
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useGmailStore = create<GmailState>()((setState, getState) => {

  const checkRecent = async (accessToken: string, uid: string): Promise<number> => {
    setState({ error: null, errorCode: null });
    try {
      // Fetch emails from last 24 hours (unread OR read, all relevant)
      const query = `newer_than:1d (${HELPDESK_QUERY})`;
      const messageIds = await fetchAllMessageIds(accessToken, query, 100);
      if (messageIds.length === 0) {
        setState({ lastChecked: new Date().toISOString() });
        return 0;
      }

      const snap = await get(ref(db, `gmail/processedIds/${uid}`));
      const processedIds: Record<string, boolean> = snap.val() ?? {};

      const imports: ImportedTicketInfo[] = [];
      for (const msgId of messageIds) {
        const info = await processMessage(msgId, accessToken, uid, processedIds);
        if (info) {
          imports.push(info);
          processedIds[msgId] = true; // avoid re-check within same batch
        }
      }

      const prev = getState().ticketsCreated;
      setState({
        lastChecked: new Date().toISOString(),
        ticketsCreated: prev + imports.length,
        recentImports: [...imports, ...getState().recentImports].slice(0, 20),
      });
      return imports.length;
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      setState({
        error: e.message ?? 'Nieznany błąd Gmail',
        errorCode: e.code ?? null,
        lastChecked: new Date().toISOString(),
      });
      return 0;
    }
  };

  const scanFullInbox = async (accessToken: string, uid: string): Promise<number> => {
    setState({ scanning: true, error: null, errorCode: null });
    try {
      // Full scan: all time, helpdesk keywords, up to 500 messages
      const query = HELPDESK_QUERY;
      const messageIds = await fetchAllMessageIds(accessToken, query, 500);

      const snap = await get(ref(db, `gmail/processedIds/${uid}`));
      const processedIds: Record<string, boolean> = snap.val() ?? {};

      const imports: ImportedTicketInfo[] = [];
      for (const msgId of messageIds) {
        const info = await processMessage(msgId, accessToken, uid, processedIds);
        if (info) {
          imports.push(info);
          processedIds[msgId] = true;
        }
      }

      const prev = getState().ticketsCreated;
      setState({
        scanning: false,
        lastChecked: new Date().toISOString(),
        ticketsCreated: prev + imports.length,
        recentImports: [...imports, ...getState().recentImports].slice(0, 50),
      });
      return imports.length;
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      setState({
        scanning: false,
        error: e.message ?? 'Nieznany błąd Gmail',
        errorCode: e.code ?? null,
      });
      return 0;
    }
  };

  return {
    polling:        false,
    lastChecked:    null,
    ticketsCreated: 0,
    error:          null,
    errorCode:      null,
    scanning:       false,
    recentImports:  [],

    startPolling: (accessToken, uid) => {
      if (intervalId) clearInterval(intervalId);
      setState({ polling: true });
      // First run: check last 24h
      checkRecent(accessToken, uid);
      // Then every 5 minutes
      intervalId = setInterval(() => checkRecent(accessToken, uid), 300_000);
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
