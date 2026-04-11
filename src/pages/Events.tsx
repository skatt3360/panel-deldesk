import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PartyPopper, PlusCircle, Calendar, Clock, MapPin,
  ChevronRight, CalendarCheck2, Search, X,
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { useCalendarStore } from '../store/calendarStore';
import { statusLabel, formatRelative, eventTypeColor } from '../utils/helpers';
import { TicketStatus } from '../types';
import { format, isFuture, isPast, isToday } from 'date-fns';
import { pl } from 'date-fns/locale';

const STATUS_PILL: Record<TicketStatus, string> = {
  open:          'bg-blue-500/20 text-blue-300 border border-blue-400/30',
  'in-progress': 'bg-yellow-500/15 text-yellow-300 border border-yellow-400/25',
  pending:       'bg-purple-500/15 text-purple-300 border border-purple-400/25',
  resolved:      'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25',
  closed:        'bg-white/5 text-white/30 border border-white/10',
};

const Events: React.FC = () => {
  const navigate = useNavigate();
  const tickets = useTicketStore((s) => s.tickets);
  const calendarEvents = useCalendarStore((s) => s.events);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'upcoming' | 'all' | 'past'>('upcoming');

  // Event tickets = category 'Event' OR linkedCalendarEventId
  const eventTickets = useMemo(() => {
    return tickets.filter((t) => t.category === 'Event' || t.linkedCalendarEventId);
  }, [tickets]);

  // Enrich with calendar event data
  const enriched = useMemo(() => {
    return eventTickets.map((ticket) => {
      const calEvent = ticket.linkedCalendarEventId
        ? calendarEvents.find((e) => e.id === ticket.linkedCalendarEventId)
        : calendarEvents.find((e) => e.linkedTicketId === ticket.id);
      return { ticket, calEvent };
    });
  }, [eventTickets, calendarEvents]);

  // Filter by tab
  const filtered = useMemo(() => {
    let list = enriched;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(({ ticket }) =>
        ticket.title.toLowerCase().includes(q) ||
        ticket.requesterName.toLowerCase().includes(q) ||
        (ticket.room ?? '').toLowerCase().includes(q)
      );
    }
    if (tab === 'upcoming') {
      list = list.filter(({ calEvent }) =>
        !calEvent || isFuture(new Date(calEvent.start)) || isToday(new Date(calEvent.start))
      );
    } else if (tab === 'past') {
      list = list.filter(({ calEvent }) =>
        calEvent && isPast(new Date(calEvent.end))
      );
    }
    // Sort by event date
    list.sort((a, b) => {
      const da = a.calEvent ? new Date(a.calEvent.start).getTime() : new Date(a.ticket.createdAt).getTime();
      const db_ = b.calEvent ? new Date(b.calEvent.start).getTime() : new Date(b.ticket.createdAt).getTime();
      return da - db_;
    });
    return list;
  }, [enriched, search, tab]);

  // Calendar events NOT linked to tickets
  const standaloneCalEvents = useMemo(() => {
    const linkedIds = new Set(enriched.map(({ calEvent }) => calEvent?.id).filter(Boolean));
    return calendarEvents.filter((e) =>
      !linkedIds.has(e.id) && (
        tab === 'upcoming' ? (isFuture(new Date(e.start)) || isToday(new Date(e.start))) :
        tab === 'past' ? isPast(new Date(e.end)) : true
      )
    );
  }, [calendarEvents, enriched, tab]);

  const tabCounts = useMemo(() => ({
    upcoming: enriched.filter(({ calEvent }) => !calEvent || isFuture(new Date(calEvent.start)) || isToday(new Date(calEvent.start))).length,
    all: enriched.length,
    past: enriched.filter(({ calEvent }) => calEvent && isPast(new Date(calEvent.end))).length,
  }), [enriched]);

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cdv-orange/15 border border-cdv-orange/25">
            <PartyPopper size={16} className="text-cdv-orange" />
          </div>
          <div>
            <h2 className="text-white font-bold text-[16px]">Eventy CDV</h2>
            <p className="text-white/35 text-[12px]">Wszystkie wydarzenia i eventy uczelni</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold bg-cdv-orange text-white hover:brightness-110 transition-all shadow-lg shadow-cdv-orange/20"
        >
          <PlusCircle size={13} />
          Nowy event
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-2xl p-1 w-fit">
        {(['upcoming', 'all', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
              tab === t ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t === 'upcoming' ? 'Nadchodzące' : t === 'all' ? 'Wszystkie' : 'Minione'}
            <span className="text-[10px] opacity-60">{tabCounts[t]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj eventów..."
          className="w-full pl-9 pr-8 py-2 text-[13px] bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Event cards grid */}
      {filtered.length === 0 && standaloneCalEvents.length === 0 ? (
        <div className="text-center py-16 text-white/25">
          <PartyPopper size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-[14px] font-medium">Brak eventów w tej kategorii</p>
          <p className="text-[12px] mt-1">Utwórz nowe zgłoszenie z kategorią "Wydarzenie"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(({ ticket, calEvent }) => {
            const isPastEvent = calEvent ? isPast(new Date(calEvent.end)) : false;
            const isUpcoming = calEvent ? isFuture(new Date(calEvent.start)) : false;
            const isTodayEvent = calEvent ? isToday(new Date(calEvent.start)) : false;

            const leftBorderColor = calEvent ? eventTypeColor[calEvent.type] : undefined;
            const cardBg = calEvent ? eventTypeColor[calEvent.type] + '0d' : undefined;

            return (
              <div
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className={`group cursor-pointer border rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                  isPastEvent ? 'opacity-50 border-white/8 bg-white/[0.03]' :
                  isTodayEvent ? 'border-cdv-orange/40 shadow-lg shadow-cdv-orange/10 bg-white/[0.06]' :
                  'border-white/10 hover:border-white/20 bg-white/[0.05] hover:bg-white/[0.08]'
                }`}
                style={leftBorderColor ? { borderLeft: `3px solid ${leftBorderColor}`, background: cardBg } : undefined}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${isTodayEvent ? 'bg-cdv-orange/20 border-cdv-orange/30' : 'bg-white/[0.07] border-white/10'}`}>
                      <PartyPopper size={14} className={isTodayEvent ? 'text-cdv-orange' : 'text-white/50'} />
                    </div>
                    <div>
                      {isTodayEvent && (
                        <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#FF6900' }}>Dziś</span>
                      )}
                      {isUpcoming && !isTodayEvent && (
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block">Nadchodzące</span>
                      )}
                      {isPastEvent && (
                        <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest block">Minione</span>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${STATUS_PILL[ticket.status]}`}>
                    <span className="w-1 h-1 rounded-full bg-current opacity-70" />
                    {statusLabel[ticket.status]}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[14px] font-bold text-white mb-1 group-hover:brightness-110 transition-colors line-clamp-2">
                  {ticket.title}
                </h3>
                <p className="text-[12px] text-white/40 font-mono mb-3">{ticket.id}</p>

                {/* Calendar date */}
                {calEvent && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar size={12} className="text-cdv-gold/60 flex-shrink-0" />
                    <span className="text-[12px] text-white/60 font-medium">
                      {format(new Date(calEvent.start), 'dd MMM yyyy, HH:mm', { locale: pl })}
                    </span>
                  </div>
                )}

                {/* Room */}
                {ticket.room && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={12} className="text-white/30 flex-shrink-0" />
                    <span className="text-[12px] text-white/45">{ticket.room}</span>
                  </div>
                )}

                {/* Requester */}
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-white/30 flex-shrink-0" />
                  <span className="text-[11px] text-white/30">{formatRelative(ticket.createdAt)} · {ticket.requesterName}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.07]">
                  {calEvent ? (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-300/70">
                      <CalendarCheck2 size={11} />
                      W kalendarzu
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-white/25">
                      <Calendar size={11} />
                      Brak w kalendarzu
                    </div>
                  )}
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}

          {/* Standalone calendar events (not linked to tickets) */}
          {standaloneCalEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => navigate('/calendar')}
              className="group cursor-pointer border border-dashed rounded-2xl p-4 hover:bg-white/[0.07] transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: eventTypeColor[ev.type] + '0a', borderColor: eventTypeColor[ev.type] + '50', borderLeft: `3px solid ${eventTypeColor[ev.type]}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl border" style={{ background: eventTypeColor[ev.type] + '18', borderColor: eventTypeColor[ev.type] + '30' }}>
                  <Calendar size={14} style={{ color: eventTypeColor[ev.type] }} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: eventTypeColor[ev.type] + 'aa' }}>Tylko w kalendarzu</span>
              </div>
              <h3 className="text-[14px] font-semibold text-white/80 mb-2 line-clamp-2">{ev.title}</h3>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-white/25" />
                <span className="text-[12px] text-white/35">
                  {format(new Date(ev.start), 'dd MMM yyyy, HH:mm', { locale: pl })}
                </span>
              </div>
              {ev.room && (
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={12} className="text-white/20" />
                  <span className="text-[12px] text-white/30">{ev.room}</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                <span className="text-[11px] text-white/25">Brak zgłoszenia IT</span>
                <ChevronRight size={14} className="text-white/15 group-hover:text-white/40 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
