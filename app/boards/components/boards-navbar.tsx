"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList, Plus, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function BoardsNavbar() {
	const pathname = usePathname();
	const isRootBoardsPath = pathname === "/boards";

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto">
				<div className="flex h-14 items-center">
					<nav className="flex flex-1 items-center justify-between">
						<div className="flex items-center space-x-6">
							<Link
								href="/boards"
								className="font-medium transition-colors hover:text-foreground/80"
							>
								Boards
							</Link>
							<div className="flex items-center space-x-2">
								<Link href="/boards">
									<Button
										variant={
											isRootBoardsPath
												? "secondary"
												: "ghost"
										}
										size="sm"
										className="h-8"
									>
										<LayoutGrid className="h-4 w-4 mr-2" />
										All Boards
									</Button>
								</Link>
								<Button
									variant="ghost"
									size="sm"
									className="h-8"
								>
									<LayoutList className="h-4 w-4 mr-2" />
									Recent
								</Button>
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
