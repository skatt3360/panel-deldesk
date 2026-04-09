import { create } from 'zustand';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { Ticket, TicketStatus, Comment, NewTicketForm, AppSettings } from '../types';

// ---------------------------------------------------------------------------
// Sample data helpers
// ---------------------------------------------------------------------------

const _now = new Date();
const daysAgo = (d: number) => new Date(_now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(_now.getTime() - h * 3600000).toISOString();

const DEFAULT_SETTINGS: AppSettings = {
  organizationName: 'CDV - Collegium Da Vinci',
  adminEmail: 'skatt3360@gmail.com',
  secondAdminEmail: 'kacper.kubiak@cdv.pl',
  slaHoursLow: 72,
  slaHoursMedium: 24,
  slaHoursHigh: 8,
  slaHoursCritical: 2,
  defaultAssignee: 'Marek Wiśniewski',
  emailNotifications: true,
  darkMode: false,
};

/** Tickets stored as objects in Firebase (comments as keyed object, not array) */
const SAMPLE_TICKETS: Record<string, any> = {
  'CDV-001': {
    id: 'CDV-001',
    title: 'Komputer nie uruchamia się w sali 204',
    description: 'Po włączeniu komputer wydaje 3 sygnały dźwiękowe i nie wchodzi do systemu. Problem od dzisiaj rana. Maszyna: Dell OptiPlex 7080.',
    status: 'open', priority: 'high', category: 'Hardware',
    requesterName: 'dr Anna Kowalska', requesterEmail: 'a.kowalska@cdv.pl',
    assignee: 'Marek Wiśniewski',
    createdAt: hoursAgo(3), updatedAt: hoursAgo(3),
    dueDate: new Date(_now.getTime() + 4 * 3600000).toISOString(), slaBreached: false,
    comments: {
      c1: { id: 'c1', ticketId: 'CDV-001', author: 'System', authorRole: 'system', content: 'Zgłoszenie zostało utworzone.', createdAt: hoursAgo(3) },
      c2: { id: 'c2', ticketId: 'CDV-001', author: 'Marek Wiśniewski', authorRole: 'technician', content: 'Przyjmuję zgłoszenie. Udaję się do sali 204 sprawdzić pamięć RAM.', createdAt: hoursAgo(2) },
    },
  },
  'CDV-002': {
    id: 'CDV-002',
    title: 'Brak dostępu do systemu USOS',
    description: 'Student nie może zalogować się do systemu USOS. Błąd "Nieprawidłowe dane logowania" mimo poprawnych danych. Konto: 123456.',
    status: 'in-progress', priority: 'medium', category: 'Access',
    requesterName: 'Piotr Nowak', requesterEmail: 'p.nowak@student.cdv.pl',
    assignee: 'Katarzyna Jabłońska',
    createdAt: daysAgo(1), updatedAt: hoursAgo(5),
    dueDate: new Date(_now.getTime() + 8 * 3600000).toISOString(), slaBreached: false,
    comments: {
      c3: { id: 'c3', ticketId: 'CDV-002', author: 'System', authorRole: 'system', content: 'Zgłoszenie zostało utworzone.', createdAt: daysAgo(1) },
      c4: { id: 'c4', ticketId: 'CDV-002', author: 'Katarzyna Jabłońska', authorRole: 'technician', content: 'Zresetowałam hasło w systemie AD. Proszę spróbować ponownie.', createdAt: hoursAgo(5) },
      c5: { id: 'c5', ticketId: 'CDV-002', author: 'Piotr Nowak', authorRole: 'requester', content: 'Nadal nie mogę się zalogować. Ten sam błąd.', createdAt: hoursAgo(4) },
    },
  },
  'CDV-003': {
    id: 'CDV-003',
    title: 'Drukarka w dziekanacie nie drukuje',
    description: 'Drukarka HP LaserJet (budynek A, pok. 101) wyświetla błąd "Paper Jam" mimo braku zacięcia papieru.',
    status: 'pending', priority: 'medium', category: 'Hardware',
    requesterName: 'mgr Zofia Lewandowska', requesterEmail: 'z.lewandowska@cdv.pl',
    assignee: 'Marek Wiśniewski',
    createdAt: daysAgo(2), updatedAt: daysAgo(1),
    dueDate: new Date(_now.getTime() + 24 * 3600000).toISOString(), slaBreached: false,
    comments: {
      c6: { id: 'c6', ticketId: 'CDV-003', author: 'System', authorRole: 'system', content: 'Zgłoszenie zostało utworzone.', createdAt: daysAgo(2) },
      c7: { id: 'c7', ticketId: 'CDV-003', author: 'Marek Wiśniewski', authorRole: 'technician', content: 'Problem z czujnikiem papieru. Zamówiłem część zamienną.', createdAt: daysAgo(1) },
    },
  },
  'CDV-004': {
    id: 'CDV-004',
    title: 'Awaria sieci Wi-Fi w auli głównej',
    description: 'Podczas wykładu sieć Wi-Fi przestała działać. Access point AP-AULA-01 nie odpowiada.',
    status: 'resolved', priority: 'critical', category: 'Network',
    requesterName: 'prof. Tomasz Zieliński', requesterEmail: 't.zielinski@cdv.pl',
    assignee: 'Katarzyna Jabłońska',
    createdAt: daysAgo(3), updatedAt: daysAgo(2), dueDate: daysAgo(2), slaBreached: false,
    comments: {
      c8: { id: 'c8', ticketId: 'CDV-004', author: 'System', authorRole: 'system', content: 'Zgłoszenie zostało utworzone.', createdAt: daysAgo(3) },
      c9: { id: 'c9', ticketId: 'CDV-004', author: 'Katarzyna Jabłońska', authorRole: 'technician', content: 'Restart AP rozwiązał problem. Sieć działa prawidłowo.', createdAt: daysAgo(2) },
    },
  },
  'CDV-005': {
    id: 'CDV-005',
    title: 'Instalacja MATLAB na komputerach lab 302',
    description: 'Proszę o instalację MATLAB R2024a na 15 stanowiskach w lab 302. Posiadamy ważną licencję uczelniną.',
    status: 'closed', priority: 'low', category: 'Software',
    requesterName: 'dr inż. Michał Wróbel', requesterEmail: 'm.wrobel@cdv.pl',
    assignee: 'Adam Szymański',
    createdAt: daysAgo(7), updatedAt: daysAgo(4), dueDate: daysAgo(5), slaBreached: false,
    comments: {
      c10: { id: 'c10', ticketId: 'CDV-005', author: 'System', authorRole: 'system', content: 'Zgłoszenie zostało utworzone.', createdAt: daysAgo(7) },
      c11: { id: 'c11', ticketId: 'CDV-005', author: 'Adam Szymański', authorRole: 'technician', content: 'MATLAB zainstalowany na wszystkich 15 stanowiskach.', createdAt: daysAgo(4) },
      c12: { id: 'c12', ticketId: 'CDV-005', author: 'dr inż. Michał Wróbel', authorRole: 'requester', content: 'Dziękuję, wszystko działa poprawnie. Można zamknąć zgłoszenie.', createdAt: daysAgo(4) },
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTicket(raw: any): Ticket {
  const comments: Comment[] = raw.comments
    ? (Object.values(raw.comments) as Comment[]).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : [];
  return { ...raw, comments };
}

function nextId(tickets: Ticket[]): string {
  const max = tickets.reduce((m, t) => {
    const n = parseInt(t.id.replace('CDV-', ''), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `CDV-${String(max + 1).padStart(3, '0')}`;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface TicketState {
  tickets: Ticket[];
  settings: AppSettings;
  initialized: boolean;
  addTicket: (form: NewTicketForm) => Promise<string>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<void>;
  assignTicket: (id: string, assignee: string) => Promise<void>;
  addComment: (ticketId: string, author: string, authorRole: Comment['authorRole'], content: string) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
}

export const useTicketStore = create<TicketState>()((setState, getState) => {
  // Subscribe to /tickets in Firebase
  onValue(ref(db, 'tickets'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const tickets = (Object.values(data) as any[])
        .map(parseTicket)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setState({ tickets, initialized: true });
    } else {
      // First run: seed sample data
      set(ref(db, 'tickets'), SAMPLE_TICKETS);
    }
  });

  // Subscribe to /settings in Firebase
  onValue(ref(db, 'settings'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      setState({ settings: data });
    } else {
      set(ref(db, 'settings'), DEFAULT_SETTINGS);
    }
  });

  return {
    tickets: [],
    settings: DEFAULT_SETTINGS,
    initialized: false,

    addTicket: async (form: NewTicketForm) => {
      const { tickets, settings } = getState();
      const id = nextId(tickets);
      const ts = new Date().toISOString();
      const slaMap: Record<string, number> = {
        low: settings.slaHoursLow,
        medium: settings.slaHoursMedium,
        high: settings.slaHoursHigh,
        critical: settings.slaHoursCritical,
      };
      const dueDate = new Date(Date.now() + (slaMap[form.priority] ?? 24) * 3600000).toISOString();
      const commentId = `${id}-c1`;

      await set(ref(db, `tickets/${id}`), {
        id, title: form.title, description: form.description,
        status: 'open', priority: form.priority, category: form.category,
        requesterName: form.requesterName, requesterEmail: form.requesterEmail,
        room: form.room ?? '',
        createdAt: ts, updatedAt: ts, dueDate, slaBreached: false,
        comments: {
          [commentId]: { id: commentId, ticketId: id, author: 'System', authorRole: 'system', content: 'Zgłoszenie zostało utworzone.', createdAt: ts },
        },
      });
      return id;
    },

    updateTicketStatus: async (id: string, status: TicketStatus) => {
      const ts = new Date().toISOString();
      const cid = `${id}-sys-${Date.now()}`;
      await update(ref(db, `tickets/${id}`), { status, updatedAt: ts });
      await set(ref(db, `tickets/${id}/comments/${cid}`), {
        id: cid, ticketId: id, author: 'System', authorRole: 'system',
        content: `Status zgłoszenia zmieniony na: ${status}`, createdAt: ts,
      });
    },

    assignTicket: async (id: string, assignee: string) => {
      const ts = new Date().toISOString();
      const cid = `${id}-sys-${Date.now()}`;
      await update(ref(db, `tickets/${id}`), { assignee, updatedAt: ts });
      await set(ref(db, `tickets/${id}/comments/${cid}`), {
        id: cid, ticketId: id, author: 'System', authorRole: 'system',
        content: `Zgłoszenie przypisano do: ${assignee}`, createdAt: ts,
      });
    },

    addComment: async (ticketId: string, author: string, authorRole: Comment['authorRole'], content: string) => {
      const ts = new Date().toISOString();
      const cid = `${ticketId}-c-${Date.now()}`;
      await set(ref(db, `tickets/${ticketId}/comments/${cid}`), {
        id: cid, ticketId, author, authorRole, content, createdAt: ts,
      });
      await update(ref(db, `tickets/${ticketId}`), { updatedAt: ts });
    },

    deleteTicket: async (id: string) => {
      await remove(ref(db, `tickets/${id}`));
    },

    updateSettings: async (partial: Partial<AppSettings>) => {
      const merged = { ...getState().settings, ...partial };
      await set(ref(db, 'settings'), merged);
    },
  };
});
