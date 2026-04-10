import React, { useState } from 'react';
import {
  Mail, MailCheck, RefreshCw, AlertCircle,
  Database, X, ChevronDown, CheckCircle2, Loader2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGmailStore } from '../store/gmailStore';

const GmailStatus: React.FC = () => {
  const googleAccessToken = useAuthStore((s) => s.googleAccessToken);
  const user              = useAuthStore((s) => s.user);
  const loginGoogle       = useAuthStore((s) => s.loginGoogle);
  const {
    polling, lastChecked, ticketsCreated, error, errorCode,
    scanning, recentImports, checkRecent, scanFullInbox, clearError,
  } = useGmailStore();

  const [expanded, setExpanded] = useState(false);
  const [checkingNow, setCheckingNow] = useState(false);
  const [scanDone, setScanDone] = useState<number | null>(null);

  const needsReauth = errorCode === 'auth/token-expired' || errorCode === 'auth/insufficient-scope';

  const handleCheckNow = async () => {
    if (!googleAccessToken || !user) return;
    setCheckingNow(true);
    setScanDone(null);
    const n = await checkRecent(googleAccessToken, user.uid);
    setScanDone(n);
    setCheckingNow(false);
  };

  const handleScanAll = async () => {
    if (!googleAccessToken || !user) return;
    setScanDone(null);
    const n = await scanFullInbox(googleAccessToken, user.uid);
    setScanDone(n);
  };

  const formattedTime = lastChecked
    ? new Date(lastChecked).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : null;

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!googleAccessToken || !user) {
    return (
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
        <Mail size={11} />
        Gmail: brak
      </div>
    );
  }

  // ── Error: needs reauth ────────────────────────────────────────────────────
  if (error && needsReauth) {
    return (
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
        onClick={() => { clearError(); loginGoogle(); }}
        title="Kliknij aby zalogować ponownie">
        <AlertCircle size={11} />
        Gmail: odśwież token
      </div>
    );
  }

  return (
    <div className="relative hidden md:block">
      {/* ── Pill trigger ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150"
        style={{
          background: error ? 'rgba(239,68,68,0.1)' : scanning ? 'rgba(139,67,214,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.25)' : scanning ? 'rgba(139,67,214,0.25)' : 'rgba(255,255,255,0.09)'}`,
          color: error ? '#fca5a5' : scanning ? '#C49EE8' : 'rgba(255,255,255,0.45)',
        }}
      >
        {error
          ? <AlertCircle size={11} style={{ flexShrink: 0 }} />
          : scanning || checkingNow
            ? <Loader2 size={11} className="animate-spin" style={{ flexShrink: 0 }} />
            : polling
              ? <MailCheck size={11} style={{ flexShrink: 0, color: '#34d399' }} />
              : <Mail size={11} style={{ flexShrink: 0 }} />
        }

        <span>
          {error
            ? 'Gmail: błąd'
            : scanning
              ? 'Skanowanie…'
              : `Gmail${ticketsCreated > 0 ? ` +${ticketsCreated}` : ''}`}
        </span>

        {formattedTime && !error && !scanning && (
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>{formattedTime}</span>
        )}

        <ChevronDown size={9} style={{ opacity: 0.4, transition: 'transform 0.15s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {/* ── Dropdown panel ── */}
      {expanded && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
          <div
            className="absolute right-0 top-9 z-50 w-72 rounded-2xl shadow-2xl animate-scale-in"
            style={{
              background: 'rgba(13,10,26,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <MailCheck size={13} style={{ color: '#34d399' }} />
                <span className="text-[13px] font-bold text-white">Gmail — synchronizacja</span>
              </div>
              <button onClick={() => setExpanded(false)} className="text-white/30 hover:text-white/70 transition-colors">
                <X size={13} />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-3 mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[12px]"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="font-semibold">Błąd Gmail</p>
                  <p className="mt-0.5 opacity-80 leading-snug">{error}</p>
                  {errorCode && <p className="mt-0.5 font-mono text-[10px] opacity-50">{errorCode}</p>}
                </div>
              </div>
            )}

            {/* Scan done banner */}
            {scanDone !== null && !error && (
              <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[12px]"
                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#6ee7b7' }}>
                <CheckCircle2 size={12} />
                {scanDone === 0 ? 'Brak nowych zgłoszeń' : `Zaimportowano ${scanDone} zgłoszeń`}
              </div>
            )}

            <div className="p-3 space-y-2">
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Zgłoszenia z email', ticketsCreated.toString()],
                  ['Ostatni skan', formattedTime ?? '—'],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-xl px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                    <p className="text-[14px] font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <button
                onClick={handleCheckNow}
                disabled={checkingNow || scanning}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.65)',
                  opacity: checkingNow || scanning ? 0.5 : 1,
                }}
              >
                {checkingNow
                  ? <><Loader2 size={12} className="animate-spin" /> Sprawdzanie…</>
                  : <><RefreshCw size={12} /> Sprawdź ostatnie 24h</>
                }
              </button>

              <button
                onClick={handleScanAll}
                disabled={scanning || checkingNow}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all"
                style={{
                  background: scanning ? 'rgba(139,67,214,0.15)' : 'rgba(139,67,214,0.1)',
                  border: '1px solid rgba(139,67,214,0.25)',
                  color: '#C49EE8',
                  opacity: scanning || checkingNow ? 0.6 : 1,
                }}
              >
                {scanning
                  ? <><Loader2 size={12} className="animate-spin" /> Skanowanie skrzynki…</>
                  : <><Database size={12} /> Skanuj całą skrzynkę</>
                }
              </button>

              {/* Recent imports */}
              {recentImports.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Ostatnio zaimportowane
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {recentImports.slice(0, 8).map((t) => (
                      <div key={t.id} className="flex items-start gap-2 px-2 py-1.5 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <MailCheck size={10} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-white/70 truncate leading-tight">{t.title.replace('[Email] ', '')}</p>
                          <p className="text-[10px] text-white/30 truncate">{t.requesterEmail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GmailStatus;
