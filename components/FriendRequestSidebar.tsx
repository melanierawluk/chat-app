'use client'

import { pusherClient } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface FriendRequestSidebarProps {
    sessionId: string
    initialUnseenRequestCount: number
}

export default function FriendRequestSidebar({
    sessionId,
    initialUnseenRequestCount }: FriendRequestSidebarProps) {

    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    )

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`user:${sessionId}:incoming_friend_requests`)
        );

        const friendRequestHandler = () => {
            setUnseenRequestCount((prev) => prev + 1)
        }

        pusherClient.bind(
            'incoming_friend_requests', friendRequestHandler
        );

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`user:${sessionId}:incoming_friend_requests`));
            pusherClient.unbind(
                'incoming_friend_requests', friendRequestHandler);
        }

    }, [sessionId])

    return (
        // Sidebar friend request
        <Link
            href='/dashboard/requests'
            className='flex items-center gap-x-3 p-4'
        >
            <div className='text-gray-500 border-gray-200 group-hover:border-purple-600 group-hover:text-purple-600 flex h-10 w-10 items-center justify-center rounded-lg border bg-white'>
                <User className='h-4 w-4' />
            </div>

            {/* Badge notification */}
            {unseenRequestCount > 0 ? (
                <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-purple-400'>
                    {unseenRequestCount}
                </div>
            ) : null}
        </Link>
    )
}