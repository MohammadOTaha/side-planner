"use server";
import { verifyToken } from "@/lib/auth/session";
import { and, desc, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "./drizzle";
import { boards, tasks, users, type NewBoard, type NewTask } from "./schema";

export async function getUser() {
	const sessionCookie = (await cookies()).get("session");
	if (!sessionCookie || !sessionCookie.value) {
		return null;
	}

	const sessionData = await verifyToken(sessionCookie.value);
	if (
		!sessionData ||
		!sessionData.user ||
		typeof sessionData.user.id !== "number"
	) {
		return null;
	}

	if (new Date(sessionData.expires) < new Date()) {
		return null;
	}

	const user = await db
		.select()
		.from(users)
		.where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
		.limit(1);

	if (user.length === 0) {
		return null;
	}

	return user[0];
}

// Board CRUD Operations
export async function createBoard(data: NewBoard) {
	const [board] = await db.insert(boards).values(data).returning();
	return board;
}

export async function getBoard(boardId: number, userId: number) {
	const board = await db.query.boards.findFirst({
		where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
		with: {
			tasks: {
				where: isNull(tasks.deletedAt),
				orderBy: desc(tasks.updatedAt),
			},
		},
	});

	return board;
}

export async function getUserBoards(userId: number) {
	return await db
		.select()
		.from(boards)
		.where(eq(boards.userId, userId))
		.orderBy(desc(boards.updatedAt));
}

export async function updateBoard(
	boardId: number,
	userId: number,
	data: Partial<NewBoard>
) {
	const [board] = await db
		.update(boards)
		.set({ ...data, updatedAt: new Date() })
		.where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
		.returning();
	return board;
}

export async function deleteBoard(boardId: number, userId: number) {
	await db
		.delete(boards)
		.where(and(eq(boards.id, boardId), eq(boards.userId, userId)));
}

// Task CRUD Operations
export async function createTask(data: NewTask) {
	const [task] = await db.insert(tasks).values(data).returning();
	return task;
}

export async function getTask(taskId: number, boardId: number) {
	const task = await db
		.select()
		.from(tasks)
		.where(
			and(
				eq(tasks.id, taskId),
				eq(tasks.boardId, boardId),
				isNull(tasks.deletedAt)
			)
		)
		.limit(1);

	return task[0] || null;
}

export async function getBoardTasks(boardId: number) {
	const result = await db.query.tasks.findMany({
		where: and(eq(tasks.boardId, boardId), isNull(tasks.deletedAt)),
		orderBy: [tasks.position, desc(tasks.createdAt)],
		with: {
			parent: true,
		},
	});

	return result;
}

export async function updateTask(
	taskId: number,
	boardId: number,
	data: Partial<NewTask>
) {
	const [task] = await db
		.update(tasks)
		.set({ ...data, updatedAt: new Date() })
		.where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
		.returning();
	return task;
}

export async function deleteTask(taskId: number, boardId: number) {
	// Soft delete
	await db
		.update(tasks)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)));
}

export async function updateTaskStatus(
	taskId: number,
	boardId: number,
	status: string,
	position: number
) {
	// First, get all tasks in the target status to update their positions
	const tasksInStatus = await db
		.select()
		.from(tasks)
		.where(
			and(
				eq(tasks.boardId, boardId),
				eq(tasks.status, status),
				isNull(tasks.deletedAt)
			)
		)
		.orderBy(tasks.position);

	// Update positions of existing tasks to make space for the new task
	for (let i = tasksInStatus.length - 1; i >= position; i--) {
		await db
			.update(tasks)
			.set({ position: i + 1, updatedAt: new Date() })
			.where(eq(tasks.id, tasksInStatus[i].id));
	}

	// Update the task's status and position
	const [task] = await db
		.update(tasks)
		.set({
			status,
			position,
			updatedAt: new Date(),
		})
		.where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
		.returning();

	return task;
}
