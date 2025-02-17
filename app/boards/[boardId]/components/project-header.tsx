"use client";

import { Button } from "@/components/ui/button";
import { type ProjectHeaderProps } from "@/lib/types/board";
import { Pencil } from "lucide-react";
import EditProjectDialog from "../../components/board-dialog";

export default function ProjectHeader({
	title,
	description,
	features,
	onUpdateBoard,
}: ProjectHeaderProps) {
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
						onSubmit={onUpdateBoard || (() => {})}
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
