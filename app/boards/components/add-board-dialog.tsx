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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBoardAction } from "../actions";
import { type Board } from "@/lib/db/schema";
import { Plus } from "lucide-react";

interface Props {
	onBoardCreated?: (board: Board) => void;
	children?: React.ReactNode;
}

export default function AddBoardDialog({ onBoardCreated, children }: Props) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const board = await createBoardAction({
				name,
				description,
			});

			setOpen(false);
			setName("");
			setDescription("");
			onBoardCreated?.(board);
		} catch (error) {
			console.error("Failed to create board:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Board
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create New Board</DialogTitle>
						<DialogDescription>
							Create a new board to organize your tasks. Click save when you're
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
						<Button type="submit" disabled={isLoading} className="w-full">
							{isLoading ? "Creating..." : "Create Board"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
