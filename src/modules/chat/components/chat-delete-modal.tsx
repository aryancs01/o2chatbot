"use client"
import React from "react"
import { useDeleteChat } from "../hooks/chat";
import { toast } from "sonner";
import Modal from "@/components/ui/modal";

const DeleteChatModal = ({
    isModalOpen,
    setIsModalOpen,
    chatId
}: {
    isModalOpen: boolean;
    setIsModalOpen: (b: boolean) => void;
    chatId: string;
}) => {
    const { mutateAsync, isPending } = useDeleteChat(chatId)

    const handleDelete = async () => {
        try {
            await mutateAsync();
            toast.success("Chat deleted successfully");
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error deleting chat:", error);
            toast.error("Failed to delete chat. Please try again.");
        }
    }

    return (
        <Modal
            title="Delete Chat"
            description="Are you sure you want to delete this chat? This action cannot be undone."
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleDelete}
            submitText="Delete"
            cancelText="Cancel"
            submitVariant="destructive"
        >
            <p className="text-sm text-zinc-500">
                This will permanently delete the chat and all its messages. Please confirm that you want to proceed.
            </p>
        </Modal>
    )
}

export default DeleteChatModal;