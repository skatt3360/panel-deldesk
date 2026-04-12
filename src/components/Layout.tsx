import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTicketStore } from '../store/ticketStore';
import { useCalendarStore } from '../store/calendarStore';
import { useEquipmentStore } from '../store/equipmentStore';
import { usePeopleStore } from '../store/peopleStore';
import { useProtocolStore } from '../store/protocolStore';
import CdvLogo from './CdvLogo';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ticketsReady = useTicketStore((s) => s.initialized);
  const calendarReady = useCalendarStore((s) => s.initialized);
  const equipmentReady = useEquipmentStore((s) => s.initialized);
  const peopleReady = usePeopleStore((s) => s.initialized);
  const protocolsReady = useProtocolStore((s) => s.initialized);

  if (!ticketsReady || !calendarReady || !equipmentReady || !peopleReady || !protocolsReady) {
    return (
      <div className="flex h-screen items-center justify-center app-bg">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <CdvLogo size={40} variant="white" />
          </div>
          <div className="w-6 h-6 border-2 border-cdv-gold/40 border-t-cdv-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-white/50 font-medium">Łączenie z bazą danych…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen app-bg overflow-hidden">
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
