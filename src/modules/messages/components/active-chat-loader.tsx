"use client"

import { useGetChatById } from "@/modules/chat/hooks/chat";
import { useChatStore } from "@/modules/chat/store/chat-store";
import { set } from "better-auth";
import { use, useEffect } from "react";

const ActiveChatLoader = ({ chatId }: { chatId: string }) => {
    const {setActiveChatId, setMessages, addChat, chats } = useChatStore();

    const { data } = useGetChatById(chatId)

    useEffect(() => {
        if(!chatId) return;

        setActiveChatId(chatId);
    }, [chatId, setActiveChatId])

    useEffect(() => {
        if(!data || !data.success || !data.data) return;

        const chat = data.data;

        setMessages(chat.messages || []);
        
        if (!chats.some(c => c.id === chat.id)) {
            addChat(chat);
        }
    }, [data, addChat, setMessages, chats])

    return null;
}

export default ActiveChatLoader;