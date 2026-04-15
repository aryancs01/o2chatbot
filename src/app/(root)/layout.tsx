import { auth } from '@/lib/auth';
import { currentUser } from '@/modules/authentication/actions';
import { getAllChats } from '@/modules/chat/actions';
import ChatShell from '@/modules/chat/components/chat-shell';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'

const layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const user = await currentUser();

    
    const {data:chats} = await getAllChats();

    if(!session) {
        return redirect("/signin")
    }

    return (
        <ChatShell user={user} chats={chats ?? []}>
            {children}
        </ChatShell>
    )
}

export default layout