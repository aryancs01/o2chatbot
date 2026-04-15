import { Chat, Message } from '@/generated/prisma/client';
import { create } from 'zustand';

interface ChatStoreState {
    chats: Chat[];
    messages: Message[];
    activeChatId: string | null;
    triggeredChats: Set<string>;

    addChat: (chat: Chat) => void;
    setChats: (chats: Chat[]) => void;
    setMessages: (messages: Message[]) => void;
    setActiveChatId: (chatId: string | null) => void;
    markChatAsTriggered: (chatId: string) => void;
    hasChatBeenTriggered: (chatId: string) => boolean;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
    chats: [],
    messages: [],
    activeChatId: null,
    triggeredChats: new Set(),

    setChats: (chats) => set({ chats }),
    setMessages: (messages) => set({ messages }),
    setActiveChatId: (chatId: string | null) => set({ activeChatId: chatId }),

    addChat: (chat: Chat) => set({ chats: [chat, ...get().chats] }),
    addMessage: (message: Message) => set({ messages: [...get().messages, message] }),

    clearMessages: () => set({ messages: [] }),

    markChatAsTriggered: (chatId: string) => {
        const triggeredChats = new Set(get().triggeredChats);
        triggeredChats.add(chatId);
        set({ triggeredChats: triggeredChats });
    },

    hasChatBeenTriggered: (chatId: string) => get().triggeredChats.has(chatId),
}))
