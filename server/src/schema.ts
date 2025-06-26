
import { z } from 'zod';

// Todo schema for output
export const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
  created_at: z.coerce.date(), // Automatically converts string timestamps to Date objects
  updated_at: z.coerce.date(), // Automatically converts string timestamps to Date objects
});

export type Todo = z.infer<typeof todoSchema>;

// Input schema for creating todos
export const createTodoInputSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"), // Title is required and cannot be empty
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

// Input schema for updating todos
export const updateTodoInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title cannot be empty").optional(), // Title can be updated, but must not be empty if present
  completed: z.boolean().optional(), // Completed status can be updated
});

export type UpdateTodoInput = z.infer<typeof updateTodoInputSchema>;

// Input schema for deleting todos
export const deleteTodoInputSchema = z.object({
  id: z.number(),
});

export type DeleteTodoInput = z.infer<typeof deleteTodoInputSchema>;
