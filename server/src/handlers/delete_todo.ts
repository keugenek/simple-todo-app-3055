
import { type DeleteTodoInput } from '../schema';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteTodo = async (input: DeleteTodoInput): Promise<{ success: boolean; id: number }> => {
  try {
    // Delete the todo record
    // Use .returning() to get the deleted row, which helps determine if a row was actually deleted.
    const deletedTodos = await db.delete(todosTable)
      .where(eq(todosTable.id, input.id))
      .returning({ id: todosTable.id }) // Only return the ID, as success is based on presence
      .execute();

    // Check if any todo was actually deleted
    const success = deletedTodos.length > 0;

    return { success, id: input.id };
  } catch (error) {
    console.error(`Todo deletion failed for ID ${input.id}:`, error);
    throw error;
  }
};
