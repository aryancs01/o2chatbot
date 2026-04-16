"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signUp } from "@/lib/auth-client";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const Page = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [activeTab, setActiveTab] = useState("signin");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match. Please try again.");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await signUp.email({ email, password, name: email.split("@")[0] });
            if (error) {
                toast.error(error.message || "Failed to create account. User might already exist.");
            } else {
                toast.success("Account created successfully! Please sign in.");
                setActiveTab("signin");
                setPassword("");
                setConfirmPassword("");
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    const handleSignin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast.error("Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await signIn.email({ email, password, callbackURL: "/" });
            if (error) {
                toast.error(error.message || "Incorrect email or password.");
            } else {
                toast.success("Signed in successfully!");
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className='flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-16'>
            <div className='flex flex-col items-center gap-2 mb-8'>
                <h1 className='text-4xl font-bold text-foreground'>
                    Welcome to
                </h1>
                <span
                    className='text-4xl font-mono font-bold text-primary tracking-tight'
                    style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                >
                    O2Chat
                </span>
                <p className="mt-2 text-center text-muted-foreground max-w-sm">
                    Your AI companion. Sign in or create an account to start chatting.
                </p>
            </div>

            <Card className="w-full max-w-md shadow-lg border-border/50">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <CardHeader className="pb-4">
                        <TabsList className="grid w-full grid-cols-2 mb-2">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    
                    <CardContent>
                        <TabsContent value="signin" className="mt-0 space-y-4">
                            <form onSubmit={handleSignin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signin-email">Email</Label>
                                    <Input 
                                        id="signin-email"
                                        type="email" 
                                        placeholder="m@example.com" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        required 
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signin-password">Password</Label>
                                    <div className="relative">
                                        <Input 
                                            id="signin-password"
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            required 
                                            disabled={isLoading}
                                            className="pr-10"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Sign In
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup" className="mt-0 space-y-4">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input 
                                        id="signup-email"
                                        type="email" 
                                        placeholder="m@example.com" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        required 
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <div className="relative">
                                        <Input 
                                            id="signup-password"
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="Min. 8 characters" 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            required 
                                            disabled={isLoading}
                                            className="pr-10"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <div className="relative">
                                        <Input 
                                            id="confirm-password"
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="Confirm your password" 
                                            value={confirmPassword} 
                                            onChange={e => setConfirmPassword(e.target.value)} 
                                            required 
                                            disabled={isLoading}
                                            className="pr-10"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Create Account
                                </Button>
                            </form>
                        </TabsContent>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 pt-2 border-t mt-4 border-border/40">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button 
                            variant="outline" 
                            className="w-full"
                            disabled={isLoading}
                            onClick={() => signIn.social({
                                provider: "github",
                                callbackURL: "/"
                            })}
                        >
                            <Image src="/github.svg" alt="GitHub" width={20} height={20} className="mr-2" />
                            GitHub
                        </Button>
                    </CardFooter>
                </Tabs>
            </Card>
        </section>
    )
}

export default Page;