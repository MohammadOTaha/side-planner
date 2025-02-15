"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
	const { theme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent hydration mismatch by waiting for client-side mount
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
			<div className="flex flex-col items-center text-center">
				<Image
					src={logoSrc}
					alt="SidePlanner Logo"
					width={500}
					height={500}
					priority
					className="mb-12"
				/>
				<h1 className="mb-6 text-5xl font-bold">Welcome to SidePlanner</h1>
				<p className="text-muted-foreground mb-10 max-w-2xl text-xl">
					Your AI-powered personal project management solution
				</p>
				<Link href="/boards">
					<Button size="lg" className="px-8 py-6 text-lg">
						Get Started with Boards
					</Button>
				</Link>
			</div>
		</div>
	);
}
