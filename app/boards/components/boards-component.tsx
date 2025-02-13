"use client";

import { useState } from "react";
import { type Board } from "@/lib/db/schema";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Layout } from "lucide-react";
import Link from "next/link";
import AddBoardDialog from "./add-board-dialog";
import EditBoardDialog from "./edit-board-dialog";
import DeleteBoardDialog from "./delete-board-dialog";
import { format } from "date-fns";

interface Props {
	initialBoards: Board[];
}

export default function BoardsComponent({ initialBoards }: Props) {
	const [boards, setBoards] = useState<Board[]>(initialBoards);
	const [editingBoard, setEditingBoard] = useState<Board | null>(null);
	const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

	const handleBoardCreated = (newBoard: Board) => {
		setBoards((prev) => [...prev, newBoard]);
	};

	const handleBoardUpdated = (updatedBoard: Board) => {
		setBoards((prev) =>
			prev.map((board) =>
				board.id === updatedBoard.id ? updatedBoard : board
			)
		);
		setEditingBoard(null);
	};

	const handleBoardDeleted = (boardId: number) => {
		setBoards((prev) => prev.filter((board) => board.id !== boardId));
		setDeletingBoard(null);
	};

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">
						Boards
					</h1>
					<p className="text-muted-foreground">
						Create and manage your kanban boards
					</p>
				</div>
				<AddBoardDialog onBoardCreated={handleBoardCreated}>
					<Button size="sm">
						<Plus className="h-4 w-4 mr-2" />
						New Board
					</Button>
				</AddBoardDialog>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{boards.map((board) => (
					<Card
						key={board.id}
						className="group relative hover:shadow-lg transition-all duration-200 hover:border-primary/50"
					>
						<Link href={`/boards/${board.id}`}>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Layout className="h-5 w-5 text-primary" />
									{board.name}
								</CardTitle>
								{board.description && (
									<CardDescription className="line-clamp-2">
										{board.description}
									</CardDescription>
								)}
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Created{" "}
								{format(new Date(board.createdAt), "PP")}
							</CardContent>
						</Link>

						<CardFooter className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={(e) => {
										e.preventDefault();
										setEditingBoard(board);
									}}
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={(e) => {
										e.preventDefault();
										setDeletingBoard(board);
									}}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</CardFooter>
					</Card>
				))}

				<AddBoardDialog onBoardCreated={handleBoardCreated}>
					<Card className="flex items-center justify-center h-[200px] border-2 border-dashed hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors">
						<div className="flex flex-col items-center gap-2 text-muted-foreground">
							<Plus className="h-8 w-8" />
							<p className="text-sm font-medium">
								Create New Board
							</p>
						</div>
					</Card>
				</AddBoardDialog>
			</div>

			{/* Edit dialog */}
			{editingBoard && (
				<EditBoardDialog
					board={editingBoard}
					onBoardUpdated={handleBoardUpdated}
					onClose={() => setEditingBoard(null)}
				/>
			)}

			{/* Delete dialog */}
			{deletingBoard && (
				<DeleteBoardDialog
					board={deletingBoard}
					onBoardDeleted={handleBoardDeleted}
					onClose={() => setDeletingBoard(null)}
				/>
			)}
		</div>
	);
}
