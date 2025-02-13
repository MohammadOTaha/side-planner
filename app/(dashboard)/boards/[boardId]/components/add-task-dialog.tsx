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
import { Plus } from "lucide-react";
import { type Board } from "@/lib/db/schema";
import { createTaskAction } from "../actions";

interface Props {
	board: Board;
	onTaskCreated?: () => void;
}

export default function AddTaskDialog({ board, onTaskCreated }: Props) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await createTaskAction({
				title,
				description,
				boardId: board.id,
				status: "todo",
			});

			setTitle("");
			setDescription("");
			setOpen(false);
			onTaskCreated?.();
		} catch (error) {
			console.error("Failed to create task:", error);
			// You might want to show an error toast here
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Task
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create New Task</DialogTitle>
						<DialogDescription>
							Add a new task to your board. Click save when you're
							done.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Input
								id="title"
								placeholder="Task title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Textarea
								id="description"
								placeholder="Add a description..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							disabled={!title.trim() || isLoading}
						>
							{isLoading ? "Creating..." : "Create Task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
