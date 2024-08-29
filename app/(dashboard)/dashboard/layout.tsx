import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { Icon, Icons } from "@/components/Icons";
import SignOutButton from "@/components/SignOutButton";
import { fetchRedis } from "@/helpers/redis";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import SidebarChatList from "@/components/SidebarChatList";
import FriendRequestSidebar from "@/components/FriendRequestSidebar";
import Image from "next/image";

interface LayoutProps {
	children: React.ReactNode;
}

interface SidebarOption {
	id: number
	name: string
	href: string
	Icon: Icon
}

const sidebarOptions: SidebarOption[] = [
	{
		id: 1,
		name: '',
		href: '/dashboard/add',
		Icon: 'UserPlus',
	},
]

export default async function Layout({ children }: LayoutProps) {

	const session = await getServerSession(authOptions)
	if (!session) notFound();

	const friends = await getFriendsByUserId(session.user.id)

	const unseenRequestCount = (
		(await fetchRedis(
			'smembers',
			`user:${session.user.id}:incoming_friend_requests`
		)) as User[]
	).length

	return (
		<section className="w-full flex h-screen">

			{/* Left sidebar/navigation */}
			<nav className="flex flex-1 flex-col border border-r-1">
				<ul role="list" className="mt-10">
					{sidebarOptions.map((option) => {
						const Icon = Icons[option.Icon]
						return (
							<li key={option.id}>
								<Link href={option.href}
									className="flex rounded-md p-4 ">
									<span className="text-gray-600 border-gray-300 flex h-10 w-10 items-center justify-center rounded-lg border ">
										<Icon className="h-4 w-4" />
									</span>
								</Link>
							</li>
						)
					})}

					<li>
						<FriendRequestSidebar
							sessionId={session.user.id}
							initialUnseenRequestCount={unseenRequestCount} />
					</li>
				</ul>
				<div className=" mt-auto flex items-center mb-2">
					<div className='relative h-8 w-8 ml-2'>
						<Image
							fill
							referrerPolicy='no-referrer'
							className='rounded-full'
							src={session.user.image || ''}
							alt='Your profile picture'
						/>
					</div>
					<SignOutButton className='h-full aspect-square' />
				</div>
			</nav>

			{/* Chat list */}
			<div className="flex h-full min-w-fit max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
				<Link href='/dashboard' className="flex h-16 shrink-0 items-center">
					<Icons.Logo className="h-8 w-auto text-purple-600" />
				</Link>

				{friends.length > 0 ? (
					<div className="text-xs font-semibold leading-6 text-gray-400">
						Your chats
					</div>
				) : null}
				<div>
					<SidebarChatList friends={friends} sessionId={session.user.id} />
				</div>
			</div>

			{/* Selected chat OR friends pages when either icon selected */}
			<aside className="max-h-screen container py-6 px-0">
				{children}
			</aside>
		</section>
	);
}