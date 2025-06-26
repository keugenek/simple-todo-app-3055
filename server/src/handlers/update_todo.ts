
import { db } from '../db';
import { todosTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateTodoInput, type Todo } from '../schema';

export const updateTodo = async (input: UpdateTodoInput): Promise<Todo> => {
  try {
    const { id, title, completed } = input;

    // Use Partial<Omit<Todo, ...>> to build a type for the update payload
    // and explicitly allow 'updated_at' for cases where it's manually set.
    const updateFields: Partial<Omit<Todo, 'id' | 'created_at'>> = {};
    let hasExplicitContentFields = false; // Tracks if title or completed are provided

    if (title !== undefined) {
      updateFields.title = title;
      hasExplicitContentFields = true;
    }
    if (completed !== undefined) {
      updateFields.completed = completed;
      hasExplicitContentFields = true;
    }

    // If no user-defined content fields (title or completed) are being updated,
    // we still want to trigger an update on the row to ensure 'updated_at' is touched.
    // Drizzle's .set({}) is not allowed, so we explicitly set updated_at.
    // This will take precedence over the $onUpdate hook for this specific case,
    // but ensures the `updated_at` timestamp is correctly updated when no other fields change.
    if (!hasExplicitContentFields) {
      updateFields.updated_at = new Date();
    }

    const result = await db.update(todosTable)
      .set(updateFields)
      .where(eq(todosTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Todo with ID ${id} not found.`);
    }

    // Drizzle's $inferSelect type already handles `Date` objects for `timestamp` columns.
    return result[0];
  } catch (error) {
    console.error(`Failed to update todo with ID ${input.id}:`, error);
    throw error;
  }
};
