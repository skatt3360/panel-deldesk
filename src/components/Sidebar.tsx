import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Calendar,
  Settings,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/tickets', label: 'Zgłoszenia', icon: <Ticket size={18} /> },
  { to: '/tickets/new', label: 'Nowe zgłoszenie', icon: <PlusCircle size={18} /> },
  { to: '/calendar', label: 'Kalendarz', icon: <Calendar size={18} /> },
  { to: '/settings', label: 'Ustawienia', icon: <Settings size={18} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 bg-cdv-blue flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-cdv-gold flex items-center justify-center flex-shrink-0">
            <HelpCircle size={20} className="text-cdv-blue" />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">DelDesk</div>
            <div className="text-white/60 text-xs leading-tight">CDV IT Helpdesk</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 px-3 text-white/40 text-xs uppercase tracking-wider font-semibold">
            Menu
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group
                    ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive ? 'text-cdv-gold' : 'group-hover:text-cdv-gold transition-colors'}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {isActive && (
                        <ChevronRight size={14} className="text-cdv-gold" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cdv-gold flex items-center justify-center flex-shrink-0">
              <span className="text-cdv-blue text-xs font-bold">IT</span>
            </div>
            <div>
              <div className="text-white text-sm font-medium">Administrator</div>
              <div className="text-white/50 text-xs">helpdesk@cdv.pl</div>
            </div>
          </div>
        </div>

        {/* Active page indicator stripe */}
        <div
          className="absolute right-0 top-0 bottom-0 w-0.5 bg-cdv-gold opacity-0"
          style={{
            opacity: location.pathname ? 0 : 0,
          }}
        />
      </aside>
    </>
  );
};

export default Sidebar;
