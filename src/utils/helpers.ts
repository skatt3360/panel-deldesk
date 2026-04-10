import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { TicketStatus, TicketPriority, TicketCategory, CalendarEventType } from '../types';

export const formatDate = (isoString: string): string => {
  try {
    return format(parseISO(isoString), 'dd.MM.yyyy HH:mm', { locale: pl });
  } catch {
    return isoString;
  }
};

export const formatDateShort = (isoString: string): string => {
  try {
    return format(parseISO(isoString), 'dd.MM.yyyy', { locale: pl });
  } catch {
    return isoString;
  }
};

export const formatRelative = (isoString: string): string => {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true, locale: pl });
  } catch {
    return isoString;
  }
};

export const formatDateTimeLocal = (isoString: string): string => {
  try {
    return format(parseISO(isoString), "yyyy-MM-dd'T'HH:mm");
  } catch {
    return '';
  }
};

// Status display helpers
export const statusLabel: Record<TicketStatus, string> = {
  open: 'Otwarte',
  'in-progress': 'W trakcie',
  pending: 'Oczekujące',
  resolved: 'Rozwiązane',
  closed: 'Zamknięte',
};

export const statusColor: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  pending: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

// Priority display helpers
export const priorityLabel: Record<TicketPriority, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  critical: 'Krytyczny',
};

export const priorityColor: Record<TicketPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const priorityDotColor: Record<TicketPriority, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

// Category display helpers
export const categoryLabel: Record<TicketCategory, string> = {
  Hardware: 'Sprzęt',
  Software: 'Oprogramowanie',
  Network: 'Sieć',
  Access: 'Dostęp',
  Event: 'Wydarzenie',
  Other: 'Inne',
};

export const categoryColor: Record<TicketCategory, string> = {
  Hardware: 'bg-indigo-100 text-indigo-700',
  Software: 'bg-cyan-100 text-cyan-700',
  Network: 'bg-teal-100 text-teal-700',
  Access: 'bg-pink-100 text-pink-700',
  Event: 'bg-amber-100 text-amber-700',
  Other: 'bg-slate-100 text-slate-600',
};

// Calendar event type helpers
export const eventTypeLabel: Record<CalendarEventType, string> = {
  maintenance: 'Konserwacja',
  appointment: 'Spotkanie',
  deadline: 'Termin',
  other: 'Inne',
};

export const eventTypeColor: Record<CalendarEventType, string> = {
  maintenance: '#ef4444',
  appointment: '#3b82f6',
  deadline: '#f59e0b',
  other: '#8b5cf6',
};

// All privileged accounts (owner + admins)
export const ADMINS = [
  { email: 'skatt3360@gmail.com',       name: 'Szymon Karaszewski' },
  { email: 'szymon.karaszewski@cdv.pl', name: 'Szymon Karaszewski' },
  { email: 'kacper.kubiak@cdv.pl',      name: 'Kacper Kubiak' },
];

// For assignment dropdowns
export const TECHNICIANS = ['Szymon Karaszewski', 'Kacper Kubiak'];

export const ALL_STATUSES: TicketStatus[] = ['open', 'in-progress', 'pending', 'resolved', 'closed'];
export const ALL_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
export const ALL_CATEGORIES: TicketCategory[] = ['Hardware', 'Software', 'Network', 'Access', 'Event', 'Other'];
export const ALL_EVENT_TYPES: CalendarEventType[] = ['maintenance', 'appointment', 'deadline', 'other'];
