import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, PlusCircle, Search, X, AlertTriangle, Ticket as TicketIcon, Zap } from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { statusLabel, statusColor, priorityColor, priorityLabel, formatRelative } from '../utils/helpers';
import Badge from './ui/Badge';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tickets': 'Zgłoszenia',
  '/tickets/new': 'Nowe zgłoszenie',
  '/calendar': 'Kalendarz',
  '/settings': 'Ustawienia',
};

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const tickets = useTicketStore((s) => s.tickets);
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in-progress');
  const criticalTickets = tickets.filter(
    (t) => t.priority === 'critical' && (t.status === 'open' || t.status === 'in-progress')
  );
  const notifCount = criticalTickets.length > 0 ? criticalTickets.length : openTickets.length;
  const notifTickets = [
    ...criticalTickets,
    ...openTickets.filter((t) => t.priority !== 'critical'),
  ].slice(0, 8);

  const pathKey =
    Object.keys(pageTitles).find((key) => {
      if (key === '/') return location.pathname === '/';
      return location.pathname.startsWith(key);
    }) ?? '/';
  const title = pageTitles[pathKey] ?? 'Panel Helpdesk';
  const isTicketDetail =
    location.pathname.startsWith('/tickets/') && location.pathname !== '/tickets/new';
  const ticketId = isTicketDetail ? location.pathname.split('/tickets/')[1] : null;
  const displayTitle = ticketId ? `Zgłoszenie ${ticketId}` : title;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-surface-border px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors lg:hidden"
        >
          <Menu size={19} />
        </button>
        <div>
          <h1 className="text-[17px] font-bold text-ink leading-tight">{displayTitle}</h1>
          <p className="text-[11px] text-ink-faint hidden sm:block font-medium tracking-wide">
            Collegium Da Vinci — IT Helpdesk
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <button
          onClick={() => navigate('/tickets')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-[13px] text-ink-faint bg-surface border border-surface-border rounded-xl hover:border-cdv-blue/30 hover:text-ink-muted transition-all duration-200"
        >
          <Search size={13} />
          <span>Szukaj zgłoszeń...</span>
          <span className="text-[10px] bg-surface-border/60 text-ink-faint px-1.5 py-0.5 rounded-md font-mono">⌘K</span>
        </button>

        {/* New ticket */}
        <button
          onClick={() => navigate('/tickets/new')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-white bg-cdv-blue hover:bg-cdv-blue-dark rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97]"
        >
          <PlusCircle size={14} />
          <span>Nowe</span>
        </button>

        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface transition-all duration-200 relative"
          >
            <Bell size={18} />
            {notifCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-dropdown border border-surface-border z-50 animate-scale-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-cdv-gold fill-cdv-gold" />
                  <h3 className="text-sm font-bold text-ink">Powiadomienia</h3>
                  {notifCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-cdv-blue text-white text-[10px] font-bold rounded-full">
                      {notifCount}
                    </span>
                  )}
                </div>
                <button onClick={() => setNotifOpen(false)} className="text-ink-faint hover:text-ink transition-colors">
                  <X size={15} />
                </button>
              </div>

              {notifTickets.length === 0 ? (
                <div className="px-4 py-10 text-center text-ink-faint text-sm">
                  <Bell size={28} className="mx-auto mb-2 opacity-20" />
                  Brak aktywnych zgłoszeń
                </div>
              ) : (
                <ul className="max-h-72 overflow-y-auto">
                  {notifTickets.map((t) => (
                    <li key={t.id} className="border-b border-surface-border last:border-0">
                      <button
                        onClick={() => { navigate(`/tickets/${t.id}`); setNotifOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-surface transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                            t.priority === 'critical' ? 'bg-red-100' : 'bg-cdv-blue-light'
                          }`}>
                            {t.priority === 'critical'
                              ? <AlertTriangle size={12} className="text-red-500" />
                              : <TicketIcon size={12} className="text-cdv-blue" />
                            }
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[11px] font-mono font-bold text-cdv-blue">{t.id}</span>
                              <Badge className={priorityColor[t.priority]}>{priorityLabel[t.priority]}</Badge>
                            </div>
                            <p className="text-[13px] text-ink font-medium truncate">{t.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={statusColor[t.status]}>{statusLabel[t.status]}</Badge>
                              <span className="text-[11px] text-ink-faint">{formatRelative(t.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="px-4 py-3 border-t border-surface-border bg-surface/50">
                <button
                  onClick={() => { navigate('/tickets'); setNotifOpen(false); }}
                  className="text-[12px] text-cdv-blue hover:underline font-semibold"
                >
                  Zobacz wszystkie zgłoszenia →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Open count */}
        {openTickets.length > 0 && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-cdv-blue-light text-cdv-blue text-[12px] font-semibold rounded-full cursor-pointer hover:bg-cdv-blue/10 transition-colors"
            onClick={() => navigate('/tickets')}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cdv-blue animate-pulse-dot" />
            {openTickets.length} otwartych
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
