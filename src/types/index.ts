export type TicketStatus = 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Access' | 'Other';

export interface Comment {
  id: string;
  ticketId: string;
  author: string;
  authorRole: 'requester' | 'technician' | 'system';
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: string;           // e.g. CDV-001
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requesterName: string;
  requesterEmail: string;
  assignee?: string;
  room?: string;        // sala/lokalizacja
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  comments: Comment[];
  slaBreached: boolean;
}

export type CalendarEventType = 'maintenance' | 'appointment' | 'deadline' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;   // ISO string
  end: string;     // ISO string
  type: CalendarEventType;
  description?: string;
  allDay?: boolean;
  room?: string;
  linkedTicketId?: string; // powiązane zgłoszenie
}

export interface DashboardStats {
  open: number;
  inProgress: number;
  closed: number;
  slaCompliance: number;
}

export interface NewTicketForm {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  requesterName: string;
  requesterEmail: string;
  room?: string;
}

export interface NewCalendarEventForm {
  title: string;
  start: string;
  end: string;
  type: CalendarEventType;
  description: string;
  allDay: boolean;
  room?: string;
}

export interface AppSettings {
  organizationName: string;
  adminEmail: string;
  secondAdminEmail: string;
  slaHoursLow: number;
  slaHoursMedium: number;
  slaHoursHigh: number;
  slaHoursCritical: number;
  defaultAssignee: string;
  emailNotifications: boolean;
  darkMode: boolean;
}
