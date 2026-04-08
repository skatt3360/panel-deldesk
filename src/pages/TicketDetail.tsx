import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  User,
  Tag,
  Clock,
  Calendar,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { TicketStatus } from '../types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  statusLabel,
  statusColor,
  priorityLabel,
  priorityColor,
  categoryLabel,
  formatDate,
  formatRelative,
  TECHNICIANS,
  ALL_STATUSES,
} from '../utils/helpers';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tickets = useTicketStore((s) => s.tickets);
  const updateTicketStatus = useTicketStore((s) => s.updateTicketStatus);
  const assignTicket = useTicketStore((s) => s.assignTicket);
  const addComment = useTicketStore((s) => s.addComment);

  const ticket = tickets.find((t) => t.id === id);

  const [comment, setComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Marek Wiśniewski');
  const [commentRole, setCommentRole] = useState<'technician' | 'requester'>('technician');
  const [submittingComment, setSubmittingComment] = useState(false);

  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto pt-16 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Zgłoszenie nie zostało znalezione</h2>
        <p className="text-gray-500 mb-6">Zgłoszenie o ID <code>{id}</code> nie istnieje.</p>
        <Button onClick={() => navigate('/tickets')}>
          <ArrowLeft size={16} /> Powrót do listy
        </Button>
      </div>
    );
  }

  const handleStatusChange = (status: TicketStatus) => {
    updateTicketStatus(ticket.id, status);
  };

  const handleAssign = (assignee: string) => {
    assignTicket(ticket.id, assignee);
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
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/tickets')}
            className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-lg font-bold text-cdv-blue">{ticket.id}</span>
              <Badge className={statusColor[ticket.status]}>{statusLabel[ticket.status]}</Badge>
              <Badge className={priorityColor[ticket.priority]}>
                {priorityLabel[ticket.priority]}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{ticket.title}</h1>
          </div>
        </div>
        {isResolved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium flex-shrink-0">
            <CheckCircle2 size={18} />
            Zamknięte
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Opis zgłoszenia
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </Card>

          {/* Comments / Activity */}
          <Card padding={false}>
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900">
                Komentarze i aktywność
              </h2>
              <span className="ml-auto text-xs text-gray-400">
                {ticket.comments.length} wpisów
              </span>
            </div>

            {/* Timeline */}
            <div className="px-6 py-4 space-y-4">
              {ticket.comments.map((c, idx) => (
                <div key={c.id} className="flex gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold
                    ${
                      c.authorRole === 'system'
                        ? 'bg-gray-100 text-gray-400'
                        : c.authorRole === 'technician'
                        ? 'bg-cdv-blue text-white'
                        : 'bg-cdv-gold text-cdv-blue'
                    }`}
                  >
                    {c.authorRole === 'system' ? '⚙' : c.author.charAt(0)}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className={`text-sm font-medium ${
                          c.authorRole === 'system' ? 'text-gray-400' : 'text-gray-800'
                        }`}
                      >
                        {c.authorRole === 'system' ? 'System' : c.author}
                      </span>
                      {c.authorRole !== 'system' && (
                        <span className="text-xs text-gray-400">
                          {c.authorRole === 'technician' ? '(Technik)' : '(Zgłaszający)'}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatRelative(c.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-0.5 leading-relaxed ${
                        c.authorRole === 'system'
                          ? 'text-gray-400 italic'
                          : 'text-gray-700'
                      }`}
                    >
                      {c.content}
                    </p>
                    {idx < ticket.comments.length - 1 && (
                      <div className="mt-3 border-b border-gray-50" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            {!isResolved && (
              <div className="px-6 pb-5">
                <div className="border-t border-gray-100 pt-4">
                  <form onSubmit={handleAddComment}>
                    <div className="flex gap-2 mb-3">
                      <select
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cdv-blue/30"
                      >
                        {TECHNICIANS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <select
                        value={commentRole}
                        onChange={(e) =>
                          setCommentRole(e.target.value as 'technician' | 'requester')
                        }
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cdv-blue/30"
                      >
                        <option value="technician">Technik</option>
                        <option value="requester">Zgłaszający</option>
                      </select>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Dodaj komentarz lub aktualizację..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cdv-blue/30 resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        type="submit"
                        size="sm"
                        loading={submittingComment}
                        disabled={!comment.trim()}
                      >
                        <Send size={14} />
                        Dodaj komentarz
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Status change */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Zmień status
            </h3>
            <div className="space-y-1.5">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    ticket.status === s
                      ? 'bg-cdv-blue text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {ticket.status === s && <CheckCircle2 size={14} />}
                    {statusLabel[s]}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Assign */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Przypisz technika
            </h3>
            <div className="space-y-1.5">
              {TECHNICIANS.map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleAssign(tech)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    ticket.assignee === tech
                      ? 'bg-cdv-blue/10 text-cdv-blue font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {tech.charAt(0)}
                  </div>
                  <span className="truncate">{tech}</span>
                  {ticket.assignee === tech && (
                    <UserCheck size={14} className="ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Details */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Szczegóły
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Tag size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-gray-400 text-xs">Kategoria</dt>
                  <dd className="font-medium text-gray-700">{categoryLabel[ticket.category]}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-gray-400 text-xs">Zgłaszający</dt>
                  <dd className="font-medium text-gray-700">{ticket.requesterName}</dd>
                  <dd className="text-gray-400 text-xs">{ticket.requesterEmail}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-gray-400 text-xs">Utworzono</dt>
                  <dd className="font-medium text-gray-700">{formatDate(ticket.createdAt)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-gray-400 text-xs">Ostatnia aktualizacja</dt>
                  <dd className="font-medium text-gray-700">{formatRelative(ticket.updatedAt)}</dd>
                </div>
              </div>
              {ticket.dueDate && (
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <dt className="text-gray-400 text-xs">Termin SLA</dt>
                    <dd
                      className={`font-medium ${
                        new Date(ticket.dueDate) < new Date()
                          ? 'text-red-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {formatDate(ticket.dueDate)}
                    </dd>
                    {new Date(ticket.dueDate) < new Date() && (
                      <dd className="text-xs text-red-500 flex items-center gap-0.5">
                        <AlertTriangle size={11} /> SLA przekroczony
                      </dd>
                    )}
                  </div>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
