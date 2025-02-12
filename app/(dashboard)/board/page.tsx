"use client";

import { useState } from "react";
import {
	DndContext,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "@/app/(dashboard)/board/components/kanban-column";
import { Card } from "@/components/ui/card";
import ProjectHeader from "@/app/(dashboard)/board/components/project-header";

interface Task {
	id: string;
	title: string;
	description?: string;
	status: "backlog" | "todo" | "in-progress" | "done";
	createdAt: Date;
}

interface TaskData {
	title: string;
	description?: string;
}

interface Column {
	id: string;
	title: string;
	tasks: Task[];
}

const initialColumns: Column[] = [
	{
		id: "backlog",
		title: "Backlog",
		tasks: [
			{
				id: "5",
				title: "Implement dark mode",
				status: "backlog",
				createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
			},
			{
				id: "6",
				title: "Add user settings",
				status: "backlog",
				createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
			},
		],
	},
	{
		id: "todo",
		title: "To Do",
		tasks: [
			{
				id: "1",
				title: "Research competitors",
				status: "todo",
				createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
			},
			{
				id: "2",
				title: "Design homepage",
				status: "todo",
				createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
			},
		],
	},
	{
		id: "in-progress",
		title: "In Progress",
		tasks: [
			{
				id: "3",
				title: "Implement authentication",
				status: "in-progress",
				createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
			},
		],
	},
	{
		id: "done",
		title: "Done",
		tasks: [
			{
				id: "4",
				title: "Project setup",
				status: "done",
				createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
			},
		],
	},
];

export default function BoardPage() {
	const [columns, setColumns] = useState<Column[]>(initialColumns);
	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 250,
				tolerance: 5,
			},
		})
	);

	const handleDragStart = (event: any) => {
		const { active } = event;
		const task = columns
			.flatMap((col) => col.tasks)
			.find((task) => task.id === active.id);
		setActiveTask(task || null);
	};

	const handleDragEnd = (event: any) => {
		const { active, over } = event;

		if (!over) {
			setActiveTask(null);
			return;
		}

		const activeTask = columns
			.flatMap((col) => col.tasks)
			.find((task) => task.id === active.id);

		const activeColumn = columns.find((col) =>
			col.tasks.some((task) => task.id === active.id)
		);

		const overColumn = columns.find((col) => col.id === over.id);

		if (!activeTask || !activeColumn || !overColumn) {
			setActiveTask(null);
			return;
		}

		setColumns((columns) => {
			const activeColumnIndex = columns.findIndex(
				(col) => col.id === activeColumn.id
			);
			const overColumnIndex = columns.findIndex(
				(col) => col.id === overColumn.id
			);

			const newColumns = [...columns];

			// Remove task from source column
			newColumns[activeColumnIndex] = {
				...columns[activeColumnIndex],
				tasks: columns[activeColumnIndex].tasks.filter(
					(task) => task.id !== activeTask.id
				),
			};

			if (activeColumn.id === overColumn.id) {
				// If dragging within the same column, use the updated tasks array from newColumns after removal
				newColumns[overColumnIndex] = {
					...columns[overColumnIndex],
					tasks: [
						...newColumns[activeColumnIndex].tasks,
						{
							...activeTask,
							status: overColumn.id as Task["status"],
						},
					],
				};
			} else {
				// Add task to destination column
				newColumns[overColumnIndex] = {
					...columns[overColumnIndex],
					tasks: [
						...columns[overColumnIndex].tasks,
						{
							...activeTask,
							status: overColumn.id as Task["status"],
						},
					],
				};
			}

			return newColumns;
		});

		setActiveTask(null);
	};

	const handleAddTask = (taskData: TaskData) => {
		setColumns((prevColumns) => {
			const newColumns = [...prevColumns];
			const todoColumn = newColumns[0];
			todoColumn.tasks.push({
				id: Math.random().toString(36).substr(2, 9),
				title: taskData.title,
				description: taskData.description,
				status: "backlog",
				createdAt: new Date(), // Add creation timestamp
			});
			return newColumns;
		});
	};

	return (
		<div className="p-6 max-w-[1600px] mx-auto">
			<ProjectHeader
				title="Kanban Board"
				description="A drag-and-drop kanban board for managing tasks and projects."
			/>

			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="flex gap-6">
					{/* Backlog Column */}
					<div className="w-80">
						<SortableContext items={[columns[0].id]}>
							<KanbanColumn column={columns[0]} />
						</SortableContext>
					</div>

					{/* Vertical Separator */}
					<div className="w-px bg-border/50 mx-2" />

					{/* Main Columns */}
					<div className="grid grid-cols-3 gap-6 flex-1">
						<SortableContext
							items={columns.slice(1).map((col) => col.id)}
						>
							{columns.slice(1).map((column) => (
								<KanbanColumn key={column.id} column={column} />
							))}
						</SortableContext>
					</div>
				</div>

				<DragOverlay>
					{activeTask && (
						<Card className="p-4 w-[300px] bg-background/60 backdrop-blur-sm shadow-2xl border border-border/50 scale-105">
							<p>{activeTask.title}</p>
						</Card>
					)}
				</DragOverlay>
			</DndContext>
		</div>
	);
}
