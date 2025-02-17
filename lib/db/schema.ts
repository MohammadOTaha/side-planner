import { relations } from "drizzle-orm";
import {
	AnyPgColumn,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }),
	email: varchar("email", { length: 255 }).notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export const boards = pgTable("boards", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	features: text("features"),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	status: varchar("status", { length: 50 }).notNull().default("todo"),
	priority: varchar("priority", { length: 20 }).notNull().default("medium"),
	complexity: varchar("complexity", { length: 10 }).notNull().default("medium"),
	boardId: integer("board_id")
		.notNull()
		.references(() => boards.id),
	parentId: integer("parent_id").references((): AnyPgColumn => tasks.id),
	dueDate: timestamp("due_date"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
	boards: many(boards),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
	user: one(users, {
		fields: [boards.userId],
		references: [users.id],
	}),
	tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	board: one(boards, {
		fields: [tasks.boardId],
		references: [boards.id],
	}),
	parent: one(tasks, {
		fields: [tasks.parentId],
		references: [tasks.id],
		relationName: "parentTask",
	}),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
