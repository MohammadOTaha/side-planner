"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { deleteBoardAction } from "../actions";
import { type Board } from "@/lib/db/schema";

interface Props {
	board: Board;
	onBoardDeleted: (boardId: number) => void;
	onClose: () => void;
}

export default function DeleteBoardDialog({
	board,
	onBoardDeleted,
	onClose,
}: Props) {
	const [isLoading, setIsLoading] = useState(false);

	const handleDelete = async () => {
		setIsLoading(true);

		try {
			await deleteBoardAction(board.id);
			onBoardDeleted(board.id);
		} catch (error) {
			console.error("Failed to delete board:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={() => onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Delete Board</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this board? This action
						cannot be undone and all tasks in this board will be
						deleted.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isLoading}
					>
						{isLoading ? "Deleting..." : "Delete Board"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
