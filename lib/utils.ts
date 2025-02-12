import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Typography scale (in pixels)
export const typography = {
	h1: "text-4xl font-bold tracking-tighter",
	h2: "text-3xl font-bold tracking-tight",
	h3: "text-2xl font-bold tracking-tight",
	h4: "text-xl font-semibold tracking-tight",
	h5: "text-lg font-semibold tracking-tight",
	h6: "text-base font-semibold tracking-tight",
	p: "text-base leading-7",
	small: "text-sm leading-6",
	tiny: "text-xs leading-5",
	mono: "font-mono text-sm",
} as const;

// Spacing scale (in rem)
export const spacing = {
	0: "0",
	px: "1px",
	0.5: "0.125rem",
	1: "0.25rem",
	1.5: "0.375rem",
	2: "0.5rem",
	2.5: "0.625rem",
	3: "0.75rem",
	3.5: "0.875rem",
	4: "1rem",
	5: "1.25rem",
	6: "1.5rem",
	7: "1.75rem",
	8: "2rem",
	9: "2.25rem",
	10: "2.5rem",
	11: "2.75rem",
	12: "3rem",
	14: "3.5rem",
	16: "4rem",
	20: "5rem",
	24: "6rem",
	28: "7rem",
	32: "8rem",
	36: "9rem",
	40: "10rem",
	44: "11rem",
	48: "12rem",
	52: "13rem",
	56: "14rem",
	60: "15rem",
	64: "16rem",
	72: "18rem",
	80: "20rem",
	96: "24rem",
} as const;
