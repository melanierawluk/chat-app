'use client'

import { pusherClient } from "@/lib/pusher"
import { chatHrefConstructor, toPusherKey } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import ChatNotificationToast from "./ChatNotificationToast"
import Image from "next/image"
import { format } from "date-fns"


interface SidebarChatListProps {
    friends: User[]
    sessionId: string
}

interface ExtendedMessage extends Message {
    senderImg: string
    senderName: string
}

export default function SidebarChatList({ friends, sessionId }: SidebarChatListProps) {

    const router = useRouter();
    const pathname = usePathname();
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
    const [mostRecentMessageText, setMostRecentMessageText] = useState<string>('');
    const [mostRecentMessageTimestamp, setMostRecentMessageTimestamp] = useState<string>('');

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

        const newFriendHandler = () => {
            router.refresh();
        }

        const chatHandler = (message: ExtendedMessage) => {
            // Checks which page user is on - should only notify if not within chat
            const shouldNotify =
                pathname !==
                `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

            if (!shouldNotify) return;

            toast.custom((t) => (
                <ChatNotificationToast
                    t={t}
                    sessionId={sessionId}
                    senderId={message.senderId}
                    senderImg={message.senderImg}
                    senderMessage={message.text}
                    senderName={message.senderName}
                />
            ));

            setUnseenMessages((prev) => [...prev, message]);
            setMostRecentMessageText(message.text)
            setMostRecentMessageTimestamp(format(new Date(), 'HH:mm'));
        }

        pusherClient.bind('new_message', chatHandler);
        pusherClient.bind('new_friend', newFriendHandler);

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

            pusherClient.unbind('new_message', chatHandler);
            pusherClient.unbind('new_friend', newFriendHandler);
        }
    }, [pathname, sessionId, router]);

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId));
            })
        }
    }, [pathname]);


    return (
        // Single name in chat list
        <article className="max-h-[25rem] overflow-y-auto -mx-2 ">
            {friends.sort().map((friend) => {
                const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
                    return unseenMsg.senderId === friend.id
                }).length;

                return (
                    <div key={friend.id}>
                        <a href={`/dashboard/chat/${chatHrefConstructor(
                            sessionId,
                            friend.id
                        )}`}
                            className="text-gray-700 hover:text-purple-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-4 text-sm leading-6 font-semibold"
                        >
                            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
                                <Image
                                    fill
                                    referrerPolicy='no-referrer'
                                    src={friend.image}
                                    alt={`${friend.name} profile picture`}
                                    className='rounded-full'
                                />
                            </div>
                            <div>
                                <div>
                                    {friend.name}
                                </div>
                                <div className="font-normal">
                                    {mostRecentMessageText}
                                </div>
                            </div>
                            <div className="font-normal">
                                {mostRecentMessageTimestamp}
                            </div>

                            {/* Notification badge */}
                            {unseenMessagesCount > 0 ? (
                                <div className="bg-red-500 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                                    {unseenMessagesCount}
                                </div>
                            ) : null}
                        </a>
                    </div>)
            })}
        </article>
    )
}