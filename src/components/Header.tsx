import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, PlusCircle, Search } from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { statusLabel } from '../utils/helpers';

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

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const criticalCount = tickets.filter(
    (t) => t.priority === 'critical' && (t.status === 'open' || t.status === 'in-progress')
  ).length;

  // Determine page title
  const pathKey =
    Object.keys(pageTitles).find((key) => {
      if (key === '/') return location.pathname === '/';
      return location.pathname.startsWith(key);
    }) ?? '/';
  const title = pageTitles[pathKey] ?? 'DelDesk';

  // If on ticket detail page
  const isTicketDetail =
    location.pathname.startsWith('/tickets/') && location.pathname !== '/tickets/new';
  const ticketId = isTicketDetail ? location.pathname.split('/tickets/')[1] : null;
  const displayTitle = ticketId ? `Zgłoszenie ${ticketId}` : title;

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{displayTitle}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            Collegium Da Vinci — Panel IT Helpdesk
          </p>
        </div>
      </div>

      {/* Right: search + actions + notifications */}
      <div className="flex items-center gap-2">
        {/* Search trigger (visual only — filtering is on Tickets page) */}
        <button
          onClick={() => navigate('/tickets')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-600 transition-colors"
        >
          <Search size={14} />
          <span>Szukaj zgłoszeń...</span>
        </button>

        {/* New ticket shortcut */}
        <button
          onClick={() => navigate('/tickets/new')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-cdv-blue hover:bg-cdv-blue-dark rounded-lg transition-colors"
        >
          <PlusCircle size={15} />
          <span>Nowe</span>
        </button>

        {/* Notifications bell */}
        <div className="relative">
          <button className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <Bell size={20} />
          </button>
          {(openCount > 0 || criticalCount > 0) && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {criticalCount > 0 ? criticalCount : openCount > 9 ? '9+' : openCount}
            </span>
          )}
        </div>

        {/* Status pills */}
        {openCount > 0 && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full cursor-pointer"
            onClick={() => navigate('/tickets')}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {openCount} {statusLabel['open'].toLowerCase()}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
