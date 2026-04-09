import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { NewTicketForm, TicketCategory, TicketPriority } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  ALL_CATEGORIES, ALL_PRIORITIES, categoryLabel, priorityLabel, priorityDotColor,
} from '../utils/helpers';

const INITIAL_FORM: NewTicketForm = {
  title: '', description: '', category: 'Software',
  priority: 'medium', requesterName: '', requesterEmail: '', room: '',
};

const slaInfo: Record<TicketPriority, { label: string; color: string }> = {
  low:      { label: 'SLA: 72 godziny', color: 'bg-gray-50 border-gray-200 text-gray-600' },
  medium:   { label: 'SLA: 24 godziny', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  high:     { label: 'SLA: 8 godzin',   color: 'bg-orange-50 border-orange-200 text-orange-700' },
  critical: { label: 'SLA: 2 godziny',  color: 'bg-red-50 border-red-200 text-red-700' },
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
      <div className="max-w-lg mx-auto pt-8 animate-fade-up">
        <Card className="text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Zgłoszenie utworzone!</h2>
          <p className="text-ink-muted text-[14px] mb-1">Zarejestrowano pod numerem:</p>
          <p className="text-2xl font-mono font-bold text-cdv-blue mb-6">{submitted}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(`/tickets/${submitted}`)}>Przejdź do zgłoszenia</Button>
            <Button variant="outline" onClick={() => { setForm(INITIAL_FORM); setSubmitted(null); }}>
              Nowe zgłoszenie
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-1.5 text-[12px] text-red-500 flex items-center gap-1">
        <AlertCircle size={12} /> {msg}
      </p>
    ) : null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          {/* Ticket info */}
          <Card>
            <h2 className="text-[14px] font-bold text-ink mb-5">Informacje o zgłoszeniu</h2>

            <div className="mb-4">
              <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
                Tytuł zgłoszenia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Krótki, opisowy tytuł problemu…"
                maxLength={120}
                className={`input-base ${errors.title ? '!border-red-400 focus:!ring-red-400/20' : ''}`}
              />
              <FieldError msg={errors.title} />
            </div>

            <div className="mb-4">
              <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
                Opis problemu <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Opisz szczegółowo problem: co się dzieje, kiedy wystąpił, jakie komunikaty błędów widzisz…"
                rows={5}
                className={`input-base resize-none ${errors.description ? '!border-red-400 focus:!ring-red-400/20' : ''}`}
              />
              <FieldError msg={errors.description} />
            </div>

            <div className="mb-4">
              <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
                Sala / Lokalizacja
              </label>
              <input
                type="text"
                value={form.room ?? ''}
                onChange={(e) => set('room', e.target.value)}
                placeholder="np. Sala 204, Budynek A, Lab 302…"
                className="input-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
                  Kategoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value as TicketCategory)}
                  className="select-base w-full"
                >
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
                  Priorytet <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value as TicketPriority)}
                  className="select-base w-full"
                >
                  {ALL_PRIORITIES.map((p) => <option key={p} value={p}>{priorityLabel[p]}</option>)}
                </select>
                <p className={`mt-2 text-[12px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium ${slaInfo[form.priority].color}`}>
                  <span className={`w-2 h-2 rounded-full ${priorityDotColor[form.priority]}`} />
                  {slaInfo[form.priority].label}
                </p>
              </div>
            </div>
          </Card>

          {/* Requester */}
          <Card>
            <h2 className="text-[14px] font-bold text-ink mb-5">Dane zgłaszającego</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
                  Imię i nazwisko <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.requesterName}
                  onChange={(e) => set('requesterName', e.target.value)}
                  placeholder="np. Jan Kowalski"
                  className={`input-base ${errors.requesterName ? '!border-red-400' : ''}`}
                />
                <FieldError msg={errors.requesterName} />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink-faint mb-1.5 uppercase tracking-wider">
                  Adres email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.requesterEmail}
                  onChange={(e) => set('requesterEmail', e.target.value)}
                  placeholder="imie.nazwisko@cdv.pl"
                  className={`input-base ${errors.requesterEmail ? '!border-red-400' : ''}`}
                />
                <FieldError msg={errors.requesterEmail} />
              </div>
            </div>
          </Card>

          {form.priority === 'critical' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 animate-fade-up">
              <AlertCircle size={17} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-700">
                <span className="font-bold">Priorytet krytyczny:</span> Zgłoszenie musi zostać
                rozwiązane w ciągu 2 godzin. Zostanie natychmiast eskalowane do zespołu IT.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => navigate('/tickets')}>Anuluj</Button>
            <Button type="submit" loading={submitting}>
              <Send size={14} />
              Wyślij zgłoszenie
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewTicket;
