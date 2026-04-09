import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTicketStore } from '../store/ticketStore';
import { useCalendarStore } from '../store/calendarStore';
import { Zap } from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ticketsReady = useTicketStore((s) => s.initialized);
  const calendarReady = useCalendarStore((s) => s.initialized);

  if (!ticketsReady || !calendarReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cdv-blue mb-5 shadow-lg">
            <Zap size={24} className="text-cdv-gold fill-cdv-gold animate-pulse" />
          </div>
          <div className="w-6 h-6 border-2 border-cdv-blue/20 border-t-cdv-blue rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-ink-muted font-medium">Łączenie z bazą danych…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
