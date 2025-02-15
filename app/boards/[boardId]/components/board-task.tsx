"use client";

import { Card } from "@/components/ui/card";
import { type Task } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { format } from "timeago.js";

interface DraggableTask extends Omit<Task, "id"> {
	id: string; // For DnD we need string IDs
}

interface Props {
	task: DraggableTask;
}

export default function BoardTask({ task }: Props) {
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
				return <ArrowDown className="h-4 w-4 text-blue-500" />;
			case "medium":
				return <ArrowRight className="h-4 w-4 text-yellow-500" />;
			case "high":
				return <ArrowUp className="h-4 w-4 text-red-500" />;
			default:
				return <ArrowRight className="h-4 w-4 text-yellow-500" />;
		}
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				"hover:bg-muted/50 border-border/40 flex min-h-[80px] cursor-grab flex-col p-3 transition-colors active:cursor-grabbing",
				isDragging && "opacity-50"
			)}
			{...attributes}
			{...listeners}
		>
			<div className="flex-1">
				<div className="mb-2 flex items-center gap-2">
					{getPriorityIcon(task.priority)}
					<p className="text-sm font-medium break-words">{task.title}</p>
				</div>
			</div>
			<div className="mt-2 flex items-center justify-end gap-2">
				<span className="text-muted-foreground text-xs">
					{format(task.createdAt)}
				</span>
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
					{task.complexity.charAt(0).toUpperCase() + task.complexity.slice(1)}
				</span>
			</div>
		</Card>
	);
}
