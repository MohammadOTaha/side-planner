"use client";

interface Props {
	title: string;
	description?: string | null;
}

export default function ProjectHeader({ title, description }: Props) {
	return (
		<div className="space-y-1.5">
			<h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
			{description && (
				<p className="text-sm text-muted-foreground">{description}</p>
			)}
		</div>
	);
}
