import { create } from 'zustand';
import {
  ref, onValue, set, update, push, off,
} from 'firebase/database';
import {
  ref as storageRef, uploadBytes, getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { ChatChannel, ChatMessage, ChatAttachment } from '../types';

// ── Default channels seeded on first run ───────────────────────────────────
const DEFAULT_CHANNELS: Record<string, ChatChannel> = {
  'ch-general': {
    id: 'ch-general', name: 'ogólny', description: 'Kanał ogólny dla całego zespołu IT',
    type: 'public', members: [], createdBy: 'system', createdAt: new Date().toISOString(),
  },
  'ch-it': {
    id: 'ch-it', name: 'helpdesk', description: 'Sprawy helpdesk i tickety',
    type: 'public', members: [], createdBy: 'system', createdAt: new Date().toISOString(),
  },
  'ch-events': {
    id: 'ch-events', name: 'eventy', description: 'Koordynacja wydarzeń CDV',
    type: 'public', members: [], createdBy: 'system', createdAt: new Date().toISOString(),
  },
};

interface ChatState {
  channels: ChatChannel[];
  activeChannelId: string | null;
  messages: ChatMessage[];
  initialized: boolean;

  setActiveChannel: (id: string) => void;
  sendMessage: (channelId: string, authorId: string, authorName: string, content: string, authorPhotoUrl?: string, replyToId?: string) => Promise<void>;
  recallMessage: (channelId: string, messageId: string) => Promise<void>;
  addReaction: (channelId: string, messageId: string, emoji: string, userEmail: string) => Promise<void>;
  uploadFile: (channelId: string, authorId: string, authorName: string, file: File, authorPhotoUrl?: string) => Promise<void>;
  createChannel: (name: string, description: string, type: 'public' | 'group', members: string[], createdBy: string) => Promise<string>;
  updateChannelLastMessage: (channelId: string, preview: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()((setState, getState) => {
  // Subscribe to channels
  onValue(ref(db, 'chat/channels'), (snap) => {
    const data = snap.val();
    if (data) {
      const channels = Object.values(data) as ChatChannel[];
      channels.sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt));
      setState({ channels, initialized: true });
    } else {
      set(ref(db, 'chat/channels'), DEFAULT_CHANNELS);
    }
  });

  let unsubMessages: (() => void) | null = null;

  return {
    channels: [],
    activeChannelId: null,
    messages: [],
    initialized: false,

    setActiveChannel: (id: string) => {
      setState({ activeChannelId: id, messages: [] });
      // Unsubscribe from previous channel
      if (unsubMessages) { unsubMessages(); unsubMessages = null; }

      const msgRef = ref(db, `chat/messages/${id}`);
      const handler = onValue(msgRef, (snap) => {
        const data = snap.val();
        if (data) {
          const msgs = (Object.values(data) as ChatMessage[])
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          setState({ messages: msgs });
        } else {
          setState({ messages: [] });
        }
      });
      unsubMessages = () => off(msgRef, 'value', handler);
    },

    sendMessage: async (channelId, authorId, authorName, content, authorPhotoUrl, replyToId) => {
      const msgRef = push(ref(db, `chat/messages/${channelId}`));
      const id = msgRef.key!;
      const ts = new Date().toISOString();
      const msg: ChatMessage = {
        id, channelId, authorId, authorName, content, createdAt: ts,
        ...(authorPhotoUrl ? { authorPhotoUrl } : {}),
        ...(replyToId ? { replyToId } : {}),
      };
      await set(msgRef, msg);
      await getState().updateChannelLastMessage(channelId, content.slice(0, 60));
    },

    recallMessage: async (channelId, messageId) => {
      await update(ref(db, `chat/messages/${channelId}/${messageId}`), {
        deletedAt: new Date().toISOString(),
        content: '',
      });
    },

    addReaction: async (channelId, messageId, emoji, userEmail) => {
      const reactRef = ref(db, `chat/messages/${channelId}/${messageId}/reactions/${emoji}`);
      onValue(reactRef, async (snap) => {
        const current: string[] = snap.val() ?? [];
        const idx = current.indexOf(userEmail);
        const updated = idx >= 0
          ? current.filter((e) => e !== userEmail)  // toggle off
          : [...current, userEmail];                  // add
        await set(reactRef, updated.length > 0 ? updated : null);
      }, { onlyOnce: true });
    },

    uploadFile: async (channelId, authorId, authorName, file, authorPhotoUrl) => {
      const path = `chat/${channelId}/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);

      const attachment: ChatAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        url,
        type: file.type,
        size: file.size,
      };

      const msgRef = push(ref(db, `chat/messages/${channelId}`));
      const id = msgRef.key!;
      const ts = new Date().toISOString();
      const msg: ChatMessage = {
        id, channelId, authorId, authorName,
        content: `📎 ${file.name}`,
        createdAt: ts,
        attachments: [attachment],
        ...(authorPhotoUrl ? { authorPhotoUrl } : {}),
      };
      await set(msgRef, msg);
      await getState().updateChannelLastMessage(channelId, `📎 ${file.name}`);
    },

    createChannel: async (name, description, type, members, createdBy) => {
      const channelRef = push(ref(db, 'chat/channels'));
      const id = channelRef.key!;
      const channel: ChatChannel = {
        id, name, description, type, members, createdBy,
        createdAt: new Date().toISOString(),
      };
      await set(channelRef, channel);
      return id;
    },

    updateChannelLastMessage: async (channelId, preview) => {
      await update(ref(db, `chat/channels/${channelId}`), {
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: preview,
      });
    },
  };
});
