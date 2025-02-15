"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Pencil, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import EditProjectDialog from "./edit-project-dialog";

interface Props {
	title: string;
	description?: string | null;
	features?: string | null;
	onUpdateBoard?: (
		title: string,
		description: string,
		features: string
	) => void;
}

export default function ProjectHeader({
	title,
	description,
	features,
	onUpdateBoard,
}: Props) {
	return (
		<div className="group relative space-y-1.5">
			<div className="flex items-center gap-2">
				<h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
				<div className="flex items-center gap-1">
					<EditProjectDialog
						board={
							{
								name: title,
								description: description || "",
								features: features || "",
							} as any
						}
						onUpdate={onUpdateBoard || (() => {})}
						trigger={
							<Button
								variant="ghost"
								size="sm"
								className="h-8 opacity-0 transition group-hover:opacity-100"
							>
								<Pencil className="h-4 w-4" />
							</Button>
						}
					/>
				</div>
			</div>
		</div>
	);
}
