import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, PlusCircle, Settings, LogOut,
  CalendarCheck, MessageSquare, PartyPopper,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ADMINS } from '../utils/helpers';
import { ROLE_LABEL, ROLE_COLOR } from '../utils/roles';
import CdvLogo from './CdvLogo';
import ProfileEditModal from './ProfileEditModal';
import { useProfileData } from './ProfileEditModal';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/',             label: 'Dashboard',      icon: <LayoutDashboard size={16} />, end: true },
  { to: '/tickets',      label: 'Zgłoszenia',      icon: <Ticket size={16} /> },
  { to: '/tickets/new',  label: 'Nowe zgłoszenie', icon: <PlusCircle size={16} /> },
  { to: '/events',       label: 'Eventy',          icon: <PartyPopper size={16} /> },
  { to: '/calendar',     label: 'Kalendarz',       icon: <CalendarCheck size={16} /> },
  { to: '/chat',         label: 'Chat',            icon: <MessageSquare size={16} /> },
  { to: '/settings',     label: 'Ustawienia',      icon: <Settings size={16} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuthStore();
  const adminRecord  = ADMINS.find((a) => a.email === user?.email);
  const profileData  = useProfileData(user?.email ?? undefined);
  const displayName  = profileData?.displayName || adminRecord?.name || user?.displayName || user?.email || 'Administrator';
  const initials     = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-60 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: '#0A0C12',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Orange top bar */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, #FF6900, transparent)', flexShrink: 0 }} />

        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-4 cursor-pointer"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => { navigate('/'); onClose(); }}
        >
          <div className="flex-shrink-0">
            <CdvLogo size={26} variant="white" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 13.5, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              Panel Helpdesk
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>
              Collegium Da Vinci
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 overflow-y-auto">
          <p style={{ padding: '0 10px', marginBottom: 10, fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Nawigacja
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 10px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                    background: isActive ? 'rgba(255,105,0,0.12)' : 'transparent',
                    borderLeft: isActive ? '2px solid #FF6900' : '2px solid transparent',
                    paddingLeft: isActive ? 9 : 10,
                    transition: 'all 0.15s',
                  })}
                  className={({ isActive }) => isActive ? '' : 'hover:!bg-white/[0.05] hover:!text-white/75'}
                >
                  {({ isActive }) => (
                    <>
                      <span style={{ color: isActive ? '#FF6900' : 'rgba(255,255,255,0.35)', flexShrink: 0, transition: 'color 0.15s' }}>
                        {item.icon}
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer / User */}
        <div style={{ padding: '12px 10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <ProfileEditModal open={showProfile} onClose={() => setShowProfile(false)} />

          {/* User card */}
          <div
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 cursor-pointer rounded-xl"
            style={{
              padding: '8px 10px', marginBottom: 4,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            title="Edytuj profil"
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6900, #FF8C00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: 11, fontWeight: 800, color: '#fff',
              boxShadow: '0 2px 8px rgba(255,105,0,0.3)',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              <div style={{ marginTop: 2 }}>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${ROLE_COLOR[role]}`}>
                  {ROLE_LABEL[role]}
                </span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 rounded-xl transition-all duration-200"
            style={{
              padding: '8px 10px', fontSize: 12.5, fontWeight: 500,
              color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={13} />
            Wyloguj się
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
