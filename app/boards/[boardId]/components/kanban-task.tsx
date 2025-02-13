"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Task } from "@/lib/db/schema";
import { format } from "timeago.js";

interface KanbanTask extends Omit<Task, "id"> {
	id: string; // For DnD we need string IDs
}

interface Props {
	task: KanbanTask;
}

export default function KanbanTask({ task }: Props) {
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

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				"p-3 cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors border-border/40",
				isDragging && "opacity-50"
			)}
			{...attributes}
			{...listeners}
		>
			<div className="flex items-center justify-between gap-2">
				<p className="text-sm font-medium truncate flex-1">
					{task.title}
				</p>
				<span className="text-xs text-muted-foreground whitespace-nowrap">
					{format(task.createdAt)}
				</span>
			</div>
		</Card>
	);
}
