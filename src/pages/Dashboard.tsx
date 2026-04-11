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
import {
  categoryLabel,
  formatRelative,
  formatDate,
} from '../utils/helpers';
import { TicketStatus, TicketPriority } from '../types';

const STATUS_CONFIG: Record<TicketStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  open:          { label: 'Otwarte',    dot: 'bg-blue-400',    bg: 'bg-blue-500/15',    text: 'text-blue-300',    border: 'border-blue-400/25' },
  'in-progress': { label: 'W trakcie',  dot: 'bg-yellow-400',  bg: 'bg-yellow-500/12',  text: 'text-yellow-300',  border: 'border-yellow-400/20' },
  pending:       { label: 'Oczekujące', dot: 'bg-purple-400',  bg: 'bg-purple-500/12',  text: 'text-purple-300',  border: 'border-purple-400/20' },
  resolved:      { label: 'Rozwiązane', dot: 'bg-emerald-400', bg: 'bg-emerald-500/12', text: 'text-emerald-300', border: 'border-emerald-400/20' },
  closed:        { label: 'Zamknięte',  dot: 'bg-white/20',    bg: 'bg-white/5',         text: 'text-white/30',    border: 'border-white/10' },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: 'Krytyczny', bg: 'bg-red-500/20',     text: 'text-red-300',     border: 'border-red-500/30' },
  high:     { label: 'Wysoki',    bg: 'bg-orange-500/15',  text: 'text-orange-300',  border: 'border-orange-400/25' },
  medium:   { label: 'Średni',    bg: 'bg-white/[0.06]',   text: 'text-white/50',    border: 'border-white/10' },
  low:      { label: 'Niski',     bg: 'bg-white/6',        text: 'text-white/35',    border: 'border-white/10' },
};

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
      icon: <Ticket size={20} className="text-blue-300" />,
      accent: 'from-blue-500 to-blue-600',
      trend: `${open} aktywnych`,
      onClick: () => navigate('/tickets?status=open'),
    },
    {
      label: 'W trakcie realizacji',
      value: inProgress,
      icon: <Clock size={20} className="text-amber-300" />,
      accent: 'from-amber-400 to-orange-500',
      trend: `${inProgress} przypisanych`,
      onClick: () => navigate('/tickets?status=in-progress'),
    },
    {
      label: 'Zakończone',
      value: closed,
      icon: <CheckCircle2 size={20} className="text-emerald-300" />,
      accent: 'from-emerald-400 to-teal-500',
      trend: `z ${total} wszystkich`,
      onClick: () => navigate('/tickets?status=closed'),
    },
    {
      label: 'Zgodność z SLA',
      value: `${slaCompliance}%`,
      icon: <ShieldCheck size={20} className={slaCompliance >= 90 ? 'text-violet-300' : 'text-red-300'} />,
      accent: slaCompliance >= 90 ? 'from-violet-400 to-purple-600' : 'from-red-400 to-rose-600',
      trend: `${notBreached}/${total} terminowo`,
      onClick: () => navigate('/tickets'),
    },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto animate-fade-in">
      {/* Critical alert */}
      {criticalOpen.length > 0 && (
        <div
          className="flex items-center gap-3 rounded-2xl p-4 animate-fade-up border"
          style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <Flame size={18} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-red-300 font-bold text-sm">
              {criticalOpen.length} krytyczne zgłoszenie{criticalOpen.length > 1 ? 'a' : ''} wymaga natychmiastowej uwagi
            </p>
            <p className="text-red-400/60 text-xs mt-0.5 font-mono">
              {criticalOpen.map((t) => t.id).join(' · ')}
            </p>
          </div>
          <button
            onClick={() => navigate('/tickets?priority=critical')}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[12px] font-bold bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all"
          >
            Przejdź
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <button
            key={card.label}
            onClick={card.onClick}
            className="relative text-left p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.accent} rounded-t-2xl`} />
            <div className="flex items-start justify-between pt-1">
              <div>
                <p className="text-[11px] font-bold text-white/30 mb-2 uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-extrabold text-white tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1 mt-2 text-[12px] text-white/30 font-medium">
                  <Activity size={11} />
                  {card.trend}
                </div>
              </div>
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                {card.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent tickets */}
        <div
          className="xl:col-span-2 rounded-2xl border overflow-hidden animate-fade-up"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.07]">
            <h2 className="text-[14px] font-bold text-white">Ostatnie zgłoszenia</h2>
            <button
              onClick={() => navigate('/tickets')}
              className="flex items-center gap-1 text-[12px] text-white/40 hover:text-white/70 transition-colors font-semibold"
            >
              Wszystkie <ArrowRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-white/25 uppercase tracking-[0.08em] border-b border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th className="text-left px-5 py-3">ID / Tytuł</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Priorytet</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Zgłaszający</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Czas</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket, idx) => {
                  const sc = STATUS_CONFIG[ticket.status];
                  const pc = PRIORITY_CONFIG[ticket.priority];
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className={`cursor-pointer transition-colors group hover:bg-white/[0.04] ${
                        idx < recentTickets.length - 1 ? 'border-b border-white/[0.06]' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-mono font-bold text-cdv-orange/70 group-hover:text-cdv-orange transition-colors">
                            {ticket.id}
                          </span>
                          <span className="text-[13px] text-white/80 font-medium truncate max-w-[200px]">
                            {ticket.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className={`w-1 h-1 rounded-full ${sc.dot} flex-shrink-0`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${pc.bg} ${pc.text} ${pc.border}`}>
                          {pc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-[13px] text-white/45 truncate max-w-[140px] block">
                          {ticket.requesterName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-[12px] text-white/25">{formatRelative(ticket.createdAt)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div
            className="rounded-2xl border p-5 animate-fade-up"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-[14px] font-bold text-white mb-4">Szybkie akcje</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/tickets/new')}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-cdv-orange text-white hover:brightness-110 transition-all"
              >
                <PlusCircle size={15} />
                Utwórz nowe zgłoszenie
              </button>
              <button
                onClick={() => navigate('/tickets')}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border border-white/15 text-white/70 hover:bg-white/[0.06] hover:text-white transition-all"
              >
                <Ticket size={15} />
                Przeglądaj zgłoszenia
              </button>
              <button
                onClick={() => navigate('/calendar')}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white/45 hover:text-white/70 hover:bg-white/[0.04] transition-all"
              >
                <Clock size={15} />
                Otwórz kalendarz
              </button>
            </div>
          </div>

          {/* Category breakdown */}
          <div
            className="rounded-2xl border p-5 animate-fade-up"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-[14px] font-bold text-white mb-4">Wg kategorii</h2>
            <div className="space-y-3">
              {(['Hardware', 'Software', 'Network', 'Access', 'Other'] as const).map((cat) => {
                const count = tickets.filter((t) => t.category === cat).length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-[13px] mb-1.5">
                      <span className="text-white/50 font-medium">{categoryLabel[cat]}</span>
                      <span className="font-bold text-white tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full bg-gradient-to-r from-cdv-orange to-orange-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div
            className="rounded-2xl border p-5 animate-fade-up"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-[14px] font-bold text-white mb-4">Ostatnia aktywność</h2>
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
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(255,105,0,0.15)' }}>
                      <span className="text-cdv-orange text-[11px] font-bold">
                        {comment.author.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] text-white/40 leading-snug">
                        <span className="font-semibold text-white/70">{comment.author}</span>
                        {' · '}
                        <span className="font-mono text-cdv-orange/70 group-hover:text-cdv-orange text-[11px]">
                          {comment.ticketId}
                        </span>
                      </p>
                      <p className="text-[12px] text-white/30 truncate">{comment.content}</p>
                      <p className="text-[11px] text-white/20 mt-0.5">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
