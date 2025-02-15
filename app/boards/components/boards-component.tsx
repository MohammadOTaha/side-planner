"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type Board } from "@/lib/db/schema";
import { format } from "date-fns";
import { Layout, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ProjectDialog from "../[boardId]/components/project-dialog";
import { createBoardAction, updateBoardAction } from "../actions";
import DeleteBoardDialog from "./delete-board-dialog";

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
			prev.map((board) => (board.id === updatedBoard.id ? updatedBoard : board))
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
					<h1 className="text-3xl font-bold tracking-tight">Boards</h1>
					<p className="text-muted-foreground">
						Create and manage your kanban boards
					</p>
				</div>
				<ProjectDialog
					mode="add"
					onSubmit={async (name, description, features) => {
						const board = await createBoardAction({
							name,
							description,
							features,
						});
						handleBoardCreated(board);
					}}
					trigger={
						<Button size="sm">
							<Plus className="mr-2 h-4 w-4" />
							New Board
						</Button>
					}
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{boards.map((board) => (
					<Card
						key={board.id}
						className="group hover:border-primary/50 relative transition-all duration-200 hover:shadow-lg"
					>
						<Link href={`/boards/${board.id}`}>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Layout className="text-primary h-5 w-5" />
									{board.name}
								</CardTitle>
								{board.description && (
									<CardDescription className="line-clamp-2">
										{board.description}
									</CardDescription>
								)}
							</CardHeader>
							<CardContent className="text-muted-foreground text-sm">
								Created {format(new Date(board.createdAt), "PP")}
							</CardContent>
						</Link>

						<CardFooter className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
							<div className="flex gap-1">
								<ProjectDialog
									mode="edit"
									board={board}
									onSubmit={async (name, description, features) => {
										const updatedBoard = await updateBoardAction(board.id, {
											name,
											description,
											features,
										});
										handleBoardUpdated(updatedBoard);
									}}
									trigger={
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={(e) => {
												e.preventDefault();
											}}
										>
											<Pencil className="h-4 w-4" />
										</Button>
									}
								/>
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

				<ProjectDialog
					mode="add"
					onSubmit={async (name, description, features) => {
						const board = await createBoardAction({
							name,
							description,
							features,
						});
						handleBoardCreated(board);
					}}
					trigger={
						<Card className="hover:border-primary hover:bg-primary/5 flex h-[200px] cursor-pointer items-center justify-center border-2 border-dashed transition-colors">
							<div className="text-muted-foreground flex flex-col items-center gap-2">
								<Plus className="h-8 w-8" />
								<p className="text-sm font-medium">Create New Board</p>
							</div>
						</Card>
					}
				/>
			</div>

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
