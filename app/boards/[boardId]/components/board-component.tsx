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
import {
	updateBoardAction,
	updateTaskStatusAction,
} from "@/app/boards/actions";
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
			<div className="mb-6 flex items-center justify-between">
				<ProjectHeader
					title={board.name}
					description={board.description}
					features={board.features}
					onUpdateBoard={async (title, description, features) => {
						await updateBoardAction(board.id, {
							name: title,
							description,
							features,
						});
						loadTasks();
					}}
				/>
				<AddTaskDialog
					board={board}
					onTaskCreated={loadTasks}
					existingTasks={columns
						.flatMap((col) => col.tasks)
						.map((task) => `[${task.title}]`)
						.join(", ")}
				/>
			</div>

			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="flex h-[calc(100vh-12rem)] gap-6 overflow-hidden">
					{/* Backlog Column */}
					<div className="w-80 overflow-y-auto">
						<SortableContext items={[columns[0].id]}>
							<KanbanColumn column={columns[0]} />
						</SortableContext>
					</div>

					{/* Vertical Separator */}
					<div className="bg-border/50 mx-2 h-full w-px" />

					{/* Main Columns */}
					<div className="grid flex-1 grid-cols-3 gap-6 overflow-x-auto">
						<SortableContext items={columns.slice(1).map((col) => col.id)}>
							{columns.slice(1).map((column) => (
								<div key={column.id} className="overflow-y-auto">
									<KanbanColumn column={column} />
								</div>
							))}
						</SortableContext>
					</div>
				</div>

				<DragOverlay>
					{activeTask && (
						<Card className="bg-background/60 border-border/50 w-[300px] scale-105 border p-4 shadow-2xl backdrop-blur-sm">
							<p>{activeTask.title}</p>
						</Card>
					)}
				</DragOverlay>
			</DndContext>
		</>
	);
}
