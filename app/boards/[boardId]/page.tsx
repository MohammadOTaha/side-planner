import { Skeleton } from "@/components/ui/skeleton";
import { getBoard, getUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Board from "./components/board";

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

	const { boardId } = await params;

	const board = await getBoard(parseInt(boardId), user.id);
	if (!board) {
		redirect("/boards");
	}

	return (
		<div className="container mx-auto flex-1 space-y-6 py-6">
			<Suspense
				fallback={
					<div className="space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-8 w-[200px]" />
							<Skeleton className="h-4 w-[300px]" />
						</div>
						<div className="grid grid-cols-4 gap-6">
							{[...Array(4)].map((_, i) => (
								<Skeleton key={i} className="h-[500px] w-full" />
							))}
						</div>
					</div>
				}
			>
				<Board board={board} />
			</Suspense>
		</div>
	);
}
