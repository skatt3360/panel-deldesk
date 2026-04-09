import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, PlusCircle, Calendar, Settings, LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ADMINS } from '../utils/helpers';
import CdvLogo from './CdvLogo';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={17} />, end: true },
  { to: '/tickets', label: 'Zgłoszenia', icon: <Ticket size={17} /> },
  { to: '/tickets/new', label: 'Nowe zgłoszenie', icon: <PlusCircle size={17} /> },
  { to: '/calendar', label: 'Kalendarz', icon: <Calendar size={17} /> },
  { to: '/settings', label: 'Ustawienia', icon: <Settings size={17} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const adminRecord = ADMINS.find((a) => a.email === user?.email);
  const displayName = adminRecord?.name ?? user?.email ?? 'Administrator';
  const displayEmail = user?.email ?? '';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 flex flex-col
        bg-sidebar-gradient sidebar-texture
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto shadow-sidebar
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo CDV */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
          <div className="flex-shrink-0">
            <CdvLogo size={42} />
          </div>
          <div>
            <div className="text-white font-extrabold text-[14px] leading-tight tracking-tight">
              Panel Helpdesk
            </div>
            <div className="text-white/50 text-[11px] leading-tight font-semibold tracking-widest uppercase">
              Collegium Da Vinci
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Nawigacja</p>
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : 'nav-link-idle'}`}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-cdv-gold' : 'text-white/50 group-hover:text-white/80'}`}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-[13.5px]">{item.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cdv-gold flex-shrink-0" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-cdv-gold flex items-center justify-center flex-shrink-0 text-cdv-blue text-xs font-bold shadow">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-[13px] font-semibold truncate leading-tight">{displayName}</div>
              <div className="text-white/40 text-[11px] truncate">{displayEmail}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/45 hover:text-white/80 hover:bg-white/8 transition-all duration-200 text-[13px] font-medium"
          >
            <LogOut size={14} />
            Wyloguj się
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
