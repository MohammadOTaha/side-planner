"use client";

import { Button } from "@/components/ui/button";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Task } from "@/lib/db/schema";
import { ChevronDown, ChevronUp, Minus } from "lucide-react";
import { useState } from "react";
import { type RegularTaskFormProps } from "./types";

export function RegularTaskForm({
	board,
	isLoading,
	onSubmit,
	onAIPlan,
}: RegularTaskFormProps) {
	const [title, setTitle] = useState("");
	const [complexity, setComplexity] = useState("medium");
	const [priority, setPriority] = useState("medium");
	const [parentId, setParentId] = useState<number | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		await onSubmit({
			title: title.trim(),
			complexity,
			priority,
			parentId,
		});

		// Reset form
		setTitle("");
		setComplexity("medium");
		setPriority("medium");
		setParentId(null);
	};

	return (
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
									<ChevronDown className="mr-2 h-4 w-4 text-blue-500" />
									Low
								</div>
							</SelectItem>
							<SelectItem value="medium">
								<div className="flex items-center">
									<Minus className="mr-2 h-4 w-4 text-yellow-500" />
									Medium
								</div>
							</SelectItem>
							<SelectItem value="high">
								<div className="flex items-center">
									<ChevronUp className="mr-2 h-4 w-4 text-red-500" />
									High
								</div>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="mt-6 flex justify-end gap-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="submit"
								disabled={!title.trim() || isLoading}
								variant="outline"
								onClick={handleSubmit}
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
								onClick={() => onAIPlan(title)}
								loading={isLoading}
							>
								{isLoading ? "Generating suggestions..." : "Plan with AI"}
							</GlowButton>
						</TooltipTrigger>
						<TooltipContent>Generate task suggestions using AI</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
}
