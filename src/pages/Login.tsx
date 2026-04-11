import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CdvLogo from '../components/CdvLogo';

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Small CDV-brand feature tag
const FeatureTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
    color: 'rgba(255,255,255,0.5)',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8, padding: '5px 10px',
  }}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6900', flexShrink: 0 }} />
    {children}
  </span>
);

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
  fontSize: 14, color: '#fff',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, outline: 'none',
  transition: 'border-color 0.15s, background 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
  letterSpacing: '0.12em', marginBottom: 7,
};

const Login: React.FC = () => {
  const { login, loginGoogle, register, loading, googleLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const switchMode = (m: 'login' | 'register') => {
    setMode(m); clearError(); setLocalError(null);
    setPassword(''); setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLocalError(null);
    if (!email.trim() || !password) return;
    if (mode === 'register') {
      if (password.length < 6) { setLocalError('Hasło musi mieć co najmniej 6 znaków.'); return; }
      if (password !== confirmPassword) { setLocalError('Hasła nie są identyczne.'); return; }
      await register(email.trim(), password);
    } else {
      await login(email.trim(), password);
    }
  };

  const displayError = localError || error;

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{
        background: '#0C0E14',
        backgroundImage: [
          'radial-gradient(ellipse 70% 60% at 0% 0%, rgba(255,105,0,0.12) 0%, transparent 55%)',
          'radial-gradient(ellipse 50% 50% at 100% 100%, rgba(255,105,0,0.07) 0%, transparent 55%)',
          'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 60%)',
        ].join(', '),
      }}
    >
      {/* ── Decorative elements ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Horizontal rule accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #FF6900 0%, #FF8C00 30%, transparent 70%)',
        }} />
        {/* Geometric grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.015,
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />
        {/* Large circle accent */}
        <div style={{
          position: 'absolute', top: -160, left: -160,
          width: 520, height: 520, borderRadius: '50%',
          border: '1px solid rgba(255,105,0,0.1)',
          animation: 'rotate-slow 30s linear infinite',
        }} />
        <div style={{
          position: 'absolute', top: -60, left: -60,
          width: 320, height: 320, borderRadius: '50%',
          border: '1px solid rgba(255,105,0,0.06)',
          animation: 'rotate-slow 20s linear infinite reverse',
        }} />
        {/* Bottom-right orange glow */}
        <div style={{
          position: 'absolute', bottom: -100, right: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,105,0,0.08) 0%, transparent 70%)',
        }} />
      </div>

      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between relative z-10 p-14 xl:p-20"
        style={{
          width: '46%', maxWidth: 540,
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="animate-fade-in">
          <CdvLogo size={30} variant="white" />
        </div>

        {/* Main headline */}
        <div className="animate-fade-up animate-delay-100">
          {/* Orange bar before title */}
          <div style={{
            width: 40, height: 3, background: '#FF6900',
            borderRadius: 2, marginBottom: 24,
          }} />

          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
            marginBottom: 20,
          }}>
            IT Helpdesk Panel — Collegium Da Vinci
          </p>

          <div style={{ fontFamily: 'Syne, sans-serif', marginBottom: 24 }}>
            <div style={{
              fontSize: 56, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.04em', lineHeight: 0.92,
              marginBottom: 4, whiteSpace: 'nowrap',
            }}>
              Panel
            </div>
            <div style={{
              fontSize: 56, fontWeight: 900, letterSpacing: '-0.04em',
              lineHeight: 0.92, marginBottom: 4, whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #FF6900 0%, #FFB347 60%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Helpdesk
            </div>
            <div style={{
              fontSize: 56, fontWeight: 900, color: 'rgba(255,255,255,0.2)',
              letterSpacing: '-0.04em', lineHeight: 0.92, whiteSpace: 'nowrap',
            }}>
              CDV.
            </div>
          </div>

          <p style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 13.5,
            lineHeight: 1.75, maxWidth: 310,
          }}>
            Centralny panel zarządzania zgłoszeniami IT, harmonogramem i komunikacją wewnętrzną.
          </p>

          {/* Feature tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 28 }}>
            {['Zgłoszenia L1/L2/L3', 'Kalendarz IT', 'Chat', 'Gmail sync'].map((f) => (
              <FeatureTag key={f}>{f}</FeatureTag>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="animate-fade-up animate-delay-300">
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />
          <div style={{ display: 'flex', gap: 36 }}>
            {[['3', 'Administratorzy'], ['L1–L3', 'Linie wsparcia'], ['∞', 'Zgłoszeń']].map(([n, l]) => (
              <div key={l}>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 900,
                  color: '#fff', letterSpacing: '-0.03em',
                }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6">
        <div className="w-full animate-blur-in" style={{ maxWidth: 400 }}>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <CdvLogo size={28} variant="white" className="inline-block mb-3" />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 500 }}>CDV IT Helpdesk</p>
          </div>

          {/* Glass card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 24,
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Orange top accent line */}
            <div style={{
              height: 2,
              background: 'linear-gradient(90deg, #FF6900 0%, transparent 80%)',
            }} />

            <div style={{ padding: '32px 32px 28px' }}>

              {/* Heading */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 900,
                  color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 5,
                }}>
                  {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13, fontWeight: 500 }}>
                  {mode === 'login'
                    ? 'Panel dostępny dla administratorów IT CDV'
                    : 'Nowe konto otrzyma rolę Użytkownika'}
                </p>
              </div>

              {/* Mode toggle */}
              <div style={{
                display: 'flex', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
                padding: 3, gap: 3, marginBottom: 22,
              }}>
                {(['login', 'register'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => switchMode(m)}
                    style={{
                      flex: 1, padding: '8px 0',
                      fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700,
                      letterSpacing: '0.01em', borderRadius: 11, border: 'none',
                      cursor: 'pointer', transition: 'all 0.18s',
                      background: mode === m ? 'rgba(255,105,0,0.15)' : 'transparent',
                      color: mode === m ? '#FF8533' : 'rgba(255,255,255,0.3)',
                      boxShadow: mode === m ? 'inset 0 0 0 1px rgba(255,105,0,0.25)' : 'none',
                    }}>
                    {m === 'login' ? 'Logowanie' : 'Rejestracja'}
                  </button>
                ))}
              </div>

              {/* Error */}
              {displayError && (
                <div className="animate-slide-up-sm" style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 12, padding: '11px 14px', marginBottom: 18,
                  fontSize: 13, color: '#fca5a5',
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ lineHeight: 1.5 }}>{displayError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
                    <input
                      type="email" value={email} required autoComplete="email"
                      onChange={(e) => { setEmail(e.target.value); clearError(); }}
                      placeholder="admin@cdv.pl"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(255,105,0,0.5)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Hasło</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
                    <input
                      type="password" value={password} required
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      onChange={(e) => { setPassword(e.target.value); clearError(); }}
                      placeholder="••••••••"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(255,105,0,0.5)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                    />
                  </div>
                </div>

                {/* Confirm password */}
                {mode === 'register' && (
                  <div className="animate-slide-up-sm">
                    <label style={labelStyle}>Powtórz hasło</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
                      <input
                        type="password" value={confirmPassword} required autoComplete="new-password"
                        onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(null); }}
                        placeholder="••••••••"
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(255,105,0,0.5)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !email || !password || (mode === 'register' && !confirmPassword)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px 0', marginTop: 4,
                    fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800, letterSpacing: '0.01em',
                    color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #FF6900 0%, #E85D00 100%)',
                    boxShadow: '0 4px 20px rgba(255,105,0,0.35)',
                    opacity: (loading || !email || !password || (mode === 'register' && !confirmPassword)) ? 0.35 : 1,
                    transition: 'all 0.18s',
                  }}
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" />{mode === 'login' ? 'Logowanie…' : 'Rejestracja…'}</>
                    : <>{mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}<ArrowRight size={14} /></>
                  }
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>lub</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Google */}
              <button
                type="button" onClick={() => loginGoogle()}
                disabled={loading || googleLoading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 0', fontSize: 14, fontWeight: 600,
                  color: 'rgba(255,255,255,0.65)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, cursor: googleLoading ? 'default' : 'pointer',
                  opacity: loading || googleLoading ? 0.7 : 1,
                  transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              >
                {googleLoading
                  ? <><span style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Przekierowywanie…</>
                  : <><GoogleIcon />Kontynuuj z Google</>
                }
              </button>

              <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.12)', marginTop: 20, fontWeight: 500 }}>
                Collegium Da Vinci © {new Date().getFullYear()}
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
