import { Skeleton } from "@/components/ui/skeleton";
import { getUser, getUserBoards } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import BoardsComponent from "./components/boards";

export default async function BoardsPage() {
	const user = await getUser();
	if (!user) {
		redirect("/login");
	}

	const boards = await getUserBoards(user.id);

	return (
		<div className="container mx-auto flex-1 space-y-6 py-6">
			<Suspense
				fallback={
					<div className="space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-8 w-[200px]" />
							<Skeleton className="h-4 w-[300px]" />
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{[...Array(6)].map((_, i) => (
								<Skeleton key={i} className="h-[200px] w-full" />
							))}
						</div>
					</div>
				}
			>
				<BoardsComponent initialBoards={boards} />
			</Suspense>
		</div>
	);
}
