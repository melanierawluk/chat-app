'use client'

import { pusherClient } from "@/lib/pusher"
import { cn, formatTimestamp, toPusherKey } from "@/lib/utils"
import { Message } from "@/lib/validations/message"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

interface MessagesProps {
    initialMessages: Message[]
    sessionId: string
    chatId: string
    sessionImg: string | null | undefined
    chatPartner: User
}

export default function Messages({
    initialMessages,
    sessionId,
    sessionImg,
    chatPartner,
    chatId
}: MessagesProps) {

    const [messages, setMessages] = useState<Message[]>(initialMessages)

    useEffect(() => {
        // Listen/subscribe to real time event
        pusherClient.subscribe(
            toPusherKey(`chat:${chatId}`)
        )

        const messageHandler = (message: Message) => {
            setMessages((prev) => [message, ...prev])
        }

        pusherClient.bind('incoming-message', messageHandler)

        // Cleanup function
        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`chat:${chatId}`)
            )
            pusherClient.unbind('incoming-message', messageHandler)
        }
    }, [chatId])

    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    return (
        // Full message area
        <section
            id="messages"
            className='bg-gray-50 flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
            <div ref={scrollDownRef} />

            {/* Iterate over each message */}
            {messages.map((message, index) => {
                const isCurrentUser = message.senderId === sessionId

                const hasNextMessageFromSameUser =
                    messages[index - 1]?.senderId === messages[index].senderId

                return (
                    // Single message row
                    <article className='chat-message' key={`${message.id}-${message.timestamp}`}>
                        <div className={cn('flex items-end', { 'justify-end': isCurrentUser, })}>
                            {/* Timestamp */}
                            <span className={cn('ml-2 text-xs text-gray-400 self-center', {
                                'order-1 items-end': isCurrentUser,
                                'order-3 items-start ': !isCurrentUser,

                            })}>
                                {formatTimestamp(message.timestamp)}
                            </span>
                            {/* Message bubble */}
                            <div className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2',
                                {
                                    'order-1 items-end': isCurrentUser,
                                    'order-2 items-start': !isCurrentUser,
                                }
                            )}>
                                <span className={cn('px-4 py-2 rounded-xl inline-block', {
                                    'bg-purple-500 text-white': isCurrentUser,
                                    'bg-gray-200 text-gray-900': !isCurrentUser,
                                    'rounded-br-none':
                                        !hasNextMessageFromSameUser && isCurrentUser,
                                    'rounded-bl-none':
                                        !hasNextMessageFromSameUser && !isCurrentUser,
                                })}>
                                    {message.text}{' '}
                                </span>
                            </div>

                            {/* Profile photo next to message bubble*/}
                            <div
                                className={cn('relative w-7 h-7', {
                                    'order-2': isCurrentUser,
                                    'order-1': !isCurrentUser,
                                    invisible: hasNextMessageFromSameUser,
                                })}>
                                <Image
                                    fill
                                    src={isCurrentUser ? (sessionImg as string) : chatPartner.image}
                                    alt='Profile picture'
                                    referrerPolicy='no-referrer'
                                    className='rounded-full'
                                />
                            </div>
                        </div>
                    </article>
                )
            })}
        </section>
    )
}