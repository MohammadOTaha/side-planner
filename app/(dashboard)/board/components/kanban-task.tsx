"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { format } from "timeago.js";

interface Task {
	id: string;
	title: string;
	description?: string;
	status: "backlog" | "todo" | "in-progress" | "done";
	createdAt: Date;
}

interface Props {
	task: Task;
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

	const isBacklog = task.status === "backlog";

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				"group relative hover:ring-1 hover:ring-primary/30 transition-all cursor-grab active:cursor-grabbing",
				"border border-border/50 shadow-sm hover:shadow-md",
				isDragging &&
					"opacity-50 ring-1 ring-primary shadow-lg scale-105",
				isBacklog && "bg-card hover:bg-card/80",
				!isBacklog && "bg-background"
			)}
			{...attributes}
			{...listeners}
		>
			<CardContent className="p-3">
				<div className="flex items-center justify-between gap-2">
					<span className="text-sm">{task.title}</span>
					{task.description && (
						<span className="text-xs text-muted-foreground truncate max-w-[120px]">
							{task.description}
						</span>
					)}
				</div>
				<div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
					<Clock className="h-3 w-3" />
					<span>{format(task.createdAt)}</span>
				</div>
			</CardContent>
		</Card>
	);
}
