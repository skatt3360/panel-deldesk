import React, { useState } from 'react';
import {
  Mail, MailCheck, RefreshCw, AlertCircle,
  Database, X, ChevronDown, CheckCircle2, Loader2, Terminal,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGmailStore } from '../store/gmailStore';

const GmailStatus: React.FC = () => {
  const googleAccessToken = useAuthStore((s) => s.googleAccessToken);
  const user              = useAuthStore((s) => s.user);
  const loginGoogle       = useAuthStore((s) => s.loginGoogle);
  const googleLoading     = useAuthStore((s) => s.googleLoading);

  const {
    polling, lastChecked, ticketsCreated, error, errorCode,
    scanning, recentImports, debugLog, checkRecent, scanFullInbox, clearError,
  } = useGmailStore();

  const [expanded,    setExpanded]    = useState(false);
  const [checkingNow, setCheckingNow] = useState(false);
  const [scanDone,    setScanDone]    = useState<number | null>(null);
  const [showDebug,   setShowDebug]   = useState(false);

  const needsReauth  = errorCode === 'auth/token-expired' || errorCode === 'auth/insufficient-scope';
  const isConnected  = !!googleAccessToken && !!user;
  const isBusy       = checkingNow || scanning || googleLoading;

  const handleCheckNow = async () => {
    if (!googleAccessToken || !user) return;
    setCheckingNow(true); setScanDone(null);
    const n = await checkRecent(googleAccessToken, user.uid);
    setScanDone(n); setCheckingNow(false);
  };

  const handleScanAll = async () => {
    if (!googleAccessToken || !user) return;
    setScanDone(null);
    const n = await scanFullInbox(googleAccessToken, user.uid);
    setScanDone(n);
  };

  // Force full consent screen so Gmail scope is re-granted
  const handleRefreshToken = () => {
    clearError();
    loginGoogle(true); // forceConsent=true → prompt:'consent'
  };

  const formattedTime = lastChecked
    ? new Date(lastChecked).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : null;

  // ── Not connected ────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 999,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 11, fontWeight: 600,
        color: 'rgba(255,255,255,0.3)',
      }}>
        <Mail size={11} />
        Gmail: brak
      </div>
    );
  }

  // ── Pill color ───────────────────────────────────────────────────────────
  const pillStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', borderRadius: 999, cursor: 'pointer',
    fontSize: 11, fontWeight: 600,
    transition: 'all 0.15s',
    background:   error   ? 'rgba(239,68,68,0.12)'     : scanning ? 'rgba(139,67,214,0.12)' : 'rgba(255,255,255,0.05)',
    border:       `1px solid ${error ? 'rgba(239,68,68,0.3)' : scanning ? 'rgba(139,67,214,0.3)' : 'rgba(255,255,255,0.09)'}`,
    color:        error   ? '#fca5a5'                   : scanning ? '#C49EE8'               : 'rgba(255,255,255,0.5)',
  };

  return (
    <div style={{ position: 'relative' }} className="hidden md:block">

      {/* Pill */}
      <button style={pillStyle} onClick={() => setExpanded((v) => !v)}>
        {error
          ? <AlertCircle size={11} />
          : (isBusy)
            ? <Loader2 size={11} className="animate-spin" />
            : polling
              ? <MailCheck size={11} style={{ color: '#34d399' }} />
              : <Mail size={11} />
        }
        <span>
          {error ? 'Gmail: błąd'
            : scanning ? 'Skanowanie…'
            : `Gmail${ticketsCreated > 0 ? ` +${ticketsCreated}` : ''}`}
        </span>
        {formattedTime && !error && !scanning && (
          <span style={{ color: 'rgba(255,255,255,0.22)' }}>{formattedTime}</span>
        )}
        <ChevronDown size={9} style={{
          opacity: 0.4,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
        }} />
      </button>

      {/* Dropdown */}
      {expanded && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setExpanded(false)} />
          <div style={{
            position: 'absolute', right: 0, top: 36, zIndex: 50,
            width: 300,
            background: 'rgba(13,10,26,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 18,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          }} className="animate-scale-in">

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MailCheck size={13} style={{ color: '#34d399' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Gmail sync</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setShowDebug((v) => !v)}
                  title="Log diagnostyczny"
                  style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: showDebug ? '#C49EE8' : 'rgba(255,255,255,0.3)' }}
                >
                  <Terminal size={12} />
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>

              {/* Error banner */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <AlertCircle size={12} style={{ color: '#fca5a5', flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>
                      {error}
                      {errorCode && <div style={{ marginTop: 4, fontSize: 10, opacity: 0.6, fontFamily: 'monospace' }}>{errorCode}</div>}
                    </div>
                  </div>
                  {needsReauth && (
                    <button
                      onClick={handleRefreshToken}
                      disabled={googleLoading}
                      style={{
                        marginTop: 8, width: '100%', padding: '7px 0',
                        background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fca5a5',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        opacity: googleLoading ? 0.5 : 1,
                      }}
                    >
                      {googleLoading ? <><Loader2 size={11} className="animate-spin" />Otwieranie…</> : <><RefreshCw size={11} />Odśwież token Gmail</>}
                    </button>
                  )}
                </div>
              )}

              {/* Success banner */}
              {scanDone !== null && !error && (
                <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6ee7b7' }}>
                  <CheckCircle2 size={12} />
                  {scanDone === 0 ? 'Brak nowych zgłoszeń' : `Zaimportowano ${scanDone} zgłoszeń`}
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[['Zaimportowane', ticketsCreated.toString()], ['Ostatni skan', formattedTime ?? '—']].map(([l, v]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: 'Syne, sans-serif' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <button onClick={handleCheckNow} disabled={isBusy} style={{
                width: '100%', padding: '9px 0',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)',
                cursor: isBusy ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: isBusy ? 0.5 : 1,
              }}>
                {checkingNow
                  ? <><Loader2 size={11} className="animate-spin" />Sprawdzanie…</>
                  : <><RefreshCw size={11} />Sprawdź ostatnie 7 dni</>}
              </button>

              <button onClick={handleScanAll} disabled={isBusy} style={{
                width: '100%', padding: '9px 0',
                background: scanning ? 'rgba(139,67,214,0.15)' : 'rgba(139,67,214,0.08)',
                border: '1px solid rgba(139,67,214,0.25)',
                borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#C49EE8',
                cursor: isBusy ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: isBusy ? 0.5 : 1,
              }}>
                {scanning
                  ? <><Loader2 size={11} className="animate-spin" />Skanowanie całej skrzynki…</>
                  : <><Database size={11} />Skanuj całą skrzynkę</>}
              </button>

              {/* Debug log */}
              {showDebug && debugLog.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 10px', maxHeight: 120, overflowY: 'auto' }}>
                  {debugLog.map((entry, i) => (
                    <div key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', lineHeight: 1.6 }}>{entry}</div>
                  ))}
                </div>
              )}

              {/* Recent imports */}
              {recentImports.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Ostatnio zaimportowane</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
                    {recentImports.slice(0, 6).map((t) => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <MailCheck size={10} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title.replace('[Email] ', '')}</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.requesterEmail}</div>
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
