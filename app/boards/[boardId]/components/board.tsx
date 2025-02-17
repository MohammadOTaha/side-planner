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
	defaultDropAnimationSideEffects,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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

const dropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: "0.5",
			},
		},
	}),
};

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

	const findContainer = (id: string) => {
		const container = columns.find((col) =>
			col.tasks.some((task) => task.id === id)
		);
		return container ? container.id : null;
	};

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

		const activeContainerId = findContainer(activeId);
		const overContainerId =
			over.data?.current?.type === "column" ? over.id : findContainer(overId);

		if (!activeContainerId || !overContainerId) return;

		// If items are in the same container, no need to update columns
		if (activeContainerId === overContainerId) return;

		setColumns((prev) => {
			const activeContainer = prev.find((col) => col.id === activeContainerId);
			const overContainer = prev.find((col) => col.id === overContainerId);

			if (!activeContainer || !overContainer) return prev;

			const activeIndex = activeContainer.tasks.findIndex(
				(task) => task.id === activeId
			);
			const overIndex =
				over.data?.current?.type === "column"
					? overContainer.tasks.length
					: overContainer.tasks.findIndex((task) => task.id === overId);

			const newIndex =
				over.data?.current?.type === "column"
					? overContainer.tasks.length
					: overIndex;

			// Log the position information
			console.log("Task Position Info:", {
				taskId: activeId,
				fromColumn: activeContainerId,
				toColumn: overContainerId,
				fromIndex: activeIndex,
				toIndex: newIndex,
				totalTasksInColumn: overContainer.tasks.length,
				isDirectlyOverColumn: over.data?.current?.type === "column",
			});

			return prev.map((col) => {
				if (col.id === activeContainerId) {
					return {
						...col,
						tasks: col.tasks.filter((task) => task.id !== activeId),
					};
				}
				if (col.id === overContainerId) {
					const updatedTasks = [...col.tasks];
					const movingTask = {
						...activeContainer.tasks[activeIndex],
						status: col.id,
					};
					updatedTasks.splice(newIndex, 0, movingTask);
					return {
						...col,
						tasks: updatedTasks,
					};
				}
				return col;
			});
		});
	};

	const handleDragEnd = async (event: any) => {
		const { active, over } = event;
		if (!over) {
			setActiveTask(null);
			return;
		}

		const activeId = active.id;
		const overId = over.id;

		const activeContainerId = findContainer(activeId);
		const overContainerId =
			over.data?.current?.type === "column" ? over.id : findContainer(overId);

		if (!activeContainerId || !overContainerId) {
			setActiveTask(null);
			return;
		}

		const activeContainer = columns.find((col) => col.id === activeContainerId);
		const overContainer = columns.find((col) => col.id === overContainerId);

		if (!activeContainer || !overContainer) {
			setActiveTask(null);
			return;
		}

		const activeIndex = activeContainer.tasks.findIndex(
			(task) => task.id === activeId
		);
		const overIndex =
			over.data?.current?.type === "column"
				? overContainer.tasks.length
				: overContainer.tasks.findIndex((task) => task.id === overId);

		const newIndex =
			over.data?.current?.type === "column"
				? overContainer.tasks.length
				: overIndex;

		try {
			const activeTask = activeContainer.tasks[activeIndex];

			// If in the same container, handle reordering
			if (activeContainerId === overContainerId) {
				setColumns((prev) => {
					return prev.map((col) => {
						if (col.id === activeContainerId) {
							const updatedTasks = arrayMove(col.tasks, activeIndex, newIndex);
							return { ...col, tasks: updatedTasks };
						}
						return col;
					});
				});
			}

			await updateTaskStatusAction(
				parseInt(activeTask.id),
				board.id,
				overContainerId,
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
				<div className="flex h-[calc(100vh-12rem)] gap-4 overflow-hidden">
					{/* Backlog Column */}
					<div className="w-[calc((100%-3rem)/4)] overflow-y-auto">
						<SortableContext
							items={columns[0].tasks.map((task) => task.id)}
							strategy={verticalListSortingStrategy}
						>
							<BoardColumn column={columns[0]} />
						</SortableContext>
					</div>

					{/* Vertical Separator */}
					<div className="bg-border/50 h-full w-px" />

					{/* Main Columns */}
					<div className="grid flex-1 grid-cols-3 gap-4 overflow-x-auto">
						{columns.slice(1).map((column) => (
							<div key={column.id} className="overflow-y-auto">
								<SortableContext
									items={column.tasks.map((task) => task.id)}
									strategy={verticalListSortingStrategy}
								>
									<BoardColumn column={column} />
								</SortableContext>
							</div>
						))}
					</div>
				</div>

				<DragOverlay dropAnimation={dropAnimation}>
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
