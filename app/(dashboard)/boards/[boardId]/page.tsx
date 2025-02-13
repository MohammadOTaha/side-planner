import { Suspense } from "react";
import { getUser, getBoard } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import BoardComponent from "./components/board-component";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
	params: {
		boardId: string;
	};
}

export default async function BoardPage({ params }: Props) {
	const user = await getUser();
	if (!user) {
		redirect("/login");
	}

	const board = await getBoard(parseInt(params.boardId), user.id);
	if (!board) {
		redirect("/boards");
	}

	return (
		<div className="h-full flex-1 flex flex-col gap-8 p-8">
			<div className="flex-1 space-y-4">
				<div className="container mx-auto">
					<Suspense
						fallback={
							<div className="space-y-4">
								<div className="space-y-2">
									<Skeleton className="h-8 w-[200px]" />
									<Skeleton className="h-4 w-[300px]" />
								</div>
								<div className="grid grid-cols-4 gap-6">
									{[...Array(4)].map((_, i) => (
										<Skeleton
											key={i}
											className="h-[500px] w-full"
										/>
									))}
								</div>
							</div>
						}
					>
						<BoardComponent board={board} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
