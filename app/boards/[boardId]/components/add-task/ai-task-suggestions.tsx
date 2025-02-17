"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import { type AITaskSuggestionsProps } from "./types";

export function AITaskSuggestions({
	suggestions,
	isLoading,
	selectedTasks,
	selectedSubtasks,
	onTaskSelect,
	onSubtaskSelect,
}: AITaskSuggestionsProps) {
	if (isLoading) {
		return (
			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, index) => (
					<Card key={index} className="border p-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 space-y-4">
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<Skeleton className="h-5 w-[180px]" />
										<Skeleton className="h-4 w-[300px]" />
									</div>
									<div className="flex items-center gap-2">
										<Skeleton className="h-6 w-16 rounded-full" />
										<Skeleton className="h-6 w-6 rounded-full" />
									</div>
								</div>

								{index === 1 && (
									<div className="bg-muted/40 space-y-3 rounded-lg p-3">
										<div className="flex items-center gap-2">
											<Skeleton className="h-3 w-3" />
											<Skeleton className="h-3 w-16" />
										</div>
										<div className="space-y-3">
											{Array.from({ length: 2 }).map((_, subIndex) => (
												<div
													key={subIndex}
													className="flex items-start justify-between gap-2"
												>
													<div className="space-y-1.5">
														<Skeleton className="h-4 w-[160px]" />
														<Skeleton className="h-3 w-[240px]" />
													</div>
													<Skeleton className="h-5 w-14 rounded-full" />
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="max-h-[400px] space-y-4 overflow-y-auto px-1">
			{suggestions.map((suggestion, index) => (
				<Card
					key={index}
					className={cn(
						"group cursor-pointer border p-4 transition-all hover:shadow-md",
						selectedTasks.has(index)
							? "border-primary bg-primary/5"
							: "hover:border-primary/50"
					)}
					onClick={() => onTaskSelect(index)}
				>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1 space-y-4">
							<div className="flex items-start justify-between">
								<div>
									<h4 className="font-medium">{suggestion.title}</h4>
									<p className="text-muted-foreground mt-1.5 text-sm">
										{suggestion.description}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<span
										className={cn(
											"rounded-full px-2.5 py-1 text-xs font-medium",
											suggestion.complexity === "Easy"
												? "bg-emerald-500/10 text-emerald-600"
												: suggestion.complexity === "Medium"
													? "bg-amber-500/10 text-amber-600"
													: "bg-rose-500/10 text-rose-600"
										)}
									>
										{suggestion.complexity}
									</span>
									{suggestion.subtasks && suggestion.subtasks.length > 0 && (
										<span className="text-muted-foreground text-xs">
											{
												Array.from(selectedSubtasks).filter((key) =>
													key.startsWith(`${index}-`)
												).length
											}{" "}
											/ {suggestion.subtasks.length} subtasks
										</span>
									)}
									{selectedTasks.has(index) ? (
										<div className="bg-primary/10 rounded-full p-1">
											<Check className="text-primary h-4 w-4" />
										</div>
									) : (
										<></>
									)}
								</div>
							</div>

							{suggestion.subtasks && suggestion.subtasks.length > 0 && (
								<div className="bg-muted/40 space-y-3 rounded-lg p-3">
									<h5 className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
										<ChevronRight className="h-3 w-3" />
										Subtasks
									</h5>
									<div className="space-y-3">
										{suggestion.subtasks.map((subtask, subtaskIndex) => (
											<div
												key={subtaskIndex}
												className="space-y-1.5"
												onClick={(e) => onSubtaskSelect(index, subtaskIndex, e)}
											>
												<div
													className={cn(
														"flex items-start justify-between gap-2 rounded-lg p-2 transition-colors",
														selectedSubtasks.has(`${index}-${subtaskIndex}`)
															? "bg-primary/10"
															: "hover:bg-muted/60"
													)}
												>
													<div className="flex items-start gap-2">
														<div className="mt-1">
															{selectedSubtasks.has(
																`${index}-${subtaskIndex}`
															) ? (
																<Check className="text-primary h-3 w-3" />
															) : (
																<div className="border-muted-foreground/30 h-3 w-3 rounded-sm border" />
															)}
														</div>
														<div>
															<h6 className="text-sm font-medium">
																{subtask.title}
															</h6>
															<p className="text-muted-foreground text-xs">
																{subtask.description}
															</p>
														</div>
													</div>
													<span
														className={cn(
															"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
															subtask.complexity === "Easy"
																? "bg-emerald-500/10 text-emerald-600"
																: subtask.complexity === "Medium"
																	? "bg-amber-500/10 text-amber-600"
																	: "bg-rose-500/10 text-rose-600"
														)}
													>
														{subtask.complexity}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
