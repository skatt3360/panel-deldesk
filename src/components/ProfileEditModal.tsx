import React, { useState, useEffect } from 'react';
import { X, Phone, Building2, Save, Mail, Camera, Crown, Shield, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ADMINS } from '../utils/helpers';
import { ROLE_LABEL, ROLE_COLOR } from '../utils/roles';

interface ProfileData {
  displayName: string;
  phone: string;
  department: string;
}

const LS_KEY = 'cdv-profile-data';

export function useProfileData(email: string | undefined) {
  const stored = email ? JSON.parse(localStorage.getItem(`${LS_KEY}-${email}`) ?? 'null') : null;
  return stored as ProfileData | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<Props> = ({ open, onClose }) => {
  const { user, role } = useAuthStore();
  const adminRecord = ADMINS.find((a) => a.email === user?.email);
  const defaultName = adminRecord?.name ?? user?.displayName ?? user?.email ?? '';

  const [form, setForm] = useState<ProfileData>({ displayName: '', phone: '', department: '' });
  const [saved, setSaved] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user?.email) return;
    const stored = JSON.parse(localStorage.getItem(`${LS_KEY}-${user.email}`) ?? 'null') as ProfileData | null;
    setForm({
      displayName: stored?.displayName || defaultName,
      phone: stored?.phone || '',
      department: stored?.department || '',
    });
    setSaved(false);
  }, [open, user?.email]);

  const handleSave = () => {
    if (!user?.email) return;
    localStorage.setItem(`${LS_KEY}-${user.email}`, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  if (!open) return null;

  const initials = (form.displayName || defaultName)
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const roleIcon = role === 'owner' ? <Crown size={12} /> : role === 'admin' ? <Shield size={12} /> : <User size={12} />;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md animate-scale-in" style={{ filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.6))' }}>
        {/* Card */}
        <div className="rounded-3xl overflow-hidden" style={{ background: '#0D0A1A', border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Top banner */}
          <div className="relative h-24 overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(255,105,0,0.35) 0%, rgba(139,67,214,0.35) 50%, rgba(45,184,122,0.2) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,105,0,0.2) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(139,67,214,0.2) 0%, transparent 60%)',
            }} />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Avatar — overlaps the banner */}
          <div className="flex flex-col items-center" style={{ marginTop: -40 }}>
            <div className="relative group">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold font-display"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,105,0,0.3), rgba(139,67,214,0.3))',
                  border: '3px solid #0D0A1A',
                  color: '#fff',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {initials}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera size={18} className="text-white" />
              </div>
            </div>

            <div className="mt-3 flex flex-col items-center gap-1.5">
              <p className="text-[15px] font-bold text-white">{form.displayName || defaultName}</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${ROLE_COLOR[role]}`}>
                  {roleIcon}
                  {ROLE_LABEL[role]}
                </span>
              </div>
              <p className="text-[11px] text-white/35 flex items-center gap-1.5 mt-0.5">
                <Mail size={10} />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 pt-5 pb-6 space-y-3.5">
            {/* Divider */}
            <div className="border-t border-white/[0.07]" />

            {[
              {
                key: 'displayName' as const,
                label: 'Wyświetlana nazwa',
                placeholder: 'Imię i nazwisko...',
                icon: <User size={14} className="text-white/30" />,
              },
              {
                key: 'phone' as const,
                label: 'Numer telefonu',
                placeholder: '+48 000 000 000',
                icon: <Phone size={14} className="text-white/30" />,
              },
              {
                key: 'department' as const,
                label: 'Dział / Wydział',
                placeholder: 'np. Dział IT, Dziekanat...',
                icon: <Building2 size={14} className="text-white/30" />,
              },
            ].map(({ key, label, placeholder, icon }) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-1.5">
                  {label}
                </label>
                <div
                  className="relative flex items-center transition-all duration-200"
                  style={{
                    background: activeField === key ? 'rgba(255,105,0,0.06)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${activeField === key ? 'rgba(255,105,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 12,
                  }}
                >
                  <span className="pl-3.5 flex-shrink-0">{icon}</span>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    onFocus={() => setActiveField(key)}
                    onBlur={() => setActiveField(null)}
                    placeholder={placeholder}
                    className="flex-1 px-2.5 py-2.5 text-[13px] bg-transparent text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleSave}
              className="w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300"
              style={{
                background: saved
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))'
                  : 'linear-gradient(135deg, #FF6900, #E85D00)',
                border: saved ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                color: saved ? '#34d399' : '#fff',
                boxShadow: saved ? 'none' : '0 4px 20px rgba(255,105,0,0.35)',
              }}
            >
              <Save size={14} />
              {saved ? 'Zapisano!' : 'Zapisz zmiany'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
