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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Board } from "@/lib/db/schema";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface Props {
	board?: Partial<Board>;
	onSubmit: (title: string, description: string, features: string) => void;
	trigger?: React.ReactNode;
	mode?: "add" | "edit";
}

export default function BoardDialog({
	board,
	onSubmit,
	trigger,
	mode = "edit",
}: Props) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState(board?.name || "");
	const [overview, setOverview] = useState(board?.description || "");
	const [features, setFeatures] = useState<string[]>(
		(board?.features || "").split("\n").filter(Boolean)
	);
	const [newFeature, setNewFeature] = useState("");
	const [showFeatureInput, setShowFeatureInput] = useState(false);

	// Reset form state when dialog opens
	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen) {
			setTitle(board?.name || "");
			setOverview(board?.description || "");
			setFeatures((board?.features || "").split("\n").filter(Boolean));
		}
	};

	const handleAddFeature = () => {
		if (newFeature.trim()) {
			setFeatures([...features, newFeature.trim()]);
			setNewFeature("");
			setShowFeatureInput(false);
		}
	};

	const handleRemoveFeature = (index: number) => {
		setFeatures(features.filter((_, i) => i !== index));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(title, overview, features.join("\n"));
		setOpen(false);
		if (mode === "add") {
			setTitle("");
			setOverview("");
			setFeatures([]);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline">
						{mode === "add" ? "Add Board" : "Edit Board"}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{mode === "add" ? "Create New Board" : "Edit Board"}
						</DialogTitle>
						<DialogDescription>
							{mode === "add"
								? "Create a new board to organize your tasks."
								: "Add project details for"}
							{mode === "edit" && (
								<span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text font-bold text-transparent">
									{" "}
									AI Planning
								</span>
							)}
						</DialogDescription>
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
							<div className="flex items-center justify-between">
								<Label htmlFor="features">Features</Label>
								<Button
									type="button"
									onClick={() => setShowFeatureInput(true)}
									variant="secondary"
									size="sm"
									className="h-8"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<div
								className={`mt-2 max-h-[200px] space-y-2 overflow-y-auto rounded-md ${features.length > 0 || showFeatureInput ? "border-border/40 border p-2" : ""}`}
							>
								<div className="flex flex-col gap-2">
									{showFeatureInput && (
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
												autoFocus
											/>
											<Button
												type="button"
												onClick={handleAddFeature}
												variant="secondary"
											>
												Add
											</Button>
										</div>
									)}
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
					</div>
					<DialogFooter>
						<Button type="submit">
							{mode === "add" ? "Create Board" : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
