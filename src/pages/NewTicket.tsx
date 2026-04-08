import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertCircle } from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { NewTicketForm, TicketCategory, TicketPriority } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  ALL_CATEGORIES,
  ALL_PRIORITIES,
  categoryLabel,
  priorityLabel,
  priorityDotColor,
} from '../utils/helpers';

const INITIAL_FORM: NewTicketForm = {
  title: '',
  description: '',
  category: 'Software',
  priority: 'medium',
  requesterName: '',
  requesterEmail: '',
};

const NewTicket: React.FC = () => {
  const navigate = useNavigate();
  const addTicket = useTicketStore((s) => s.addTicket);

  const [form, setForm] = useState<NewTicketForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewTicketForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const set = <K extends keyof NewTicketForm>(key: K, value: NewTicketForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof NewTicketForm, string>> = {};
    if (!form.title.trim()) errs.title = 'Tytuł jest wymagany';
    if (form.title.length > 120) errs.title = 'Maksymalnie 120 znaków';
    if (!form.description.trim()) errs.description = 'Opis jest wymagany';
    if (!form.requesterName.trim()) errs.requesterName = 'Imię i nazwisko jest wymagane';
    if (!form.requesterEmail.trim()) errs.requesterEmail = 'Email jest wymagany';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.requesterEmail))
      errs.requesterEmail = 'Nieprawidłowy format email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const id = await addTicket(form);
    setSubmitting(false);
    setSubmitted(id);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto pt-8">
        <Card className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Zgłoszenie utworzone!</h2>
          <p className="text-gray-500 mb-1">
            Twoje zgłoszenie zostało zarejestrowane pod numerem:
          </p>
          <p className="text-2xl font-mono font-bold text-cdv-blue mb-6">{submitted}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(`/tickets/${submitted}`)}>
              Przejdź do zgłoszenia
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setForm(INITIAL_FORM);
                setSubmitted(null);
              }}
            >
              Nowe zgłoszenie
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const slaInfo: Record<TicketPriority, string> = {
    low: 'SLA: 72 godziny',
    medium: 'SLA: 24 godziny',
    high: 'SLA: 8 godzin',
    critical: 'SLA: 2 godziny',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          {/* Basic info */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-5">Informacje o zgłoszeniu</h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tytuł zgłoszenia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Krótki, opisowy tytuł problemu..."
                maxLength={120}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 transition ${
                  errors.title ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cdv-blue'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Opis problemu <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Opisz szczegółowo problem: co się dzieje, kiedy wystąpił, jakie komunikaty błędów widzisz, jakie kroki już podjąłeś..."
                rows={5}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 resize-none transition ${
                  errors.description
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-gray-200 focus:border-cdv-blue'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.description}
                </p>
              )}
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value as TicketCategory)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 focus:border-cdv-blue"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{categoryLabel[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Priorytet <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 focus:border-cdv-blue"
                >
                  {ALL_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{priorityLabel[p]}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${priorityDotColor[form.priority]}`} />
                  {slaInfo[form.priority]}
                </p>
              </div>
            </div>
          </Card>

          {/* Requester info */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-5">Dane zgłaszającego</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Imię i nazwisko <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.requesterName}
                  onChange={(e) => set('requesterName', e.target.value)}
                  placeholder="np. Jan Kowalski"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 transition ${
                    errors.requesterName
                      ? 'border-red-400'
                      : 'border-gray-200 focus:border-cdv-blue'
                  }`}
                />
                {errors.requesterName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.requesterName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adres email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.requesterEmail}
                  onChange={(e) => set('requesterEmail', e.target.value)}
                  placeholder="imie.nazwisko@cdv.pl"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 transition ${
                    errors.requesterEmail
                      ? 'border-red-400'
                      : 'border-gray-200 focus:border-cdv-blue'
                  }`}
                />
                {errors.requesterEmail && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.requesterEmail}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Priority info banner */}
          {form.priority === 'critical' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                <span className="font-semibold">Priorytet krytyczny:</span> Zgłoszenie musi zostać
                rozwiązane w ciągu 2 godzin. Zostanie natychmiast eskalowane do zespołu IT.
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/tickets')}
            >
              Anuluj
            </Button>
            <Button type="submit" loading={submitting}>
              <Send size={15} />
              Wyślij zgłoszenie
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewTicket;
