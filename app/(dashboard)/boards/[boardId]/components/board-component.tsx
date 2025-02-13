"use client";

import { useState, useEffect, useCallback } from "react";
import {
	DndContext,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import KanbanColumn from "./kanban-column";
import { Card } from "@/components/ui/card";
import ProjectHeader from "./project-header";
import { type Board, type Task } from "@/lib/db/schema";
import { updateTaskStatusAction } from "@/app/(dashboard)/boards/actions";
import { getBoardTasks } from "@/lib/db/queries";
import AddTaskDialog from "./add-task-dialog";

interface KanbanTask extends Omit<Task, "id"> {
	id: string; // For DnD we need string IDs
}

interface Column {
	id: string;
	title: string;
	tasks: KanbanTask[];
}

interface Props {
	board: Board;
}

const INITIAL_COLUMNS: Column[] = [
	{
		id: "backlog",
		title: "Backlog",
		tasks: [],
	},
	{
		id: "todo",
		title: "To Do",
		tasks: [],
	},
	{
		id: "in-progress",
		title: "In Progress",
		tasks: [],
	},
	{
		id: "done",
		title: "Done",
		tasks: [],
	},
];

export default function BoardComponent({ board }: Props) {
	const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
	const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);

	const loadTasks = useCallback(async () => {
		const tasks = await getBoardTasks(board.id);
		const tasksByStatus = INITIAL_COLUMNS.map((column) => ({
			...column,
			tasks: tasks
				.filter((task) => task.status === column.id)
				.map((task) => ({
					...task,
					id: task.id.toString(), // Convert to string for DnD
				})),
		}));

		setColumns(tasksByStatus);
	}, [board.id]);

	// Load tasks when component mounts or board changes
	useEffect(() => {
		loadTasks();
	}, [loadTasks]);

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

	const handleDragEnd = async (event: any) => {
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

		// If dropping in the same column, do nothing
		if (activeColumn.id === overColumn.id) {
			setActiveTask(null);
			return;
		}

		// Optimistically update the UI
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

			// Add task to destination column
			newColumns[overColumnIndex] = {
				...columns[overColumnIndex],
				tasks: [
					...columns[overColumnIndex].tasks,
					{
						...activeTask,
						status: overColumn.id,
					},
				],
			};

			return newColumns;
		});

		setActiveTask(null);

		// Update task status in the database
		try {
			await updateTaskStatusAction(
				parseInt(activeTask.id),
				board.id,
				overColumn.id
			);
		} catch (error) {
			console.error("Failed to update task status:", error);
			// Revert the optimistic update on error
			loadTasks();
		}
	};

	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<ProjectHeader
					title={board.name}
					description={board.description || "Manage your tasks"}
				/>
				<AddTaskDialog board={board} onTaskCreated={loadTasks} />
			</div>

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
		</>
	);
}
