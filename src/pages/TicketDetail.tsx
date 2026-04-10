import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, User, Tag, Clock, Calendar,
  UserCheck, AlertTriangle, CheckCircle2, MessageSquare, MapPin, Trash2,
  ListChecks, Plus, X as XIcon, CalendarCheck2, ExternalLink,
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { useAuthStore } from '../store/authStore';
import { TicketStatus } from '../types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  statusLabel, statusColor, priorityLabel, priorityColor,
  categoryLabel, formatDate, formatRelative, TECHNICIANS, ALL_STATUSES,
} from '../utils/helpers';
import { isAdmin } from '../utils/roles';
import { TIER_SHORT, TIER_COLOR } from '../utils/autoCategory';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const tickets = useTicketStore((s) => s.tickets);
  const updateTicketStatus = useTicketStore((s) => s.updateTicketStatus);
  const assignTicket = useTicketStore((s) => s.assignTicket);
  const addComment = useTicketStore((s) => s.addComment);
  const deleteTicket = useTicketStore((s) => s.deleteTicket);
  const addChecklistItem = useTicketStore((s) => s.addChecklistItem);
  const toggleChecklistItem = useTicketStore((s) => s.toggleChecklistItem);
  const deleteChecklistItem = useTicketStore((s) => s.deleteChecklistItem);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [checklistInput, setChecklistInput] = useState('');
  const canAdmin = isAdmin(user?.email);

  const ticket = tickets.find((t) => t.id === id);

  const [comment, setComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState(TECHNICIANS[0] ?? 'Administrator');
  const [commentRole, setCommentRole] = useState<'technician' | 'requester'>('technician');
  const [submittingComment, setSubmittingComment] = useState(false);

  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto pt-16 text-center animate-fade-in">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">Zgłoszenie nie znalezione</h2>
        <p className="text-ink-muted mb-6 text-[14px]">Zgłoszenie <code className="font-mono bg-surface px-1.5 py-0.5 rounded-lg text-cdv-blue">{id}</code> nie istnieje.</p>
        <Button onClick={() => navigate('/tickets')}>
          <ArrowLeft size={15} /> Powrót do listy
        </Button>
      </div>
    );
  }

  const handleStatusChange = (status: TicketStatus) => updateTicketStatus(ticket.id, status);
  const handleAssign = (assignee: string) => assignTicket(ticket.id, assignee);
  const handleDelete = async () => {
    await deleteTicket(ticket.id);
    navigate('/tickets');
  };
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    setTimeout(() => {
      addComment(ticket.id, commentAuthor, commentRole, comment.trim());
      setComment('');
      setSubmittingComment(false);
    }, 300);
  };

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/tickets')}
            className="mt-1 p-1.5 rounded-xl text-ink-faint hover:text-ink hover:bg-surface transition-all duration-200 flex-shrink-0"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base font-bold text-cdv-gold">{ticket.id}</span>
              <Badge dot className={statusColor[ticket.status]}>{statusLabel[ticket.status]}</Badge>
              <Badge className={priorityColor[ticket.priority]}>{priorityLabel[ticket.priority]}</Badge>
              {ticket.supportTier && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${TIER_COLOR[ticket.supportTier]}`}>
                  {TIER_SHORT[ticket.supportTier]}
                </span>
              )}
              {ticket.linkedCalendarEventId && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
                  <CalendarCheck2 size={10} /> W kalendarzu
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-ink mt-1">{ticket.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isResolved && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-[13px] font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 size={15} />
              Zamknięte
            </div>
          )}
          {/* Delete */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all duration-200"
            >
              <Trash2 size={14} />
              Usuń
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 animate-scale-in">
              <span className="text-[12px] text-red-600 font-semibold">Na pewno?</span>
              <button
                onClick={handleDelete}
                className="text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-lg transition-colors"
              >
                Tak, usuń
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[12px] text-ink-muted hover:text-ink font-medium"
              >
                Anuluj
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <Card>
            <h2 className="text-[11px] font-bold text-ink-faint uppercase tracking-[0.08em] mb-3">
              Opis zgłoszenia
            </h2>
            <p className="text-[14px] text-ink leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </Card>

          {/* Comments */}
          <Card padding={false}>
            <div className="px-5 pt-5 pb-4 border-b border-surface-border flex items-center gap-2">
              <MessageSquare size={15} className="text-ink-faint" />
              <h2 className="text-[14px] font-bold text-ink">Komentarze i aktywność</h2>
              <span className="ml-auto text-[11px] font-semibold text-ink-faint bg-surface px-2 py-0.5 rounded-full border border-surface-border">
                {ticket.comments.length}
              </span>
            </div>

            <div className="px-5 py-4 space-y-4">
              {ticket.comments.map((c, idx) => (
                <div key={c.id} className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold
                    ${c.authorRole === 'system' ? 'bg-surface text-ink-faint border border-surface-border'
                      : c.authorRole === 'technician' ? 'bg-cdv-blue text-white'
                      : 'bg-cdv-gold text-cdv-blue'
                    }`}
                  >
                    {c.authorRole === 'system' ? '⚙' : c.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-[13px] font-semibold ${c.authorRole === 'system' ? 'text-ink-faint' : 'text-ink'}`}>
                        {c.authorRole === 'system' ? 'System' : c.author}
                      </span>
                      {c.authorRole !== 'system' && (
                        <span className="text-[11px] text-ink-faint">
                          {c.authorRole === 'technician' ? '(Technik)' : '(Zgłaszający)'}
                        </span>
                      )}
                      <span className="text-[11px] text-ink-faint ml-auto">{formatRelative(c.createdAt)}</span>
                    </div>
                    <p className={`text-[13px] mt-0.5 leading-relaxed ${
                      c.authorRole === 'system' ? 'text-ink-faint italic' : 'text-ink-muted'
                    }`}>
                      {c.content}
                    </p>
                    {idx < ticket.comments.length - 1 && (
                      <div className="mt-3 border-b border-surface-border" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!isResolved && (
              <div className="px-5 pb-5">
                <div className="border-t border-surface-border pt-4">
                  <form onSubmit={handleAddComment}>
                    <div className="flex gap-2 mb-3">
                      <select
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        className="select-base text-[12px]"
                      >
                        {TECHNICIANS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select
                        value={commentRole}
                        onChange={(e) => setCommentRole(e.target.value as 'technician' | 'requester')}
                        className="select-base text-[12px]"
                      >
                        <option value="technician">Technik</option>
                        <option value="requester">Zgłaszający</option>
                      </select>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Dodaj komentarz lub aktualizację…"
                      rows={3}
                      className="input-base resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button type="submit" size="sm" loading={submittingComment} disabled={!comment.trim()}>
                        <Send size={13} />
                        Dodaj komentarz
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <h3 className="text-[11px] font-bold text-ink-faint uppercase tracking-[0.08em] mb-3">Zmień status</h3>
            <div className="space-y-1">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    ticket.status === s
                      ? 'bg-cdv-blue text-white shadow-sm'
                      : 'text-ink-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {ticket.status === s && <CheckCircle2 size={13} />}
                    {statusLabel[s]}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Assign */}
          <Card>
            <h3 className="text-[11px] font-bold text-ink-faint uppercase tracking-[0.08em] mb-3">Przypisz technika</h3>
            <div className="space-y-1">
              {TECHNICIANS.map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleAssign(tech)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 flex items-center gap-2.5 ${
                    ticket.assignee === tech
                      ? 'bg-cdv-blue-light text-cdv-blue border border-cdv-blue/20'
                      : 'text-ink-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-cdv-blue/10 flex items-center justify-center text-[10px] font-bold text-cdv-blue flex-shrink-0">
                    {tech.charAt(0)}
                  </div>
                  <span className="truncate">{tech}</span>
                  {ticket.assignee === tech && <UserCheck size={13} className="ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          </Card>

          {/* Details */}
          <Card>
            <h3 className="text-[11px] font-bold text-ink-faint uppercase tracking-[0.08em] mb-3">Szczegóły</h3>
            <dl className="space-y-3 text-[13px]">
              {[
                { icon: <Tag size={13} />, label: 'Kategoria', value: categoryLabel[ticket.category] },
                { icon: <User size={13} />, label: 'Zgłaszający', value: ticket.requesterName, sub: ticket.requesterEmail },
                ...(ticket.room ? [{ icon: <MapPin size={13} />, label: 'Sala / Lokalizacja', value: ticket.room }] : []),
                { icon: <Clock size={13} />, label: 'Utworzono', value: formatDate(ticket.createdAt) },
                { icon: <Clock size={13} />, label: 'Ostatnia aktualizacja', value: formatRelative(ticket.updatedAt) },
              ].map(({ icon, label, value, sub }: any) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className="text-ink-faint mt-0.5 flex-shrink-0">{icon}</span>
                  <div>
                    <dt className="text-[11px] text-ink-faint font-medium">{label}</dt>
                    <dd className="font-semibold text-ink mt-0.5">{value}</dd>
                    {sub && <dd className="text-[11px] text-ink-faint">{sub}</dd>}
                  </div>
                </div>
              ))}
              {ticket.dueDate && (
                <div className="flex items-start gap-2.5">
                  <Calendar size={13} className="text-ink-faint mt-0.5 flex-shrink-0" />
                  <div>
                    <dt className="text-[11px] text-ink-faint font-medium">Termin SLA</dt>
                    <dd className={`font-semibold mt-0.5 ${new Date(ticket.dueDate) < new Date() ? 'text-red-600' : 'text-ink'}`}>
                      {formatDate(ticket.dueDate)}
                    </dd>
                    {new Date(ticket.dueDate) < new Date() && (
                      <dd className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                        <AlertTriangle size={10} /> SLA przekroczony
                      </dd>
                    )}
                  </div>
                </div>
              )}
            </dl>
          </Card>
          {/* Checklist — admin only */}
          {canAdmin && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <ListChecks size={14} className="text-ink-faint" />
                <h3 className="text-[11px] font-bold text-ink-faint uppercase tracking-[0.08em] flex-1">
                  Checklist wewnętrzny
                </h3>
                {(ticket.checklist ?? []).length > 0 && (
                  <span className="text-[10px] font-bold text-ink-faint">
                    {(ticket.checklist ?? []).filter((i) => i.done).length}/{(ticket.checklist ?? []).length}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {(ticket.checklist ?? []).length > 0 && (
                <div className="w-full h-1 bg-surface rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${((ticket.checklist ?? []).filter((i) => i.done).length / (ticket.checklist ?? []).length) * 100}%` }}
                  />
                </div>
              )}

              {/* Items */}
              <div className="space-y-1.5 mb-3">
                {(ticket.checklist ?? []).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleChecklistItem(ticket.id, item.id, !item.done)}
                      className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                        item.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {item.done && <CheckCircle2 size={10} className="text-white" />}
                    </button>
                    <span className={`text-[13px] flex-1 ${item.done ? 'line-through text-ink-faint' : 'text-ink-muted'}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => deleteChecklistItem(ticket.id, item.id)}
                      className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 transition-all"
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add item */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && checklistInput.trim()) {
                      addChecklistItem(ticket.id, checklistInput.trim());
                      setChecklistInput('');
                    }
                  }}
                  placeholder="Dodaj pozycję..."
                  className="flex-1 text-[12px] px-2.5 py-1.5 bg-surface border border-surface-border rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:border-cdv-blue/30 transition-all"
                />
                <button
                  onClick={() => {
                    if (checklistInput.trim()) {
                      addChecklistItem(ticket.id, checklistInput.trim());
                      setChecklistInput('');
                    }
                  }}
                  className="p-1.5 rounded-xl bg-cdv-blue text-white hover:bg-cdv-blue-dark transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </Card>
          )}

          {/* Linked calendar event */}
          {ticket.linkedCalendarEventId && (
            <Card>
              <div className="flex items-center gap-2">
                <CalendarCheck2 size={14} className="text-emerald-500" />
                <span className="text-[11px] font-bold text-ink-faint uppercase tracking-[0.08em]">Powiązany event</span>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="mt-2 flex items-center gap-1.5 text-[13px] text-cdv-blue hover:underline font-semibold"
              >
                <ExternalLink size={12} />
                Otwórz w kalendarzu
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
