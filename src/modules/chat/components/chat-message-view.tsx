"use client"

import { useState } from "react";
import ChatWelcometabs from "./chat-welcome-tabs";
import ChatMessageForm from "./chat-message-form";

interface ChatMessageViewProps {
    user: { id: string; image: string | null; name: string; createdAt: Date; updatedAt: Date; email: string; } | null
}

const ChatMessageView = ({ user }: ChatMessageViewProps) => {

    const [selectedMessage, setSelectedMessage] = useState("");

    const handleMessageSelect = (message:string) => {
        setSelectedMessage(message);
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-10">
            <ChatWelcometabs
                userName={user?.name}
                onMessageSelect={handleMessageSelect}
            />
            <ChatMessageForm
                key={selectedMessage}
                initialMessage={selectedMessage}
            />
        </div>
    )
}

export default ChatMessageView