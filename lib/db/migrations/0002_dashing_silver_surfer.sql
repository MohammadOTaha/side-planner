ALTER TABLE "tasks" ADD COLUMN "complexity" varchar(10) DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "description";