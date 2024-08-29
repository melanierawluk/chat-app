import FriendRequestList from "@/components/FriendRequestList";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"


export default async function Page() {

    const session = await getServerSession(authOptions)
    if (!session) notFound()

    const incomingSenderIds = (await fetchRedis(
        'smembers',
        `user:${session.user.id}:incoming_friend_requests`
    )) as string[]

    const incomingFriendRequests = await Promise.all(
        incomingSenderIds.map(async (senderId) => {
            const sender = (await fetchRedis('get', `user:${senderId}`)) as string
            const senderParsed = JSON.parse(sender) as User
            return {
                senderId,
                senderEmail: senderParsed.email,
            }
        })
    )

    return (
        <main className='p-5'>
            <h1 className='font-bold text-3xl mb-8'>Friend Requests</h1>
            <div className='flex flex-col gap-4'>
                <FriendRequestList
                    incomingFriendRequests={incomingFriendRequests}
                    sessionId={session.user.id}
                />
            </div>
        </main>
    )
}