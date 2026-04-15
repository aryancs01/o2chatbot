"use client"
import { useState, useMemo, Fragment } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import UserButton from "@/modules/authentication/components/user-button"

import { cn } from "@/lib/utils"
import { PlusIcon, SearchIcon, Trash2Icon, Ellipsis } from "lucide-react"
import { useChatStore } from "../store/chat-store"
import DeleteChatModal from "./chat-delete-modal"

interface ChatMessage {
    id: string
    messageRole: "USER" | "ASSISTANT"
    messageType: "NORMAL" | "ERROR" | "TOOL_CALL"
    content: string
    model: string | null
    chatId: string
    createdAt: Date
    updatedAt: Date
}

interface ChatItem {
    id: string
    title: string
    model: string
    userId: string
    createdAt: Date
    updatedAt: Date
    messages: ChatMessage[]
}

interface SidebarUser {
    id: string
    image: string | null
    name: string
    createdAt: Date
    updatedAt: Date
    email: string
}

interface ChatSidebarProps {
    user: SidebarUser | null
    chats: ChatItem[] | null
}

const ChatSidebar = ({ user, chats }: ChatSidebarProps) => {
    const { activeChatId } = useChatStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(activeChatId);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) {
            return chats;
        }

        const query = searchQuery.toLowerCase();
        return chats?.filter(chat => chat.title.toLowerCase().includes(query) || chat.messages.some((message: ChatMessage) => message.content.toLowerCase().includes(query)));

    }, [chats, searchQuery])

    //Group chats by date (eg: Today, Yesterday, Last Week, etc.)
    const groupedChats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        const groups: {
            today: ChatItem[]
            yesterday: ChatItem[]
            lastWeek: ChatItem[]
            older: ChatItem[]
        } = {
            today: [],
            yesterday: [],
            lastWeek: [],
            older: []
        }

        filteredChats?.forEach(chat => {
            const chatDate = new Date(chat.updatedAt);

            if (chatDate >= today) {
                groups.today.push(chat);
            } else if (chatDate >= yesterday) {
                groups.yesterday.push(chat);
            } else if (chatDate >= lastWeek) {
                groups.lastWeek.push(chat);
            } else {
                groups.older.push(chat);
            }
        })

        return groups;
    }, [filteredChats])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }

    const onDelete = (e: React.MouseEvent, chatId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedChatId(chatId);
        setIsModalOpen(true);
    }

    const renderChatItem = (chatList: ChatItem[]) => {
        if (chatList.length === 0) {
            return null;
        }

        return chatList.map((chat) => (
            <Fragment key={chat.id}>
                <Link className={cn(
                    "block rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                    chat.id === activeChatId && "bg-sidebar-accent"
                )} href={`/chat/${chat.id}`} key={chat.id}>
                    <div className="flex flex-row justify-between items-center gap-2">
                        <span className="flex-1 truncate">{chat.title}</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 group-hover:opacity-100 hover:bg-sidebar-accent-foreground/10"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <Ellipsis className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="flex flex-row gap-2 cursor-pointer"
                                    onClick={(e) => onDelete(e, chat.id)}
                                >
                                    <Trash2Icon className="h-4 w-4 text-red-500" />
                                    <span className="text-red-500">Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </Link>
                <DeleteChatModal
                    chatId={chat.id}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            </Fragment>

        ))
    }
    return (
        <div className="flex h-full w-full sm:w-64 flex-col border-r border-border bg-sidebar">
            <div className="flex items-center justify-between border-b border-sidebar-border px-2 py-2">
                <div className="flex items-center gap-2">
                    <span
                        className='text-2xl font-mono font-semibold text-secondary tracking-tight'
                        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                    >
                        O2Chat
                    </span>
                </div>
            </div>

            <div className="p-4">
                <Link href={"/"}>
                    <Button className="w-full">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Chat
                    </Button>
                </Link>
            </div>

            <div className="px-4 pb-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations" className="pl-8 bg-sidebar-accent border-sidebar-b pr-8"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2">
                {
                    filteredChats?.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            {searchQuery ? "No conversations found." : "No conversations yet. Start a new chat!"}
                        </div>
                    )
                        :
                        (
                            <>
                                {
                                    groupedChats.today.length > 0 && (
                                        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                                            TODAY
                                            {renderChatItem(groupedChats.today)}
                                        </div>
                                    )
                                }

                                {
                                    groupedChats.yesterday.length > 0 && (
                                        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                                            YESTERDAY
                                            {renderChatItem(groupedChats.yesterday)}
                                        </div>
                                    )
                                }

                                {
                                    groupedChats.lastWeek.length > 0 && (
                                        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                                            LAST WEEK
                                            {renderChatItem(groupedChats.lastWeek)}
                                        </div>
                                    )
                                }

                                {
                                    groupedChats.older.length > 0 && (
                                        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                                            OLDER
                                            {renderChatItem(groupedChats.older)}
                                        </div>
                                    )
                                }
                            </>
                        )
                }
            </div>

            <div className="p-4 flex items-center gap-3 border-t border-sidebar-border">
                <UserButton user={user} />
                <span className="flex-1 text-sm text-sidebar-foreground truncate">
                    {user?.name}
                </span>
            </div>
        </div>
    )
}

export default ChatSidebar