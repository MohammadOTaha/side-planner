"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import KanbanTask from "@/app/(dashboard)/board/components/kanban-task";
import { cn } from "@/lib/utils";

interface Task {
	id: string;
	title: string;
	description?: string;
	status: "backlog" | "todo" | "in-progress" | "done";
	createdAt: Date;
}

interface Column {
	id: string;
	title: string;
	tasks: Task[];
}

interface Props {
	column: Column;
}

export default function KanbanColumn({ column }: Props) {
	const { setNodeRef, isOver } = useDroppable({
		id: column.id,
	});

	const isBacklog = column.id === "backlog";

	return (
		<Card
			className={cn(
				"bg-background border-border/40",
				isBacklog && "bg-muted/10"
			)}
		>
			<CardHeader className="p-4">
				<CardTitle className="text-sm font-medium flex items-center justify-between">
					{column.title}
					<span
						className={cn(
							"px-2 py-1 rounded-full text-xs",
							isBacklog
								? "bg-secondary/50 text-secondary-foreground"
								: "bg-muted/60 text-muted-foreground"
						)}
					>
						{column.tasks.length}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent
				ref={setNodeRef}
				className={cn(
					"p-2 transition-colors min-h-[500px]",
					"rounded-b-lg",
					isOver
						? "bg-blue-100"
						: isBacklog
						? "bg-muted/5"
						: "bg-muted/30"
				)}
			>
				<SortableContext
					items={column.tasks.map((task) => task.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="flex flex-col gap-2">
						{column.tasks.map((task) => (
							<KanbanTask key={task.id} task={task} />
						))}
					</div>
				</SortableContext>
			</CardContent>
		</Card>
	);
}
