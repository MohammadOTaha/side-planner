"use server";
import { desc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
	activityLogs,
	teamMembers,
	teams,
	users,
	boards,
	tasks,
	type NewBoard,
	type NewTask,
} from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";

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

export async function getTeamByStripeCustomerId(customerId: string) {
	const result = await db
		.select()
		.from(teams)
		.where(eq(teams.stripeCustomerId, customerId))
		.limit(1);

	return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
	teamId: number,
	subscriptionData: {
		stripeSubscriptionId: string | null;
		stripeProductId: string | null;
		planName: string | null;
		subscriptionStatus: string;
	}
) {
	await db
		.update(teams)
		.set({
			...subscriptionData,
			updatedAt: new Date(),
		})
		.where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
	const result = await db
		.select({
			user: users,
			teamId: teamMembers.teamId,
		})
		.from(users)
		.leftJoin(teamMembers, eq(users.id, teamMembers.userId))
		.where(eq(users.id, userId))
		.limit(1);

	return result[0];
}

export async function getActivityLogs() {
	const user = await getUser();
	if (!user) {
		throw new Error("User not authenticated");
	}

	return await db
		.select({
			id: activityLogs.id,
			action: activityLogs.action,
			timestamp: activityLogs.timestamp,
			ipAddress: activityLogs.ipAddress,
			userName: users.name,
		})
		.from(activityLogs)
		.leftJoin(users, eq(activityLogs.userId, users.id))
		.where(eq(activityLogs.userId, user.id))
		.orderBy(desc(activityLogs.timestamp))
		.limit(10);
}

export async function getTeamForUser(userId: number) {
	const result = await db.query.users.findFirst({
		where: eq(users.id, userId),
		with: {
			teamMembers: {
				with: {
					team: {
						with: {
							teamMembers: {
								with: {
									user: {
										columns: {
											id: true,
											name: true,
											email: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});

	return result?.teamMembers[0]?.team || null;
}

// Board CRUD Operations
export async function createBoard(data: NewBoard) {
	const [board] = await db.insert(boards).values(data).returning();
	return board;
}

export async function getBoard(boardId: number, userId: number) {
	const board = await db
		.select()
		.from(boards)
		.where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
		.limit(1);

	return board[0] || null;
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
	return await db
		.select()
		.from(tasks)
		.where(and(eq(tasks.boardId, boardId), isNull(tasks.deletedAt)))
		.orderBy(desc(tasks.updatedAt));
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
	status: string
) {
	const [task] = await db
		.update(tasks)
		.set({ status, updatedAt: new Date() })
		.where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
		.returning();
	return task;
}

export async function updateTaskPriority(
	taskId: number,
	boardId: number,
	priority: string
) {
	const [task] = await db
		.update(tasks)
		.set({ priority, updatedAt: new Date() })
		.where(and(eq(tasks.id, taskId), eq(tasks.boardId, boardId)))
		.returning();
	return task;
}
