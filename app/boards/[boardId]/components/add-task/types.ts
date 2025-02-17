import { type Task } from "@/lib/db/schema";
import { type AITaskSuggestion } from "@/lib/types/board";

export interface AddTaskDialogProps {
	board: {
		id: number;
		name: string;
		description?: string | null;
		features?: string | null;
		tasks?: Task[];
	};
	onTaskCreated?: () => void;
	existingTasks?: string;
}

export interface RegularTaskFormProps {
	board: AddTaskDialogProps["board"];
	isLoading: boolean;
	onSubmit: (data: RegularTaskData) => Promise<void>;
	onAIPlan: (title: string) => Promise<void>;
}

export interface AITaskSuggestionsProps {
	board: AddTaskDialogProps["board"];
	suggestions: AITaskSuggestion[];
	isLoading: boolean;
	selectedTasks: Set<number>;
	selectedSubtasks: Set<string>;
	onTaskSelect: (index: number) => void;
	onSubtaskSelect: (
		taskIndex: number,
		subtaskIndex: number,
		event: React.MouseEvent
	) => void;
}

export interface RegularTaskData {
	title: string;
	complexity: string;
	priority: string;
	parentId: number | null;
}
