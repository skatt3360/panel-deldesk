import { create } from 'zustand';
import { ref, set, update, get } from 'firebase/database';
import { db } from '../firebase';
import { suggestCategory, detectSupportTier } from '../utils/autoCategory';

interface GmailState {
  polling: boolean;
  lastChecked: string | null;
  ticketsCreated: number;
  error: string | null;

  startPolling: (accessToken: string, uid: string) => void;
  stopPolling: () => void;
  checkNow: (accessToken: string, uid: string) => Promise<number>;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

function decodeBase64Url(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  } catch {
    return '';
  }
}

function getHeader(headers: { name: string; value: string }[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function parseFrom(from: string): { requesterName: string; requesterEmail: string } {
  const match = from.match(/^"?([^"<]+?)"?\s*<([^>]+)>/);
  if (match) {
    return { requesterName: match[1].trim(), requesterEmail: match[2].trim() };
  }
  const emailOnly = from.trim();
  return { requesterName: emailOnly.split('@')[0] ?? emailOnly, requesterEmail: emailOnly };
}

function extractPlainText(payload: GmailPayload): string {
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractPlainText(part);
      if (text) return text;
    }
  }
  return '';
}

interface GmailPayload {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPayload[];
  headers?: { name: string; value: string }[];
}

interface GmailMessage {
  id: string;
  payload: GmailPayload;
}

export const useGmailStore = create<GmailState>()((setState, getState) => {
  const checkNow = async (accessToken: string, uid: string): Promise<number> => {
    setState({ error: null });
    try {
      // Fetch unread inbox messages
      const listRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread+in:inbox&maxResults=25',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!listRes.ok) {
        const errText = await listRes.text();
        setState({ error: `Gmail API error: ${listRes.status}`, lastChecked: new Date().toISOString() });
        console.error('Gmail list error:', errText);
        return 0;
      }
      const listData = await listRes.json() as { messages?: { id: string }[] };
      const messages = listData.messages ?? [];

      if (messages.length === 0) {
        setState({ lastChecked: new Date().toISOString() });
        return 0;
      }

      // Load processed IDs from Firebase
      const processedSnap = await get(ref(db, `gmail/processedIds/${uid}`));
      const processedIds: Record<string, boolean> = processedSnap.val() ?? {};

      const newMessages = messages.filter((m) => !processedIds[m.id]);
      if (newMessages.length === 0) {
        setState({ lastChecked: new Date().toISOString() });
        return 0;
      }

      let created = 0;
      for (const { id: msgId } of newMessages) {
        try {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!msgRes.ok) continue;

          const msg = await msgRes.json() as GmailMessage;
          const headers = msg.payload.headers ?? [];

          const fromHeader = getHeader(headers, 'From');
          const subjectHeader = getHeader(headers, 'Subject');
          const { requesterName, requesterEmail } = parseFrom(fromHeader);

          const rawTitle = subjectHeader || '(bez tematu)';
          const title = rawTitle.startsWith('[Email]') ? rawTitle : `[Email] ${rawTitle}`;
          const description = extractPlainText(msg.payload).slice(0, 2000) || '(brak treści)';

          const category = suggestCategory(title, description);
          const supportTier = detectSupportTier(title, description);

          const id = `TKT-${Date.now().toString(36).toUpperCase()}`;
          const now = new Date().toISOString();
          const ticket = {
            id,
            title,
            description,
            category,
            priority: 'medium',
            status: 'open',
            requesterName,
            requesterEmail,
            supportTier,
            createdAt: now,
            updatedAt: now,
            source: 'email',
          };

          await set(ref(db, `tickets/${id}`), ticket);
          await update(ref(db, `gmail/processedIds/${uid}`), { [msgId]: true });
          created++;
        } catch (msgErr) {
          console.error('Error processing message', msgId, msgErr);
        }
      }

      const prev = getState().ticketsCreated;
      setState({ lastChecked: new Date().toISOString(), ticketsCreated: prev + created });
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nieznany błąd Gmail';
      setState({ error: msg, lastChecked: new Date().toISOString() });
      return 0;
    }
  };

  return {
    polling: false,
    lastChecked: null,
    ticketsCreated: 0,
    error: null,

    startPolling: (accessToken, uid) => {
      if (intervalId) clearInterval(intervalId);
      setState({ polling: true });
      // Check immediately
      checkNow(accessToken, uid);
      // Then every 3 minutes
      intervalId = setInterval(() => {
        checkNow(accessToken, uid);
      }, 180_000);
    },

    stopPolling: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setState({ polling: false });
    },

    checkNow,
  };
});
