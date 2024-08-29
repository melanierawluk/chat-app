'use client'

import { ButtonHTMLAttributes, useState } from "react"
import Button from "./ui/Button"
import toast from "react-hot-toast"
import { signOut } from "next-auth/react"
import { Loader2, LogOut } from "lucide-react"


interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { }

export default function SignOutButton({ ...props }: SignOutButtonProps) {
    const [isSignedOut, setIsSignedOut] = useState<boolean>(false)
    return (
        <Button
            {...props}
            variant='ghost'
            onClick={async () => {
                setIsSignedOut(true)
                try {
                    await signOut()
                } catch (error) {
                    toast.error('There was a problem signing out')
                } finally {
                    setIsSignedOut(false)
                }
            }}>
            {isSignedOut ? (
                <Loader2 className='animate-spin h-4 w-4' />
            ) : (
                <LogOut className='w-6 h-6' />
            )}
        </Button>
    )
}