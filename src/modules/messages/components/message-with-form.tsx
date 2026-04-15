"use client"
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Spinner } from "@/components/ui/spinner";
import { useAIModels } from "@/modules/ai-agent/hook/ai-agent";
import { useGetChatById } from "@/modules/chat/hooks/chat";
import { useChatStore } from "@/modules/chat/store/chat-store";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputButton, PromptInputFooter, PromptInputProvider, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input";
import { ModelSelector as ChatModelSelector } from "@/modules/chat/components/model-selector";
import { RotateCcwIcon, StopCircleIcon } from "lucide-react";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type MessageRoleUI = "user" | "assistant" | "system";

interface UIMessagePart {
    type: "text" | "reasoning";
    text: string;
}

interface UIMessageItem {
    id: string;
    role: MessageRoleUI;
    parts: UIMessagePart[];
    createdAt: Date;
}

const toMessageRole = (role: string): MessageRoleUI => {
    if (role === "USER") return "user";
    if (role === "ASSISTANT") return "assistant";
    return "system";
}

const MessageWithForm = ({ chatId }: { chatId: string }) => {
    const { data: models, isPending: isModelsLoading } = useAIModels();
    const { data, isPending } = useGetChatById(chatId);
    const { hasChatBeenTriggered, markChatAsTriggered } = useChatStore()

    const [selectedModel, setSelectedModel] = useState<string | undefined>(data?.data?.model)
    const [input, setInput] = useState("");
    const activeModel = selectedModel ?? data?.data?.model;

    const hasAutoTrigger = useRef(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const shouldAutoTrigger = searchParams.get("autoTrigger") === "true"

    const initialMessages = useMemo<UIMessageItem[]>(() => {
        if (!data?.data?.messages) return []
        return data.data.messages
            .filter((msg) => msg.content && msg.content.trim() !== "" && msg.id)
            .map((msg) => {
                try {
                    const parts = JSON.parse(msg.content) as Array<{ type?: string; text?: string }>;

                    return {
                        id: msg.id,
                        role: toMessageRole(msg.messageRole),
                        parts: Array.isArray(parts)
                            ? parts
                                .filter((part): part is UIMessagePart => part.type === "text" && typeof part.text === "string")
                            : [{ type: "text", text: msg.content }],
                        createdAt: msg.createdAt
                    }
                } catch {
                    return {
                        id: msg.id,
                        role: toMessageRole(msg.messageRole),
                        parts: [{ type: "text", text: msg.content }],
                        createdAt: msg.createdAt
                    }
                }
            })
    }, [data])

    const { stop, messages, status, sendMessage, regenerate } = useChat({
        messages: [],
        transport: new DefaultChatTransport({ api: "/api/chat" }),
        onError: (error) => {
            const lowerMessage = error.message.toLowerCase();
            const isRateLimited =
                lowerMessage.includes("rate-limit") ||
                lowerMessage.includes("rate limited") ||
                lowerMessage.includes("429") ||
                lowerMessage.includes("temporarily rate-limited");

            if (isRateLimited) {
                toast.error("This model is temporarily rate-limited. Please try again or choose another model.");
                return;
            }

            toast.error(error.message || "Something went wrong while generating the response.");
        },
    })

    useEffect(() => {
        if (hasAutoTrigger.current) return;
        if (!shouldAutoTrigger) return;
        if(hasChatBeenTriggered(chatId)) return;
        if(!activeModel) return;
        if(initialMessages.length === 0) return;

        const lastMessage = initialMessages[initialMessages.length - 1]

        if(lastMessage?.role !== "user") return;

        hasAutoTrigger.current = true;
        markChatAsTriggered(chatId);

        sendMessage(
            undefined,
            {
                body: {
                    model: activeModel,
                    chatId,
                    skipUserMessages: true,
                }
            }
        )

        router.replace(`/chat/${chatId}`,{scroll: false})
    }, [
        shouldAutoTrigger,
        chatId,
        markChatAsTriggered,
        hasChatBeenTriggered,
        sendMessage,
        activeModel,
        initialMessages,
        router
    ])

    if (isPending) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner />
            </div>
        )
    }

    const handleSubmit = () => {
        if (!input.trim()) return;

        sendMessage(
            { text: input },
            {
                body: {
                    model: activeModel,
                    chatId,
                }
            }
        )

        setInput("");
    }

    const handleRetry = () => {
        regenerate()
    }

    const handleStop = () => {
        stop()
    }

    const messageToRender = [...initialMessages, ...messages]

    return (
        <div className="max-w-4xl mx-auto px-3 py-3 sm:p-6 relative size-full h-[calc(100vh-4rem)]">
            <div className="flex flex-col h-full">
                <Conversation className="h-full">
                    <ConversationContent>
                        {
                            messageToRender.length === 0 ? (<>
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Start conversation
                                </div>
                            </>) : (
                                messageToRender.map((msg) => (
                                    <Fragment key={msg.id}>
                                        {
                                            msg.parts.map((part, i) => {
                                                switch (part.type) {
                                                    case "text":
                                                        return (
                                                            <Message from={msg.role} key={`${msg.id}-${i}`}>
                                                                <MessageContent>
                                                                    <MessageResponse>
                                                                        {part.text}
                                                                    </MessageResponse>
                                                                </MessageContent>
                                                            </Message>
                                                        )

                                                    case "reasoning":
                                                        return (<Reasoning
                                                            className="max-w-2xl px-4 py-4 border border-muted rounded-md bg-muted/50"
                                                            key={`${msg.id}-${i}`}
                                                        >
                                                            <ReasoningTrigger />
                                                            <ReasoningContent className="mt-2 italic font-light text-muted-foreground">
                                                                {part.text}
                                                            </ReasoningContent>
                                                        </Reasoning>
                                                        )
                                                }
                                            })
                                        }
                                    </Fragment>
                                ))
                            )
                        }
                        {
                            status === "streaming" && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Spinner />
                                    <span className="text-sm">AI is typing...
                                    </span>
                                </div>
                            )
                        }
                    </ConversationContent>
                </Conversation>

                <PromptInputProvider>
                    <PromptInput onSubmit={handleSubmit} className="mt-3 sm:mt-4 *:data-[slot=input-group]:min-h-32">
                        <PromptInputBody>
                            <PromptInputTextarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message here..."
                                className="min-h-24"

                            >

                            </PromptInputTextarea>
                        </PromptInputBody>
                        <PromptInputFooter>
                            <PromptInputTools className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                                {
                                    isModelsLoading ? (<Spinner />) : (
                                        <ChatModelSelector
                                            models={models?.models}
                                            selectedModelId={activeModel}
                                            onModelSelect={setSelectedModel}
                                        />
                                    )
                                }
                                {
                                    status === "streaming" ? (
                                        <PromptInputButton onClick={handleStop}>
                                            <StopCircleIcon size={16} />
                                            <span>Stop</span>
                                        </PromptInputButton>
                                    ) : (
                                        <PromptInputButton onClick={handleRetry}>
                                            <RotateCcwIcon size={16} />
                                            <span>Retry</span>
                                        </PromptInputButton>
                                    )
                                }
                            </PromptInputTools>
                            <PromptInputSubmit status={status} />
                        </PromptInputFooter>
                    </PromptInput>
                </PromptInputProvider>
            </div>
        </div>
    )
}

export default MessageWithForm;