import React, { useState } from 'react';
import { Save, RotateCcw, Bell, Shield, Users, Building2, CheckCircle2 } from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TECHNICIANS } from '../utils/helpers';

const Settings: React.FC = () => {
  const storeSettings = useTicketStore((s) => s.settings);
  const updateSettings = useTicketStore((s) => s.updateSettings);
  const [form, setForm] = useState({ ...storeSettings });
  const [saved, setSaved] = useState(false);

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

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 focus:ring-offset-1 ${
        value ? 'bg-cdv-blue' : 'bg-surface-border'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const inputCls = 'input-base';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <form onSubmit={handleSave} className="space-y-5">

        {/* Organization */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-cdv-blue-light rounded-xl">
              <Building2 size={16} className="text-cdv-blue" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-ink">Informacje o organizacji</h2>
              <p className="text-[12px] text-ink-faint">Podstawowe dane wyświetlane w systemie</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { id: 'orgName', label: 'Nazwa organizacji', hint: 'Wyświetlana w nagłówkach i raportach', key: 'organizationName', type: 'text' },
              { id: 'adminEmail', label: 'Email administratora', hint: 'Adres do powiadomień systemowych', key: 'adminEmail', type: 'email' },
              { id: 'secondEmail', label: 'Drugi email (opcjonalnie)', hint: 'Dodatkowy adres powiadomień', key: 'secondAdminEmail', type: 'email' },
            ].map(({ id, label, hint, key, type }) => (
              <div key={id} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <div className="sm:w-52 flex-shrink-0">
                  <label htmlFor={id} className="text-[13px] font-semibold text-ink block">{label}</label>
                  <p className="text-[11px] text-ink-faint mt-0.5">{hint}</p>
                </div>
                <div className="flex-1">
                  <input
                    id={id}
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => set(key as any, e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* SLA */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Shield size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-ink">Parametry SLA</h2>
              <p className="text-[12px] text-ink-faint">Czas na rozwiązanie zgłoszenia (w godzinach)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: 'slaHoursLow',      label: 'Niski',    accent: 'border-gray-200 bg-gray-50',     dot: 'bg-gray-400' },
              { key: 'slaHoursMedium',   label: 'Średni',   accent: 'border-blue-200 bg-blue-50',     dot: 'bg-blue-500' },
              { key: 'slaHoursHigh',     label: 'Wysoki',   accent: 'border-orange-200 bg-orange-50', dot: 'bg-orange-500' },
              { key: 'slaHoursCritical', label: 'Krytyczny', accent: 'border-red-200 bg-red-50',      dot: 'bg-red-500' },
            ] as const).map(({ key, label, accent, dot }) => (
              <div key={key} className={`rounded-2xl p-4 border ${accent}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                  <label className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">{label}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={720}
                    value={form[key]}
                    onChange={(e) => set(key, parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-1.5 text-sm border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-cdv-blue/20 bg-white font-semibold text-ink"
                  />
                  <span className="text-[13px] text-ink-faint font-medium">godz.</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-violet-50 rounded-xl">
              <Users size={16} className="text-violet-600" />
            </div>
            <h2 className="text-[14px] font-bold text-ink">Zespół i przypisania</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 mb-5">
            <div className="sm:w-52 flex-shrink-0">
              <label className="text-[13px] font-semibold text-ink block">Domyślny technik</label>
              <p className="text-[11px] text-ink-faint mt-0.5">Przypisywany do nowych zgłoszeń</p>
            </div>
            <div className="flex-1">
              <select
                value={form.defaultAssignee}
                onChange={(e) => set('defaultAssignee', e.target.value)}
                className="select-base w-full"
              >
                {TECHNICIANS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-ink-faint mb-3 uppercase tracking-wider">
              Aktywni technicy ({TECHNICIANS.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {TECHNICIANS.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-xl border border-surface-border text-[13px] font-medium text-ink"
                >
                  <div className="w-5 h-5 rounded-full bg-cdv-blue text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                    {t.charAt(0)}
                  </div>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Bell size={16} className="text-emerald-600" />
            </div>
            <h2 className="text-[14px] font-bold text-ink">Powiadomienia i wygląd</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                key: 'emailNotifications', title: 'Powiadomienia email',
                desc: 'Wysyłaj powiadomienia przy zmianach statusu zgłoszeń',
              },
              {
                key: 'darkMode', title: 'Tryb ciemny',
                desc: 'Przełącz na ciemny motyw interfejsu (wkrótce)',
              },
            ].map(({ key, title, desc }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                <div>
                  <p className="text-[13px] font-semibold text-ink">{title}</p>
                  <p className="text-[12px] text-ink-faint">{desc}</p>
                </div>
                <Toggle value={(form as any)[key]} onChange={() => set(key as any, !(form as any)[key])} />
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pb-4">
          <div>
            {saved && (
              <p className="text-[13px] text-emerald-600 flex items-center gap-1.5 font-semibold animate-fade-in">
                <CheckCircle2 size={15} />
                Ustawienia zostały zapisane
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => { setForm({ ...storeSettings }); setSaved(false); }}>
              <RotateCcw size={14} />
              Przywróć
            </Button>
            <Button type="submit" variant="primary">
              <Save size={14} />
              Zapisz ustawienia
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
