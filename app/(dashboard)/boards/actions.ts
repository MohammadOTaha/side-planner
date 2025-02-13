"use server";

import { revalidatePath } from "next/cache";
import {
	createBoard,
	updateBoard,
	deleteBoard,
	getUser,
} from "@/lib/db/queries";
import { type NewBoard } from "@/lib/db/schema";

export async function createNewBoard(data: Omit<NewBoard, "userId">) {
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

export async function updateExistingBoard(
	boardId: number,
	data: Partial<NewBoard>
) {
	const user = await getUser();
	if (!user) {
		throw new Error("Not authenticated");
	}

	const board = await updateBoard(boardId, user.id, data);
	revalidatePath("/boards");
	return board;
}

export async function deleteExistingBoard(boardId: number) {
	const user = await getUser();
	if (!user) {
		throw new Error("Not authenticated");
	}

	await deleteBoard(boardId, user.id);
	revalidatePath("/boards");
}
