import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CdvLogo from '../components/CdvLogo';

const Login: React.FC = () => {
  const { login, register, loading, error, clearError } = useAuthStore();
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
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cdv-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cdv-blue-mid/20 rounded-full blur-3xl pointer-events-none" />

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="w-full max-w-[380px] relative animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <CdvLogo size={64} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Panel Helpdesk</h1>
          <p className="text-white/40 text-[13px] mt-1 font-medium">CDV IT Helpdesk · Panel administracyjny</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-xl bg-white/5 border border-white/8 p-1 mb-6">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-cdv-blue shadow-sm'
                    : 'text-white/45 hover:text-white/70'
                }`}
              >
                {m === 'login' ? <LogIn size={13} /> : <UserPlus size={13} />}
                {m === 'login' ? 'Logowanie' : 'Rejestracja'}
              </button>
            ))}
          </div>

          <p className="text-white/35 text-[12px] mb-5 font-medium">
            {mode === 'login'
              ? 'Dostęp tylko dla administratorów IT CDV'
              : 'Utwórz konto administratora IT CDV'}
          </p>

          {displayError && (
            <div className="flex items-start gap-2.5 bg-red-500/15 border border-red-500/25 rounded-xl p-3 mb-5 text-[13px] text-red-300 animate-fade-in">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                Adres email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError(null); }}
                  placeholder="admin@cdv.pl"
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-3.5 py-2.5 text-[13.5px] bg-white/8 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cdv-gold/30 focus:border-cdv-gold/40 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                Hasło
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError(null); }}
                  placeholder="••••••••"
                  required
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className="w-full pl-9 pr-3.5 py-2.5 text-[13.5px] bg-white/8 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cdv-gold/30 focus:border-cdv-gold/40 transition-all duration-200"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="animate-fade-up">
                <label className="block text-[12px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                  Powtórz hasło
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(null); }}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3.5 py-2.5 text-[13.5px] bg-white/8 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cdv-gold/30 focus:border-cdv-gold/40 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password || (mode === 'register' && !confirmPassword)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cdv-gold hover:bg-cdv-gold-dark disabled:opacity-50 disabled:cursor-not-allowed text-cdv-blue font-bold text-[14px] rounded-xl transition-all duration-200 shadow-lg shadow-cdv-gold/20 hover:shadow-xl hover:shadow-cdv-gold/30 active:scale-[0.98] mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {mode === 'login' ? 'Logowanie…' : 'Rejestracja…'}
                </>
              ) : mode === 'login' ? (
                'Zaloguj się'
              ) : (
                'Zarejestruj się'
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-white/20 mt-6 font-medium">
            Collegium Da Vinci © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
