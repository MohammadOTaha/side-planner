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
import { Plus, Sparkles, Check } from "lucide-react";
import { type Board } from "@/lib/db/schema";
import {
	createTaskAction,
	getAITaskSuggestionsAction,
} from "@/app/boards/actions";
import { GlowButton } from "@/components/ui/glow-button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
	board: Board;
	onTaskCreated?: () => void;
}

interface AITaskSuggestion {
	title: string;
	description: string;
	complexity: "Low" | "Medium" | "High";
	dependencies: string[];
	technicalConsiderations: string[];
}

export default function AddTaskDialog({ board, onTaskCreated }: Props) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [aiSuggestions, setAiSuggestions] = useState<AITaskSuggestion[]>([]);
	const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
	const [isAiMode, setIsAiMode] = useState(false);

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
						status: "todo",
					});
				}
			} else {
				await createTaskAction({
					title,
					boardId: board.id,
					status: "todo",
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
				title
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
					<div className="space-y-4 py-4">
						{!isAiMode ? (
							<div className="space-y-2">
								<Input
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="What do you want to get done?"
								/>
							</div>
						) : (
							<div className="space-y-4 max-h-[400px] overflow-y-auto">
								{aiSuggestions.map((suggestion, index) => (
									<Card
										key={index}
										className={cn(
											"p-4 cursor-pointer hover:bg-accent transition-colors",
											selectedTasks.has(index) &&
												"border-primary"
										)}
										onClick={() =>
											toggleTaskSelection(index)
										}
									>
										<div className="flex items-start justify-between">
											<div>
												<h4 className="font-semibold">
													{suggestion.title}
												</h4>
												<div className="flex gap-2 mt-2">
													<span className="text-xs bg-secondary px-2 py-1 rounded">
														{suggestion.complexity}
													</span>
												</div>
											</div>
											{selectedTasks.has(index) && (
												<Check className="h-5 w-5 text-primary" />
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
								<Button
									type="submit"
									disabled={
										selectedTasks.size === 0 || isLoading
									}
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
								</Button>
							</>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
