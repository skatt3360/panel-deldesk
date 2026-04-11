import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, PlusCircle, ChevronUp, ChevronDown, X,
  Cpu, Code2, Wifi, KeyRound, CalendarCheck2, MoreHorizontal,
  ArrowUpDown, Clock, AlertTriangle, Flame, Zap, Link2,
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { TicketStatus, TicketPriority, TicketCategory } from '../types';
import {
  priorityLabel,
  categoryLabel, formatRelative, ALL_STATUSES, ALL_PRIORITIES, ALL_CATEGORIES,
} from '../utils/helpers';

type SortField = 'id' | 'title' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<TicketPriority, number> = {
  critical: 4, high: 3, medium: 2, low: 1,
};

const CATEGORY_ICON: Record<TicketCategory, React.ReactNode> = {
  Hardware:  <Cpu size={11} />,
  Software:  <Code2 size={11} />,
  Network:   <Wifi size={11} />,
  Access:    <KeyRound size={11} />,
  Event:     <CalendarCheck2 size={11} />,
  Other:     <MoreHorizontal size={11} />,
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  open:          { label: 'Otwarte',    dot: 'bg-blue-400',    bg: 'bg-blue-500/15',    text: 'text-blue-300',    border: 'border-blue-400/25' },
  'in-progress': { label: 'W trakcie',  dot: 'bg-yellow-400',  bg: 'bg-yellow-500/12',  text: 'text-yellow-300',  border: 'border-yellow-400/20' },
  pending:       { label: 'Oczekujące', dot: 'bg-purple-400',  bg: 'bg-purple-500/12',  text: 'text-purple-300',  border: 'border-purple-400/20' },
  resolved:      { label: 'Rozwiązane', dot: 'bg-emerald-400', bg: 'bg-emerald-500/12', text: 'text-emerald-300', border: 'border-emerald-400/20' },
  closed:        { label: 'Zamknięte',  dot: 'bg-white/20',    bg: 'bg-white/5',         text: 'text-white/30',    border: 'border-white/10' },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  critical: { label: 'Krytyczny', icon: <Flame size={10} />,         bg: 'bg-red-500/20',     text: 'text-red-300',     border: 'border-red-500/30' },
  high:     { label: 'Wysoki',    icon: <AlertTriangle size={10} />, bg: 'bg-orange-500/15',  text: 'text-orange-300',  border: 'border-orange-400/25' },
  medium:   { label: 'Średni',    icon: <Zap size={10} />,           bg: 'bg-white/[0.06]',   text: 'text-white/50',         border: 'border-white/10' },
  low:      { label: 'Niski',     icon: <Clock size={10} />,         bg: 'bg-white/6',        text: 'text-white/35',    border: 'border-white/10' },
};

