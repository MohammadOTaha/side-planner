"use client";

import {
	createTaskAction,
	getAITaskSuggestionsAction,
} from "@/app/boards/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Task } from "@/lib/db/schema";
import {
	type AddTaskDialogProps,
	type AITaskSuggestion,
} from "@/lib/types/board";
import { cn } from "@/lib/utils";
import {
	ArrowDown,
	ArrowRight,
	ArrowUp,
	Check,
	ChevronRight,
	Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AddTaskDialog({
	board,
	onTaskCreated,
	existingTasks,
}: AddTaskDialogProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [complexity, setComplexity] = useState("medium");
	const [priority, setPriority] = useState("medium");
	const [parentId, setParentId] = useState<number | null>(null);
	const [isAiMode, setIsAiMode] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
	const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setIsLoading(true);

			if (isAiMode) {
				// Create selected AI-suggested tasks
				const promises = Array.from(selectedTasks).map(async (index) => {
					const suggestion = suggestions[index];
					const task = await createTaskAction({
						title: suggestion.title,
						boardId: board.id,
						complexity: suggestion.complexity.toLowerCase(),
						priority,
						parentId,
						status: "backlog",
					});

					// Create subtasks if they exist
					if (suggestion.subtasks && suggestion.subtasks.length > 0) {
						const subtaskPromises = suggestion.subtasks.map((subtask) =>
							createTaskAction({
								title: subtask.title,
								boardId: board.id,
								complexity: subtask.complexity.toLowerCase(),
								priority,
								parentId: task.id,
								status: "backlog",
							})
						);
						await Promise.all(subtaskPromises);
					}
				});

				await Promise.all(promises);
				toast.success(
					`Created ${selectedTasks.size} task${
						selectedTasks.size === 1 ? "" : "s"
					} with subtasks successfully`
				);
			} else {
				// Create regular task
				if (!title.trim()) return;
				await createTaskAction({
					title: title.trim(),
					boardId: board.id,
					complexity,
					priority,
					parentId,
					status: "backlog",
				});
				toast.success("Task created successfully");
			}

			onTaskCreated?.();
			setOpen(false);
			setTitle("");
			setComplexity("medium");
			setPriority("medium");
			setParentId(null);
			setIsAiMode(false);
			setSuggestions([]);
			setSelectedTasks(new Set());
		} catch (error) {
			console.error("Failed to create task:", error);
			toast.error("Failed to create task. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleAiPlan = async () => {
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

	const toggleTaskSelection = (index: number) => {
		const newSelected = new Set(selectedTasks);
		if (newSelected.has(index)) {
			newSelected.delete(index);
		} else {
			newSelected.add(index);
		}
		setSelectedTasks(newSelected);
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
				<form onSubmit={handleSubmit}>
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
							<div className="space-y-4">
								<div className="mt-4 flex flex-col space-y-2">
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="What do you want to get done?"
									/>
								</div>
								<div className="mt-4 flex flex-col space-y-2">
									<Label htmlFor="parent">Parent Task (Optional)</Label>
									<Select
										value={parentId?.toString() ?? "none"}
										onValueChange={(value) =>
											setParentId(value === "none" ? null : parseInt(value))
										}
									>
										<SelectTrigger id="parent">
											<SelectValue placeholder="Select a parent task" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">No Parent</SelectItem>
											{(board?.tasks || []).map((task: Task) => (
												<SelectItem key={task.id} value={task.id.toString()}>
													{task.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="flex flex-col space-y-2">
										<Label htmlFor="complexity">Complexity</Label>
										<Select value={complexity} onValueChange={setComplexity}>
											<SelectTrigger id="complexity">
												<SelectValue placeholder="Select complexity" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="easy">
													<div className="flex items-center">
														<div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
														Easy
													</div>
												</SelectItem>
												<SelectItem value="medium">
													<div className="flex items-center">
														<div className="mr-2 h-2 w-2 rounded-full bg-amber-500" />
														Medium
													</div>
												</SelectItem>
												<SelectItem value="hard">
													<div className="flex items-center">
														<div className="mr-2 h-2 w-2 rounded-full bg-rose-500" />
														Hard
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="flex flex-col space-y-2">
										<Label htmlFor="priority">Priority</Label>
										<Select value={priority} onValueChange={setPriority}>
											<SelectTrigger id="priority">
												<SelectValue placeholder="Select priority" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">
													<div className="flex items-center">
														<ArrowDown className="mr-2 h-4 w-4 text-blue-500" />
														Low
													</div>
												</SelectItem>
												<SelectItem value="medium">
													<div className="flex items-center">
														<ArrowRight className="mr-2 h-4 w-4 text-yellow-500" />
														Medium
													</div>
												</SelectItem>
												<SelectItem value="high">
													<div className="flex items-center">
														<ArrowUp className="mr-2 h-4 w-4 text-red-500" />
														High
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						) : (
							<div className="max-h-[400px] space-y-4 overflow-y-auto px-1">
								{isLoading ? (
									<>
										{Array.from({ length: 3 }).map((_, index) => (
											<Card key={index} className="border p-4">
												<div className="flex items-start justify-between gap-4">
													<div className="flex-1 space-y-4">
														<div className="flex items-start justify-between">
															<div className="space-y-2">
																<Skeleton className="h-5 w-[180px]" />
																<Skeleton className="h-4 w-[300px]" />
															</div>
															<div className="flex items-center gap-2">
																<Skeleton className="h-6 w-16 rounded-full" />
																<Skeleton className="h-6 w-6 rounded-full" />
															</div>
														</div>

														{/* Subtasks skeleton - show for some cards */}
														{index === 1 && (
															<div className="bg-muted/40 space-y-3 rounded-lg p-3">
																<div className="flex items-center gap-2">
																	<Skeleton className="h-3 w-3" />
																	<Skeleton className="h-3 w-16" />
																</div>
																<div className="space-y-3">
																	{Array.from({ length: 2 }).map(
																		(_, subIndex) => (
																			<div
																				key={subIndex}
																				className="flex items-start justify-between gap-2"
																			>
																				<div className="space-y-1.5">
																					<Skeleton className="h-4 w-[160px]" />
																					<Skeleton className="h-3 w-[240px]" />
																				</div>
																				<Skeleton className="h-5 w-14 rounded-full" />
																			</div>
																		)
																	)}
																</div>
															</div>
														)}
													</div>
												</div>
											</Card>
										))}
									</>
								) : (
									<>
										{suggestions.map((suggestion, index) => (
											<Card
												key={index}
												className={cn(
													"group cursor-pointer border p-4 transition-all hover:shadow-md",
													selectedTasks.has(index)
														? "border-primary bg-primary/5"
														: "hover:border-primary/50"
												)}
												onClick={() => toggleTaskSelection(index)}
											>
												<div className="flex items-start justify-between gap-4">
													<div className="flex-1 space-y-4">
														<div className="flex items-start justify-between">
															<div>
																<h4 className="font-medium">
																	{suggestion.title}
																</h4>
																<p className="text-muted-foreground mt-1.5 text-sm">
																	{suggestion.description}
																</p>
															</div>
															<div className="flex items-center gap-2">
																<span
																	className={cn(
																		"rounded-full px-2.5 py-1 text-xs font-medium",
																		suggestion.complexity === "Easy"
																			? "bg-emerald-500/10 text-emerald-600"
																			: suggestion.complexity === "Medium"
																				? "bg-amber-500/10 text-amber-600"
																				: "bg-rose-500/10 text-rose-600"
																	)}
																>
																	{suggestion.complexity}
																</span>
																{selectedTasks.has(index) ? (
																	<div className="bg-primary/10 rounded-full p-1">
																		<Check className="text-primary h-4 w-4" />
																	</div>
																) : (
																	<></>
																)}
															</div>
														</div>

														{suggestion.subtasks &&
															suggestion.subtasks.length > 0 && (
																<div className="bg-muted/40 space-y-3 rounded-lg p-3">
																	<h5 className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
																		<ChevronRight className="h-3 w-3" />
																		Subtasks
																	</h5>
																	<div className="space-y-3">
																		{suggestion.subtasks.map(
																			(subtask, subtaskIndex) => (
																				<div
																					key={subtaskIndex}
																					className="space-y-1.5"
																				>
																					<div className="flex items-start justify-between gap-2">
																						<div>
																							<h6 className="text-sm font-medium">
																								{subtask.title}
																							</h6>
																							<p className="text-muted-foreground text-xs">
																								{subtask.description}
																							</p>
																						</div>
																						<span
																							className={cn(
																								"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
																								subtask.complexity === "Easy"
																									? "bg-emerald-500/10 text-emerald-600"
																									: subtask.complexity ===
																										  "Medium"
																										? "bg-amber-500/10 text-amber-600"
																										: "bg-rose-500/10 text-rose-600"
																							)}
																						>
																							{subtask.complexity}
																						</span>
																					</div>
																				</div>
																			)
																		)}
																	</div>
																</div>
															)}
													</div>
												</div>
											</Card>
										))}
									</>
								)}
							</div>
						)}
					</div>
					<DialogFooter className="gap-2">
						<TooltipProvider>
							{!isAiMode ? (
								<>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												type="submit"
												disabled={!title.trim() || isLoading}
												variant="outline"
											>
												{isLoading ? "Creating..." : "Create Task"}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											Create a new task with provided details
										</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<GlowButton
												type="button"
												disabled={!title.trim() || isLoading}
												onClick={handleAiPlan}
												loading={isLoading}
											>
												{isLoading
													? "Generating suggestions..."
													: "Plan with AI"}
											</GlowButton>
										</TooltipTrigger>
										<TooltipContent>
											Generate task suggestions using AI
										</TooltipContent>
									</Tooltip>
								</>
							) : (
								<>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setIsAiMode(false);
											setSuggestions([]);
											setSelectedTasks(new Set());
										}}
									>
										Back
									</Button>
									<GlowButton
										type="submit"
										disabled={selectedTasks.size === 0 || isLoading}
										loading={isLoading}
									>
										{isLoading
											? "Adding tasks..."
											: `Add ${selectedTasks.size} Task${selectedTasks.size === 1 ? "" : "s"}`}
									</GlowButton>
								</>
							)}
						</TooltipProvider>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
