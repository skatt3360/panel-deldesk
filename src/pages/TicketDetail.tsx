import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, User, Tag, Clock, Calendar,
  UserCheck, AlertTriangle, CheckCircle2, MessageSquare, MapPin, Trash2,
  ListChecks, Plus, X as XIcon, CalendarCheck2,
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { useAuthStore } from '../store/authStore';
import { TicketStatus } from '../types';
import {
  statusLabel, priorityLabel,
  categoryLabel, formatDate, formatRelative, TECHNICIANS, ALL_STATUSES,
} from '../utils/helpers';
import { isAdmin } from '../utils/roles';
import { TIER_SHORT } from '../utils/autoCategory';

// ─── Design tokens ────────────────────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
};
const inp: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#fff',
  fontSize: 13,
  width: '100%',
  outline: 'none',
};
const lbl: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
};

const STATUS_CFG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  open:        { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.25)',  dot: '#60a5fa' },
  'in-progress':{ bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)', dot: '#fbbf24' },
  pending:     { bg: 'rgba(168,85,247,0.1)',  text: '#c084fc', border: 'rgba(168,85,247,0.25)',  dot: '#c084fc' },
  resolved:    { bg: 'rgba(34,197,94,0.1)',   text: '#4ade80', border: 'rgba(34,197,94,0.25)',   dot: '#4ade80' },
  closed:      { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.25)', dot: '#9ca3af' },
};
const PRIORITY_CFG: Record<string, { bg: string; text: string; border: string }> = {
  low:      { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.2)' },
  medium:   { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.2)'  },
  high:     { bg: 'rgba(249,115,22,0.1)',  text: '#fb923c', border: 'rgba(249,115,22,0.2)'  },
  critical: { bg: 'rgba(239,68,68,0.1)',   text: '#f87171', border: 'rgba(239,68,68,0.2)'   },
};

