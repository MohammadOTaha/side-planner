"use client";

import { deleteTaskAction } from "@/app/boards/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type BoardTaskProps, type DraggableTask } from "@/lib/types/board";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, Minus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "timeago.js";
import EditTaskDialog from "./edit-task-dialog";

function TaskMetadata({
	complexity,
	priority,
	createdAt,
}: {
	complexity: string;
	priority: string;
	createdAt: Date;
}) {
	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case "low":
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="rounded-md bg-emerald-500/10 px-2 py-1">
									<ChevronDown className="h-4 w-4 fill-emerald-600 text-emerald-600" />
								</span>
							</TooltipTrigger>
							<TooltipContent>
								<p>Priority: Low</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				);
			case "medium":
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="rounded-md bg-amber-500/10 px-2 py-1">
									<Minus className="h-4 w-4 fill-amber-600 text-amber-600" />
								</span>
							</TooltipTrigger>
							<TooltipContent>
								<p>Priority: Medium</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				);
			case "high":
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="rounded-md bg-rose-500/10 px-2 py-1">
									<ChevronUp className="h-4 w-4 fill-rose-600 text-rose-600" />
								</span>
							</TooltipTrigger>
							<TooltipContent>
								<p>Priority: High</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				);
			default:
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="rounded-md bg-amber-500/10 px-2 py-1">
									<Minus className="h-4 w-4 fill-amber-600 text-amber-600" />
								</span>
							</TooltipTrigger>
							<TooltipContent>
								<p>Priority: Medium</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<span className="text-muted-foreground text-xs">{format(createdAt)}</span>
			<div className="flex items-center gap-1">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<span
								className={cn(
									"rounded-md px-2 py-1 text-xs font-medium",
									complexity === "easy"
										? "bg-emerald-500/10 text-emerald-600"
										: complexity === "medium"
											? "bg-amber-500/10 text-amber-600"
											: "bg-rose-500/10 text-rose-600"
								)}
							>
								{complexity.charAt(0).toUpperCase() + complexity.slice(1)}
							</span>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								Complexity:{" "}
								{complexity.charAt(0).toUpperCase() + complexity.slice(1)}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				{getPriorityIcon(priority)}
			</div>
		</div>
	);
}

function ParentTaskHeader({ title }: { title: string }) {
	return (
		<div className="border-border/40 bg-muted/30 absolute inset-x-0 top-0 rounded-t-md border-b px-3 py-1.5">
			<div className="flex items-center gap-2">
				<div className="bg-muted-foreground/50 h-1 w-1 rounded-full" />
				<p className="text-muted-foreground line-clamp-1 text-xs font-medium">
					{title}
				</p>
			</div>
		</div>
	);
}

export default function BoardTask({
	task,
	onRemoved,
	boardTasks,
}: BoardTaskProps & { onRemoved?: () => void; boardTasks?: DraggableTask[] }) {
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: "task",
			task,
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			await deleteTaskAction(parseInt(task.id), task.boardId);
			toast.success("Task deleted successfully");
			onRemoved?.();
		} catch (error) {
			console.error("Failed to delete task:", error);
			toast.error("Failed to delete task. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn("group relative", isDragging && "opacity-50")}
			{...attributes}
			{...listeners}
		>
			<Card
				id={`task-${task.id}`}
				className={cn(
					"hover:bg-muted/50 border-border/40 group flex cursor-grab flex-col transition-colors active:cursor-grabbing",
					task.parentId && "pt-7",
					"shadow-sm hover:shadow-md"
				)}
			>
				{task.parentId && task.parent && (
					<ParentTaskHeader title={task.parent.title} />
				)}
				<div className="flex-1 p-3">
					<div className="space-y-2">
						<p className="text-sm leading-normal font-medium break-words">
							{task.title}
						</p>
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="hover:bg-destructive/90 hover:text-destructive-foreground h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
									onClick={handleDelete}
									disabled={isDeleting}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
								<EditTaskDialog
									task={{
										...task,
										id: parseInt(task.id),
										boardId: task.boardId,
									}}
									boardTasks={boardTasks?.map((t) => ({
										...t,
										id: parseInt(t.id),
										boardId: t.boardId,
									}))}
									onTaskUpdated={onRemoved}
									trigger={
										<Button
											variant="ghost"
											size="icon"
											className="hover:bg-primary/90 hover:text-primary-foreground h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
										>
											<Pencil className="h-3.5 w-3.5" />
										</Button>
									}
								/>
							</div>
							<TaskMetadata
								complexity={task.complexity}
								priority={task.priority}
								createdAt={task.createdAt}
							/>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
