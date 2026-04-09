import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PlusCircle, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { TicketStatus, TicketPriority, TicketCategory } from '../types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  statusLabel,
  statusColor,
  priorityLabel,
  priorityColor,
  categoryLabel,
  formatRelative,
  ALL_STATUSES,
  ALL_PRIORITIES,
  ALL_CATEGORIES,
} from '../utils/helpers';

type SortField = 'id' | 'title' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<TicketPriority, number> = {
  critical: 4, high: 3, medium: 2, low: 1,
};

const Tickets: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tickets = useTicketStore((s) => s.tickets);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const statusFilter = (searchParams.get('status') as TicketStatus | null) ?? '';
  const priorityFilter = (searchParams.get('priority') as TicketPriority | null) ?? '';
  const categoryFilter = (searchParams.get('category') as TicketCategory | null) ?? '';

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => { setSearchParams({}); setSearch(''); };
  const hasFilters = !!statusFilter || !!priorityFilter || !!categoryFilter || !!search;

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
    if (sortField !== field)
      return <ChevronUp size={11} className="text-ink-faint opacity-0 group-hover:opacity-60" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-cdv-blue" />
      : <ChevronDown size={11} className="text-cdv-blue" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po ID, tytule, osobie…"
            className="input-base pl-9"
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal size={14} />
            Filtry
            {hasFilters && (
              <span className="w-4 h-4 bg-cdv-blue text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {[statusFilter, priorityFilter, categoryFilter, search].filter(Boolean).length}
              </span>
            )}
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/tickets/new')}>
            <PlusCircle size={14} />
            Nowe zgłoszenie
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="py-4 animate-fade-up">
          <div className="flex flex-wrap gap-3 items-end">
            {[
              { key: 'status', label: 'Status', options: ALL_STATUSES, labels: statusLabel, value: statusFilter },
              { key: 'priority', label: 'Priorytet', options: ALL_PRIORITIES, labels: priorityLabel, value: priorityFilter },
              { key: 'category', label: 'Kategoria', options: ALL_CATEGORIES, labels: categoryLabel, value: categoryFilter },
            ].map(({ key, label, options, labels, value }) => (
              <div key={key}>
                <label className="text-[11px] font-bold text-ink-faint mb-1.5 block uppercase tracking-wider">{label}</label>
                <select
                  value={value}
                  onChange={(e) => setFilter(key, e.target.value)}
                  className="select-base"
                >
                  <option value="">Wszystkie</option>
                  {(options as string[]).map((s) => (
                    <option key={s} value={s}>{(labels as Record<string, string>)[s]}</option>
                  ))}
                </select>
              </div>
            ))}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={13} /> Wyczyść filtry
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Count */}
      <p className="text-[13px] text-ink-faint font-medium">
        Wyświetlono <span className="font-bold text-ink">{filtered.length}</span> z {tickets.length} zgłoszeń
      </p>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-ink-faint uppercase tracking-[0.08em] border-b border-surface-border bg-surface/50">
                {([
                  { field: 'id', label: 'ID' },
                  { field: 'title', label: 'Tytuł' },
                  { field: 'status', label: 'Status' },
                  { field: 'priority', label: 'Priorytet' },
                ] as { field: SortField; label: string }[]).map(({ field, label }) => (
                  <th
                    key={field}
                    className="text-left px-4 py-3 cursor-pointer group select-none"
                    onClick={() => handleSort(field)}
                  >
                    <span className="flex items-center gap-1 hover:text-ink-muted transition-colors">
                      {label}
                      <SortIcon field={field} />
                    </span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 hidden md:table-cell">Kategoria</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Przypisany</th>
                <th
                  className="text-left px-4 py-3 hidden xl:table-cell cursor-pointer group select-none"
                  onClick={() => handleSort('createdAt')}
                >
                  <span className="flex items-center gap-1 hover:text-ink-muted transition-colors">
                    Utworzono <SortIcon field="createdAt" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-ink-faint">
                    <Search size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-[13px] font-medium">Brak zgłoszeń spełniających kryteria</p>
                  </td>
                </tr>
              ) : (
                filtered.map((ticket, idx) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className={`cursor-pointer hover:bg-surface/60 transition-colors group ${
                      idx < filtered.length - 1 ? 'border-b border-surface-border' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-cdv-blue group-hover:text-cdv-blue-mid">
                        {ticket.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="text-[13px] text-ink font-semibold truncate">{ticket.title}</p>
                      <p className="text-[11px] text-ink-faint truncate">{ticket.requesterName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge dot className={statusColor[ticket.status]}>{statusLabel[ticket.status]}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={priorityColor[ticket.priority]}>{priorityLabel[ticket.priority]}</Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <Badge className="bg-surface text-ink-muted border border-surface-border">
                        {categoryLabel[ticket.category]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-[13px] text-ink-muted">
                        {ticket.assignee ?? <span className="text-ink-faint italic">Nieprzypisany</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-[12px] text-ink-faint">{formatRelative(ticket.createdAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Tickets;
