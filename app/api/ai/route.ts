import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
	const {
		projectName,
		projectDescription,
		projectFeatures,
		taskDescription,
		existingTasks,
	} = await req.json();

	const result = await generateObject({
		model: google("gemini-2.0-flash-exp"),
		system: `
        You are a senior software engineer and project manager with extensive experience in breaking down projects into well-organized tasks. 
        Your role is to analyze project requirements and generate appropriately scoped tasks, using subtasks only when they add clarity or help manage complexity.
        You excel at:
        - Breaking down complex features into manageable pieces
        - Identifying when a task needs further breakdown
        - Estimating task complexity accurately
        - Organizing work in a logical sequence
        - Providing clear, actionable descriptions
        `,
		prompt: `
        Project Context:
        - Name: ${projectName}
        - Description: ${projectDescription}
        - Key Features: ${projectFeatures}
        - Current Tasks: ${existingTasks}

        New Task to Plan: ${taskDescription}

        Please analyze the task and:

        1. Understand the Context:
           - Consider how this task fits into the overall project
           - Review existing tasks to avoid duplication
           - Identify any dependencies or prerequisites

        2. Generate Main Tasks:
           For each main task:
           - Write a specific, action-oriented title
           - Provide a clear description explaining what needs to be done and why
           - Assess complexity (Easy/Medium/Hard) based on:
             * Technical difficulty
             * Time required
             * Dependencies
             * Required expertise
           - Evaluate if the task would benefit from being broken down into subtasks
             * Only create subtasks if they provide better clarity or organization
             * A task that can be completed in one sitting may not need subtasks
             * Consider creating subtasks for tasks that span multiple areas or require different skills

        3. Create Subtasks (only if beneficial):
           When a task needs subtasks:
           - Make each subtask title specific and actionable
           - Include implementation details in the description
           - Estimate complexity relative to the parent task
           - Ensure it represents a meaningful unit of work

        4. Sequence and Structure:
           - Order tasks in a logical implementation sequence
           - Group related tasks together
           - If using subtasks, ensure they follow a natural progression

        Focus on making each task:
        - Clear and unambiguous
        - Independently workable
        - Properly scoped (not too big, not too small)
        - Well-described with actionable details
        
        Remember: Not every task needs subtasks. Only create them when they genuinely help organize the work better.
        `,
		schema: z.object({
			tasks: z.array(
				z.object({
					title: z.string(),
					description: z.string(),
					complexity: z.enum(["Easy", "Medium", "Hard"]),
					subtasks: z
						.array(
							z.object({
								title: z.string(),
								description: z.string(),
								complexity: z.enum(["Easy", "Medium", "Hard"]),
							})
						)
						.optional(),
				})
			),
		}),
	});

	return result.toJsonResponse();
}
