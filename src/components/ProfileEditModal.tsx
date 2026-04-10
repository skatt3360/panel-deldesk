import React, { useState, useEffect } from 'react';
import { X, User, Phone, Building2, Save, Mail } from 'lucide-react';
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
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  if (!open) return null;

  const initials = (form.displayName || defaultName)
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0D0A1A] border border-white/12 rounded-3xl shadow-2xl animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cdv-purple/20 border border-cdv-purple/30 flex items-center justify-center">
              <User size={16} className="text-cdv-purple-light" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">Edytuj profil</h2>
              <p className="text-[11px] text-white/35">Dane wyświetlane w panelu</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center pt-6 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-cdv-purple/25 border border-cdv-purple/35 flex items-center justify-center text-cdv-purple-light font-extrabold text-xl font-display mb-3">
            {initials}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ROLE_COLOR[role]}`}>
              {ROLE_LABEL[role]}
            </span>
          </div>
          <p className="text-[12px] text-white/35 mt-1.5 flex items-center gap-1.5">
            <Mail size={11} />
            {user?.email}
          </p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-1.5">
              Wyświetlana nazwa
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder="Imię i nazwisko..."
              className="w-full px-3.5 py-2.5 text-[13px] bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-cdv-purple/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-1.5">
              <Phone size={10} className="inline mr-1" />
              Numer telefonu
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+48 000 000 000"
              className="w-full px-3.5 py-2.5 text-[13px] bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-cdv-purple/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-1.5">
              <Building2 size={10} className="inline mr-1" />
              Dział / Wydział
            </label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              placeholder="np. Dział IT, Dziekanat..."
              className="w-full px-3.5 py-2.5 text-[13px] bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-cdv-purple/50 transition-all"
            />
          </div>

          <button
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${
              saved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'btn-purple'
            }`}
          >
            <Save size={14} />
            {saved ? 'Zapisano!' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
