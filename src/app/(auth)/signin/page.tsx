"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import Image from "next/image";

const Page = () => {
    return (
        <section className='flex flex-col items-center justify-center min-h-screen bg-background px-4 py-16 md:py-32'>
            <div className='flex items-center gap-2'>
                <h1 className='text-3xl font-bold text-foreground'>
                    Welcome to
                </h1>
                <span
                    className='text-3xl font-mono font-semibold text-primary tracking-tight'
                    style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                >
                    O2Chat
                </span>
            </div>

            <p className="mt-2 text-lg text-muted-foreground font-semibold">
                Sign in to continue interacting with the AI and managing your conversations.
            </p>

            <Button variant={"default"}
             className={
                "max-w-sm mt-5 w-full py-6 flex flex-row justify-center items-center cursor-pointer rounded-2xl"
             }
             onClick={() => signIn.social({
                provider: "github",
                callbackURL: "/"
             })}
            >
                <Image src="/github.svg" alt="GitHub" width={24} height={24} />
                <span className="font-lg text-lg ml-2">Sign in with Github</span>
            </Button>
        </section>
    )
}

export default Page;