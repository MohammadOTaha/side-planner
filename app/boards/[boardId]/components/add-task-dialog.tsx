"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
	Plus,
	Sparkles,
	Check,
	ArrowDown,
	ArrowRight,
	ArrowUp,
} from "lucide-react";
import { type Board } from "@/lib/db/schema";
import {
	createTaskAction,
	getAITaskSuggestionsAction,
} from "@/app/boards/actions";
import { GlowButton } from "@/components/ui/glow-button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
	board: Board;
	onTaskCreated?: () => void;
	existingTasks?: string;
}

interface AITaskSuggestion {
	title: string;
	description: string;
	complexity: "Easy" | "Medium" | "Hard";
}

export default function AddTaskDialog({
	board,
	onTaskCreated,
	existingTasks,
}: Props) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [aiSuggestions, setAiSuggestions] = useState<AITaskSuggestion[]>([]);
	const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
	const [isAiMode, setIsAiMode] = useState(false);
	const [complexity, setComplexity] = useState("medium");
	const [priority, setPriority] = useState("medium");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (isAiMode) {
				// Create all selected AI tasks
				for (const index of selectedTasks) {
					const task = aiSuggestions[index];
					await createTaskAction({
						title: task.title,
						boardId: board.id,
						status: "backlog",
						complexity: task.complexity.toLowerCase(),
						priority,
					});
				}
			} else {
				await createTaskAction({
					title,
					boardId: board.id,
					status: "backlog",
					complexity,
					priority,
				});
			}

			setTitle("");
			setOpen(false);
			setIsAiMode(false);
			setAiSuggestions([]);
			setSelectedTasks(new Set());
			onTaskCreated?.();
		} catch (error) {
			console.error("Failed to create task:", error);
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
				title,
				existingTasks || ""
			);
			setAiSuggestions(suggestions);
		} catch (error) {
			console.error("Failed to get AI suggestions:", error);
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
			<DialogContent className="sm:max-w-[600px] border border-gray-800">
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
								<div className="flex flex-col space-y-2 mt-4">
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										placeholder="What do you want to get done?"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="flex flex-col space-y-2">
										<Label htmlFor="complexity">
											Complexity
										</Label>
										<Select
											value={complexity}
											onValueChange={setComplexity}
										>
											<SelectTrigger id="complexity">
												<SelectValue placeholder="Select complexity" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="easy">
													<div className="flex items-center">
														<div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
														Easy
													</div>
												</SelectItem>
												<SelectItem value="medium">
													<div className="flex items-center">
														<div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
														Medium
													</div>
												</SelectItem>
												<SelectItem value="hard">
													<div className="flex items-center">
														<div className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
														Hard
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="flex flex-col space-y-2">
										<Label htmlFor="priority">
											Priority
										</Label>
										<Select
											value={priority}
											onValueChange={setPriority}
										>
											<SelectTrigger id="priority">
												<SelectValue placeholder="Select priority" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">
													<div className="flex items-center">
														<ArrowDown className="w-4 h-4 mr-2 text-blue-500" />
														Low
													</div>
												</SelectItem>
												<SelectItem value="medium">
													<div className="flex items-center">
														<ArrowRight className="w-4 h-4 mr-2 text-yellow-500" />
														Medium
													</div>
												</SelectItem>
												<SelectItem value="high">
													<div className="flex items-center">
														<ArrowUp className="w-4 h-4 mr-2 text-red-500" />
														High
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						) : (
							<div className="space-y-4 max-h-[400px] overflow-y-auto px-1">
								{aiSuggestions.map((suggestion, index) => (
									<Card
										key={index}
										className={cn(
											"p-4 cursor-pointer hover:bg-accent/50 transition-all border-2",
											selectedTasks.has(index)
												? "border-primary shadow-sm"
												: "border-border/50"
										)}
										onClick={() =>
											toggleTaskSelection(index)
										}
									>
										<div className="flex items-start justify-between gap-4">
											<div className="space-y-3 flex-1">
												<div>
													<h4 className="font-medium text-sm">
														{suggestion.title}
													</h4>
													<p className="text-sm text-muted-foreground mt-1">
														{suggestion.description}
													</p>
												</div>
												<div className="flex items-center gap-3">
													<span
														className={cn(
															"text-xs px-2 py-1 rounded-full font-medium",
															suggestion.complexity ===
																"Easy"
																? "bg-emerald-500/10 text-emerald-600"
																: suggestion.complexity ===
																  "Medium"
																? "bg-amber-500/10 text-amber-600"
																: "bg-rose-500/10 text-rose-600"
														)}
													>
														Complexity:{" "}
														{suggestion.complexity}
													</span>
												</div>
											</div>
											{selectedTasks.has(index) && (
												<Check className="h-5 w-5 text-primary shrink-0" />
											)}
										</div>
									</Card>
								))}
							</div>
						)}
					</div>
					<DialogFooter className="gap-2">
						{!isAiMode ? (
							<>
								<Button
									type="submit"
									disabled={!title.trim() || isLoading}
									variant="outline"
								>
									{isLoading ? "Creating..." : "Create Task"}
								</Button>
								<GlowButton
									type="button"
									disabled={!title.trim() || isLoading}
									onClick={handleAiPlan}
									loading={isLoading}
								>
									{isLoading ? "Planning..." : "Plan with AI"}
								</GlowButton>
							</>
						) : (
							<>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsAiMode(false);
										setAiSuggestions([]);
										setSelectedTasks(new Set());
									}}
								>
									Back
								</Button>
								<GlowButton
									type="submit"
									disabled={
										selectedTasks.size === 0 || isLoading
									}
									loading={isLoading}
								>
									{isLoading
										? isAiMode
											? "Planning..."
											: "Creating..."
										: `Add ${selectedTasks.size} Task${
												selectedTasks.size === 1
													? ""
													: "s"
										  }`}
								</GlowButton>
							</>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
