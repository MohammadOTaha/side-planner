"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleIcon, Home, LogOut } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/auth";
import { signOut } from "@/app/(login)/actions";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { userPromise } = useUser();
	const user = use(userPromise);
	const router = useRouter();

	async function handleSignOut() {
		await signOut();
		router.refresh();
		router.push("/");
	}

	return (
		<header className="border-b border-gray-200 dark:border-gray-800 bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
				<Link href="/" className="flex items-center">
					<CircleIcon className="h-6 w-6 text-orange-500" />
					<span className="ml-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
						ACME
					</span>
				</Link>
				<div className="flex items-center space-x-4">
					<Link
						href="/pricing"
						className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
					>
						Pricing
					</Link>
					<ThemeToggle />
					{user ? (
						<DropdownMenu
							open={isMenuOpen}
							onOpenChange={setIsMenuOpen}
						>
							<DropdownMenuTrigger>
								<Avatar className="cursor-pointer size-9">
									<AvatarImage alt={user.name || ""} />
									<AvatarFallback>
										{user.email
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem className="cursor-pointer">
									<Link
										href="/dashboard"
										className="flex w-full items-center"
									>
										<Home className="mr-2 h-4 w-4" />
										<span>Dashboard</span>
									</Link>
								</DropdownMenuItem>
								<form action={handleSignOut} className="w-full">
									<button
										type="submit"
										className="flex w-full"
									>
										<DropdownMenuItem className="w-full flex-1 cursor-pointer">
											<LogOut className="mr-2 h-4 w-4" />
											<span>Sign out</span>
										</DropdownMenuItem>
									</button>
								</form>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild variant="secondary" className="text-sm">
							<Link href="/sign-up">Sign Up</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<section className="flex flex-col min-h-screen">
			<Header />
			{children}
		</section>
	);
}
