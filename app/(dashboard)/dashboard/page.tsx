
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'

const page = async ({ }) => {
    const session = await getServerSession(authOptions)
    if (!session) notFound()


    return (
        <div>Hi</div>
    )
}

export default page