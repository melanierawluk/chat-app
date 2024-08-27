'use client'

import { chatHrefConstuctor } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"


interface SidebarChatListProps {
    friends: User[]
    sessionId: string
}

export default function SidebarChatList({ friends, sessionId }: SidebarChatListProps) {

    const router = useRouter();
    const pathname = usePathname();
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])

    return (
        <ul role='list' className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
            {friends.sort().map((friend) => {
                const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
                    return unseenMsg.senderId === friend.id
                }).length;

                return <li key={friend.id}>
                    <a href={`/dashboard/chat/${chatHrefConstuctor(
                        sessionId,
                        friend.id
                    )}`}>hello</a>
                </li>
            })}
        </ul>
    )
}