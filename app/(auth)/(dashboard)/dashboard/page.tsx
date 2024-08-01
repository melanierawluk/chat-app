import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

type Props = {}
export default async function page({ }: Props) {

    const session = await getServerSession(authOptions)
    return (
        <pre>{JSON.stringify(session)}</pre>
    )
}