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

const Login: React.FC = () => {
  const { login, loginGoogle, register, loading, googleLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    clearError();
    setLocalError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
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
        background: '#080510',
        backgroundImage: [
          'radial-gradient(ellipse 80% 70% at 15% 30%, rgba(139,67,214,0.22) 0%, transparent 60%)',
          'radial-gradient(ellipse 60% 60% at 85% 70%, rgba(107,45,139,0.18) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 50% at 50% 0%, rgba(255,105,0,0.09) 0%, transparent 55%)',
        ].join(', '),
      }}
    >
      {/* ── Decorative rings ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="deco-ring absolute w-[700px] h-[700px] -top-36 -left-36 opacity-30" />
        <div className="deco-ring-inner absolute w-[440px] h-[440px] top-16 -left-16 opacity-20" />
        <div className="absolute w-[200px] h-[200px] bottom-20 left-52 rounded-full opacity-15"
          style={{ border: '1px solid rgba(255,105,0,0.3)', animation: 'rotate-slow 12s linear infinite' }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
            backgroundSize: '72px 72px',
          }} />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] rounded-full blur-3xl"
          style={{ background: 'rgba(255,105,0,0.05)' }} />
      </div>

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between relative z-10 p-14 xl:p-20" style={{ width: '46%', maxWidth: 540 }}>

        {/* Logo */}
        <div className="animate-fade-in">
          <CdvLogo size={32} variant="white" />
        </div>

        {/* Headline */}
        <div className="animate-fade-up animate-delay-100">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-5"
            style={{ color: 'rgba(196,158,232,0.7)' }}>
            IT Helpdesk Panel
          </p>

          <div className="mb-6" style={{ fontFamily: 'Syne, sans-serif', overflow: 'visible' }}>
            <div className="font-black text-white leading-[0.95] mb-0.5"
              style={{ fontSize: 52, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
              Panel
            </div>
            <div className="font-black leading-[0.95] mb-0.5"
              style={{
                fontSize: 52,
                letterSpacing: '-0.03em',
                whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, #C49EE8 0%, #8B43D6 50%, #FF6900 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              Helpdesk
            </div>
            <div className="font-black text-white leading-[0.95]"
              style={{ fontSize: 52, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
              CDV.
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
            Centralny panel zgłoszeń IT, kalendarza i komunikacji dla Collegium Da Vinci.
          </p>

          {/* Chips */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['Zgłoszenia L1/L2/L3', 'Kalendarz IT', 'Chat', 'Gmail sync'].map((f) => (
              <span key={f}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(196,158,232,0.6)' }} />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-10 animate-fade-up animate-delay-300">
          {[['3', 'Administratorzy'], ['L1–L3', 'Linie wsparcia'], ['∞', 'Zgłoszeń']].map(([n, l]) => (
            <div key={l}>
              <div className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>{n}</div>
              <div className="text-[11px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6">
        <div className="w-full" style={{ maxWidth: 400 }}>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <CdvLogo size={28} variant="white" className="inline-block mb-3" />
            <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>CDV IT Helpdesk</p>
          </div>

          {/* Glass card */}
          <div className="animate-blur-in" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 28,
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            {/* Shimmer top edge */}
            <div style={{
              position: 'absolute', top: 0, left: 32, right: 32, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
              borderRadius: 999,
            }} />

            <div style={{ padding: '36px 36px 32px' }}>

              {/* Heading */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: 6,
                }}>
                  {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 500 }}>
                  {mode === 'login'
                    ? 'Panel dostępny dla administratorów IT CDV'
                    : 'Nowe konto otrzyma rolę Użytkownika'}
                </p>
              </div>

              {/* Mode toggle */}
              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: 4,
                gap: 4,
                marginBottom: 24,
              }}>
                {(['login', 'register'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => switchMode(m)}
                    style={{
                      flex: 1,
                      padding: '9px 0',
                      fontFamily: 'Syne, sans-serif',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: mode === m ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: mode === m ? '#fff' : 'rgba(255,255,255,0.3)',
                    }}>
                    {m === 'login' ? 'Logowanie' : 'Rejestracja'}
                  </button>
                ))}
              </div>

              {/* Error */}
              {displayError && (
                <div className="animate-slide-up-sm" style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 14, padding: '12px 14px',
                  marginBottom: 20, fontSize: 13, color: '#fca5a5',
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ lineHeight: 1.5 }}>{displayError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                    <input
                      type="email" value={email} required autoComplete="email"
                      onChange={(e) => { setEmail(e.target.value); clearError(); }}
                      placeholder="admin@cdv.pl"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                        fontSize: 14, color: '#fff',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 14, outline: 'none',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(139,67,214,0.6)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Hasło</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                    <input
                      type="password" value={password} required
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      onChange={(e) => { setPassword(e.target.value); clearError(); }}
                      placeholder="••••••••"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                        fontSize: 14, color: '#fff',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 14, outline: 'none',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(139,67,214,0.6)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                    />
                  </div>
                </div>

                {/* Confirm password */}
                {mode === 'register' && (
                  <div className="animate-slide-up-sm">
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Powtórz hasło</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                      <input
                        type="password" value={confirmPassword} required autoComplete="new-password"
                        onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(null); }}
                        placeholder="••••••••"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                          fontSize: 14, color: '#fff',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 14, outline: 'none',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(139,67,214,0.6)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
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
                    fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 900, letterSpacing: '-0.01em',
                    color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #8B43D6 0%, #6B2D8B 100%)',
                    boxShadow: '0 4px 24px rgba(139,67,214,0.4)',
                    opacity: (loading || !email || !password || (mode === 'register' && !confirmPassword)) ? 0.35 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" />{mode === 'login' ? 'Logowanie…' : 'Rejestracja…'}</>
                    : <>{mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'} <ArrowRight size={14} /></>
                  }
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>lub</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={() => loginGoogle()}
                disabled={loading || googleLoading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 0',
                  fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)',
                  background: googleLoading ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.11)',
                  borderRadius: 16, cursor: googleLoading ? 'default' : 'pointer',
                  opacity: loading || googleLoading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                }}
              >
                {googleLoading
                  ? <><span style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Przekierowywanie do Google…</>
                  : <><GoogleIcon />Kontynuuj z Google</>
                }
              </button>

              <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.13)', marginTop: 22, fontWeight: 500 }}>
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
