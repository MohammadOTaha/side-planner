import { ThemeProvider } from "@/components/providers/theme-provider";
import { UserProvider } from "@/lib/auth";
import { getUser } from "@/lib/db/queries";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Next.js SaaS Starter",
	description: "Get started quickly with Next.js, Postgres, and Stripe.",
};

export const viewport: Viewport = {
	maximumScale: 1,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	let userPromise = getUser();

	return (
		<html lang="en" suppressHydrationWarning>
			<body className="bg-background min-h-screen font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<UserProvider userPromise={userPromise}>
						<main className="relative flex min-h-screen flex-col">
							{children}
						</main>
					</UserProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
