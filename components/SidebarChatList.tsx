import { usePathname } from "next/navigation"
import { useRouter } from "next/router"
import path from "path";
import { useEffect, useState } from "react"


interface SidebarChatListProps {
    friends: User[]
}

export default function SidebarChatList({ friends }: SidebarChatListProps) {

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
                return <></>
            })}
        </ul>
    )
}