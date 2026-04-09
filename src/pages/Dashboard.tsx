import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle2,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  Flame,
  Activity,
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
  const closed = tickets.filter((t) => t.status === 'closed' || t.status === 'resolved').length;
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
      icon: <Ticket size={20} />,
      accent: 'from-blue-500 to-cdv-blue',
      iconBg: 'bg-blue-50 text-blue-600',
      trend: `${open} aktywnych`,
      onClick: () => navigate('/tickets?status=open'),
    },
    {
      label: 'W trakcie realizacji',
      value: inProgress,
      icon: <Clock size={20} />,
      accent: 'from-amber-400 to-orange-500',
      iconBg: 'bg-amber-50 text-amber-600',
      trend: `${inProgress} przypisanych`,
      onClick: () => navigate('/tickets?status=in-progress'),
    },
    {
      label: 'Zakończone',
      value: closed,
      icon: <CheckCircle2 size={20} />,
      accent: 'from-emerald-400 to-teal-500',
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: `z ${total} wszystkich`,
      onClick: () => navigate('/tickets?status=closed'),
    },
    {
      label: 'Zgodność z SLA',
      value: `${slaCompliance}%`,
      icon: <ShieldCheck size={20} />,
      accent: slaCompliance >= 90 ? 'from-violet-400 to-purple-600' : 'from-red-400 to-rose-600',
      iconBg: slaCompliance >= 90 ? 'bg-violet-50 text-violet-600' : 'bg-red-50 text-red-600',
      trend: `${notBreached}/${total} terminowo`,
      onClick: () => navigate('/tickets'),
    },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto animate-fade-in">
      {/* Critical alert */}
      {criticalOpen.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200/70 rounded-2xl p-4 animate-fade-up">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Flame size={18} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-red-800 font-bold text-sm">
              {criticalOpen.length} krytyczne zgłoszenie{criticalOpen.length > 1 ? 'a' : ''} wymaga natychmiastowej uwagi
            </p>
            <p className="text-red-500 text-xs mt-0.5 font-mono">
              {criticalOpen.map((t) => t.id).join(' · ')}
            </p>
          </div>
          <Button size="sm" variant="danger" onClick={() => navigate('/tickets?priority=critical')}>
            Przejdź
          </Button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <button
            key={card.label}
            onClick={card.onClick}
            className={`stat-card text-left p-5 animate-fade-up animate-delay-${i * 50 + 100}`}
          >
            {/* Gradient top bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accent} rounded-t-2xl`} />
            <div className="flex items-start justify-between pt-1">
              <div>
                <p className="text-[12px] font-semibold text-ink-faint mb-2 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-3xl font-extrabold text-ink tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1 mt-2 text-[12px] text-ink-faint font-medium">
                  <Activity size={11} />
                  {card.trend}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>{card.icon}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent tickets */}
        <Card padding={false} className="xl:col-span-2 animate-fade-up animate-delay-200">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-surface-border">
            <h2 className="text-[14px] font-bold text-ink">Ostatnie zgłoszenia</h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/tickets')}>
              Wszystkie <ArrowRight size={13} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-ink-faint uppercase tracking-[0.08em] border-b border-surface-border bg-surface/50">
                  <th className="text-left px-5 py-3">ID / Tytuł</th>
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
                    className={`cursor-pointer hover:bg-surface/60 transition-colors group ${
                      idx < recentTickets.length - 1 ? 'border-b border-surface-border' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-mono font-bold text-cdv-blue group-hover:text-cdv-blue-mid">
                          {ticket.id}
                        </span>
                        <span className="text-[13px] text-ink font-medium truncate max-w-[200px]">
                          {ticket.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge dot className={statusColor[ticket.status]}>{statusLabel[ticket.status]}</Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <Badge className={priorityColor[ticket.priority]}>{priorityLabel[ticket.priority]}</Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-[13px] text-ink-muted truncate max-w-[140px] block">
                        {ticket.requesterName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-[12px] text-ink-faint">{formatRelative(ticket.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-5">
          {/* Quick actions */}
          <Card className="animate-fade-up animate-delay-250">
            <h2 className="text-[14px] font-bold text-ink mb-4">Szybkie akcje</h2>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="primary" onClick={() => navigate('/tickets/new')}>
                <PlusCircle size={15} />
                Utwórz nowe zgłoszenie
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/tickets')}>
                <Ticket size={15} />
                Przeglądaj zgłoszenia
              </Button>
              <Button className="w-full justify-start" variant="ghost" onClick={() => navigate('/calendar')}>
                <Clock size={15} />
                Otwórz kalendarz
              </Button>
            </div>
          </Card>

          {/* Category breakdown */}
          <Card className="animate-fade-up animate-delay-300">
            <h2 className="text-[14px] font-bold text-ink mb-4">Wg kategorii</h2>
            <div className="space-y-3">
              {(['Hardware', 'Software', 'Network', 'Access', 'Other'] as const).map((cat) => {
                const count = tickets.filter((t) => t.category === cat).length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-[13px] mb-1.5">
                      <span className="text-ink-muted font-medium">{categoryLabel[cat]}</span>
                      <span className="font-bold text-ink tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cdv-blue to-cdv-blue-mid rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent activity */}
          <Card className="animate-fade-up animate-delay-350">
            <h2 className="text-[14px] font-bold text-ink mb-4">Ostatnia aktywność</h2>
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
                    <div className="w-7 h-7 rounded-full bg-cdv-blue-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-cdv-blue text-[11px] font-bold">
                        {comment.author.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] text-ink-muted leading-snug">
                        <span className="font-semibold text-ink">{comment.author}</span>
                        {' · '}
                        <span className="font-mono text-cdv-blue group-hover:underline text-[11px]">
                          {comment.ticketId}
                        </span>
                      </p>
                      <p className="text-[12px] text-ink-faint truncate">{comment.content}</p>
                      <p className="text-[11px] text-ink-faint/70 mt-0.5">{formatDate(comment.createdAt)}</p>
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
