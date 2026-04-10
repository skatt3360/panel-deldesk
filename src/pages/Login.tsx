import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CdvLogo from '../components/CdvLogo';

/* ── Google "G" SVG ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ── Input field ── */
const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}> = ({ label, icon, type, value, onChange, placeholder, autoComplete }) => (
  <div>
    <label className="block text-[11px] font-bold text-white/40 mb-2 uppercase tracking-[0.12em]">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
        className="w-full pl-11 pr-4 py-3 text-[14px] text-white placeholder:text-white/20 bg-white/[0.07] border border-white/10 rounded-2xl focus:outline-none transition-all duration-200 focus:bg-white/[0.1] focus:border-cdv-purple/60"
      />
    </div>
  </div>
);

const Login: React.FC = () => {
  const { login, loginGoogle, register, loading, error, clearError } = useAuthStore();
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
    <div className="min-h-screen mesh-bg flex overflow-hidden relative">

      {/* ── Decorative background elements ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="deco-ring absolute w-[800px] h-[800px] -top-40 -left-40 opacity-35" />
        <div className="deco-ring-inner absolute w-[500px] h-[500px] top-10 -left-20 opacity-25" />
        <div className="absolute w-[220px] h-[220px] bottom-24 left-48 rounded-full opacity-15"
          style={{ border: '1px solid rgba(255,105,0,0.35)', animation: 'rotate-slow 12s linear infinite' }} />
        <div className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }} />
        <div className="absolute top-0 right-0 w-[600px] h-[350px] bg-cdv-orange/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[350px] bg-cdv-purple/[0.12] rounded-full blur-3xl" />
      </div>

      {/* ── Left — Brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] max-w-[560px] relative p-14 xl:p-20">
        <div className="animate-fade-in">
          <CdvLogo size={34} variant="white" />
        </div>

        <div className="animate-fade-up animate-delay-100 space-y-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] text-cdv-purple-light/80 uppercase mb-5">
              IT Helpdesk — Collegium Da Vinci
            </p>
            <h1 className="font-display font-black text-white leading-[1.0] mb-6"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(48px, 5vw, 72px)',
                letterSpacing: '-0.02em',
              }}>
              Zarządzaj<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #C49EE8 0%, #FF6900 100%)' }}>
                infrastrukturą
              </span><br />
              CDV.
            </h1>
            <p className="text-white/40 text-[15px] leading-relaxed max-w-sm font-medium">
              Centralny panel zgłoszeń IT, kalendarza i komunikacji dla całego zespołu uczelni.
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 animate-fade-up animate-delay-200">
            {['Zgłoszenia L1/L2/L3', 'Kalendarz IT', 'Chat zespołu', 'Import z Gmail'].map((f) => (
              <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white/50 border border-white/10 bg-white/[0.04]">
                <span className="w-1 h-1 rounded-full bg-cdv-purple-light opacity-60" />
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-fade-up animate-delay-300 flex gap-10">
          {[['3', 'Administratorzy'], ['L1–L3', 'Linie wsparcia'], ['∞', 'Zgłoszeń']].map(([n, l]) => (
            <div key={l}>
              <div className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{n}</div>
              <div className="text-[11px] text-white/30 font-medium mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative z-10">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <CdvLogo size={30} variant="white" className="inline-block mb-3" />
            <p className="text-white/35 text-[13px] font-semibold tracking-wide">CDV IT Helpdesk</p>
          </div>

          {/* Card */}
          <div className="relative animate-blur-in" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '32px',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            {/* Top shimmer line */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />

            <div className="p-8 lg:p-10">

              {/* Card heading */}
              <div className="mb-8">
                <h2 className="text-[22px] font-black text-white leading-tight tracking-tight"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
                  {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
                </h2>
                <p className="text-white/35 text-[13px] mt-1.5 font-medium">
                  {mode === 'login'
                    ? 'Panel dostępny dla administratorów IT CDV'
                    : 'Nowe konto otrzyma rolę Użytkownika'}
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex rounded-2xl bg-white/[0.05] border border-white/[0.07] p-1 mb-7 gap-1">
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 ${
                      mode === m
                        ? 'bg-white/[0.12] text-white shadow-sm'
                        : 'text-white/30 hover:text-white/55'
                    }`}
                    style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}
                  >
                    {m === 'login' ? 'Logowanie' : 'Rejestracja'}
                  </button>
                ))}
              </div>

              {/* Error */}
              {displayError && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 mb-6 text-[13px] text-red-300 animate-slide-up-sm">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{displayError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Email" icon={<Mail size={14} />} type="email"
                  value={email} onChange={(v) => { setEmail(v); clearError(); }}
                  placeholder="admin@cdv.pl" autoComplete="email" />

                <Field label="Hasło" icon={<Lock size={14} />} type="password"
                  value={password} onChange={(v) => { setPassword(v); clearError(); }}
                  placeholder="••••••••"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />

                {mode === 'register' && (
                  <div className="animate-slide-up-sm">
                    <Field label="Powtórz hasło" icon={<Lock size={14} />} type="password"
                      value={confirmPassword} onChange={(v) => { setConfirmPassword(v); setLocalError(null); }}
                      placeholder="••••••••" autoComplete="new-password" />
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !email || !password || (mode === 'register' && !confirmPassword)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 font-black text-[15px] rounded-2xl transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed mt-2 tracking-tight"
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    background: 'linear-gradient(135deg, #8B43D6 0%, #6B2D8B 100%)',
                    boxShadow: '0 4px 24px rgba(139,67,214,0.4)',
                    color: '#fff',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" />{mode === 'login' ? 'Logowanie…' : 'Rejestracja…'}</>
                  ) : (
                    <>{mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'} <ArrowRight size={15} /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-[11px] text-white/20 font-bold tracking-wider uppercase">lub</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={loginGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 font-bold text-[14px] rounded-2xl text-white/80 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.05] hover:bg-white/[0.09] transition-all duration-200 disabled:opacity-35 group"
                style={{ letterSpacing: '-0.01em' }}
              >
                <GoogleIcon />
                Kontynuuj z Google
                <span className="ml-auto text-[10px] text-white/20 font-medium normal-case tracking-normal group-hover:text-white/35 transition-colors">
                  + Gmail sync
                </span>
              </button>

              <p className="text-center text-[11px] text-white/15 mt-7 font-medium tracking-wide">
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
