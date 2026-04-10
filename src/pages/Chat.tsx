import React, { useState, useRef, useEffect } from 'react';
import {
  Hash, Lock, Plus, Send, Paperclip, Smile, X, Trash2,
  CornerDownLeft, Users, MessageSquare, Search,
  Image as ImageIcon, FileText,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { ChatMessage, ChatChannelType } from '../types';
import { ADMINS } from '../utils/helpers';

// ── Emoji picker (compact, no extra package) ─────────────────────
const QUICK_EMOJIS = ['👍','❤️','😂','😮','😢','🔥','✅','🎉','👀','🙏','⚡','🚀'];

// ── Helpers ──────────────────────────────────────────────────────
function formatMsgDate(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return `Wczoraj ${format(d, 'HH:mm')}`;
  return format(d, 'dd MMM, HH:mm', { locale: pl });
}

function formatGroupDate(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return 'Dziś';
  if (isYesterday(d)) return 'Wczoraj';
  return format(d, 'EEEE, dd MMMM', { locale: pl });
}

function fileSizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ── Channel type icon ─────────────────────────────────────────────
const ChanIcon = ({ type }: { type: ChatChannelType }) => {
  if (type === 'public') return <Hash size={13} className="text-white/40" />;
  if (type === 'group')  return <Users size={13} className="text-white/40" />;
  return <Lock size={13} className="text-white/40" />;
};

// ── New channel modal ─────────────────────────────────────────────
const NewChannelModal: React.FC<{
  onClose: () => void;
  onSubmit: (name: string, desc: string, type: 'public' | 'group', members: string[]) => void;
  currentUserEmail: string;
}> = ({ onClose, onSubmit, currentUserEmail }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'public' | 'group'>('public');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([currentUserEmail]);

  const addMember = () => {
    const e = memberInput.trim().toLowerCase();
    if (e && !members.includes(e)) { setMembers([...members, e]); setMemberInput(''); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#07112a] border border-white/15 rounded-2xl shadow-2xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-bold text-white">Nowy kanał</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={16}/></button>
        </div>
        <div className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Typ</label>
            <div className="flex gap-2">
              {(['public', 'group'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-all ${type === t ? 'bg-white/15 border-white/25 text-white' : 'border-white/10 text-white/40 hover:text-white/70'}`}>
                  {t === 'public' ? '# Publiczny' : '👥 Grupowy'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nazwa *</label>
            <input value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s/g, '-'))}
              placeholder="nazwa-kanalu"
              className="w-full px-3 py-2 text-[13px] bg-white/[0.07] border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Opis</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder="O czym jest ten kanał?"
              className="w-full px-3 py-2 text-[13px] bg-white/[0.07] border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-all" />
          </div>
          {type === 'group' && (
            <div>
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Członkowie (email)</label>
              <div className="flex gap-2 mb-2">
                <input value={memberInput} onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                  placeholder="email@cdv.pl"
                  className="flex-1 px-3 py-2 text-[13px] bg-white/[0.07] border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-all" />
                <button onClick={addMember} className="px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-white/60 hover:text-white transition-colors"><Plus size={14}/></button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {members.map((m) => (
                  <span key={m} className="flex items-center gap-1 px-2 py-0.5 bg-cdv-blue/20 border border-cdv-blue/30 rounded-lg text-[11px] text-blue-300">
                    {m}
                    {m !== currentUserEmail && (
                      <button onClick={() => setMembers(members.filter((x) => x !== m))} className="hover:text-red-400 transition-colors ml-0.5"><X size={10}/></button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 transition-all">Anuluj</button>
            <button onClick={() => name.trim() && onSubmit(name.trim(), desc.trim(), type, members)}
              disabled={!name.trim()}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-cdv-gold text-cdv-blue hover:brightness-110 disabled:opacity-50 transition-all">
              Utwórz kanał
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Chat page ────────────────────────────────────────────────
const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const { channels, activeChannelId, messages, setActiveChannel, sendMessage, recallMessage, addReaction, uploadFile, createChannel } = useChatStore();

  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [emojiFor, setEmojiFor] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userEmail = user?.email ?? '';
  const adminRecord = ADMINS.find((a) => a.email === userEmail);
  const displayName = user?.displayName ?? adminRecord?.name ?? userEmail.split('@')[0];
  const photoUrl = user?.photoURL ?? undefined;

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  // Auto-select first channel
  useEffect(() => {
    if (!activeChannelId && channels.length > 0) {
      setActiveChannel(channels[0].id);
    }
  }, [channels, activeChannelId, setActiveChannel]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter channels by search
  const visibleChannels = channels.filter((c) =>
    !search || c.name.includes(search.toLowerCase())
  );

  // Group messages by date
  const groupedMessages = useMemo_(() => {
    const groups: { date: string; msgs: ChatMessage[] }[] = [];
    for (const msg of messages) {
      const dateKey = msg.createdAt.slice(0, 10);
      const last = groups[groups.length - 1];
      if (last && last.date === dateKey) last.msgs.push(msg);
      else groups.push({ date: dateKey, msgs: [msg] });
    }
    return groups;
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeChannelId) return;
    setInput('');
    setReplyTo(null);
    await sendMessage(activeChannelId, userEmail, displayName, text, photoUrl, replyTo?.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!activeChannelId) return;
    setUploading(true);
    try {
      await uploadFile(activeChannelId, userEmail, displayName, file, photoUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    if (!activeChannelId) return;
    await addReaction(activeChannelId, msgId, emoji, userEmail);
    setEmojiFor(null);
  };

  const handleCreateChannel = async (name: string, desc: string, type: 'public' | 'group', members: string[]) => {
    const id = await createChannel(name, desc, type, members, userEmail);
    setActiveChannel(id);
    setShowNewChannel(false);
  };

  // Compute initials for avatar
  const getInitials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const getAvatarColor = (email: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
    return colors[email.charCodeAt(0) % colors.length];
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden animate-fade-in">
      {/* ── Sidebar ──────────────────────────────── */}
      <div className="w-64 flex-shrink-0 border-r border-white/10 flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-white/[0.07]">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj kanałów..."
              className="w-full pl-7 pr-3 py-1.5 text-[12px] bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {/* Channels list */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Public channels */}
          <div className="px-3 mb-1">
            <div className="flex items-center justify-between py-1">
              <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.1em]">Kanały</span>
              <button
                onClick={() => setShowNewChannel(true)}
                className="text-white/25 hover:text-white/60 transition-colors"
                title="Nowy kanał"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
          <div className="space-y-0.5 px-2">
            {visibleChannels.filter((c) => c.type !== 'dm').map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] transition-all text-left ${
                  activeChannelId === ch.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/45 hover:text-white/75 hover:bg-white/[0.06]'
                }`}
              >
                <ChanIcon type={ch.type} />
                <span className="flex-1 truncate font-medium">{ch.name}</span>
                {ch.lastMessagePreview && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cdv-gold flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* DMs */}
          {visibleChannels.filter((c) => c.type === 'dm').length > 0 && (
            <>
              <div className="px-3 mt-4 mb-1">
                <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.1em]">Wiadomości prywatne</span>
              </div>
              <div className="space-y-0.5 px-2">
                {visibleChannels.filter((c) => c.type === 'dm').map((ch) => {
                  const otherMember = ch.members.find((m) => m !== userEmail) ?? ch.name;
                  return (
                    <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] transition-all text-left ${
                        activeChannelId === ch.id ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white/75 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${getAvatarColor(otherMember)} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
                        {getInitials(otherMember.split('@')[0])}
                      </div>
                      <span className="flex-1 truncate font-medium">{otherMember.split('@')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            {photoUrl
              ? <img src={photoUrl} className="w-7 h-7 rounded-full border border-white/15" alt={displayName} />
              : <div className={`w-7 h-7 rounded-full ${getAvatarColor(userEmail)} flex items-center justify-center text-[10px] font-bold text-white`}>{getInitials(displayName)}</div>
            }
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white/80 truncate">{displayName}</p>
              <p className="text-[10px] text-white/30 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main area ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeChannel ? (
          <div className="flex-1 flex items-center justify-center text-white/25">
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-[14px] font-medium">Wybierz kanał z listy</p>
            </div>
          </div>
        ) : (
          <>
            {/* Channel header */}
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
              <ChanIcon type={activeChannel.type} />
              <div>
                <h3 className="text-[14px] font-bold text-white">{activeChannel.name}</h3>
                {activeChannel.description && (
                  <p className="text-[11px] text-white/35">{activeChannel.description}</p>
                )}
              </div>
              <div className="ml-auto text-[11px] text-white/25">
                {messages.filter((m) => !m.deletedAt).length} wiadomości
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/20 text-[13px]">
                  <div className="text-center">
                    <Hash size={32} className="mx-auto mb-2 opacity-20" />
                    <p>Brak wiadomości — napisz pierwszą!</p>
                  </div>
                </div>
              ) : (
                groupedMessages.map(({ date, msgs }) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-white/[0.07]" />
                      <span className="text-[11px] text-white/25 font-medium px-2 py-0.5 bg-white/[0.04] rounded-full">
                        {formatGroupDate(date + 'T12:00:00')}
                      </span>
                      <div className="flex-1 h-px bg-white/[0.07]" />
                    </div>

                    {msgs.map((msg, i) => {
                      const isOwn = msg.authorId === userEmail;
                      const isDeleted = !!msg.deletedAt;
                      const showAvatar = i === 0 || msgs[i - 1]?.authorId !== msg.authorId;
                      const replyMsg = msg.replyToId ? messages.find((m) => m.id === msg.replyToId) : null;

                      return (
                        <div
                          key={msg.id}
                          className={`group relative flex gap-3 px-2 py-1 rounded-xl hover:bg-white/[0.04] transition-colors ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
                        >
                          {/* Avatar */}
                          <div className="w-8 flex-shrink-0 flex items-start justify-center">
                            {showAvatar ? (
                              msg.authorPhotoUrl
                                ? <img src={msg.authorPhotoUrl} className="w-8 h-8 rounded-full border border-white/15 mt-0.5" alt={msg.authorName} />
                                : <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.authorId)} flex items-center justify-center text-[10px] font-bold text-white mt-0.5`}>{getInitials(msg.authorName)}</div>
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            {showAvatar && (
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className={`text-[13px] font-bold ${isOwn ? 'text-cdv-gold' : 'text-white/80'}`}>{msg.authorName}</span>
                                <span className="text-[10px] text-white/25 font-mono">{formatMsgDate(msg.createdAt)}</span>
                                {msg.editedAt && <span className="text-[10px] text-white/20 italic">edytowana</span>}
                              </div>
                            )}

                            {/* Reply preview */}
                            {replyMsg && (
                              <div className="flex items-center gap-2 mb-1 pl-2 border-l-2 border-white/15">
                                <span className="text-[11px] text-white/35 truncate">
                                  <span className="font-semibold">{replyMsg.authorName}:</span> {replyMsg.content.slice(0, 60)}
                                </span>
                              </div>
                            )}

                            {/* Content */}
                            {isDeleted ? (
                              <p className="text-[13px] text-white/20 italic">— Wiadomość wycofana —</p>
                            ) : (
                              <>
                                <p className="text-[13px] text-white/75 leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

                                {/* Attachments */}
                                {msg.attachments?.map((att) => (
                                  <a
                                    key={att.id}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-1.5 px-3 py-2 bg-white/[0.07] border border-white/10 rounded-xl hover:bg-white/[0.12] transition-colors"
                                  >
                                    {att.type.startsWith('image/') ? <ImageIcon size={13} className="text-blue-300" /> : <FileText size={13} className="text-white/50" />}
                                    <span className="text-[12px] text-white/70 font-medium">{att.name}</span>
                                    <span className="text-[10px] text-white/30">{fileSizeLabel(att.size)}</span>
                                  </a>
                                ))}
                              </>
                            )}

                            {/* Reactions display */}
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {Object.entries(msg.reactions).map(([emoji, users]) =>
                                  (users as string[]).length > 0 ? (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReaction(msg.id, emoji)}
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[12px] border transition-all ${
                                        (users as string[]).includes(userEmail)
                                          ? 'bg-cdv-gold/20 border-cdv-gold/30 text-cdv-gold'
                                          : 'bg-white/[0.07] border-white/10 text-white/60 hover:bg-white/[0.12]'
                                      }`}
                                    >
                                      {emoji} <span className="text-[10px]">{(users as string[]).length}</span>
                                    </button>
                                  ) : null
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action buttons (on hover) */}
                          {!isDeleted && (
                            <div className="absolute right-2 top-1 hidden group-hover:flex items-center gap-1 bg-[#07112a] border border-white/15 rounded-xl px-1.5 py-1 shadow-xl">
                              {/* Emoji picker trigger */}
                              <button
                                onClick={() => setEmojiFor(emojiFor === msg.id ? null : msg.id)}
                                className="p-1 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/10 transition-colors"
                                title="Dodaj reakcję"
                              >
                                <Smile size={13} />
                              </button>
                              {/* Reply */}
                              <button
                                onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }}
                                className="p-1 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/10 transition-colors"
                                title="Odpowiedz"
                              >
                                <CornerDownLeft size={13} />
                              </button>
                              {/* Recall (own messages only) */}
                              {isOwn && (
                                <button
                                  onClick={() => recallMessage(activeChannel.id, msg.id)}
                                  className="p-1 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Wycofaj wiadomość"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Emoji picker popup */}
                          {emojiFor === msg.id && (
                            <div className="absolute right-2 top-10 z-20 bg-[#07112a] border border-white/15 rounded-2xl p-2.5 shadow-2xl flex flex-wrap gap-1.5 w-44">
                              {QUICK_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply banner */}
            {replyTo && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border-t border-white/[0.07] text-[12px] text-white/50">
                <CornerDownLeft size={12} />
                <span className="flex-1 truncate">
                  Odpowiadasz <span className="font-semibold text-white/70">{replyTo.authorName}</span>: {replyTo.content.slice(0, 60)}
                </span>
                <button onClick={() => setReplyTo(null)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Input area */}
            <div className="px-4 py-3 border-t border-white/10">
              <div className="flex items-end gap-2 bg-white/[0.06] border border-white/15 rounded-2xl px-3 py-2.5">
                {/* File upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 pb-0.5"
                  title="Załącz plik"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
                  ) : (
                    <Paperclip size={16} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />

                {/* Text input */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Wiadomość #${activeChannel.name}...`}
                  rows={1}
                  style={{ resize: 'none', minHeight: '24px', maxHeight: '120px' }}
                  className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/25 focus:outline-none leading-relaxed"
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                  }}
                />

                {/* Send */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex-shrink-0 p-1.5 rounded-xl bg-cdv-gold disabled:opacity-30 text-cdv-blue hover:brightness-110 transition-all"
                  title="Wyślij (Enter)"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-1.5 text-right">Enter = wyślij · Shift+Enter = nowa linia</p>
            </div>
          </>
        )}
      </div>

      {/* New channel modal */}
      {showNewChannel && (
        <NewChannelModal
          onClose={() => setShowNewChannel(false)}
          onSubmit={handleCreateChannel}
          currentUserEmail={userEmail}
        />
      )}
    </div>
  );
};

// Simple useMemo_ polyfill to avoid hook rules issue inside loop
function useMemo_<T>(fn: () => T, deps: any[]): T {
  return React.useMemo(fn, deps);
}

export default Chat;
