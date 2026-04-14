"use client"

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAIModels } from "@/modules/ai-agent/hook/ai-agent";
import { Send } from "lucide-react";
import { useState } from "react";
import { ModelSelector } from "./model-selector";

const ChatMessageForm = ({ initialMessage }: { initialMessage: string }) => {
    const {data: models, isPending} = useAIModels();
    const [selectedModel, setSelectedModel] = useState<string | undefined>(models?.models[0]?.id);
    const [message, setMessage] = useState(initialMessage);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            console.log("Message submitted:", message);
            setMessage("");
        } catch (error) {
            console.error("Error submitting message:", error);
        }
    }

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-6">
            <form onSubmit={handleSubmit}>
                <div className="relative rounded-2xl border-border shadow-sm transition-all">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="min-h-15 max-h-50 resize-none border-0 bg-transparent px-4 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit(e)
                            }
                        }}
                    />

                    <div className="flex items-center justify-between gap-2 px-3 py-2 border-t">
                        <div className="flex items-center gap-1">
                            {
                                isPending ? (
                                    <>
                                        <Spinner />
                                    </>
                                ) : (
                                   <ModelSelector models={models?.models}
                                   onModelSelect={setSelectedModel}
                                   selectedModelId={selectedModel}
                                   /> 
                                )
                            }
                        </div>
                         <Button
                        type="submit"
                        disabled={!message.trim()}
                        size="sm"
                        variant={message.trim() ? "default" : "ghost"}
                        className="h-8 w-8 p-0 rounded-full"
                    >
                        <Send className="size-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default ChatMessageForm