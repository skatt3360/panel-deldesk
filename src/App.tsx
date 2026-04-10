import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useGmailStore } from './store/gmailStore';
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

const AuthenticatedApp: React.FC = () => {
  const googleAccessToken = useAuthStore((s) => s.googleAccessToken);
  const user              = useAuthStore((s) => s.user);
  const { startPolling, stopPolling, checkRecent } = useGmailStore();
  const didInitialScan    = useRef(false);

  useEffect(() => {
    if (!googleAccessToken || !user) return;

    // Start background polling (every 5 min)
    startPolling(googleAccessToken, user.uid);

    // Run an immediate scan of last 24h on first login
    if (!didInitialScan.current) {
      didInitialScan.current = true;
      checkRecent(googleAccessToken, user.uid);
    }

    return () => stopPolling();
  }, [googleAccessToken, user?.uid]); // eslint-disable-line

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

const App: React.FC = () => {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#090610',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(139,67,214,0.2)',
          borderTopColor: '#8B43D6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 500 }}>Ładowanie…</p>
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

  return <AuthenticatedApp />;
};

export default App;
