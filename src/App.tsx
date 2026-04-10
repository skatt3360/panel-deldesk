import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import NewTicket from './pages/NewTicket';
import TicketDetail from './pages/TicketDetail';
import CalendarPage from './pages/Calendar';
import Events from './pages/Events';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#001233]">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-cdv-gold/40 border-t-cdv-gold rounded-full animate-spin mb-4" />
          <p className="text-white/40 font-medium">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/new" element={<NewTicket />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="events" element={<Events />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="chat" element={<Chat />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
