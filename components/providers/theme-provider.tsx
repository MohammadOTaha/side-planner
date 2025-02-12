import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider {...props}>
			<div
				className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
			>
				{children}
			</div>
		</NextThemesProvider>
	);
}
