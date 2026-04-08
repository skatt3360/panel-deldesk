import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  statusLabel,
  statusColor,
  priorityLabel,
  priorityColor,
  categoryLabel,
  formatRelative,
  formatDate,
} from '../utils/helpers';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const tickets = useTicketStore((s) => s.tickets);

  const open = tickets.filter((t) => t.status === 'open').length;
  const inProgress = tickets.filter((t) => t.status === 'in-progress').length;
  const closed = tickets.filter(
    (t) => t.status === 'closed' || t.status === 'resolved'
  ).length;
  const total = tickets.length;
  const notBreached = tickets.filter((t) => !t.slaBreached).length;
  const slaCompliance = total > 0 ? Math.round((notBreached / total) * 100) : 100;

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const criticalOpen = tickets.filter(
    (t) => t.priority === 'critical' && (t.status === 'open' || t.status === 'in-progress')
  );

  const statCards = [
    {
      label: 'Otwarte zgłoszenia',
      value: open,
      icon: <Ticket size={22} />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: `+${open} aktywne`,
      onClick: () => navigate('/tickets?status=open'),
    },
    {
      label: 'W trakcie realizacji',
      value: inProgress,
      icon: <Clock size={22} />,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      trend: `${inProgress} przypisane`,
      onClick: () => navigate('/tickets?status=in-progress'),
    },
    {
      label: 'Zakończone',
      value: closed,
      icon: <CheckCircle2 size={22} />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      trend: `z ${total} wszystkich`,
      onClick: () => navigate('/tickets?status=closed'),
    },
    {
      label: 'Zgodność z SLA',
      value: `${slaCompliance}%`,
      icon: <ShieldCheck size={22} />,
      color: slaCompliance >= 90 ? 'text-green-600' : 'text-orange-600',
      bg: slaCompliance >= 90 ? 'bg-green-50' : 'bg-orange-50',
      trend: `${notBreached}/${total} terminowo`,
      onClick: () => navigate('/tickets'),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Critical alerts */}
      {criticalOpen.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-red-800 font-medium text-sm">
              {criticalOpen.length} krytyczne zgłoszenie{criticalOpen.length > 1 ? 'a' : ''} wymagają natychmiastowej uwagi
            </p>
            <p className="text-red-600 text-xs mt-0.5">
              {criticalOpen.map((t) => t.id).join(', ')}
            </p>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => navigate('/tickets?priority=critical')}
          >
            Przejdź
          </Button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="cursor-pointer hover:shadow-md transition-shadow"
            padding={false}
          >
            <button
              onClick={card.onClick}
              className="w-full text-left p-6 rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <TrendingUp size={12} />
                    {card.trend}
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </button>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent tickets table */}
        <Card padding={false} className="xl:col-span-2">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Ostatnie zgłoszenia</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/tickets')}
            >
              Wszystkie <ArrowRight size={14} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-6 py-3">ID / Tytuł</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Priorytet</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Zgłaszający</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Czas</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket, idx) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      idx < recentTickets.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-cdv-blue font-semibold">
                          {ticket.id}
                        </span>
                        <span className="text-sm text-gray-700 truncate max-w-[180px]">
                          {ticket.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={statusColor[ticket.status]}>
                        {statusLabel[ticket.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <Badge className={priorityColor[ticket.priority]}>
                        {priorityLabel[ticket.priority]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600 truncate max-w-[140px] block">
                        {ticket.requesterName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">{formatRelative(ticket.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick actions + category breakdown */}
        <div className="space-y-5">
          {/* Quick actions */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Szybkie akcje</h2>
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="primary"
                onClick={() => navigate('/tickets/new')}
              >
                <PlusCircle size={16} />
                Utwórz nowe zgłoszenie
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/tickets')}
              >
                <Ticket size={16} />
                Przeglądaj zgłoszenia
              </Button>
              <Button
                className="w-full justify-start"
                variant="ghost"
                onClick={() => navigate('/calendar')}
              >
                <Clock size={16} />
                Otwórz kalendarz
              </Button>
            </div>
          </Card>

          {/* Category breakdown */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Wg kategorii</h2>
            <div className="space-y-3">
              {(['Hardware', 'Software', 'Network', 'Access', 'Other'] as const).map((cat) => {
                const count = tickets.filter((t) => t.category === cat).length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{categoryLabel[cat]}</span>
                      <span className="font-semibold text-gray-800">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cdv-blue rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent activity */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Ostatnia aktywność</h2>
            <div className="space-y-3">
              {tickets
                .flatMap((t) =>
                  t.comments
                    .filter((c) => c.authorRole !== 'system')
                    .map((c) => ({ ...c, ticketId: t.id }))
                )
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 4)
                .map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-2.5 cursor-pointer group"
                    onClick={() => navigate(`/tickets/${comment.ticketId}`)}
                  >
                    <div className="w-7 h-7 rounded-full bg-cdv-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-cdv-blue text-xs font-bold">
                        {comment.author.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{comment.author}</span>
                        {' · '}
                        <span className="font-mono text-cdv-blue group-hover:underline">
                          {comment.ticketId}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 truncate">{comment.content}</p>
                      <p className="text-[11px] text-gray-400">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
