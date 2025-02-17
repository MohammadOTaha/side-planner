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
import { type Task } from "@/lib/db/schema";
import {
	type AddTaskDialogProps,
	type AITaskSuggestion,
} from "@/lib/types/board";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowRight, ArrowUp, Check, Plus } from "lucide-react";
import { useState } from "react";

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
		if (!title.trim()) return;

		try {
			setIsLoading(true);
			await createTaskAction({
				title: title.trim(),
				boardId: board.id,
				complexity,
				priority,
				parentId,
				status: "todo",
			});
			onTaskCreated?.();
			setOpen(false);
			setTitle("");
			setComplexity("medium");
			setPriority("medium");
			setParentId(null);
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
				board.features
					?.split("\n")
					.map((feature) => `[${feature}]`)
					.join(", ") || "",
				title,
				existingTasks || ""
			);
			setSuggestions(suggestions);
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
										value={parentId?.toString() || ""}
										onValueChange={(value) =>
											setParentId(value ? parseInt(value) : null)
										}
									>
										<SelectTrigger id="parent">
											<SelectValue placeholder="Select a parent task" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">No Parent</SelectItem>
											{(board.tasks || []).map((task: Task) => (
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
								{suggestions.map((suggestion, index) => (
									<Card
										key={index}
										className={cn(
											"hover:bg-accent/50 cursor-pointer border-2 p-4 transition-all",
											selectedTasks.has(index)
												? "border-primary shadow-sm"
												: "border-border/50"
										)}
										onClick={() => toggleTaskSelection(index)}
									>
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1 space-y-3">
												<div>
													<h4 className="text-sm font-medium">
														{suggestion.title}
													</h4>
													<p className="text-muted-foreground mt-1 text-sm">
														{suggestion.description}
													</p>
												</div>
												<div className="flex items-center gap-3">
													<span
														className={cn(
															"rounded-full px-2 py-1 text-xs font-medium",
															suggestion.complexity === "Easy"
																? "bg-emerald-500/10 text-emerald-600"
																: suggestion.complexity === "Medium"
																	? "bg-amber-500/10 text-amber-600"
																	: "bg-rose-500/10 text-rose-600"
														)}
													>
														Complexity: {suggestion.complexity}
													</span>
												</div>
											</div>
											{selectedTasks.has(index) && (
												<Check className="text-primary h-5 w-5 shrink-0" />
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
										? isAiMode
											? "Planning..."
											: "Creating..."
										: `Add ${selectedTasks.size} Task${
												selectedTasks.size === 1 ? "" : "s"
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
