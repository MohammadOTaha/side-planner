"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ButtonProps } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export interface GlowButtonProps extends ButtonProps {
	glowColor?: string;
	hideSparkles?: boolean;
	loading?: boolean;
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
	(
		{
			className,
			children,
			glowColor = "rgba(168, 85, 247, 0.4)",
			hideSparkles = false,
			loading,
			...props
		},
		ref
	) => {
		return (
			<Button
				ref={ref}
				className={cn(
					"relative overflow-hidden",
					"bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
					"before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
					"after:bg-background after:absolute after:inset-[1px] after:rounded-[inherit] after:transition-colors",
					"[&>span]:relative [&>span]:z-10 [&>span]:bg-gradient-to-r [&>span]:from-indigo-500 [&>span]:via-purple-500 [&>span]:to-pink-500 [&>span]:bg-clip-text [&>span]:text-transparent",
					"shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]",
					"transition-all duration-300",
					loading && "animate-glow",
					className
				)}
				style={
					{
						"--glow-color": glowColor,
					} as React.CSSProperties
				}
				{...props}
			>
				<span className="flex items-center">
					{!hideSparkles && (
						<Sparkles className="mr-2 h-4 w-4 text-indigo-500" />
					)}
					{children}
				</span>
			</Button>
		);
	}
);

GlowButton.displayName = "GlowButton";
