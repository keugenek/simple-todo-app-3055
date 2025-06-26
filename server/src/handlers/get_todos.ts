
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type Todo } from '../schema';

/**
 * Fetches all todo items from the database.
 * @returns A promise that resolves to an array of Todo objects.
 */
export const getTodos = async (): Promise<Todo[]> => {
  try {
    // Select all columns from the todosTable
    const todos = await db.select().from(todosTable).execute();

    // No numeric columns in todosTable, so no parseFloat conversion is needed.
    // Drizzle ORM automatically handles `timestamp` columns as Date objects.
    return todos;
  } catch (error) {
    console.error('Failed to retrieve todos:', error);
    // Rethrow the error to be handled by the caller
    throw error;
  }
};
