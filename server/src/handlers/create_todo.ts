
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput, type Todo } from '../schema';

export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  try {
    // Insert todo record
    // The 'completed', 'created_at', and 'updated_at' fields have default values
    // defined in the schema, so we only need to provide 'title'.
    const result = await db.insert(todosTable)
      .values({
        title: input.title,
      })
      .returning()
      .execute();

    // The `todosTable.$inferSelect` type correctly infers Date objects for timestamps
    // and boolean for completed, so no manual conversion is needed for these types.
    return result[0];
  } catch (error) {
    console.error('Todo creation failed:', error);
    throw error;
  }
};
