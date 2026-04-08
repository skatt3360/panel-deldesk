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
  formatDate,
  formatRelative,
  ALL_STATUSES,
  ALL_PRIORITIES,
  ALL_CATEGORIES,
} from '../utils/helpers';

type SortField = 'id' | 'title' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<TicketPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
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
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearch('');
  };

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
      else if (sortField === 'priority')
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      else if (sortField === 'createdAt')
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === 'updatedAt')
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronUp size={12} className="text-gray-300 opacity-0 group-hover:opacity-100" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-cdv-blue" />
    ) : (
      <ChevronDown size={12} className="text-cdv-blue" />
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po ID, tytule, osobie..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 focus:border-cdv-blue"
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={15} />
            Filtry
            {hasFilters && (
              <span className="w-4 h-4 bg-cdv-blue text-white text-[10px] rounded-full flex items-center justify-center">
                {[statusFilter, priorityFilter, categoryFilter, search].filter(Boolean).length}
              </span>
            )}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/tickets/new')}
          >
            <PlusCircle size={15} />
            Nowe
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="py-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setFilter('status', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cdv-blue/30"
              >
                <option value="">Wszystkie</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Priorytet</label>
              <select
                value={priorityFilter}
                onChange={(e) => setFilter('priority', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cdv-blue/30"
              >
                <option value="">Wszystkie</option>
                {ALL_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{priorityLabel[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Kategoria</label>
              <select
                value={categoryFilter}
                onChange={(e) => setFilter('category', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cdv-blue/30"
              >
                <option value="">Wszystkie</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{categoryLabel[c]}</option>
                ))}
              </select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={14} /> Wyczyść
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Wyświetlono <span className="font-semibold text-gray-900">{filtered.length}</span>{' '}
          z {tickets.length} zgłoszeń
        </span>
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                {(
                  [
                    { field: 'id', label: 'ID' },
                    { field: 'title', label: 'Tytuł' },
                    { field: 'status', label: 'Status' },
                    { field: 'priority', label: 'Priorytet' },
                  ] as { field: SortField; label: string }[]
                ).map(({ field, label }) => (
                  <th
                    key={field}
                    className="text-left px-4 py-3 cursor-pointer group select-none"
                    onClick={() => handleSort(field)}
                  >
                    <span className="flex items-center gap-1 hover:text-gray-600">
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
                  <span className="flex items-center gap-1 hover:text-gray-600">
                    Utworzono
                    <SortIcon field="createdAt" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <Search size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Brak zgłoszeń spełniających kryteria</p>
                  </td>
                </tr>
              ) : (
                filtered.map((ticket, idx) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      idx < filtered.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-semibold text-cdv-blue">
                        {ticket.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="text-sm text-gray-800 font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-gray-400 truncate">{ticket.requesterName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={statusColor[ticket.status]}>
                        {statusLabel[ticket.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={priorityColor[ticket.priority]}>
                        {priorityLabel[ticket.priority]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <Badge className="bg-gray-100 text-gray-600">
                        {categoryLabel[ticket.category]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {ticket.assignee ?? (
                          <span className="text-gray-300 italic">Nieprzypisany</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-xs text-gray-400">{formatRelative(ticket.createdAt)}</span>
                      <p className="text-[11px] text-gray-300">{formatDate(ticket.createdAt)}</p>
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
