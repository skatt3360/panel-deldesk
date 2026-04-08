import React, { useState } from 'react';
import { Save, RotateCcw, Info, Bell, Shield, Users } from 'lucide-react';
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

  const handleReset = () => {
    setForm({ ...storeSettings });
    setSaved(false);
  };

  const InputRow = ({
    label,
    id,
    children,
    hint,
  }: {
    label: string;
    id: string;
    children: React.ReactNode;
    hint?: string;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="sm:w-52 flex-shrink-0">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 block">
          {label}
        </label>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSave} className="space-y-6">

        {/* Organization */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-cdv-blue/10 rounded-lg">
              <Info size={16} className="text-cdv-blue" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Informacje o organizacji</h2>
          </div>

          <InputRow label="Nazwa organizacji" id="orgName" hint="Wyświetlana w nagłówkach i raportach">
            <input
              id="orgName"
              type="text"
              value={form.organizationName}
              onChange={(e) => set('organizationName', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 focus:border-cdv-blue"
            />
          </InputRow>

          <InputRow label="Email administratora" id="adminEmail" hint="Adres do powiadomień systemowych">
            <input
              id="adminEmail"
              type="email"
              value={form.adminEmail}
              onChange={(e) => set('adminEmail', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 focus:border-cdv-blue"
            />
          </InputRow>
        </Card>

        {/* SLA */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-cdv-gold/20 rounded-lg">
              <Shield size={16} className="text-cdv-gold-dark" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Parametry SLA</h2>
              <p className="text-xs text-gray-400">Czas na rozwiązanie zgłoszenia (w godzinach)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(
              [
                { key: 'slaHoursLow', label: 'Niski priorytet', color: 'bg-gray-100' },
                { key: 'slaHoursMedium', label: 'Średni priorytet', color: 'bg-blue-100' },
                { key: 'slaHoursHigh', label: 'Wysoki priorytet', color: 'bg-orange-100' },
                { key: 'slaHoursCritical', label: 'Krytyczny', color: 'bg-red-100' },
              ] as const
            ).map(({ key, label, color }) => (
              <div key={key} className={`${color} rounded-xl p-4`}>
                <label className="text-xs font-medium text-gray-600 mb-2 block">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={720}
                    value={form[key]}
                    onChange={(e) => set(key, parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-1.5 text-sm border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 bg-white/70"
                  />
                  <span className="text-sm text-gray-500">godz.</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users size={16} className="text-purple-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Zespół i przypisania</h2>
          </div>

          <InputRow
            label="Domyślny technik"
            id="defaultAssignee"
            hint="Przypisywany domyślnie do nowych zgłoszeń"
          >
            <select
              id="defaultAssignee"
              value={form.defaultAssignee}
              onChange={(e) => set('defaultAssignee', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30"
            >
              {TECHNICIANS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </InputRow>

          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Aktywni technicy ({TECHNICIANS.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {TECHNICIANS.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-cdv-blue text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
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
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Bell size={16} className="text-green-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Powiadomienia i wygląd</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Powiadomienia email</p>
                <p className="text-xs text-gray-400">Wysyłaj powiadomienia przy zmianach statusu zgłoszeń</p>
              </div>
              <button
                type="button"
                onClick={() => set('emailNotifications', !form.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.emailNotifications ? 'bg-cdv-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Tryb ciemny</p>
                <p className="text-xs text-gray-400">Przełącz na ciemny motyw interfejsu (wkrótce)</p>
              </div>
              <button
                type="button"
                onClick={() => set('darkMode', !form.darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.darkMode ? 'bg-cdv-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            {saved && (
              <p className="text-sm text-green-600 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ustawienia zostały zapisane
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={handleReset}>
              <RotateCcw size={15} />
              Przywróć
            </Button>
            <Button type="submit" variant="primary">
              <Save size={15} />
              Zapisz ustawienia
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
