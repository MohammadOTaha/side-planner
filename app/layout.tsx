import { ThemeProvider } from "@/components/providers/theme-provider";
import { UserProvider } from "@/lib/auth";
import { getUser } from "@/lib/db/queries";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
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
					<Toaster
						theme="system"
						toastOptions={{
							classNames: {
								toast: "bg-white dark:bg-zinc-950 dark:border-zinc-800",
								title: "text-zinc-800 dark:text-zinc-100",
								description: "text-zinc-600 dark:text-zinc-400",
								actionButton: "bg-primary text-primary-foreground",
								cancelButton: "text-zinc-600 dark:text-zinc-400",
								success:
									"bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300",
								error:
									"bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-600 dark:text-red-300",
								info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-300",
								warning:
									"bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900 text-yellow-600 dark:text-yellow-300",
							},
						}}
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
