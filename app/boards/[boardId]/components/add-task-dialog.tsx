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
import { Plus, Sparkles } from "lucide-react";
import { type Board } from "@/lib/db/schema";
import { createTaskAction } from "@/app/boards/actions";
import { GlowButton } from "@/components/ui/glow-button";

interface Props {
	board: Board;
	onTaskCreated?: () => void;
}

export default function AddTaskDialog({ board, onTaskCreated }: Props) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await createTaskAction({
				title,
				boardId: board.id,
				status: "todo",
			});

			setTitle("");
			setOpen(false);
			onTaskCreated?.();
		} catch (error) {
			console.error("Failed to create task:", error);
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
						<DialogTitle>Create Task</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="What do you want to get done?"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							disabled={!title.trim() || isLoading}
							variant="outline"
						>
							{isLoading ? "Creating..." : "Create Task"}
						</Button>
						<GlowButton
							type="submit"
							disabled={!title.trim() || isLoading}
						>
							{isLoading ? "Planning..." : "Plan with AI"}
						</GlowButton>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
