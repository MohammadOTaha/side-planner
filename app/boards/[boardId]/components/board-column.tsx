"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type BoardColumnProps } from "@/lib/types/board";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	ArrowPathIcon,
	CheckCircleIcon,
	DocumentTextIcon,
	FolderIcon,
	TagIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import DraggableTask from "./board-task";

export default function BoardColumn({ column }: BoardColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: column.id,
	});
	const isBacklog = column.id === "backlog";
	const [localTasks, setLocalTasks] = useState(column.tasks);

	useEffect(() => {
		setLocalTasks(column.tasks);
	}, [column.tasks]);

	const handleTaskRemoved = useCallback((taskId: string) => {
		setLocalTasks((prev) => prev.filter((task) => task.id !== taskId));
	}, []);

	const getColumnIcon = (id: string) => {
		switch (id) {
			case "backlog":
				return <FolderIcon className="mr-2 h-5 w-5 text-blue-500" />;
			case "todo":
				return <DocumentTextIcon className="mr-2 h-5 w-5 text-yellow-500" />;
			case "in-progress":
				return <ArrowPathIcon className="mr-2 h-5 w-5 text-orange-500" />;
			case "done":
				return <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />;
			default:
				return <TagIcon className="mr-2 h-5 w-5 text-gray-500" />;
		}
	};

	return (
		<Card
			data-column-id={column.id}
			className={cn(
				"bg-background border-border/40 flex h-full flex-col",
				isBacklog && "bg-muted/10"
			)}
		>
			<CardHeader className="p-4">
				<CardTitle className="flex items-center justify-between text-sm font-medium">
					<div className="flex items-center">
						{getColumnIcon(column.id)}
						<span>{column.title}</span>
					</div>
					<span
						className={cn(
							"rounded-full px-2 py-1 text-xs",
							isBacklog
								? "bg-secondary/50 text-secondary-foreground"
								: "bg-muted/60 text-muted-foreground"
						)}
					>
						{localTasks.length}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent
				ref={setNodeRef}
				className={cn(
					"flex-1 overflow-y-auto p-2 transition-colors",
					"rounded-b-lg",
					isOver ? "bg-blue-100/10" : isBacklog ? "bg-muted/5" : "bg-muted/30"
				)}
			>
				<SortableContext
					items={localTasks.map((task) => task.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="flex flex-col gap-3">
						{localTasks.map((task) => (
							<DraggableTask
								key={task.id}
								task={task}
								onRemoved={handleTaskRemoved}
							/>
						))}
					</div>
				</SortableContext>
			</CardContent>
		</Card>
	);
}
