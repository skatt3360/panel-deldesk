import React from 'react';
import { Mail, MailCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGmailStore } from '../store/gmailStore';

const GmailStatus: React.FC = () => {
  const googleAccessToken = useAuthStore((s) => s.googleAccessToken);
  const user = useAuthStore((s) => s.user);
  const { polling, lastChecked, ticketsCreated, error, checkNow } = useGmailStore();

  if (!googleAccessToken || !user) {
    return (
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.06] border border-white/10 rounded-full text-white/30 text-[11px] font-medium">
        <Mail size={11} />
        <span>Gmail: brak</span>
      </div>
    );
  }

  const handleCheckNow = () => {
    checkNow(googleAccessToken, user.uid);
  };

  const formattedTime = lastChecked
    ? new Date(lastChecked).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.06] border border-white/10 rounded-full text-[11px] font-medium">
      {error ? (
        <AlertCircle size={11} className="text-red-400 flex-shrink-0" />
      ) : polling ? (
        <MailCheck size={11} className="text-emerald-400 flex-shrink-0" />
      ) : (
        <Mail size={11} className="text-white/40 flex-shrink-0" />
      )}

      <span className={error ? 'text-red-300' : 'text-white/50'}>
        {error ? 'Gmail: błąd' : `Gmail${ticketsCreated > 0 ? ` +${ticketsCreated}` : ''}`}
      </span>

      {formattedTime && !error && (
        <span className="text-white/25">{formattedTime}</span>
      )}

      <button
        onClick={handleCheckNow}
        title="Sprawdź teraz"
        className="ml-0.5 p-0.5 rounded text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
      >
        <RefreshCw size={10} />
      </button>
    </div>
  );
};

export default GmailStatus;
