"use client";

import { updateTaskAction } from "@/app/boards/actions";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type Task } from "@/lib/db/schema";
import { ChevronDown, ChevronUp, Minus, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
	task: Task;
	boardTasks?: Task[];
	onTaskUpdated: () => void;
	trigger?: React.ReactNode;
}

export default function EditTaskDialog({
	task,
	boardTasks,
	onTaskUpdated,
	trigger,
}: Props) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState(task.title);
	const [complexity, setComplexity] = useState(task.complexity);
	const [priority, setPriority] = useState(task.priority);
	const [parentId, setParentId] = useState<number | null>(task.parentId);
	const [isLoading, setIsLoading] = useState(false);

	// Reset form state when task changes
	useEffect(() => {
		setTitle(task.title);
		setComplexity(task.complexity);
		setPriority(task.priority);
		setParentId(task.parentId);
	}, [task]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await updateTaskAction(task.id, task.boardId, {
				title: title.trim(),
				complexity,
				priority,
				parentId,
			});
			toast.success("Task updated successfully");
			onTaskUpdated();
			setOpen(false);
		} catch (error) {
			console.error("Failed to update task:", error);
			toast.error("Failed to update task. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Filter out the current task and its children from potential parent tasks
	const availableParentTasks = (boardTasks || []).filter((t) => {
		// Don't allow a task to be its own parent
		if (t.id === task.id) return false;
		// Don't allow a task to be parented to one of its children
		if (t.parentId === task.id) return false;
		// Don't allow circular dependencies
		let currentParent = t.parentId;
		while (currentParent) {
			if (currentParent === task.id) return false;
			const parent = boardTasks?.find((p) => p.id === currentParent);
			currentParent = parent?.parentId || null;
		}
		return true;
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="ghost" size="icon" className="h-6 w-6">
						<Pencil className="h-3.5 w-3.5" />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit Task</DialogTitle>
						<DialogDescription>
							Make changes to your task. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="flex flex-col space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="What do you want to get done?"
							/>
						</div>
						<div className="flex flex-col space-y-2">
							<Label htmlFor="parent">Parent Task (Optional)</Label>
							<Select
								value={parentId?.toString() ?? "none"}
								onValueChange={(value) =>
									setParentId(value === "none" ? null : parseInt(value))
								}
							>
								<SelectTrigger id="parent">
									<SelectValue placeholder="Select a parent task" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No Parent</SelectItem>
									{availableParentTasks.map((t) => (
										<SelectItem key={t.id} value={t.id.toString()}>
											{t.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col space-y-2">
								<Label htmlFor="complexity">Complexity</Label>
								<Select value={complexity} onValueChange={setComplexity}>
									<SelectTrigger id="complexity">
										<SelectValue placeholder="Select complexity" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="easy">
											<div className="flex items-center">
												<div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
												Easy
											</div>
										</SelectItem>
										<SelectItem value="medium">
											<div className="flex items-center">
												<div className="mr-2 h-2 w-2 rounded-full bg-amber-500" />
												Medium
											</div>
										</SelectItem>
										<SelectItem value="hard">
											<div className="flex items-center">
												<div className="mr-2 h-2 w-2 rounded-full bg-rose-500" />
												Hard
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col space-y-2">
								<Label htmlFor="priority">Priority</Label>
								<Select value={priority} onValueChange={setPriority}>
									<SelectTrigger id="priority">
										<SelectValue placeholder="Select priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">
											<div className="flex items-center">
												<ChevronDown className="mr-2 h-4 w-4 text-blue-500" />
												Low
											</div>
										</SelectItem>
										<SelectItem value="medium">
											<div className="flex items-center">
												<Minus className="mr-2 h-4 w-4 text-yellow-500" />
												Medium
											</div>
										</SelectItem>
										<SelectItem value="high">
											<div className="flex items-center">
												<ChevronUp className="mr-2 h-4 w-4 text-red-500" />
												High
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isLoading} className="w-full">
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
