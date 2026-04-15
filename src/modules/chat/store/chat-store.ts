import { create } from 'zustand';

interface ChatStoreState {
    activeChatId: string | null;
    setActiveChatId: (chatId: string | null) => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
    activeChatId: null,
    setActiveChatId: (chatId: string | null) => set({ activeChatId: chatId }),
}))