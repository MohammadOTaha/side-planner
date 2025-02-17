"use client";

import {
	createTaskAction,
	getAITaskSuggestionsAction,
} from "@/app/boards/actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { GlowButton } from "@/components/ui/glow-button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type AITaskSuggestion } from "@/lib/types/board";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AITaskSuggestions } from "./ai-task-suggestions";
import { RegularTaskForm } from "./regular-task-form";
import { type AddTaskDialogProps, type RegularTaskData } from "./types";

export default function AddTaskDialog({
	board,
	onTaskCreated,
	existingTasks,
}: AddTaskDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isAiMode, setIsAiMode] = useState(false);
	const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
	const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
	const [selectedSubtasks, setSelectedSubtasks] = useState<Set<string>>(
		new Set()
	);
	const [priority, setPriority] = useState("medium");

	const handleRegularSubmit = async (data: RegularTaskData) => {
		try {
			setIsLoading(true);
			await createTaskAction({
				...data,
				boardId: board.id,
				status: "backlog",
				isVisible: true,
			});
			toast.success("Task created successfully");
			onTaskCreated?.();
			setOpen(false);
		} catch (error) {
			console.error("Failed to create task:", error);
			toast.error("Failed to create task. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleAIPlan = async (title: string) => {
		setIsLoading(true);
		setIsAiMode(true);
		try {
			const suggestions = await getAITaskSuggestionsAction(
				board.name,
				board.description || "",
				board.features
					?.split("\n")
					.map((feature) => `[${feature}]`)
					.join(", ") || "",
				title,
				existingTasks || ""
			);
			setSuggestions(suggestions);
			toast.success("AI suggestions generated successfully");
		} catch (error) {
			console.error("Failed to get AI suggestions:", error);
			toast.error("Failed to generate AI suggestions. Please try again.");
			setIsAiMode(false);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAISubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setIsLoading(true);

			const promises = Array.from(selectedTasks).map(async (index) => {
				const suggestion = suggestions[index];
				const selectedSubtasksForParent = suggestion.subtasks?.filter(
					(_, subtaskIndex) => selectedSubtasks.has(`${index}-${subtaskIndex}`)
				);

				// Create task if it has no subtasks or has selected subtasks
				if (!suggestion.subtasks || selectedSubtasksForParent?.length! > 0) {
					const task = await createTaskAction({
						title: suggestion.title,
						boardId: board.id,
						complexity: suggestion.complexity.toLowerCase(),
						priority,
						parentId: null,
						status: "backlog",
						isVisible:
							!suggestion.subtasks || selectedSubtasksForParent?.length === 0,
					});

					// Create only selected subtasks
					if (
						selectedSubtasksForParent &&
						selectedSubtasksForParent.length > 0
					) {
						const subtaskPromises = selectedSubtasksForParent.map((subtask) =>
							createTaskAction({
								title: subtask.title,
								boardId: board.id,
								complexity: subtask.complexity.toLowerCase(),
								priority,
								parentId: task.id,
								status: "backlog",
								isVisible: true,
							})
						);
						await Promise.all(subtaskPromises);
					}
				}
			});

			await Promise.all(promises);
			const totalTasks = Array.from(selectedTasks).filter(
				(index) =>
					!suggestions[index].subtasks ||
					Array.from(selectedSubtasks).some((key) =>
						key.startsWith(`${index}-`)
					)
			).length;
			const totalSelectedSubtasks = Array.from(selectedSubtasks).length;
			const message =
				totalSelectedSubtasks > 0
					? `Added ${totalSelectedSubtasks} subtask${
							totalSelectedSubtasks === 1 ? "" : "s"
						} to the board`
					: `Added ${totalTasks} task${totalTasks === 1 ? "" : "s"} to the board`;
			toast.success(message);

			onTaskCreated?.();
			setOpen(false);
			resetState();
		} catch (error) {
			console.error("Failed to create tasks:", error);
			toast.error("Failed to create tasks. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const toggleTaskSelection = (index: number) => {
		const newSelected = new Set(selectedTasks);
		if (newSelected.has(index)) {
			newSelected.delete(index);
			// Remove all subtask selections for this task
			const newSelectedSubtasks = new Set(selectedSubtasks);
			Array.from(selectedSubtasks).forEach((key) => {
				if (key.startsWith(`${index}-`)) {
					newSelectedSubtasks.delete(key);
				}
			});
			setSelectedSubtasks(newSelectedSubtasks);
		} else {
			newSelected.add(index);
			// Select all subtasks for this task
			const newSelectedSubtasks = new Set(selectedSubtasks);
			suggestions[index].subtasks?.forEach(
				(_: AITaskSuggestion, subtaskIndex: number) => {
					newSelectedSubtasks.add(`${index}-${subtaskIndex}`);
				}
			);
			setSelectedSubtasks(newSelectedSubtasks);
		}
		setSelectedTasks(newSelected);
	};

	const toggleSubtaskSelection = (
		taskIndex: number,
		subtaskIndex: number,
		event: React.MouseEvent
	) => {
		event.stopPropagation();
		const subtaskKey = `${taskIndex}-${subtaskIndex}`;
		const newSelectedSubtasks = new Set(selectedSubtasks);

		if (newSelectedSubtasks.has(subtaskKey)) {
			newSelectedSubtasks.delete(subtaskKey);
			// If no subtasks selected, remove parent task selection
			if (
				!Array.from(newSelectedSubtasks).some((key) =>
					key.startsWith(`${taskIndex}-`)
				)
			) {
				const newSelectedTasks = new Set(selectedTasks);
				newSelectedTasks.delete(taskIndex);
				setSelectedTasks(newSelectedTasks);
			}
		} else {
			newSelectedSubtasks.add(subtaskKey);
			// Add parent task selection if not already selected
			const newSelectedTasks = new Set(selectedTasks);
			newSelectedTasks.add(taskIndex);
			setSelectedTasks(newSelectedTasks);
		}

		setSelectedSubtasks(newSelectedSubtasks);
	};

	const resetState = () => {
		setIsAiMode(false);
		setSuggestions([]);
		setSelectedTasks(new Set());
		setSelectedSubtasks(new Set());
		setPriority("medium");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Task
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (isAiMode) {
							void handleAISubmit(e);
						}
					}}
				>
					<DialogHeader>
						<DialogTitle>Create Task</DialogTitle>
						{isAiMode && (
							<DialogDescription>
								Select the tasks you want to add to your board
							</DialogDescription>
						)}
					</DialogHeader>
					<div className="py-2">
						{!isAiMode ? (
							<RegularTaskForm
								board={board}
								isLoading={isLoading}
								onSubmit={handleRegularSubmit}
								onAIPlan={handleAIPlan}
							/>
						) : (
							<AITaskSuggestions
								board={board}
								suggestions={suggestions}
								isLoading={isLoading}
								selectedTasks={selectedTasks}
								selectedSubtasks={selectedSubtasks}
								onTaskSelect={toggleTaskSelection}
								onSubtaskSelect={toggleSubtaskSelection}
							/>
						)}
					</div>
					{isAiMode && (
						<DialogFooter className="gap-2">
							<TooltipProvider>
								<Button type="button" variant="outline" onClick={resetState}>
									Back
								</Button>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											type="button"
											variant="outline"
											size="icon"
											onClick={() => handleAIPlan("")}
											disabled={isLoading}
											className="h-9 w-9"
										>
											<RefreshCw
												className={cn("h-4 w-4", isLoading && "animate-spin")}
											/>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										Generate new AI task suggestions
									</TooltipContent>
								</Tooltip>
								<GlowButton
									type="submit"
									disabled={
										(selectedTasks.size === 0 && selectedSubtasks.size === 0) ||
										isLoading
									}
									loading={isLoading}
								>
									{isLoading
										? "Adding tasks..."
										: selectedSubtasks.size > 0
											? `Add ${selectedSubtasks.size} Subtask${
													selectedSubtasks.size === 1 ? "" : "s"
												}`
											: `Add ${selectedTasks.size} Task${
													selectedTasks.size === 1 ? "" : "s"
												}`}
								</GlowButton>
							</TooltipProvider>
						</DialogFooter>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}
