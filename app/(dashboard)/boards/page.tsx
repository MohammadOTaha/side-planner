import { Suspense } from "react";
import { getUser, getUserBoards } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import BoardsComponent from "./components/boards-component";

export default async function BoardsPage() {
	const user = await getUser();
	if (!user) {
		redirect("/login");
	}

	const boards = await getUserBoards(user.id);

	return (
		<div className="h-full flex-1 flex flex-col gap-8 p-8">
			<div className="flex-1 space-y-4">
				<div className="border-b pb-4">
					<div className="container mx-auto">
						<h2 className="text-lg font-medium">Dashboard</h2>
					</div>
				</div>

				<div className="container mx-auto">
					<Suspense
						fallback={
							<div className="space-y-4">
								<div className="space-y-2">
									<Skeleton className="h-8 w-[200px]" />
									<Skeleton className="h-4 w-[300px]" />
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{[...Array(6)].map((_, i) => (
										<Skeleton
											key={i}
											className="h-[200px] w-full"
										/>
									))}
								</div>
							</div>
						}
					>
						<BoardsComponent initialBoards={boards} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
