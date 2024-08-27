import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";


interface pageProps {
    params: {
        chatId: string
    }
}

const getChatMessages = async (chatId: string) => {
    try {
        const results: string[] = await fetchRedis(
            'zrange',
            `chat:${chatId}:messages`,
            0,
            -1
        );

        const dbMessages = results.map((message) => JSON.parse(message) as Message);

        const reversedDbMessages = dbMessages.reverse();

        const messages = messageArrayValidator.parse(reversedDbMessages);

        return messages;
    } catch (error) {
        notFound();
    }
}

export default async function page({ params }: pageProps) {

    const { chatId } = params;
    const session = await getServerSession(authOptions);
    if (!session) notFound();

    const { user } = session;
    const [userId1, userId2] = chatId.split('--')

    if (user.id !== userId1 && user.id !== userId2) {
        notFound();
    }

    const chatPartnerId = user.id === userId1 ? userId2 : userId1;
    const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
    const initialMessages = await getChatMessages(chatId);

    return (
        <div className="flex-1 justify-between flex flex-col h-full mx-h-[calc(100vh-6rem)]">
            <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
                <div className="relative flex items-center space-x-4">
                    <div className="relative">
                        <div className="relative w-8 sm:w-12 h-8 sm:h-12">
                            <Image
                                fill
                                referrerPolicy='no-referrer'
                                src={chatPartner.image}
                                alt={`${chatPartner.name} profile picture`}
                                className='rounded-full'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}