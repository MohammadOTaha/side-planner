import { type Board, type Task } from "@/lib/db/schema";

// Base task interface that extends the DB Task type
export interface DraggableTask extends Omit<Task, "id"> {
	id: string; // For DnD we need string IDs
	parent?: DraggableTask; // Parent task reference
}

// Column interface for board organization
export interface Column {
	id: string;
	title: string;
	tasks: DraggableTask[];
}

// Props interfaces for components
export interface BoardProps {
	board: Board & {
		tasks?: Task[];
	};
}

export interface BoardColumnProps {
	column: Column;
}

export interface BoardTaskProps {
	task: DraggableTask;
	onRemoved: (taskId: string) => void;
}

export interface ProjectHeaderProps {
	title: string;
	description?: string | null;
	features?: string | null;
	onUpdateBoard?: (
		title: string,
		description: string,
		features: string
	) => void;
}

export interface AddTaskDialogProps {
	board: Board & {
		tasks?: Task[];
	};
	onTaskCreated?: () => void;
	existingTasks?: string;
}

export interface AITaskSuggestion {
	title: string;
	description: string;
	complexity: "Easy" | "Medium" | "Hard";
}
