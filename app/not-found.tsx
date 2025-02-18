"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Compass } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
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
		<div className="relative min-h-screen">
			<div className="absolute top-4 right-4 z-50">
				<ThemeToggle />
			</div>

			{/* Background Pattern */}
			<div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,transparent_0%,#80808012_50%,transparent_100%)] dark:bg-[linear-gradient(to_right,transparent_0%,#ffffff08_50%,transparent_100%)]" />
			<div className="absolute inset-0 -z-10">
				<div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#ffffff15_1px,transparent_1px)]" />
			</div>

			<div className="relative container mx-auto flex min-h-screen items-center justify-center px-4">
				<Card className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/50 relative w-full max-w-4xl overflow-hidden p-4 shadow-xl backdrop-blur sm:p-6">
					<div className="relative flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12">
						{/* Left Side - Content */}
						<div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
							<h1 className="text-foreground/80 text-6xl font-bold tracking-tight sm:text-7xl">
								404
							</h1>
							<p className="mt-2 text-xl font-semibold">Lost in the void?</p>
							<p className="text-muted-foreground mt-4 max-w-sm">
								The page you're looking for seems to have wandered off. Let's
								get you back on track.
							</p>
							<div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
								<Link href="/">
									<Button
										size="lg"
										className="group bg-foreground text-background hover:bg-foreground/90 min-w-[160px] gap-2 transition-all hover:shadow-lg"
									>
										<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
										Go Home
									</Button>
								</Link>
								<Link href="/boards">
									<Button
										variant="outline"
										size="lg"
										className="group hover:border-foreground/50 min-w-[160px] gap-2 transition-all"
									>
										<Compass className="h-4 w-4 transition-transform group-hover:rotate-45" />
										View Boards
									</Button>
								</Link>
							</div>
						</div>

						{/* Right Side - Illustration */}
						<div className="relative flex flex-1 justify-center lg:justify-end">
							<div className="relative aspect-square w-full max-w-[300px]">
								<div className="bg-foreground/5 absolute inset-0 animate-pulse rounded-full blur-3xl" />
								<div className="bg-foreground/10 absolute inset-0 animate-pulse rounded-full blur-3xl delay-150" />
								<Image
									src={logoSrc}
									alt="SidePlanner Logo"
									fill
									className="animate-float object-contain"
									priority
								/>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
