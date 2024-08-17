
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'

const Page = async ({ }) => {
    const session = await getServerSession(authOptions)
    if (!session) notFound()


    return (
        <></>
    )
}

export default Page

/////////////////
// youtube timestamp 2:54:22