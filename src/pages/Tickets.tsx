import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, PlusCircle, ChevronUp, ChevronDown, X,
  Cpu, Code2, Wifi, KeyRound, CalendarCheck2, MoreHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { TicketStatus, TicketPriority, TicketCategory } from '../types';
import {
  statusLabel, priorityLabel,
  categoryLabel, formatRelative, ALL_STATUSES, ALL_PRIORITIES, ALL_CATEGORIES,
} from '../utils/helpers';

type SortField = 'id' | 'title' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<TicketPriority, number> = {
  critical: 4, high: 3, medium: 2, low: 1,
};

const CATEGORY_ICON: Record<TicketCategory, React.ReactNode> = {
  Hardware:  <Cpu size={12} />,
  Software:  <Code2 size={12} />,
  Network:   <Wifi size={12} />,
  Access:    <KeyRound size={12} />,
  Event:     <CalendarCheck2 size={12} />,
  Other:     <MoreHorizontal size={12} />,
};

const STATUS_TAB_COLOR: Record<TicketStatus | 'all', string> = {
  all:          'text-white bg-white/15 border-white/20',
  open:         'text-blue-200 bg-blue-500/20 border-blue-400/30',
  'in-progress':'text-yellow-200 bg-yellow-500/15 border-yellow-400/25',
  pending:      'text-purple-200 bg-purple-500/15 border-purple-400/25',
  resolved:     'text-emerald-200 bg-emerald-500/15 border-emerald-400/25',
  closed:       'text-white/40 bg-white/5 border-white/10',
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

  // Status counts
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
    if (sortField !== field) return <ArrowUpDown size={10} className="opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-cdv-gold" />
      : <ChevronDown size={11} className="text-cdv-gold" />;
  };

  const getRowStyle = (status: TicketStatus) => {
    if (status === 'closed') return 'opacity-40 grayscale-[0.6]';
    if (status === 'resolved') return 'border-l-2 border-l-emerald-400/60';
    return '';
  };

  const PRIORITY_PILL: Record<TicketPriority, string> = {
    critical: 'bg-red-500/20 text-red-300 border border-red-500/30',
    high:     'bg-orange-500/15 text-orange-300 border border-orange-400/25',
    medium:   'bg-blue-500/15 text-blue-300 border border-blue-400/25',
    low:      'bg-white/8 text-white/40 border border-white/10',
  };

  const STATUS_PILL: Record<TicketStatus, string> = {
    open:          'bg-blue-500/20 text-blue-300 border border-blue-400/30',
    'in-progress': 'bg-yellow-500/15 text-yellow-300 border border-yellow-400/25',
    pending:       'bg-purple-500/15 text-purple-300 border border-purple-400/25',
    resolved:      'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25',
    closed:        'bg-white/5 text-white/30 border border-white/10',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fade-in">

      {/* Status tab bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter('status', '')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all duration-200 ${
            !statusFilter ? STATUS_TAB_COLOR['all'] : 'text-white/35 bg-white/[0.04] border-white/8 hover:bg-white/8'
          }`}
        >
          Wszystkie
          <span className="text-[11px] opacity-70">{statusCounts.all}</span>
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter('status', statusFilter === s ? '' : s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all duration-200 ${
              statusFilter === s ? STATUS_TAB_COLOR[s] : 'text-white/35 bg-white/[0.04] border-white/8 hover:bg-white/8'
            }`}
          >
            {statusLabel[s]}
            <span className="text-[11px] opacity-70">{statusCounts[s]}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearchParam(e.target.value)}
            placeholder="Szukaj po ID, tytule, osobie…"
            className="w-full pl-9 pr-8 py-2 text-[13px] bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.09] transition-all duration-200"
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
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
              showFilters || (priorityFilter || categoryFilter)
                ? 'bg-white/15 border-white/25 text-white'
                : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filtry
            {(priorityFilter || categoryFilter) && (
              <span className="w-4 h-4 bg-cdv-gold text-cdv-blue text-[9px] rounded-full flex items-center justify-center font-bold">
                {[priorityFilter, categoryFilter].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/tickets/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold bg-cdv-gold text-cdv-blue hover:brightness-110 transition-all duration-200 shadow-lg shadow-cdv-gold/20"
          >
            <PlusCircle size={13} />
            Nowe zgłoszenie
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-4 animate-fade-up">
          <div className="flex flex-wrap gap-4 items-end">
            {[
              { key: 'priority', label: 'Priorytet', options: ALL_PRIORITIES, labels: priorityLabel, value: priorityFilter },
              { key: 'category', label: 'Kategoria', options: ALL_CATEGORIES, labels: categoryLabel, value: categoryFilter },
            ].map(({ key, label, options, labels, value }) => (
              <div key={key}>
                <label className="text-[10px] font-bold text-white/40 mb-1.5 block uppercase tracking-widest">{label}</label>
                <select
                  value={value}
                  onChange={(e) => setFilter(key, e.target.value)}
                  className="text-[13px] bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/30 transition-all"
                >
                  <option value="" className="bg-[#001233]">Wszystkie</option>
                  {(options as string[]).map((s) => (
                    <option key={s} value={s} className="bg-[#001233]">{(labels as Record<string, string>)[s]}</option>
                  ))}
                </select>
              </div>
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 transition-all"
              >
                <X size={12} /> Wyczyść filtry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Count */}
      <p className="text-[12px] text-white/40 font-medium">
        Wyświetlono{' '}
        <span className="font-bold text-white/70">{filtered.length}</span>
        {' '}z {tickets.length} zgłoszeń
        {search && (
          <span className="ml-1">
            dla „<span className="text-cdv-gold font-semibold">{search}</span>"
          </span>
        )}
      </p>

      {/* Table */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {([
                  { field: 'id', label: 'ID' },
                  { field: 'title', label: 'Tytuł' },
                  { field: 'status', label: 'Status' },
                  { field: 'priority', label: 'Priorytet' },
                ] as { field: SortField; label: string }[]).map(({ field, label }) => (
                  <th
                    key={field}
                    className="text-left px-4 py-3 cursor-pointer select-none text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]"
                    onClick={() => handleSort(field)}
                  >
                    <span className="flex items-center gap-1.5 hover:text-white/55 transition-colors">
                      {label} <SortIcon field={field} />
                    </span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 hidden md:table-cell text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Kategoria</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Przypisany</th>
                <th
                  className="text-left px-4 py-3 hidden xl:table-cell cursor-pointer select-none text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]"
                  onClick={() => handleSort('createdAt')}
                >
                  <span className="flex items-center gap-1.5 hover:text-white/55 transition-colors">
                    Utworzono <SortIcon field="createdAt" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-white/25">
                    <Search size={30} className="mx-auto mb-3 opacity-30" />
                    <p className="text-[13px] font-medium">Brak zgłoszeń spełniających kryteria</p>
                  </td>
                </tr>
              ) : (
                filtered.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className={`cursor-pointer border-b border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-150 last:border-0 ${getRowStyle(ticket.status)}`}
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-cdv-gold/80">
                        {ticket.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className={`text-[13px] font-semibold truncate ${ticket.status === 'closed' ? 'line-through text-white/25' : 'text-white/90'}`}>
                        {ticket.title}
                      </p>
                      <p className="text-[11px] text-white/35 truncate mt-0.5">{ticket.requesterName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${STATUS_PILL[ticket.status]}`}>
                        <span className="w-1 h-1 rounded-full bg-current opacity-70" />
                        {statusLabel[ticket.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold ${PRIORITY_PILL[ticket.priority]}`}>
                        {priorityLabel[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white/[0.07] text-white/50 border border-white/10">
                        <span className="text-white/40">{CATEGORY_ICON[ticket.category]}</span>
                        {categoryLabel[ticket.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {ticket.assignee ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cdv-blue/40 border border-white/15 flex items-center justify-center text-[9px] font-bold text-white/70 flex-shrink-0">
                            {ticket.assignee.charAt(0)}
                          </span>
                          <span className="text-[12px] text-white/55 truncate">{ticket.assignee}</span>
                        </span>
                      ) : (
                        <span className="text-[12px] text-white/20 italic">Nieprzypisany</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-[11px] text-white/30">{formatRelative(ticket.createdAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
