"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import * as React from "react";

export interface LandingButtonProps extends ButtonProps {
	showArrow?: boolean;
}

export const LandingButton = React.forwardRef<
	HTMLButtonElement,
	LandingButtonProps
>(({ className, children, showArrow = true, ...props }, ref) => {
	return (
		<Button
			ref={ref}
			className={cn(
				"group relative",
				"bg-black/90 dark:bg-white/10",
				"border border-black/20 dark:border-white/20",
				"before:absolute before:inset-0",
				"before:bg-gradient-to-r before:from-violet-600/20 before:via-cyan-400/20 before:to-violet-600/20",
				"before:animate-[shimmer_5s_linear_infinite]",
				"after:absolute after:inset-[1px] after:rounded-[inherit] after:bg-black/90 dark:after:bg-black/95",
				"hover:-translate-y-0.5 hover:scale-[1.02]",
				"shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-cyan-500/30",
				"transition-all duration-500",
				className
			)}
			{...props}
		>
			<span className="relative z-10 flex items-center gap-3 text-white/90">
				{children}
				{showArrow && (
					<ArrowRight className="h-5 w-5 transition-transform duration-500 ease-out group-hover:translate-x-1" />
				)}
			</span>
		</Button>
	);
});

LandingButton.displayName = "LandingButton";
