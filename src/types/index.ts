export type TicketStatus = 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
export type SupportTier = 1 | 2 | 3;

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Access' | 'Event' | 'Other';

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
  linkedCalendarEventId?: string;   // powiązane wydarzenie w kalendarzu
  supportTier?: SupportTier;        // 1=L1, 2=L2, 3=L3
  checklist?: ChecklistItem[];      // admin-only checklist
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
  // For Event category: link to calendar
  eventStart?: string;
  eventEnd?: string;
  eventAllDay?: boolean;
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

// ─── Chat ───────────────────────────────────────────────────────────────────

export type ChatChannelType = 'public' | 'group' | 'dm';

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: ChatChannelType;
  members: string[];          // user emails
  createdBy: string;
  createdAt: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
}

export interface ChatReaction {
  emoji: string;
  users: string[];            // user emails who reacted
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: string;               // MIME type
  size: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;           // user email
  authorName: string;
  authorPhotoUrl?: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;         // soft-delete (recall)
  replyToId?: string;
  reactions?: Record<string, string[]>;  // emoji → [email, ...]
  attachments?: ChatAttachment[];
}

// ─── Changelog ──────────────────────────────────────────────────────────────

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: { type: 'feat' | 'fix' | 'improve'; text: string }[];
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
