"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionState } from "@/lib/auth/middleware";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { signIn, signUp } from "./actions";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");
	const priceId = searchParams.get("priceId");
	const inviteId = searchParams.get("inviteId");
	const [state, formAction, pending] = useActionState<ActionState, FormData>(
		mode === "signin" ? signIn : signUp,
		{ error: "" }
	);
	const { theme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const currentTheme = theme === "system" ? systemTheme : theme;
	const logoSrc =
		currentTheme === "dark" ? "/SidePlanner-bow.png" : "/SidePlanner-wob.png";

	return (
		<div className="relative container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>
			<div className="flex w-full flex-col items-center space-y-6 sm:w-[400px]">
				<div className="flex flex-col items-center space-y-4">
					<Image
						src={logoSrc}
						alt="SidePlanner Logo"
						width={200}
						height={200}
						priority
						className="mb-2"
					/>
					<h1 className="text-3xl font-bold tracking-tight">
						{mode === "signin" ? "Welcome back" : "Create an account"}
					</h1>
					<p className="text-muted-foreground text-center text-sm">
						{mode === "signin"
							? "Enter your credentials to access your account"
							: "Enter your details to create your account"}
					</p>
				</div>

				<Card className="border-border/40 bg-card/95 supports-[backdrop-filter]:bg-card/50 w-full shadow-md backdrop-blur">
					<CardContent className="pt-6">
						<form className="space-y-4" action={formAction}>
							<input type="hidden" name="redirect" value={redirect || ""} />
							<input type="hidden" name="priceId" value={priceId || ""} />
							<input type="hidden" name="inviteId" value={inviteId || ""} />

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									defaultValue={state.email}
									required
									maxLength={50}
									className="border-border/50"
									placeholder="name@example.com"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									autoComplete={
										mode === "signin" ? "current-password" : "new-password"
									}
									defaultValue={state.password}
									required
									minLength={8}
									maxLength={100}
									className="border-border/50"
									placeholder="Enter your password"
								/>
							</div>

							{state?.error && (
								<div className="text-destructive text-sm">{state.error}</div>
							)}

							<Button type="submit" className="w-full" disabled={pending}>
								{pending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Loading...
									</>
								) : mode === "signin" ? (
									"Sign in"
								) : (
									"Create account"
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="text-muted-foreground text-center text-sm">
					{mode === "signin" ? (
						<>
							Don't have an account?{" "}
							<Link
								href={`/sign-up${redirect ? `?redirect=${redirect}` : ""}${
									priceId ? `&priceId=${priceId}` : ""
								}`}
								className="text-primary font-medium hover:underline"
							>
								Create an account
							</Link>
						</>
					) : (
						<>
							Already have an account?{" "}
							<Link
								href={`/sign-in${redirect ? `?redirect=${redirect}` : ""}${
									priceId ? `&priceId=${priceId}` : ""
								}`}
								className="text-primary font-medium hover:underline"
							>
								Sign in
							</Link>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
