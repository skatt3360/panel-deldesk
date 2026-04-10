import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CdvLogo from '../components/CdvLogo';

/* ── Google "G" SVG ── */
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
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

      {/* ── Decorative geometric rings ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Large ring */}
        <div className="deco-ring absolute w-[700px] h-[700px] -top-32 -left-32 opacity-40" />
        {/* Medium ring */}
        <div className="deco-ring-inner absolute w-[450px] h-[450px] top-20 -left-10 opacity-30" />
        {/* Small accent ring */}
        <div
          className="absolute w-[200px] h-[200px] bottom-20 left-40 rounded-full opacity-20"
          style={{ border: '1px solid rgba(255,105,0,0.3)', animation: 'rotate-slow 10s linear infinite' }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Orange glow top-right */}
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-cdv-orange/5 rounded-full blur-3xl" />
        {/* Purple glow bottom */}
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-cdv-purple/10 rounded-full blur-3xl" />
      </div>

      {/* ── Left — Brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] max-w-[520px] relative p-12 xl:p-16">
        {/* Logo + wordmark */}
        <div className="animate-fade-in">
          <CdvLogo size={32} variant="white" />
        </div>

        {/* Central brand statement */}
        <div className="animate-fade-up animate-delay-100">
          <p className="text-[11px] font-bold tracking-[0.2em] text-cdv-purple uppercase mb-4">
            IT Helpdesk Panel
          </p>
          <h1
            className="text-5xl xl:text-6xl font-display font-black text-white leading-[1.05] mb-5"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Zarządzaj<br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #8B43D6 0%, #FF6900 100%)' }}
            >
              infrastrukturą
            </span><br />
            CDV.
          </h1>
          <p className="text-white/35 text-[15px] leading-relaxed max-w-xs">
            Centralny panel zgłoszeń IT, kalendarza i komunikacji dla Collegium Da Vinci.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="animate-fade-up animate-delay-300">
          <div className="flex gap-6">
            {[
              { n: '3',  label: 'Administratorzy' },
              { n: 'L1–L3', label: 'Linie wsparcia' },
              { n: '∞',  label: 'Zgłoszeń' },
            ].map(({ n, label }) => (
              <div key={label}>
                <div className="text-xl font-black text-white font-display" style={{ fontFamily: 'Syne, sans-serif' }}>{n}</div>
                <div className="text-[11px] text-white/30 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-[380px] animate-blur-in">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <CdvLogo size={28} variant="white" className="inline-block mb-3" />
            <p className="text-white/40 text-[13px] font-medium">CDV IT Helpdesk</p>
          </div>

          {/* Card */}
          <div
            className="relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.055)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '28px',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          >
            {/* Subtle top highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="p-7 lg:p-8">
              {/* Tabs */}
              <div className="flex rounded-2xl bg-white/5 border border-white/8 p-1 mb-7">
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-semibold rounded-xl transition-all duration-250 ${
                      mode === m
                        ? 'bg-white/12 text-white shadow-sm'
                        : 'text-white/35 hover:text-white/60'
                    }`}
                  >
                    {m === 'login' ? <LogIn size={13} /> : <UserPlus size={13} />}
                    {m === 'login' ? 'Logowanie' : 'Rejestracja'}
                  </button>
                ))}
              </div>

              <p className="text-white/30 text-[12px] mb-5 font-medium">
                {mode === 'login'
                  ? 'Dostęp dla administratorów IT CDV'
                  : 'Nowe konto otrzyma rolę Użytkownika'}
              </p>

              {/* Error */}
              {displayError && (
                <div className="flex items-start gap-2.5 bg-red-500/12 border border-red-500/20 rounded-2xl p-3.5 mb-5 text-[13px] text-red-300 animate-slide-up-sm">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{displayError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-white/40 mb-1.5 uppercase tracking-[0.1em]">Email</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError(null); }}
                      placeholder="admin@cdv.pl"
                      required
                      autoComplete="email"
                      className="w-full pl-9 pr-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/20 focus:outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,67,214,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold text-white/40 mb-1.5 uppercase tracking-[0.1em]">Hasło</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError(null); }}
                      placeholder="••••••••"
                      required
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      className="w-full pl-9 pr-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/20 focus:outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,67,214,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    />
                  </div>
                </div>

                {/* Confirm password */}
                {mode === 'register' && (
                  <div className="animate-slide-up-sm">
                    <label className="block text-[11px] font-bold text-white/40 mb-1.5 uppercase tracking-[0.1em]">Powtórz hasło</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(null); }}
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        className="w-full pl-9 pr-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/20 focus:outline-none transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '14px',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,67,214,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !email || !password || (mode === 'register' && !confirmPassword)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-[14px] rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                  style={{
                    background: loading ? 'rgba(139,67,214,0.5)' : 'linear-gradient(135deg, #8B43D6 0%, #6B2D8B 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(139,67,214,0.35)',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 28px rgba(139,67,214,0.55)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,67,214,0.35)'; }}
                >
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" />{mode === 'login' ? 'Logowanie…' : 'Rejestracja…'}</>
                  ) : (
                    <>{mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'} <ArrowRight size={14} /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-[11px] text-white/20 font-medium">lub</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={loginGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 font-semibold text-[13px] rounded-full text-white/75 hover:text-white transition-all duration-200 disabled:opacity-40"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <GoogleIcon />
                Zaloguj się przez Google
              </button>

              <p className="text-center text-[11px] text-white/15 mt-6">
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
