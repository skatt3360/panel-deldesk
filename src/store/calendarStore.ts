import { create } from 'zustand';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { CalendarEvent, NewCalendarEventForm } from '../types';

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const _now = new Date();
const todayAt = (h: number, m = 0) => { const d = new Date(_now); d.setHours(h, m, 0, 0); return d.toISOString(); };
const inDays = (d: number, h = 9, m = 0) => { const date = new Date(_now.getTime() + d * 86400000); date.setHours(h, m, 0, 0); return date.toISOString(); };

const SAMPLE_EVENTS: Record<string, CalendarEvent> = {
  'evt-001': {
    id: 'evt-001', title: 'Konserwacja serwerów - okno serwisowe',
    start: todayAt(22, 0), end: todayAt(23, 59), type: 'maintenance',
    description: 'Planowana konserwacja serwerów uczelnianej infrastruktury IT. Możliwe przerwy w dostępie do USOS i poczty.', allDay: false,
  },
  'evt-002': {
    id: 'evt-002', title: 'Aktualizacja systemu USOS',
    start: inDays(3, 8, 0), end: inDays(3, 12, 0), type: 'maintenance',
    description: 'Aktualizacja systemu USOS do wersji 6.8.2. System będzie niedostępny.', allDay: false,
  },
  'evt-003': {
    id: 'evt-003', title: 'Spotkanie: Wdrożenie nowych komputerów lab 401',
    start: inDays(2, 10, 0), end: inDays(2, 11, 30), type: 'appointment',
    description: 'Spotkanie z kierownikiem laboratorium w sprawie wymiany sprzętu. Sala konferencyjna B.', allDay: false,
  },
  'evt-004': {
    id: 'evt-004', title: 'Deadline: Migracja danych archiwum',
    start: inDays(7, 9, 0), end: inDays(7, 9, 0), type: 'deadline',
    description: 'Termin zakończenia migracji danych archiwalnych do nowego systemu przechowywania.', allDay: true,
  },
  'evt-005': {
    id: 'evt-005', title: 'Audyt bezpieczeństwa IT',
    start: inDays(14, 9, 0), end: inDays(14, 17, 0), type: 'other',
    description: 'Coroczny audyt bezpieczeństwa infrastruktury IT przeprowadzany przez zewnętrzną firmę.', allDay: false,
  },
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface CalendarState {
  events: CalendarEvent[];
  initialized: boolean;
  addEvent: (form: NewCalendarEventForm & { linkedTicketId?: string }) => Promise<string>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>()((setState) => {
  // Subscribe to /events in Firebase
  onValue(ref(db, 'events'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const events = Object.values(data) as CalendarEvent[];
      setState({ events, initialized: true });
    } else {
      // First run: seed sample events
      set(ref(db, 'events'), SAMPLE_EVENTS);
    }
  });

  return {
    events: [],
    initialized: false,

    addEvent: async (form: NewCalendarEventForm & { linkedTicketId?: string }): Promise<string> => {
      const id = `evt-${Date.now()}`;
      const newEvent: CalendarEvent = { id, ...form };
      await set(ref(db, `events/${id}`), newEvent);
      return id;
    },

    updateEvent: async (id: string, updates: Partial<CalendarEvent>) => {
      await update(ref(db, `events/${id}`), updates);
    },

    deleteEvent: async (id: string) => {
      await remove(ref(db, `events/${id}`));
    },
  };
});
