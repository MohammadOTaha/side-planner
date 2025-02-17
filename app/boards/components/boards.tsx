"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Board } from "@/lib/db/schema";
import { Layout, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createBoardAction, updateBoardAction } from "../actions";
import BoardDialog from "./board-dialog";
import DeleteBoardDialog from "./delete-board-dialog";

interface Props {
	initialBoards: Board[];
}

export default function BoardsComponent({ initialBoards }: Props) {
	const [boards, setBoards] = useState<Board[]>(initialBoards);
	const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

	const handleBoardCreated = (newBoard: Board) => {
		setBoards((prev) => [...prev, newBoard]);
	};

	const handleBoardUpdated = (updatedBoard: Board) => {
		setBoards((prev) =>
			prev.map((board) => (board.id === updatedBoard.id ? updatedBoard : board))
		);
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
				<BoardDialog
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
						className="group relative overflow-hidden border bg-card hover:bg-accent/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<Link href={`/boards/${board.id}`} className="block h-full">
							<CardHeader className="flex h-full items-center justify-center p-8">
								<CardTitle className="text-xl font-medium">
									{board.name}
								</CardTitle>
							</CardHeader>
						</Link>

						<CardContent className="absolute top-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
							<div className="flex gap-1.5">
								<BoardDialog
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
											variant="secondary"
											size="icon"
											className="h-8 w-8 rounded-full"
										>
											<Pencil className="h-4 w-4" />
										</Button>
									}
								/>
								<Button
									variant="secondary"
									size="icon"
									className="h-8 w-8 rounded-full"
									onClick={(e) => {
										e.preventDefault();
										setDeletingBoard(board);
									}}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}

				<Card className="group flex h-[140px] cursor-pointer items-center justify-center border-2 border-dashed hover:border-primary/50 hover:bg-accent/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
					<BoardDialog
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
							<div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
								<Plus className="h-6 w-6" />
								<p className="text-sm font-medium">Create New Board</p>
							</div>
						}
					/>
				</Card>
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
