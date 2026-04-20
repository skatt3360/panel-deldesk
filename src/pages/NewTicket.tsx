import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { NewTicketForm, TicketCategory, TicketPriority } from '../types';
import {
  ALL_CATEGORIES, ALL_PRIORITIES, categoryLabel, priorityLabel, CDV_ROOMS,
} from '../utils/helpers';

const INITIAL_FORM: NewTicketForm = {
  title: '', description: '', category: 'Software',
  priority: 'medium', requesterName: '', requesterEmail: '', room: '',
};

const slaInfo: Record<TicketPriority, { label: string; bg: string; border: string; text: string; dot: string }> = {
  low:      { label: 'SLA: 72 godziny', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)',  text: 'rgba(255,255,255,0.4)', dot: 'bg-white/20' },
  medium:   { label: 'SLA: 24 godziny', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)',  text: '#93c5fd', dot: 'bg-blue-400' },
  high:     { label: 'SLA: 8 godzin',   bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)',  text: '#fdba74', dot: 'bg-orange-400' },
  critical: { label: 'SLA: 2 godziny',  bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',   text: '#fca5a5', dot: 'bg-red-400' },
};

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 14,
  color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, outline: 'none',
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle, border: '1px solid rgba(239,68,68,0.6)',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: 'none',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 20, padding: 24,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'rgba(255,255,255,0.35)', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.08em',
};

const NewTicket: React.FC = () => {
  const navigate = useNavigate();
  const addTicket = useTicketStore((s) => s.addTicket);
  const [form, setForm] = useState<NewTicketForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewTicketForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setSubmitError(null);
    try {
      const id = await addTicket(form);
      setSubmitting(false);
      setSubmitted(id);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      setSubmitError(
        code === 'PERMISSION_DENIED' || code.includes('permission')
          ? 'Brak uprawnień do zapisu. Sprawdź połączenie i zaloguj się ponownie.'
          : `Błąd zapisu: ${code || String(err)}`
      );
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto pt-8 animate-fade-up">
        <div style={cardStyle} className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border"
            style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}
          >
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Zgłoszenie utworzone!</h2>
          <p className="text-white/50 text-[14px] mb-1">Zarejestrowano pod numerem:</p>
          <p className="text-2xl font-mono font-bold text-cdv-orange mb-6">{submitted}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/tickets/${submitted}`)}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-cdv-orange text-white hover:brightness-110 transition-all"
            >
              Przejdź do zgłoszenia
            </button>
            <button
              onClick={() => { setForm(INITIAL_FORM); setSubmitted(null); }}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold border border-white/15 text-white/60 hover:bg-white/[0.06] hover:text-white transition-all"
            >
              Nowe zgłoszenie
            </button>
          </div>
        </div>
      </div>
    );
  }

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-1.5 text-[12px] text-red-400 flex items-center gap-1">
        <AlertCircle size={12} /> {msg}
      </p>
    ) : null;

  const sla = slaInfo[form.priority];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          {/* Ticket info */}
          <div style={cardStyle}>
            <h2 className="text-[14px] font-bold text-white mb-5">Informacje o zgłoszeniu</h2>

            <div className="mb-4">
              <label style={labelStyle}>
                Tytuł zgłoszenia <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Krótki, opisowy tytuł problemu…"
                maxLength={120}
                style={errors.title ? inputErrorStyle : inputStyle}
              />
              <FieldError msg={errors.title} />
            </div>

            <div className="mb-4">
              <label style={labelStyle}>
                Opis problemu <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Opisz szczegółowo problem: co się dzieje, kiedy wystąpił, jakie komunikaty błędów widzisz…"
                rows={5}
                style={{ ...( errors.description ? inputErrorStyle : inputStyle), resize: 'none' }}
              />
              <FieldError msg={errors.description} />
            </div>

            <div className="mb-4">
              <label style={labelStyle}>Sala / Lokalizacja</label>
              <input
                type="text"
                list="cdv-rooms-list"
                value={form.room ?? ''}
                onChange={(e) => set('room', e.target.value)}
                placeholder="np. Sala 204, Budynek A, Lab 302…"
                style={inputStyle}
              />
              <datalist id="cdv-rooms-list">
                {CDV_ROOMS.map((r) => <option key={r} value={r} />)}
              </datalist>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>
                  Kategoria <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value as TicketCategory)}
                  style={selectStyle}
                >
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0A0812]">{categoryLabel[c]}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>
                  Priorytet <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value as TicketPriority)}
                  style={selectStyle}
                >
                  {ALL_PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0A0812]">{priorityLabel[p]}</option>)}
                </select>
                <div
                  className="mt-2 text-[12px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium border"
                  style={{ background: sla.bg, borderColor: sla.border, color: sla.text }}
                >
                  <span className={`w-2 h-2 rounded-full ${sla.dot} flex-shrink-0`} />
                  {sla.label}
                </div>
              </div>
            </div>
          </div>

          {/* Requester */}
          <div style={cardStyle}>
            <h2 className="text-[14px] font-bold text-white mb-5">Dane zgłaszającego</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>
                  Imię i nazwisko <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.requesterName}
                  onChange={(e) => set('requesterName', e.target.value)}
                  placeholder="np. Jan Kowalski"
                  style={errors.requesterName ? inputErrorStyle : inputStyle}
                />
                <FieldError msg={errors.requesterName} />
              </div>
              <div>
                <label style={labelStyle}>
                  Adres email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.requesterEmail}
                  onChange={(e) => set('requesterEmail', e.target.value)}
                  placeholder="imie.nazwisko@cdv.pl"
                  style={errors.requesterEmail ? inputErrorStyle : inputStyle}
                />
                <FieldError msg={errors.requesterEmail} />
              </div>
            </div>
          </div>

          {form.priority === 'critical' && (
            <div
              className="flex items-start gap-3 rounded-2xl p-4 animate-fade-up border"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}
            >
              <AlertCircle size={17} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-300">
                <span className="font-bold">Priorytet krytyczny:</span> Zgłoszenie musi zostać
                rozwiązane w ciągu 2 godzin. Zostanie natychmiast eskalowane do zespołu IT.
              </p>
            </div>
          )}

          {submitError && (
            <p style={{ color: '#f87171', fontSize: 13, marginBottom: 8, textAlign: 'right' }}>{submitError}</p>
          )}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white/40 hover:text-white/70 transition-all"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-cdv-orange text-white hover:brightness-110 disabled:opacity-60 transition-all"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Wyślij zgłoszenie
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewTicket;
