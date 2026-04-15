"use client"

import { ReactNode } from "react"
import { MenuIcon } from "lucide-react"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import ChatSidebar from "@/modules/chat/components/chat-sidebar"
import Header from "@/modules/chat/components/header"

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

interface ChatShellProps {
  user: SidebarUser | null
  chats: ChatItem[]
  children: ReactNode
}

const ChatShell = ({ user, chats, children }: ChatShellProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden h-full w-64 shrink-0 md:flex">
        <ChatSidebar user={user} chats={chats} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-14 items-center justify-between border-b border-border bg-sidebar px-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Open sidebar">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" showCloseButton className="w-[85vw] max-w-sm p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Chat sidebar</SheetTitle>
                <SheetDescription>Browse conversations and start a new chat</SheetDescription>
              </SheetHeader>
              <ChatSidebar user={user} chats={chats} />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold text-secondary">O2Chat</span>
          <ModeToggle />
        </div>

        <div className="hidden md:block">
          <Header />
        </div>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

export default ChatShell
