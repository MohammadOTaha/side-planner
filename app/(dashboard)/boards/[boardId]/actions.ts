"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/db/queries";
import { db } from "@/lib/db/drizzle";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface NewTask {
	title: string;
	description?: string;
	boardId: number;
	status: string;
}

export async function createTaskAction(data: NewTask) {
	const user = await getUser();

	if (!user) {
		throw new Error("Not authenticated");
	}

	await db.insert(tasks).values({
		...data,
	});

	revalidatePath(`/boards/${data.boardId}`);
}

export async function updateTaskStatusAction(
	taskId: number,
	boardId: number,
	status: string
) {
	const user = await getUser();

	if (!user) {
		throw new Error("Not authenticated");
	}

	await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));

	revalidatePath(`/boards/${boardId}`);
}
