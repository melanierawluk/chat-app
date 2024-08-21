import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'

export default async function page({ }) {
    const session = await getServerSession(authOptions)
    if (!session) notFound()

    return (
        <></>
    )
}