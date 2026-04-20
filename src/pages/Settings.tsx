import React, { useState } from 'react';
import { Save, RotateCcw, Bell, Shield, Users, Building2, CheckCircle2 } from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { useAuthStore } from '../store/authStore';
import { TECHNICIANS } from '../utils/helpers';

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '24px 28px',
};
const inp: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '9px 13px',
  color: '#fff',
  fontSize: 13,
  width: '100%',
  outline: 'none',
};
const sectionLbl: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
};

const Toggle: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    style={{
      position: 'relative', display: 'inline-flex', width: 44, height: 24,
      borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
      background: value ? '#FF6900' : 'rgba(255,255,255,0.12)',
      transition: 'background 0.2s',
    }}
  >
    <span style={{
      position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18,
      borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    }} />
  </button>
);

const Settings: React.FC = () => {
  const storeSettings = useTicketStore((s) => s.settings);
  const updateSettings = useTicketStore((s) => s.updateSettings);
  const [form, setForm] = useState({ ...storeSettings });
  const [saved, setSaved] = useState(false);
  const role = useAuthStore((s) => s.role);

  if (role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Shield size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Brak dostępu</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>Ta sekcja jest dostępna tylko dla administratorów.</p>
      </div>
    );
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const PRIORITY_DOTS: Record<string, string> = {
    slaHoursLow: '#9ca3af', slaHoursMedium: '#60a5fa',
    slaHoursHigh: '#fb923c', slaHoursCritical: '#f87171',
  };
  const PRIORITY_LABELS: Record<string, string> = {
    slaHoursLow: 'Niski', slaHoursMedium: 'Średni',
    slaHoursHigh: 'Wysoki', slaHoursCritical: 'Krytyczny',
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Ustawienia</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>Konfiguracja systemu helpdesk CDV</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Organization */}
        <div style={glass}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,105,0,0.1)', border: '1px solid rgba(255,105,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={16} style={{ color: '#FF6900' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Informacje o organizacji</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Podstawowe dane wyświetlane w systemie</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { id: 'orgName',     label: 'Nazwa organizacji',       hint: 'Wyświetlana w nagłówkach i raportach',  key: 'organizationName',  type: 'text' },
              { id: 'adminEmail',  label: 'Email administratora',    hint: 'Adres do powiadomień systemowych',      key: 'adminEmail',        type: 'email' },
              { id: 'secondEmail', label: 'Drugi email (opcjonalnie)', hint: 'Dodatkowy adres powiadomień',         key: 'secondAdminEmail',  type: 'email' },
            ].map(({ id, label, hint, key, type }) => (
              <div key={id} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
                <div>
                  <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'block' }}>{label}</label>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>{hint}</p>
                </div>
                <input id={id} type={type} value={(form as any)[key]} onChange={(e) => set(key as any, e.target.value)} style={inp} />
              </div>
            ))}
          </div>
        </div>

        {/* SLA */}
        <div style={glass}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Parametry SLA</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Czas na rozwiązanie zgłoszenia (w godzinach)</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['slaHoursLow', 'slaHoursMedium', 'slaHoursHigh', 'slaHoursCritical'] as const).map((key) => (
              <div key={key} style={{ padding: '16px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_DOTS[key], flexShrink: 0 }} />
                  <span style={{ ...sectionLbl }}>{PRIORITY_LABELS[key]}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number" min={1} max={720}
                    value={form[key]}
                    onChange={(e) => set(key, parseInt(e.target.value) || 1)}
                    style={{ ...inp, width: 80, padding: '7px 10px', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>godz.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={glass}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Zespół i przypisania</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start', marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'block' }}>Domyślny technik</label>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Przypisywany do nowych zgłoszeń</p>
            </div>
            <select value={form.defaultAssignee} onChange={(e) => set('defaultAssignee', e.target.value)} style={inp}>
              {TECHNICIANS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <div style={{ ...sectionLbl, marginBottom: 12 }}>Aktywni technicy ({TECHNICIANS.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TECHNICIANS.map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,105,0,0.15)', border: '1px solid rgba(255,105,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#FF6900', flexShrink: 0 }}>
                    {t.charAt(0)}
                  </div>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={glass}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} style={{ color: '#4ade80' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Powiadomienia i wygląd</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { key: 'emailNotifications', title: 'Powiadomienia email', desc: 'Wysyłaj powiadomienia przy zmianach statusu zgłoszeń' },
              { key: 'darkMode',           title: 'Tryb ciemny',         desc: 'Przełącz między ciemnym a jasnym motywem interfejsu' },
            ].map(({ key, title, desc }, i, arr) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>{desc}</p>
                </div>
                <Toggle value={(form as any)[key]} onChange={() => set(key as any, !(form as any)[key])} />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 }}>
          <div>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#4ade80' }}>
                <CheckCircle2 size={15} /> Ustawienia zostały zapisane
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => { setForm({ ...storeSettings }); setSaved(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <RotateCcw size={14} /> Przywróć
            </button>
            <button
              type="submit"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, border: 'none', background: '#FF6900', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              <Save size={14} /> Zapisz ustawienia
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
