"use client";

import {
	updateBoardAction,
	updateTaskStatusAction,
} from "@/app/boards/actions";
import { Card } from "@/components/ui/card";
import { getBoardTasks } from "@/lib/db/queries";
import {
	type BoardProps,
	type Column,
	type DraggableTask,
} from "@/lib/types/board";
import {
	DndContext,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useCallback, useEffect, useState } from "react";
import AddTaskDialog from "./add-task-dialog";
import BoardColumn from "./board-column";
import ProjectHeader from "./project-header";

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

export default function Board({ board }: BoardProps) {
	const [activeTask, setActiveTask] = useState<DraggableTask | null>(null);
	const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);

	const loadTasks = useCallback(async () => {
		const tasks = await getBoardTasks(board.id);
		const tasksByStatus = INITIAL_COLUMNS.map((column) => ({
			...column,
			tasks: tasks
				.filter((task) => task.status === column.id)
				.map((task) => ({
					...task,
					id: task.id.toString(),
					parent: task.parent
						? {
								...task.parent,
								id: task.parent.id.toString(),
							}
						: undefined,
				})),
		}));

		setColumns(tasksByStatus);
	}, [board.id]);

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

	const handleDragOver = (event: any) => {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		// Find the containers
		const activeContainer = columns.find((col) =>
			col.tasks.some((task) => task.id === activeId)
		);
		const overContainer =
			over.data?.current?.type === "column"
				? columns.find((col) => col.id === overId)
				: columns.find((col) => col.tasks.some((task) => task.id === overId));

		if (!activeContainer || !overContainer) return;

		// If items are in different containers
		if (activeContainer !== overContainer) {
			setColumns((prev) => {
				const activeItems = activeContainer.tasks;
				const overItems = overContainer.tasks;

				// Find the indexes
				const activeIndex = activeItems.findIndex(
					(item) => item.id === activeId
				);
				const overIndex =
					over.data?.current?.type === "column"
						? overItems.length
						: overItems.findIndex((item) => item.id === overId);

				let newIndex: number;
				if (over.data?.current?.type === "column") {
					// We're dropping directly on a column
					newIndex = overItems.length;
				} else {
					const isBelowOverItem =
						active.rect.current.translated &&
						active.rect.current.translated.top >
							over.rect.top + over.rect.height / 2;

					newIndex = isBelowOverItem ? overIndex + 1 : overIndex;
				}

				const updatedColumns = prev.map((col) => {
					if (col.id === activeContainer.id) {
						return {
							...col,
							tasks: col.tasks.filter((item) => item.id !== activeId),
						};
					}
					if (col.id === overContainer.id) {
						const updatedItems = [...col.tasks];
						const movingItem = {
							...activeItems[activeIndex],
							status: col.id,
						};
						updatedItems.splice(newIndex, 0, movingItem);
						return {
							...col,
							tasks: updatedItems,
						};
					}
					return col;
				});

				return updatedColumns;
			});
		}
	};

	const handleDragEnd = async (event: any) => {
		const { active, over } = event;
		if (!over) {
			setActiveTask(null);
			return;
		}

		const activeId = active.id;
		const overId = over.id;

		const activeContainer = columns.find((col) =>
			col.tasks.some((task) => task.id === activeId)
		);
		const overContainer =
			over.data?.current?.type === "column"
				? columns.find((col) => col.id === overId)
				: columns.find((col) => col.tasks.some((task) => task.id === overId));

		if (!activeContainer || !overContainer) {
			setActiveTask(null);
			return;
		}

		const activeIndex = activeContainer.tasks.findIndex(
			(item) => item.id === activeId
		);
		const overIndex =
			over.data?.current?.type === "column"
				? overContainer.tasks.length
				: overContainer.tasks.findIndex((item) => item.id === overId);

		let newIndex: number;
		if (over.data?.current?.type === "column") {
			newIndex = overContainer.tasks.length;
		} else {
			const isBelowOverItem =
				active.rect.current.translated &&
				active.rect.current.translated.top >
					over.rect.top + over.rect.height / 2;

			newIndex = isBelowOverItem ? overIndex + 1 : overIndex;
		}

		// If in the same container and position hasn't changed
		if (activeContainer === overContainer && activeIndex === newIndex) {
			setActiveTask(null);
			return;
		}

		try {
			const activeTask = activeContainer.tasks[activeIndex];
			await updateTaskStatusAction(
				parseInt(activeTask.id),
				board.id,
				overContainer.id,
				newIndex
			);
		} catch (error) {
			console.error("Failed to update task status:", error);
			loadTasks();
		}

		setActiveTask(null);
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
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div className="flex h-[calc(100vh-12rem)] gap-6 overflow-hidden">
					{/* Backlog Column */}
					<div className="w-80 overflow-y-auto">
						<BoardColumn column={columns[0]} />
					</div>

					{/* Vertical Separator */}
					<div className="bg-border/50 mx-2 h-full w-px" />

					{/* Main Columns */}
					<div className="grid flex-1 grid-cols-3 gap-6 overflow-x-auto">
						{columns.slice(1).map((column) => (
							<div key={column.id} className="overflow-y-auto">
								<BoardColumn column={column} />
							</div>
						))}
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
