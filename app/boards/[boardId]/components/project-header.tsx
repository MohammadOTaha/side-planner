"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Pencil, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
	title: string;
	description?: string | null;
	onUpdateBoard?: (title: string, description: string) => void;
}

export default function ProjectHeader({
	title,
	description,
	onUpdateBoard,
}: Props) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState(title);
	const [editedDescription, setEditedDescription] = useState(
		description || ""
	);
	const [showDescription, setShowDescription] = useState(true);

	const handleSave = () => {
		if (editedTitle.trim()) {
			onUpdateBoard?.(editedTitle, editedDescription);
			setIsEditing(false);
		}
	};

	if (isEditing) {
		return (
			<div className="space-y-3 w-full max-w-2xl">
				<div className="flex items-center gap-2">
					<Input
						value={editedTitle}
						onChange={(e) => setEditedTitle(e.target.value)}
						className="text-2xl font-semibold h-auto py-1.5 w-full"
						placeholder="Enter title"
					/>
					<Button size="sm" onClick={handleSave} className="h-8">
						<Save className="h-4 w-4" />
					</Button>
				</div>
				<Textarea
					value={editedDescription}
					onChange={(e) => setEditedDescription(e.target.value)}
					className="text-sm resize-none w-full min-h-[80px]"
					placeholder="Enter description"
					rows={3}
				/>
			</div>
		);
	}

	return (
		<div className="group relative space-y-1.5">
			<div className="flex items-center gap-2">
				<h2 className="text-2xl font-semibold tracking-tight">
					{title}
				</h2>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsEditing(true)}
						className="opacity-0 group-hover:opacity-100 transition h-8"
					>
						<Pencil className="h-4 w-4" />
					</Button>
					{description && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowDescription(!showDescription)}
							className="opacity-0 group-hover:opacity-100 transition h-8"
						>
							{showDescription ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</Button>
					)}
				</div>
			</div>
			{description && showDescription && (
				<p
					className={cn(
						"text-sm text-muted-foreground transition-all duration-200",
						showDescription
							? "opacity-100 max-h-20 mb-4"
							: "opacity-0 max-h-0 overflow-hidden"
					)}
				>
					{description}
				</p>
			)}
		</div>
	);
}
