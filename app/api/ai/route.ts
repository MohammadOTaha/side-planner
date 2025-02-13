import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req: Request) {
	const { projectName, projectDescription, taskDescription } =
		await req.json();

	const result = await generateObject({
		model: google("gemini-2.0-flash-exp"),
		system: `
        You are a senior software engineer and project manager with extensive experience in breaking down projects into well-organized tasks and subtasks. 
        Your role is to analyze project requirements and generate related tasks that might have been overlooked.
        `,
		prompt: `
        Project Name: ${projectName}
        Project Description: ${projectDescription}
        Task Description: ${taskDescription}

        1. Analyze the provided task in the context of the project
        2. Break down the task into logical, manageable subtasks
        3. For each subtask:
        - Provide a clear, specific title
        - Add a brief description
        - Estimate complexity (Low/Medium/High)
        - Note any technical considerations
        4. Order subtasks in a logical sequence of implementation
        `,
		schema: z.object({
			tasks: z.array(
				z.object({
					title: z.string(),
					description: z.string(),
					complexity: z.enum(["Low", "Medium", "High"]),
				})
			),
		}),
	});

	return result.toJsonResponse();
}
