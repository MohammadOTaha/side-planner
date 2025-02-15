"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList, Plus, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";

export default function BoardsNavbar() {
	const pathname = usePathname();
	const isRootBoardsPath = pathname === "/boards";
	const { theme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent flash of incorrect theme
	if (!mounted) {
		return (
			<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto">
					<div className="flex h-14 items-center">
						<nav className="flex flex-1 items-center justify-between">
							<div className="flex items-center space-x-6">
								<div className="w-[72px] h-[72px]" />
								{/* Rest of the skeleton UI */}
							</div>
						</nav>
					</div>
				</div>
			</header>
		);
	}

	const currentTheme = theme === "system" ? systemTheme : theme;
	const logoSrc =
		currentTheme === "dark"
			? "/SidePlanner-bow.png"
			: "/SidePlanner-wob.png";

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto">
				<div className="flex h-14 items-center">
					<nav className="flex flex-1 items-center justify-between">
						<div className="flex items-center space-x-6">
							<Link
								href="/boards"
								className="flex items-center space-x-2"
							>
								<Image
									src={logoSrc}
									alt="SidePlanner Logo"
									width={72}
									height={72}
									className="object-contain"
									priority
								/>
							</Link>
							<div className="flex items-center space-x-2">
								<Link href="/boards">
									<Button
										variant={
											isRootBoardsPath
												? "outline"
												: "ghost"
										}
										size="sm"
										className="h-8"
									>
										<LayoutGrid className="h-4 w-4 mr-2" />
										All Boards
									</Button>
								</Link>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<ThemeToggle />
							<Button variant="ghost" size="sm" className="h-8">
								<Settings className="h-4 w-4" />
							</Button>
						</div>
					</nav>
				</div>
			</div>
		</header>
	);
}
