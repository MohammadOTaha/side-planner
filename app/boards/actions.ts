"use server";

import {
	createBoard,
	createTask,
	deleteBoard,
	deleteTask,
	getUser,
	updateBoard,
	updateTaskStatus,
} from "@/lib/db/queries";
import { NewTask, type NewBoard } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function createBoardAction(data: Omit<NewBoard, "userId">) {
	const user = await getUser();
	if (!user) {
		throw new Error("Not authenticated");
	}

	const board = await createBoard({
		...data,
		userId: user.id,
	});

	revalidatePath("/boards");
	return board;
}

interface UpdateBoardData {
	name?: string;
	description?: string;
	features?: string;
}

export async function updateBoardAction(
	boardId: number,
	data: UpdateBoardData
) {
	const user = await getUser();
	if (!user) {
		throw new Error("Not authenticated");
	}

	const board = await updateBoard(boardId, user.id, data);
	revalidatePath("/boards");
	return board;
}

export async function deleteBoardAction(boardId: number) {
	const user = await getUser();
	if (!user) {
		throw new Error("Not authenticated");
	}

	await deleteBoard(boardId, user.id);
	revalidatePath("/boards");
}

export async function createTaskAction(data: NewTask) {
	const user = await getUser();
	if (!user) {
		throw new Error("Not authenticated");
	}

	const task = await createTask(data);
	revalidatePath(`/boards/${data.boardId}`);
	return task;
}

export async function updateTaskStatusAction(
	taskId: number,
	boardId: number,
	status: string,
	position: number
) {
	const user = await getUser();
	if (!user) {
		throw new Error("Not authenticated");
	}

	await updateTaskStatus(taskId, boardId, status, position);
	revalidatePath(`/boards/${boardId}`);
}

export async function deleteTaskAction(taskId: number, boardId: number) {
	const user = await getUser();
	if (!user) {
		throw new Error("Not authenticated");
	}

	await deleteTask(taskId, boardId);
}

interface AITaskSuggestion {
	title: string;
	description: string;
	complexity: "Easy" | "Medium" | "Hard";
}

export async function getAITaskSuggestionsAction(
	projectName: string,
	projectDescription: string,
	projectFeatures: string,
	taskDescription: string,
	existingTasks: string
): Promise<AITaskSuggestion[]> {
	const user = await getUser();
	if (!user) {
		throw new Error("Not authenticated");
	}

	console.log(existingTasks);

	const response = await fetch(`${process.env.BASE_URL}/api/ai`, {
		method: "POST",
		body: JSON.stringify({
			projectName,
			projectDescription,
			projectFeatures,
			taskDescription,
			existingTasks,
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to get AI suggestions");
	}

	const data = await response.json();
	return data.tasks;
}
