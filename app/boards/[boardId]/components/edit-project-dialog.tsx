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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type Board } from "@/lib/db/schema";
import { Plus, X } from "lucide-react";

interface Props {
	board: Board;
	onUpdate: (title: string, description: string, features: string) => void;
	trigger?: React.ReactNode;
}

export default function EditProjectDialog({ board, onUpdate, trigger }: Props) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState(board.name);
	const [overview, setOverview] = useState(board.description || "");
	const [features, setFeatures] = useState<string[]>(
		(board.features || "").split("\n").filter(Boolean)
	);
	const [newFeature, setNewFeature] = useState("");

	const handleAddFeature = () => {
		if (newFeature.trim()) {
			setFeatures([...features, newFeature.trim()]);
			setNewFeature("");
		}
	};

	const handleRemoveFeature = (index: number) => {
		setFeatures(features.filter((_, i) => i !== index));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onUpdate(title, overview, features.join("\n"));
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || <Button variant="outline">Edit Project</Button>}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit Project</DialogTitle>
						<DialogDescription>Update your project details</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div>
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Enter project title"
							/>
						</div>
						<div>
							<Label htmlFor="overview">Overview</Label>
							<Textarea
								id="overview"
								value={overview}
								onChange={(e) => setOverview(e.target.value)}
								placeholder="Enter project overview"
								rows={3}
							/>
						</div>
						<div>
							<Label htmlFor="features">Features</Label>
							<div className="flex gap-2">
								<Input
									id="features"
									value={newFeature}
									onChange={(e) => setNewFeature(e.target.value)}
									placeholder="Add a feature"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddFeature();
										}
									}}
								/>
								<Button
									type="button"
									onClick={handleAddFeature}
									variant="secondary"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<div className="mt-2 space-y-2">
								{features.map((feature, index) => (
									<div
										key={index}
										className="bg-muted flex items-center gap-2 rounded-md p-2"
									>
										<span className="flex-1">{feature}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveFeature(index)}
											className="h-8 w-8"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Save changes</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