const Chip: React.FC<{ cfg: { bg: string; text: string; border: string }; dot?: string; children: React.ReactNode }> = ({ cfg, dot, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
  }}>
    {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
    {children}
  </span>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
    {children}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
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
  const [comment, setComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState(TECHNICIANS[0] ?? 'Administrator');
  const [commentRole, setCommentRole] = useState<'technician' | 'requester'>('technician');
  const [submittingComment, setSubmittingComment] = useState(false);
  const canAdmin = isAdmin(user?.email);

  const ticket = tickets.find((t) => t.id === id);
  const initialized = useTicketStore((s) => s.initialized);
  const [waitedLong, setWaitedLong] = useState(false);

  useEffect(() => {
    if (ticket) return;
    const t = setTimeout(() => setWaitedLong(true), 3000);
    return () => clearTimeout(t);
  }, [ticket]);

  if (!ticket) {
    if (!initialized || !waitedLong) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(255,105,0,0.3)', borderTopColor: '#FF6900', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Ładowanie zgłoszenia…</p>
        </div>
      );
    }
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertTriangle size={24} style={{ color: '#fbbf24' }} />
        </div>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Zgłoszenie nie znalezione</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>ID <code style={{ fontFamily: 'monospace', color: '#FF6900' }}>{id}</code> nie istnieje.</p>
        <button onClick={() => navigate('/tickets')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#FF6900', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Powrót do listy
        </button>
      </div>
    );
  }

  const handleStatusChange = (status: TicketStatus) => updateTicketStatus(ticket.id, status);
  const handleAssign = (assignee: string) => assignTicket(ticket.id, assignee);
  const handleDelete = async () => { await deleteTicket(ticket.id); navigate('/tickets'); };
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    setTimeout(() => { addComment(ticket.id, commentAuthor, commentRole, comment.trim()); setComment(''); setSubmittingComment(false); }, 300);
  };

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
  const sc = STATUS_CFG[ticket.status] ?? STATUS_CFG.open;
  const pc = PRIORITY_CFG[ticket.priority] ?? PRIORITY_CFG.medium;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <button
            onClick={() => navigate('/tickets')}
            style={{ marginTop: 3, padding: 7, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#FF6900' }}>{ticket.id}</span>
              <Chip cfg={sc} dot={sc.dot}>{statusLabel[ticket.status]}</Chip>
              <Chip cfg={pc}>{priorityLabel[ticket.priority]}</Chip>
              {ticket.supportTier && (
                <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {TIER_SHORT[ticket.supportTier]}
                </span>
              )}
              {ticket.linkedCalendarEventId && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <CalendarCheck2 size={10} /> W kalendarzu
                </span>
              )}
            </div>
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{ticket.title}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {isResolved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontSize: 12, fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Zamknięte
            </div>
          )}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              <Trash2 size={13} /> Usuń
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>Na pewno?</span>
              <button onClick={handleDelete} style={{ padding: '3px 10px', borderRadius: 7, border: 'none', background: '#ef4444', color: '#fff', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>Tak, usuń</button>
              <button onClick={() => setConfirmDelete(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 11.5, cursor: 'pointer' }}>Anuluj</button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Description */}
          <div style={{ ...glass, padding: '22px 24px' }}>
            <SectionTitle>Opis zgłoszenia</SectionTitle>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{ticket.description}</p>
          </div>

          {/* Comments */}
          <div style={{ ...glass, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <MessageSquare size={15} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Komentarze i aktywność</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2px 9px' }}>
                {ticket.comments.length}
              </span>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ticket.comments.map((c, idx) => (
                <div key={c.id}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      ...(c.authorRole === 'system'
                        ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                        : c.authorRole === 'technician'
                          ? { background: 'rgba(255,105,0,0.15)', border: '1px solid rgba(255,105,0,0.25)', color: '#FF6900' }
                          : { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }),
                    }}>
                      {c.authorRole === 'system' ? '⚙' : c.author.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: c.authorRole === 'system' ? 'rgba(255,255,255,0.35)' : '#fff' }}>
                          {c.authorRole === 'system' ? 'System' : c.author}
                        </span>
                        {c.authorRole !== 'system' && (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                            {c.authorRole === 'technician' ? '(Technik)' : '(Zgłaszający)'}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>{formatRelative(c.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 13, color: c.authorRole === 'system' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.65)', fontStyle: c.authorRole === 'system' ? 'italic' : 'normal', margin: 0, lineHeight: 1.6 }}>
                        {c.content}
                      </p>
                    </div>
                  </div>
                  {idx < ticket.comments.length - 1 && (
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: 16 }} />
                  )}
                </div>
              ))}
            </div>

            {!isResolved && (
              <div style={{ padding: '0 24px 22px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <form onSubmit={handleAddComment} style={{ paddingTop: 18 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <select value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} style={{ ...inp, width: 'auto', flex: 1 }}>
                      {TECHNICIANS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={commentRole} onChange={(e) => setCommentRole(e.target.value as 'technician' | 'requester')} style={{ ...inp, width: 'auto', flex: 1 }}>
                      <option value="technician">Technik</option>
                      <option value="requester">Zgłaszający</option>
                    </select>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Dodaj komentarz lub aktualizację…"
                    rows={3}
                    style={{ ...inp, resize: 'vertical', minHeight: 80 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button
                      type="submit"
                      disabled={!comment.trim() || submittingComment}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '8px 18px', borderRadius: 9, border: 'none',
                        background: comment.trim() ? '#FF6900' : 'rgba(255,255,255,0.08)',
                        color: comment.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
                        fontSize: 13, fontWeight: 700, cursor: comment.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Send size={13} /> {submittingComment ? 'Dodawanie…' : 'Dodaj komentarz'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Status */}
          <div style={{ ...glass, padding: '18px 20px' }}>
            <SectionTitle>Zmień status</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ALL_STATUSES.map((s) => {
                const cfg = STATUS_CFG[s] ?? STATUS_CFG.open;
                const active = ticket.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 9,
                      border: active ? `1px solid ${cfg.border}` : '1px solid transparent',
                      background: active ? cfg.bg : 'transparent',
                      color: active ? cfg.text : 'rgba(255,255,255,0.45)',
                      fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {active
                      ? <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
                      : <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                    }
                    {statusLabel[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assign */}
          <div style={{ ...glass, padding: '18px 20px' }}>
            <SectionTitle>Przypisz technika</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {TECHNICIANS.map((tech) => {
                const active = ticket.assignee === tech;
                return (
                  <button
                    key={tech}
                    onClick={() => handleAssign(tech)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 9,
                      border: active ? '1px solid rgba(255,105,0,0.3)' : '1px solid transparent',
                      background: active ? 'rgba(255,105,0,0.08)' : 'transparent',
                      color: active ? '#FF6900' : 'rgba(255,255,255,0.5)',
                      fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 9, transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, background: active ? 'rgba(255,105,0,0.2)' : 'rgba(255,255,255,0.07)', color: active ? '#FF6900' : 'rgba(255,255,255,0.4)' }}>
                      {tech.charAt(0)}
                    </div>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tech}</span>
                    {active && <UserCheck size={13} style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div style={{ ...glass, padding: '18px 20px' }}>
            <SectionTitle>Szczegóły</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: <Tag size={12} />, label: 'Kategoria', value: categoryLabel[ticket.category] },
                { icon: <User size={12} />, label: 'Zgłaszający', value: ticket.requesterName, sub: ticket.requesterEmail },
                ...(ticket.room ? [{ icon: <MapPin size={12} />, label: 'Sala / Lokalizacja', value: ticket.room }] : []),
                { icon: <Clock size={12} />, label: 'Utworzono', value: formatDate(ticket.createdAt) },
                { icon: <Clock size={12} />, label: 'Ostatnia aktualizacja', value: formatRelative(ticket.updatedAt) },
              ].map(({ icon, label, value, sub }: any) => (
                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)', marginTop: 3, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={lbl}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 2 }}>{value}</div>
                    {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{sub}</div>}
                  </div>
                </div>
              ))}
              {ticket.dueDate && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Calendar size={12} style={{ color: 'rgba(255,255,255,0.25)', marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={lbl}>Termin SLA</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: new Date(ticket.dueDate) < new Date() ? '#f87171' : '#fff', marginTop: 2 }}>
                      {formatDate(ticket.dueDate)}
                    </div>
                    {new Date(ticket.dueDate) < new Date() && (
                      <div style={{ fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <AlertTriangle size={10} /> SLA przekroczony
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Checklist */}
          {canAdmin && (
            <div style={{ ...glass, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <ListChecks size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span style={{ ...lbl, marginBottom: 0, flex: 1 }}>Checklist wewnętrzny</span>
                {(ticket.checklist ?? []).length > 0 && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>
                    {(ticket.checklist ?? []).filter((i) => i.done).length}/{(ticket.checklist ?? []).length}
                  </span>
                )}
              </div>

              {(ticket.checklist ?? []).length > 0 && (
                <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, marginBottom: 12, overflow: 'hidden' }}>
                  <div
                    style={{ height: '100%', background: '#4ade80', borderRadius: 99, transition: 'width 0.4s', width: `${((ticket.checklist ?? []).filter((i) => i.done).length / (ticket.checklist ?? []).length) * 100}%` }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {(ticket.checklist ?? []).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => toggleChecklistItem(ticket.id, item.id, !item.done)}
                      style={{ width: 16, height: 16, borderRadius: 4, border: item.done ? 'none' : '1.5px solid rgba(255,255,255,0.2)', background: item.done ? '#4ade80' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      {item.done && <CheckCircle2 size={10} style={{ color: '#fff' }} />}
                    </button>
                    <span style={{ flex: 1, fontSize: 12.5, color: item.done ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.65)', textDecoration: item.done ? 'line-through' : 'none' }}>
                      {item.text}
                    </span>
                    <button onClick={() => deleteChecklistItem(ticket.id, item.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
                      <XIcon size={11} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 7 }}>
                <input
                  type="text"
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && checklistInput.trim()) { addChecklistItem(ticket.id, checklistInput.trim()); setChecklistInput(''); } }}
                  placeholder="Dodaj pozycję..."
                  style={{ ...inp, flex: 1, padding: '7px 10px', fontSize: 12 }}
                />
                <button
                  onClick={() => { if (checklistInput.trim()) { addChecklistItem(ticket.id, checklistInput.trim()); setChecklistInput(''); } }}
                  style={{ padding: '7px 10px', borderRadius: 8, border: 'none', background: '#FF6900', color: '#fff', cursor: 'pointer' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Linked calendar */}
          {ticket.linkedCalendarEventId && (
            <div style={{ ...glass, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <CalendarCheck2 size={13} style={{ color: '#4ade80' }} />
                <span style={lbl}>Powiązany event</span>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                style={{ fontSize: 13, fontWeight: 600, color: '#FF6900', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Otwórz w kalendarzu →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
