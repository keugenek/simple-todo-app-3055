
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper to create a todo for testing
  const createTestTodo = async (title: string = 'Test Todo'): Promise<number> => {
    const input: CreateTodoInput = { title };
    const result = await db.insert(todosTable)
      .values(input)
      .returning({ id: todosTable.id })
      .execute();
    return result[0].id;
  };

  it('should successfully delete an existing todo', async () => {
    // Arrange: Create a todo to be deleted
    const todoIdToDelete = await createTestTodo();

    // Act: Delete the todo
    const result = await deleteTodo({ id: todoIdToDelete });

    // Assert 1: Handler returned success true and correct ID
    expect(result.success).toBeTrue();
    expect(result.id).toEqual(todoIdToDelete);

    // Assert 2: Verify the todo is no longer in the database
    const todosInDb = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoIdToDelete))
      .execute();

    expect(todosInDb).toHaveLength(0);
  });

  it('should return success false when attempting to delete a non-existent todo', async () => {
    // Arrange: Use an ID that is highly unlikely to exist
    const nonExistentId = 999999;

    // Act: Attempt to delete the non-existent todo
    const result = await deleteTodo({ id: nonExistentId });

    // Assert: Handler returned success false and the attempted ID
    expect(result.success).toBeFalse();
    expect(result.id).toEqual(nonExistentId);

    // No changes should have occurred in the database.
    // We can verify by checking if any other todos exist (if any were created for other reasons),
    // but the main point is that the specific ID was not found/deleted.
  });

  it('should only delete the specified todo and leave others untouched', async () => {
    // Arrange: Create multiple todos
    const todo1Id = await createTestTodo('First Todo');
    const todo2Id = await createTestTodo('Second Todo');
    const todo3Id = await createTestTodo('Third Todo');

    // Act: Delete only the second todo
    const result = await deleteTodo({ id: todo2Id });

    // Assert 1: Deletion of todo2 was successful
    expect(result.success).toBeTrue();
    expect(result.id).toEqual(todo2Id);

    // Assert 2: Verify todo2 is gone
    const deletedTodoCheck = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todo2Id))
      .execute();
    expect(deletedTodoCheck).toHaveLength(0);

    // Assert 3: Verify todo1 and todo3 still exist
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(2); // Only two should remain
    expect(remainingTodos.some(todo => todo.id === todo1Id)).toBeTrue();
    expect(remainingTodos.some(todo => todo.id === todo3Id)).toBeTrue();
    expect(remainingTodos.some(todo => todo.id === todo2Id)).toBeFalse(); // Double-check it's truly gone
  });
});
