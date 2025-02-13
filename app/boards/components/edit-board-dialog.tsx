"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateBoardAction } from "../actions";
import { type Board } from "@/lib/db/schema";

interface Props {
	board: Board;
	onBoardUpdated: (board: Board) => void;
	onClose: () => void;
}

export default function EditBoardDialog({
	board,
	onBoardUpdated,
	onClose,
}: Props) {
	const [name, setName] = useState(board.name);
	const [description, setDescription] = useState(board.description || "");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setName(board.name);
		setDescription(board.description || "");
	}, [board]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const updatedBoard = await updateBoardAction(board.id, {
				name,
				description,
			});

			onBoardUpdated(updatedBoard);
		} catch (error) {
			console.error("Failed to update board:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={() => onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit Board</DialogTitle>
						<DialogDescription>
							Make changes to your board. Click save when you're
							done.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<label htmlFor="name">Name</label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter board name"
								required
							/>
						</div>
						<div className="grid gap-2">
							<label htmlFor="description">Description</label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Enter board description"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							disabled={isLoading}
							className="w-full"
						>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