const Tickets: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tickets = useTicketStore((s) => s.tickets);

  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const statusFilter = (searchParams.get('status') as TicketStatus | null) ?? '';
  const priorityFilter = (searchParams.get('priority') as TicketPriority | null) ?? '';
  const categoryFilter = (searchParams.get('category') as TicketCategory | null) ?? '';
  const urlSearch = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => { setSearch(urlSearch); }, [urlSearch]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const setSearchParam = (value: string) => {
    setSearch(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value); else next.delete('q');
    setSearchParams(next);
  };

  const clearFilters = () => { setSearchParams({}); setSearch(''); };
  const hasFilters = !!statusFilter || !!priorityFilter || !!categoryFilter || !!search;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tickets.length };
    ALL_STATUSES.forEach((s) => { counts[s] = tickets.filter((t) => t.status === s).length; });
    return counts;
  }, [tickets]);

  const filtered = useMemo(() => {
    let result = [...tickets];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q) ||
          t.requesterEmail.toLowerCase().includes(q) ||
          (t.assignee ?? '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter) result = result.filter((t) => t.priority === priorityFilter);
    if (categoryFilter) result = result.filter((t) => t.category === categoryFilter);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'id') cmp = a.id.localeCompare(b.id);
      else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortField === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      else if (sortField === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === 'updatedAt') cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={10} className="opacity-20" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-cdv-orange" />
      : <ChevronDown size={11} className="text-cdv-orange" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-white font-display tracking-tight">Zgłoszenia</h1>
          <p className="text-[12px] text-white/40 mt-0.5">
            {tickets.length} zgłoszeń łącznie
            {hasFilters && <span className="ml-1 text-cdv-orange">· {filtered.length} pasuje do filtrów</span>}
          </p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="btn-purple"
        >
          <PlusCircle size={14} />
          Nowe zgłoszenie
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter('status', '')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold border transition-all duration-200 ${
            !statusFilter
              ? 'bg-white/15 border-white/25 text-white'
              : 'text-white/35 bg-white/[0.04] border-white/8 hover:bg-white/8 hover:text-white/60'
          }`}
        >
          Wszystkie
          <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-bold">{statusCounts.all}</span>
        </button>
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter('status', active ? '' : s)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold border transition-all duration-200 ${
                active
                  ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                  : 'text-white/35 bg-white/[0.04] border-white/8 hover:bg-white/8 hover:text-white/60'
              }`}
            >
              {active && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
              {cfg.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${active ? 'bg-white/15' : 'bg-white/8'}`}>
                {statusCounts[s]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearchParam(e.target.value)}
            placeholder="Szukaj po ID, tytule, osobie…"
            className="w-full pl-9 pr-8 py-2.5 text-[13px] bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cdv-orange/50 focus:bg-white/[0.09] transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearchParam('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 flex-shrink-0 ${
            showFilters || priorityFilter || categoryFilter
              ? 'bg-white/15 border-white/25 text-white'
              : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filtry
          {(priorityFilter || categoryFilter) && (
            <span className="w-4 h-4 rounded-full bg-cdv-orange text-white text-[9px] flex items-center justify-center font-bold">
              {[priorityFilter, categoryFilter].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 animate-fade-up">
          <div className="flex flex-wrap gap-5 items-end">
            {[
              { key: 'priority', label: 'Priorytet', options: ALL_PRIORITIES, labels: priorityLabel, value: priorityFilter },
              { key: 'category', label: 'Kategoria', options: ALL_CATEGORIES, labels: categoryLabel, value: categoryFilter },
            ].map(({ key, label, options, labels, value }) => (
              <div key={key}>
                <label className="text-[10px] font-bold text-white/40 mb-1.5 block uppercase tracking-[0.1em]">{label}</label>
                <select
                  value={value}
                  onChange={(e) => setFilter(key, e.target.value)}
                  className="text-[13px] bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cdv-orange/50 transition-all min-w-[140px]"
                >
                  <option value="" className="bg-[#0A0812]">Wszystkie</option>
                  {(options as string[]).map((s) => (
                    <option key={s} value={s} className="bg-[#0A0812]">{(labels as Record<string, string>)[s]}</option>
                  ))}
                </select>
              </div>
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
              >
                <X size={12} /> Wyczyść filtry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/20">
          <Search size={36} className="mb-4 opacity-25" />
          <p className="text-[14px] font-semibold">Brak zgłoszeń</p>
          <p className="text-[12px] mt-1 opacity-60">Spróbuj zmienić filtry lub wyszukiwanie</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2">
            {([
              { field: 'id' as SortField,        label: 'ID',         cols: 'col-span-2' },
              { field: 'title' as SortField,     label: 'Tytuł',      cols: 'col-span-4' },
              { field: 'status' as SortField,    label: 'Status',     cols: 'col-span-2' },
              { field: 'priority' as SortField,  label: 'Priorytet',  cols: 'col-span-2' },
              { field: 'createdAt' as SortField, label: 'Utworzono',  cols: 'col-span-2' },
            ]).map(({ field, label, cols }) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`${cols} text-left flex items-center gap-1 text-[10px] font-bold text-white/25 uppercase tracking-[0.1em] hover:text-white/50 transition-colors`}
              >
                {label} <SortIcon field={field} />
              </button>
            ))}
          </div>

          {filtered.map((ticket, idx) => {
            const sc = STATUS_CONFIG[ticket.status];
            const pc = PRIORITY_CONFIG[ticket.priority];
            const isClosed = ticket.status === 'closed';
            const isResolved = ticket.status === 'resolved';

            return (
              <div
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className={`
                  group relative grid grid-cols-12 gap-3 items-center
                  px-4 py-3.5 rounded-2xl border cursor-pointer
                  transition-all duration-200
                  ${isClosed
                    ? 'opacity-40 grayscale-[0.6] bg-white/[0.02] border-white/[0.05] hover:opacity-55'
                    : isResolved
                      ? 'bg-emerald-500/[0.06] border-emerald-500/15 hover:bg-emerald-500/[0.1] hover:border-emerald-500/25'
                      : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/15'
                  }
                  animate-fade-up
                `}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                {/* Priority accent bar */}
                {!isClosed && (
                  <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full ${
                    ticket.priority === 'critical' ? 'bg-red-500' :
                    ticket.priority === 'high' ? 'bg-orange-500' :
                    ticket.priority === 'medium' ? 'bg-white/20' :
                    'bg-white/10'
                  }`} />
                )}

                {/* ID */}
                <div className="col-span-2">
                  <span className="font-mono text-[11px] font-bold text-cdv-orange/70 group-hover:text-cdv-orange transition-colors">
                    {ticket.id}
                  </span>
                  {ticket.linkedCalendarEventId && (
                    <span className="ml-1.5 text-white/25" title="Powiązane z kalendarzem">
                      <Link2 size={9} className="inline" />
                    </span>
                  )}
                </div>

                {/* Title + requester */}
                <div className="col-span-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-white/30 flex-shrink-0 ${isClosed ? 'opacity-50' : ''}`}>
                      {CATEGORY_ICON[ticket.category]}
                    </span>
                    <p className={`text-[13px] font-semibold truncate leading-snug ${
                      isClosed ? 'line-through text-white/25' : 'text-white/90 group-hover:text-white'
                    }`}>
                      {ticket.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-white/30 truncate mt-0.5 pl-5">
                    {ticket.requesterName}
                    {ticket.assignee && (
                      <span className="ml-1.5 text-white/20">→ {ticket.assignee}</span>
                    )}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                    <span className={`w-1 h-1 rounded-full ${sc.dot} flex-shrink-0`} />
                    {sc.label}
                  </span>
                </div>

                {/* Priority */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${pc.bg} ${pc.text} ${pc.border}`}>
                    {pc.icon}
                    {pc.label}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-2 text-right">
                  <span className="text-[11px] text-white/25 group-hover:text-white/40 transition-colors">
                    {formatRelative(ticket.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tickets;
