import React, { useState, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isToday, isFuture, isPast } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  PlusCircle, Trash2, Info, ExternalLink, MapPin,
  ChevronLeft, ChevronRight,
  Wrench, Users, Flag, MoreHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCalendarStore } from '../store/calendarStore';
import { useTicketStore } from '../store/ticketStore';
import { useAuthStore } from '../store/authStore';
import { NewCalendarEventForm, CalendarEvent, CalendarEventType } from '../types';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  eventTypeLabel, eventTypeColor, ALL_EVENT_TYPES, formatDate, ADMINS,
} from '../utils/helpers';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { pl };
const localizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: pl }),
  getDay, locales,
});

const MESSAGES = {
  allDay: 'Cały dzień',
  previous: 'Poprzedni',
  next: 'Następny',
  today: 'Dziś',
  month: 'Miesiąc',
  week: 'Tydzień',
  day: 'Dzień',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Czas',
  event: 'Wydarzenie',
  noEventsInRange: 'Brak wydarzeń w tym zakresie',
  showMore: (total: number) => `+${total} więcej`,
};

const INITIAL_FORM: NewCalendarEventForm & { room: string } = {
  title: '', start: '', end: '', type: 'maintenance',
  description: '', allDay: false, room: '',
};

const localDatetimeToISO = (local: string): string => local ? new Date(local).toISOString() : '';
const isoToLocalDatetime = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const TYPE_ICONS: Record<CalendarEventType, React.ReactNode> = {
  maintenance: <Wrench size={13} />,
  appointment: <Users size={13} />,
  deadline: <Flag size={13} />,
  other: <MoreHorizontal size={13} />,
};

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, addEvent, deleteEvent } = useCalendarStore();
  const addTicket = useTicketStore((s) => s.addTicket);
  const { user } = useAuthStore();

  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<NewCalendarEventForm & { room: string }>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const calEvents = events.map((e) => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  }));

  // Upcoming events for sidebar
  const upcomingEvents = [...events]
    .filter((e) => isFuture(new Date(e.end)) || isToday(new Date(e.start)))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 6);

  // Count by type
  const countByType = ALL_EVENT_TYPES.reduce((acc, t) => {
    acc[t] = events.filter((e) => e.type === t).length;
    return acc;
  }, {} as Record<CalendarEventType, number>);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setForm({ ...INITIAL_FORM, start: isoToLocalDatetime(start.toISOString()), end: isoToLocalDatetime(end.toISOString()) });
    setFormErrors({});
    setShowAddModal(true);
  }, []);

  const handleSelectEvent = useCallback((event: (typeof calEvents)[0]) => {
    const original = events.find((e) => e.id === event.id);
    if (original) { setSelectedEvent(original); setConfirmDelete(false); setShowDetailModal(true); }
  }, [events]);

  const eventStyleGetter = (event: (typeof calEvents)[0]) => {
    const color = eventTypeColor[event.type as CalendarEventType] ?? '#3b82f6';
    const isEventPast = isPast(new Date(event.end));
    return {
      style: {
        backgroundColor: isEventPast ? '#9CA3AF' : color,
        borderColor: 'transparent',
        color: '#fff',
        borderRadius: '8px',
        border: 'none',
        fontSize: '11px',
        fontWeight: '600',
        padding: '2px 8px',
        opacity: isEventPast ? 0.65 : 1,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      },
    };
  };

  const setField = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Tytuł jest wymagany';
    if (!form.start) errs.start = 'Data rozpoczęcia jest wymagana';
    if (!form.end) errs.end = 'Data zakończenia jest wymagana';
    if (form.start && form.end && new Date(form.start) > new Date(form.end))
      errs.end = 'Data zakończenia musi być późniejsza';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const adminRecord = ADMINS.find((a) => a.email === user?.email);
      const requesterName = adminRecord?.name ?? user?.email ?? 'Administrator';
      const requesterEmail = user?.email ?? 'helpdesk@cdv.pl';
      const ticketId = await addTicket({
        title: form.title,
        description: form.description
          ? `[Wydarzenie: ${eventTypeLabel[form.type]}] ${form.description}`
          : `Wydarzenie kalendarza: ${eventTypeLabel[form.type]} — ${form.title}`,
        category: 'Other', priority: 'medium', requesterName, requesterEmail, room: form.room,
      });
      await addEvent({
        ...form,
        start: localDatetimeToISO(form.start),
        end: localDatetimeToISO(form.end),
        room: form.room,
        linkedTicketId: ticketId,
      });
      setShowAddModal(false);
      setForm(INITIAL_FORM);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
    setShowDetailModal(false);
    setSelectedEvent(null);
  };

  // Custom toolbar
  const CustomToolbar = ({ onNavigate, onView, label }: any) => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('PREV')}
          className="p-1.5 rounded-lg hover:bg-surface border border-surface-border text-ink-muted hover:text-ink transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-1 rounded-lg text-[12px] font-semibold border border-surface-border hover:bg-surface text-ink-muted hover:text-ink transition-colors"
        >
          Dziś
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-1.5 rounded-lg hover:bg-surface border border-surface-border text-ink-muted hover:text-ink transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <h2 className="text-[15px] font-bold text-ink ml-2 capitalize">{label}</h2>
      </div>
      <div className="flex bg-surface rounded-xl border border-surface-border p-1 gap-0.5">
        {(['month', 'week', 'day', 'agenda'] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all duration-200 capitalize ${
              view === v ? 'bg-white text-cdv-blue shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {MESSAGES[v as keyof typeof MESSAGES] as string}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Left sidebar */}
        <div className="xl:col-span-1 space-y-4">
          {/* Add button */}
          <Button
            className="w-full"
            onClick={() => { setForm(INITIAL_FORM); setFormErrors({}); setShowAddModal(true); }}
          >
            <PlusCircle size={15} />
            Dodaj wydarzenie
          </Button>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-surface-border shadow-card p-4">
            <h3 className="text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-3">Wg typu</h3>
            <div className="space-y-2.5">
              {ALL_EVENT_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: eventTypeColor[type] }}
                  />
                  <span className="text-[13px] text-ink-muted flex-1 font-medium">{eventTypeLabel[type]}</span>
                  <span className="text-[12px] font-bold text-ink tabular-nums">{countByType[type]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="bg-white rounded-2xl border border-surface-border shadow-card p-4">
            <h3 className="text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-3">Nadchodzące</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-[13px] text-ink-faint text-center py-3">Brak nadchodzących</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => { setSelectedEvent(ev); setConfirmDelete(false); setShowDetailModal(true); }}
                    className="w-full text-left group"
                  >
                    <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-surface transition-colors">
                      <div
                        className="w-1.5 flex-shrink-0 rounded-full mt-1"
                        style={{ backgroundColor: eventTypeColor[ev.type], height: '32px' }}
                      />
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-ink truncate group-hover:text-cdv-blue transition-colors">
                          {ev.title}
                        </p>
                        <p className="text-[11px] text-ink-faint mt-0.5">
                          {format(new Date(ev.start), 'dd MMM, HH:mm', { locale: pl })}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {TYPE_ICONS[ev.type]}
                          <span className="text-[10px] text-ink-faint">{eventTypeLabel[ev.type]}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
          <div style={{ height: 640 }}>
            <BigCalendar
              localizer={localizer}
              events={calEvents}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              messages={MESSAGES}
              culture="pl"
              style={{ height: '100%' }}
              popup
              components={{ toolbar: CustomToolbar }}
            />
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Dodaj nowe wydarzenie" size="lg">
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
              Tytuł <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Nazwa wydarzenia..."
              className={`input-base ${formErrors.title ? '!border-red-400' : ''}`}
            />
            {formErrors.title && <p className="mt-1 text-[12px] text-red-500">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-bold text-ink-faint mb-2 uppercase tracking-wider">Typ</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ALL_EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setField('type', type)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
                    form.type === type
                      ? 'border-cdv-blue bg-cdv-blue/5 text-cdv-blue'
                      : 'border-surface-border text-ink-muted hover:border-gray-300'
                  }`}
                >
                  <span style={{ color: eventTypeColor[type] }}>{TYPE_ICONS[type]}</span>
                  {eventTypeLabel[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
                Rozpoczęcie <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.start}
                onChange={(e) => setField('start', e.target.value)}
                className={`input-base ${formErrors.start ? '!border-red-400' : ''}`}
              />
              {formErrors.start && <p className="mt-1 text-[12px] text-red-500">{formErrors.start}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
                Zakończenie <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.end}
                onChange={(e) => setField('end', e.target.value)}
                className={`input-base ${formErrors.end ? '!border-red-400' : ''}`}
              />
              {formErrors.end && <p className="mt-1 text-[12px] text-red-500">{formErrors.end}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
              <MapPin size={11} className="inline mr-1" />
              Sala / Lokalizacja
            </label>
            <input
              type="text"
              value={form.room}
              onChange={(e) => setField('room', e.target.value)}
              placeholder="np. Sala 204, Budynek A..."
              className="input-base"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="allDay"
              checked={form.allDay}
              onChange={(e) => setField('allDay', e.target.checked)}
              className="rounded border-gray-300 text-cdv-blue focus:ring-cdv-blue w-4 h-4"
            />
            <label htmlFor="allDay" className="text-[13px] text-ink font-medium">Wydarzenie całodniowe</label>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">Opis</label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Dodatkowe informacje..."
              rows={3}
              className="input-base resize-none"
            />
          </div>

          <div className="flex items-start gap-2 bg-cdv-blue-light rounded-xl p-3 text-[12px] text-cdv-blue">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <span>Wydarzenie zostanie automatycznie zarejestrowane jako zgłoszenie IT.</span>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-surface-border">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Anuluj</Button>
            <Button type="submit" loading={submitting}>
              <PlusCircle size={14} />
              Dodaj wydarzenie
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Szczegóły wydarzenia" size="md">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="p-2.5 rounded-xl flex-shrink-0"
                style={{ backgroundColor: eventTypeColor[selectedEvent.type] + '18' }}
              >
                <span style={{ color: eventTypeColor[selectedEvent.type] }}>{TYPE_ICONS[selectedEvent.type]}</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-ink">{selectedEvent.title}</h3>
                <Badge
                  className="mt-1"
                  style={{ backgroundColor: eventTypeColor[selectedEvent.type] + '20', color: eventTypeColor[selectedEvent.type] }}
                >
                  {eventTypeLabel[selectedEvent.type]}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-xl p-3">
                <p className="text-[11px] text-ink-faint font-semibold uppercase tracking-wider mb-1">Rozpoczęcie</p>
                <p className="text-[13px] font-semibold text-ink">{formatDate(selectedEvent.start)}</p>
              </div>
              <div className="bg-surface rounded-xl p-3">
                <p className="text-[11px] text-ink-faint font-semibold uppercase tracking-wider mb-1">Zakończenie</p>
                <p className="text-[13px] font-semibold text-ink">{formatDate(selectedEvent.end)}</p>
              </div>
            </div>

            {selectedEvent.room && (
              <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                <MapPin size={14} className="text-ink-faint" />
                {selectedEvent.room}
              </div>
            )}

            {selectedEvent.description && (
              <div className="bg-surface rounded-xl p-3">
                <p className="text-[11px] text-ink-faint font-semibold uppercase tracking-wider mb-1">Opis</p>
                <p className="text-[13px] text-ink">{selectedEvent.description}</p>
              </div>
            )}

            {selectedEvent.linkedTicketId && (
              <div className="flex items-center gap-2 bg-cdv-blue-light border border-cdv-blue/20 rounded-xl px-3 py-2.5">
                <ExternalLink size={14} className="text-cdv-blue flex-shrink-0" />
                <span className="text-[13px] text-cdv-blue font-semibold">
                  Zgłoszenie:{' '}
                  <button
                    onClick={() => { setShowDetailModal(false); navigate(`/tickets/${selectedEvent.linkedTicketId}`); }}
                    className="underline hover:no-underline font-bold"
                  >
                    {selectedEvent.linkedTicketId}
                  </button>
                </span>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-3 border-t border-surface-border">
              {!confirmDelete ? (
                <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={13} />
                  Usuń wydarzenie
                </Button>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 animate-scale-in">
                  <span className="text-[12px] text-red-600 font-semibold">Na pewno?</span>
                  <button onClick={() => handleDelete(selectedEvent.id)} className="text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-lg">Tak</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-[12px] text-ink-muted">Anuluj</button>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>Zamknij</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
