"use client";

import { deleteTaskAction } from "@/app/boards/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type BoardTaskProps } from "@/lib/types/board";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowRight, ArrowUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "timeago.js";

export default function BoardTask({ task, onRemoved }: BoardTaskProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case "low":
				return (
					<span className="rounded-full bg-emerald-500/10 px-2 py-1">
						<ArrowDown className="h-4 w-4 text-emerald-600" />
					</span>
				);
			case "medium":
				return (
					<span className="rounded-full bg-amber-500/10 px-2 py-1">
						<ArrowRight className="h-4 w-4 text-amber-600" />
					</span>
				);
			case "high":
				return (
					<span className="rounded-full bg-rose-500/10 px-2 py-1">
						<ArrowUp className="h-4 w-4 text-rose-600" />
					</span>
				);
			default:
				return (
					<span className="rounded-full bg-amber-500/10 px-2 py-1">
						<ArrowRight className="h-4 w-4 text-amber-600" />
					</span>
				);
		}
	};

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			await deleteTaskAction(parseInt(task.id), task.boardId);
			onRemoved(task.id);
		} catch (error) {
			console.error("Failed to delete task:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Card
			id={`task-${task.id}`}
			ref={setNodeRef}
			style={style}
			className={cn(
				"hover:bg-muted/50 border-border/40 group flex min-h-[80px] cursor-grab flex-col transition-colors active:cursor-grabbing",
				isDragging && "opacity-50"
			)}
			{...attributes}
			{...listeners}
		>
			<div className="flex-1 px-3 py-2">
				<p className="text-sm font-black break-words">{task.title}</p>
			</div>

			<Card
				className={cn(
					"hover:bg-muted/50 border-border/40 group flex min-h-[80px] cursor-grab flex-col p-3 transition-colors active:cursor-grabbing",
					isDragging && "opacity-50"
				)}
			>
				<div className="flex-1">
					<div className="mb-2">
						<p className="text-sm font-medium break-words">{task.title}</p>
					</div>
				</div>

				<div className="mt-2 flex items-center justify-between gap-2 p-3">
					<Button
						variant="ghost"
						size="icon"
						className="hover:bg-destructive/90 hover:text-destructive-foreground h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-xs">
							{format(task.createdAt)}
						</span>
						<div className="flex items-center gap-1">
							<span
								className={cn(
									"rounded-full px-2 py-1 text-xs font-medium",
									task.complexity === "easy"
										? "bg-emerald-500/10 text-emerald-600"
										: task.complexity === "medium"
											? "bg-amber-500/10 text-amber-600"
											: "bg-rose-500/10 text-rose-600"
								)}
							>
								{task.complexity.charAt(0).toUpperCase() +
									task.complexity.slice(1)}
							</span>
							{getPriorityIcon(task.priority)}
						</div>
					</div>
				</div>
			</Card>
		</Card>
	);
}
