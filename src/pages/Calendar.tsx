import React, { useState, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { PlusCircle, Trash2, Info } from 'lucide-react';
import { useCalendarStore } from '../store/calendarStore';
import { NewCalendarEventForm, CalendarEvent, CalendarEventType } from '../types';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  eventTypeLabel,
  eventTypeColor,
  ALL_EVENT_TYPES,
  formatDate,
} from '../utils/helpers';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { pl };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: pl }),
  getDay,
  locales,
});

const MESSAGES = {
  allDay: 'Cały dzień',
  previous: '‹ Poprzedni',
  next: 'Następny ›',
  today: 'Dziś',
  month: 'Miesiąc',
  week: 'Tydzień',
  day: 'Dzień',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Czas',
  event: 'Wydarzenie',
  noEventsInRange: 'Brak wydarzeń w tym zakresie',
  showMore: (total: number) => `+ ${total} więcej`,
};

const INITIAL_FORM: NewCalendarEventForm = {
  title: '',
  start: '',
  end: '',
  type: 'maintenance',
  description: '',
  allDay: false,
};

const localDatetimeToISO = (local: string): string => {
  if (!local) return '';
  return new Date(local).toISOString();
};

const isoToLocalDatetime = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CalendarPage: React.FC = () => {
  const { events, addEvent, deleteEvent } = useCalendarStore();

  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<NewCalendarEventForm>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewCalendarEventForm, string>>>({});

  // Map CalendarEvent to react-big-calendar event format
  const calEvents = events.map((e) => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  }));

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setForm({
      ...INITIAL_FORM,
      start: isoToLocalDatetime(start.toISOString()),
      end: isoToLocalDatetime(end.toISOString()),
    });
    setFormErrors({});
    setShowAddModal(true);
  }, []);

  const handleSelectEvent = useCallback(
    (event: (typeof calEvents)[0]) => {
      const original = events.find((e) => e.id === event.id);
      if (original) {
        setSelectedEvent(original);
        setShowDetailModal(true);
      }
    },
    [events]
  );

  const eventStyleGetter = (event: (typeof calEvents)[0]) => {
    const color = eventTypeColor[event.type as CalendarEventType] ?? '#3b82f6';
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        color: '#fff',
        borderRadius: '6px',
        border: 'none',
        fontSize: '12px',
        padding: '2px 6px',
      },
    };
  };

  const setField = <K extends keyof NewCalendarEventForm>(key: K, val: NewCalendarEventForm[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof NewCalendarEventForm, string>> = {};
    if (!form.title.trim()) errs.title = 'Tytuł jest wymagany';
    if (!form.start) errs.start = 'Data rozpoczęcia jest wymagana';
    if (!form.end) errs.end = 'Data zakończenia jest wymagana';
    if (form.start && form.end && new Date(form.start) > new Date(form.end)) {
      errs.end = 'Data zakończenia musi być późniejsza niż rozpoczęcia';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    addEvent({
      ...form,
      start: localDatetimeToISO(form.start),
      end: localDatetimeToISO(form.end),
    });
    setShowAddModal(false);
    setForm(INITIAL_FORM);
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setShowDetailModal(false);
    setSelectedEvent(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Legend */}
          {ALL_EVENT_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: eventTypeColor[type] }}
              />
              {eventTypeLabel[type]}
            </div>
          ))}
        </div>
        <Button
          onClick={() => {
            setForm(INITIAL_FORM);
            setFormErrors({});
            setShowAddModal(true);
          }}
        >
          <PlusCircle size={15} />
          Dodaj wydarzenie
        </Button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div style={{ height: 680 }} className="p-3">
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
          />
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Dodaj nowe wydarzenie"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tytuł <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Nazwa wydarzenia..."
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 ${
                formErrors.title ? 'border-red-400' : 'border-gray-200 focus:border-cdv-blue'
              }`}
            />
            {formErrors.title && (
              <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Typ</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ALL_EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setField('type', type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === type
                      ? 'border-cdv-blue bg-cdv-blue/5 text-cdv-blue'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: eventTypeColor[type] }}
                  />
                  {eventTypeLabel[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rozpoczęcie <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.start}
                onChange={(e) => setField('start', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 ${
                  formErrors.start ? 'border-red-400' : 'border-gray-200 focus:border-cdv-blue'
                }`}
              />
              {formErrors.start && (
                <p className="mt-1 text-xs text-red-500">{formErrors.start}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Zakończenie <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.end}
                onChange={(e) => setField('end', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 ${
                  formErrors.end ? 'border-red-400' : 'border-gray-200 focus:border-cdv-blue'
                }`}
              />
              {formErrors.end && (
                <p className="mt-1 text-xs text-red-500">{formErrors.end}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={form.allDay}
              onChange={(e) => setField('allDay', e.target.checked)}
              className="rounded border-gray-300 text-cdv-blue focus:ring-cdv-blue"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">
              Wydarzenie całodniowe
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Opis (opcjonalnie)</label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Dodatkowe informacje..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              Anuluj
            </Button>
            <Button type="submit">
              <PlusCircle size={15} />
              Dodaj wydarzenie
            </Button>
          </div>
        </form>
      </Modal>

      {/* Event Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Szczegóły wydarzenia"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
              <Badge
                className="mt-1"
                style={{ backgroundColor: eventTypeColor[selectedEvent.type] + '20', color: eventTypeColor[selectedEvent.type] }}
              >
                {eventTypeLabel[selectedEvent.type]}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <Info size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Rozpoczęcie</p>
                  <p className="font-medium">{formatDate(selectedEvent.start)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <Info size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Zakończenie</p>
                  <p className="font-medium">{formatDate(selectedEvent.end)}</p>
                </div>
              </div>
              {selectedEvent.description && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Opis</p>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selectedEvent.id)}
              >
                <Trash2 size={14} />
                Usuń wydarzenie
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                Zamknij
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
