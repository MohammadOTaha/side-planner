"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProjectHeaderProps {
	title: string;
	description?: string;
	onTitleChange?: (title: string) => void;
	onDescriptionChange?: (description: string) => void;
}

export default function ProjectHeader({
	title: initialTitle = "My Project",
	description: initialDescription = "Click to add a description",
	onTitleChange,
	onDescriptionChange,
}: ProjectHeaderProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(initialTitle);
	const [description, setDescription] = useState(initialDescription);

	const handleTitleChange = (newTitle: string) => {
		setTitle(newTitle);
		onTitleChange?.(newTitle);
	};

	const handleDescriptionChange = (newDescription: string) => {
		setDescription(newDescription);
		onDescriptionChange?.(newDescription);
	};

	const handleEditComplete = () => {
		setIsEditing(false);
	};

	return (
		<div className="mb-6 group">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					{isEditing ? (
						<Input
							value={title}
							onChange={(e) => handleTitleChange(e.target.value)}
							className="text-xl font-semibold mb-2 bg-transparent border-none focus:ring-0"
							onBlur={handleEditComplete}
							onKeyDown={(e) =>
								e.key === "Enter" && handleEditComplete()
							}
							autoFocus
						/>
					) : (
						<div className="flex items-center gap-2 mb-2">
							<h2 className="text-xl font-semibold text-foreground/90">
								{title}
							</h2>
							<div className="flex items-center gap-1">
								<button
									onClick={() => setIsExpanded(!isExpanded)}
									className="text-xs text-muted-foreground/50 hover:text-muted-foreground/70 flex items-center transition-colors"
									aria-label={
										isExpanded
											? "Hide description"
											: "Show description"
									}
								>
									<ChevronDown
										className={cn(
											"h-4 w-4 transition-transform duration-200",
											isExpanded && "rotate-180"
										)}
									/>
								</button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsEditing(!isEditing)}
									className="shrink-0 opacity-0 group-hover:opacity-50 focus:opacity-50 transition-opacity p-0 h-auto"
								>
									<Edit2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
			{isExpanded && (
				<div className="mt-4 max-w-2xl transition-all duration-200 ease-in-out">
					{isEditing ? (
						<Textarea
							value={description}
							onChange={(e) =>
								handleDescriptionChange(e.target.value)
							}
							className="min-h-[100px] bg-transparent border-none focus:ring-0"
							placeholder="Add a description..."
							onBlur={handleEditComplete}
						/>
					) : (
						<p className="text-sm text-muted-foreground/70 whitespace-pre-wrap">
							{description}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
