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
import Settings from './pages/Settings';

const App: React.FC = () => {
  const { user, initialized } = useAuthStore();

  // Wait for Firebase Auth to resolve
  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-[#003087] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Ładowanie...</p>
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
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
