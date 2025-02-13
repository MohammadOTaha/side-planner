"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save } from "lucide-react";

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

	const handleSave = () => {
		if (editedTitle.trim()) {
			onUpdateBoard?.(editedTitle, editedDescription);
			setIsEditing(false);
		}
	};

	if (isEditing) {
		return (
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<Input
						value={editedTitle}
						onChange={(e) => setEditedTitle(e.target.value)}
						className="text-2xl font-semibold h-auto py-1"
						placeholder="Enter title"
					/>
					<Button size="sm" onClick={handleSave} className="h-8">
						<Save className="h-4 w-4" />
					</Button>
				</div>
				<Textarea
					value={editedDescription}
					onChange={(e) => setEditedDescription(e.target.value)}
					className="text-sm resize-none"
					placeholder="Enter description"
					rows={2}
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
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsEditing(true)}
					className="opacity-0 group-hover:opacity-100 transition h-8"
				>
					<Pencil className="h-4 w-4" />
				</Button>
			</div>
			{description && (
				<p className="text-sm text-muted-foreground">{description}</p>
			)}
		</div>
	);
}
