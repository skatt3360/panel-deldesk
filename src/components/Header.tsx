import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, BellOff, PlusCircle, Search, X, AlertTriangle, Ticket as TicketIcon, CheckCheck } from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { statusLabel, statusColor, priorityColor, priorityLabel, formatRelative } from '../utils/helpers';
import Badge from './ui/Badge';
import Changelog from './Changelog';
import GmailStatus from './GmailStatus';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/':             'Dashboard',
  '/tickets':      'Zgłoszenia',
  '/tickets/new':  'Nowe zgłoszenie',
  '/calendar':     'Kalendarz',
  '/settings':     'Ustawienia',
};

// ---------- notification persistence ----------
const STORAGE_KEY = 'cdv-read-notif-ids';

function loadReadIds(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch { return new Set(); }
}

function saveReadIds(ids: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch { /* noop */ }
}
// ----------------------------------------------

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const tickets   = useTicketStore((s) => s.tickets);

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [readIds,     setReadIds]     = useState<Set<string>>(loadReadIds);

  const bellRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current   && !bellRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tickets?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Live search results
  const searchResults = searchQuery.trim().length > 1
    ? tickets.filter((t) => {
        const q = searchQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q)
        );
      }).slice(0, 6)
    : [];

  // Notification source: open + in-progress tickets
  const openTickets    = tickets.filter((t) => t.status === 'open' || t.status === 'in-progress');
  const criticalTickets = tickets.filter(
    (t) => t.priority === 'critical' && (t.status === 'open' || t.status === 'in-progress')
  );
  const notifTickets = [
    ...criticalTickets,
    ...openTickets.filter((t) => t.priority !== 'critical'),
  ].slice(0, 10);

  const unreadCount = notifTickets.filter((t) => !readIds.has(t.id)).length;

  const markAllRead = () => {
    const next = new Set([...readIds, ...notifTickets.map((t) => t.id)]);
    setReadIds(next);
    saveReadIds(next);
  };

  const markOneRead = (id: string) => {
    const next = new Set([...readIds, id]);
    setReadIds(next);
    saveReadIds(next);
  };

  const openNotifPanel = () => {
    setNotifOpen((o) => !o);
  };

  const pathKey =
    Object.keys(pageTitles).find((key) => {
      if (key === '/') return location.pathname === '/';
      return location.pathname.startsWith(key);
    }) ?? '/';
  const title = pageTitles[pathKey] ?? 'Panel Helpdesk';
  const isTicketDetail = location.pathname.startsWith('/tickets/') && location.pathname !== '/tickets/new';
  const ticketId = isTicketDetail ? location.pathname.split('/tickets/')[1] : null;
  const displayTitle = ticketId ? `Zgłoszenie ${ticketId}` : title;

  return (
    <header className="backdrop-blur-xl border-b px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10" style={{ background: 'rgba(12,14,20,0.92)', borderColor: 'rgba(255,255,255,0.07)' }}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
        >
          <Menu size={19} />
        </button>
        <div>
          <h1 className="text-[17px] font-bold text-white leading-tight">{displayTitle}</h1>
          <p className="text-[11px] text-white/40 hidden sm:block font-medium tracking-wide">
            Collegium Da Vinci — IT Helpdesk
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={openSearch}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-[13px] text-white/40 bg-white/[0.06] border border-white/10 rounded-xl hover:border-white/25 hover:text-white/70 transition-all duration-200"
          >
            <Search size={13} />
            <span>Szukaj zgłoszeń...</span>
            <span className="text-[10px] bg-white/10 text-white/30 px-1.5 py-0.5 rounded-md font-mono">⌘K</span>
          </button>

          {searchOpen && (
            <div className="absolute right-0 top-full mt-2 w-[380px] bg-[#0a1628] border border-white/15 rounded-2xl shadow-2xl z-50 animate-scale-in overflow-hidden">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
                <Search size={15} className="text-white/30 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj po ID, tytule, nazwisku..."
                  className="flex-1 text-[13px] text-white bg-transparent focus:outline-none placeholder:text-white/30"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white/60">
                    <X size={14} />
                  </button>
                )}
              </form>

              {searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((t) => (
                    <li key={t.id} className="border-b border-white/[0.06] last:border-0">
                      <button
                        onClick={() => { navigate(`/tickets/${t.id}`); setSearchOpen(false); setSearchQuery(''); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                      >
                        <span className="font-mono text-[11px] font-bold text-cdv-orange w-16 flex-shrink-0">{t.id}</span>
                        <span className="text-[13px] text-white/80 truncate flex-1">{t.title}</span>
                        <Badge dot className={statusColor[t.status]}>{statusLabel[t.status]}</Badge>
                      </button>
                    </li>
                  ))}
                  <li className="px-4 py-2 bg-white/[0.03]">
                    <button
                      onClick={() => { navigate(`/tickets?q=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery(''); }}
                      className="text-[12px] text-cdv-orange font-semibold hover:underline"
                    >
                      Pokaż wszystkie wyniki dla „{searchQuery}" →
                    </button>
                  </li>
                </ul>
              ) : searchQuery.length > 1 ? (
                <div className="px-4 py-6 text-center text-[13px] text-white/30">
                  Brak wyników dla „{searchQuery}"
                </div>
              ) : (
                <div className="px-4 py-4 text-[12px] text-white/30">
                  Wpisz minimum 2 znaki aby wyszukać
                </div>
              )}
            </div>
          )}
        </div>

        {/* New ticket */}
        <button
          onClick={() => navigate('/tickets/new')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-cdv-blue bg-cdv-gold hover:brightness-110 rounded-xl transition-all duration-200 shadow-sm"
        >
          <PlusCircle size={14} />
          <span>Nowe</span>
        </button>

        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={openNotifPanel}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
          >
            {unreadCount > 0
              ? <Bell size={18} className="text-cdv-orange" />
              : <BellOff size={18} />
            }
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[360px] bg-[#0a1628] border border-white/15 rounded-2xl shadow-2xl z-50 animate-scale-in overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell size={14} className={unreadCount > 0 ? 'text-cdv-orange' : 'text-white/30'} />
                  <h3 className="text-sm font-bold text-white">Powiadomienia</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{unreadCount}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] text-white/50 hover:text-cdv-orange transition-colors"
                      title="Oznacz wszystkie jako przeczytane"
                    >
                      <CheckCheck size={13} />
                      <span className="hidden sm:inline">Oznacz wszystkie</span>
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {notifTickets.length === 0 ? (
                <div className="px-4 py-10 text-center text-white/25 text-sm">
                  <BellOff size={28} className="mx-auto mb-2 opacity-20" />
                  Brak aktywnych zgłoszeń
                </div>
              ) : (
                <ul className="max-h-72 overflow-y-auto">
                  {notifTickets.map((t) => {
                    const isRead = readIds.has(t.id);
                    return (
                      <li key={t.id} className="border-b border-white/[0.06] last:border-0">
                        <button
                          onClick={() => {
                            markOneRead(t.id);
                            navigate(`/tickets/${t.id}`);
                            setNotifOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-white/[0.05] transition-colors ${isRead ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${t.priority === 'critical' ? 'bg-red-500/20' : 'bg-white/10'}`}>
                              {t.priority === 'critical'
                                ? <AlertTriangle size={12} className="text-red-400" />
                                : <TicketIcon size={12} className="text-white/50" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[11px] font-mono font-bold text-cdv-orange">{t.id}</span>
                                <Badge className={priorityColor[t.priority]}>{priorityLabel[t.priority]}</Badge>
                                {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-cdv-gold flex-shrink-0" />}
                              </div>
                              <p className="text-[13px] text-white/80 font-medium truncate">{t.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge dot className={statusColor[t.status]}>{statusLabel[t.status]}</Badge>
                                <span className="text-[11px] text-white/30">{formatRelative(t.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="px-4 py-3 border-t border-white/10">
                <button
                  onClick={() => { navigate('/tickets'); setNotifOpen(false); }}
                  className="text-[12px] text-cdv-orange hover:underline font-semibold"
                >
                  Zobacz wszystkie zgłoszenia →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gmail Status */}
        <GmailStatus />

        {/* Changelog */}
        <Changelog />

        {/* Open count */}
        {unreadCount > 0 && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/10 text-white/70 text-[12px] font-semibold rounded-full cursor-pointer hover:bg-white/15 transition-colors"
            onClick={() => navigate('/tickets')}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cdv-gold animate-pulse-dot" />
            {unreadCount} nowych
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
