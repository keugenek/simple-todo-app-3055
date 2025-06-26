
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type Todo, type UpdateTodoInput } from '../schema';
import { updateTodo } from '../handlers/update_todo';
import { eq } from 'drizzle-orm';

describe('updateTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper to create a todo for tests
  const createTestTodo = async (title: string = 'Initial Todo', completed: boolean = false): Promise<Todo> => {
    const [insertedTodo] = await db.insert(todosTable).values({ title, completed }).returning().execute();
    return insertedTodo;
  };

  it('should update the title of an existing todo', async () => {
    const initialTodo = await createTestTodo();
    const newTitle = 'Updated Todo Title';
    const input: UpdateTodoInput = { id: initialTodo.id, title: newTitle };

    const updatedTodo = await updateTodo(input);

    expect(updatedTodo).toBeDefined();
    expect(updatedTodo.id).toEqual(initialTodo.id);
    expect(updatedTodo.title).toEqual(newTitle);
    expect(updatedTodo.completed).toEqual(initialTodo.completed); // Should remain unchanged
    expect(updatedTodo.created_at).toEqual(initialTodo.created_at); // Should remain unchanged
    expect(updatedTodo.updated_at.getTime()).toBeGreaterThan(initialTodo.updated_at.getTime()); // updated_at should change

    // Verify in database
    const [dbTodo] = await db.select().from(todosTable).where(eq(todosTable.id, initialTodo.id)).execute();
    expect(dbTodo).toBeDefined();
    expect(dbTodo.title).toEqual(newTitle);
    expect(dbTodo.completed).toEqual(initialTodo.completed);
    expect(dbTodo.created_at.getTime()).toEqual(initialTodo.created_at.getTime());
    expect(dbTodo.updated_at.getTime()).toBeGreaterThan(initialTodo.updated_at.getTime());
  });

  it('should update the completed status of an existing todo', async () => {
    const initialTodo = await createTestTodo('Task to complete', false);
    const input: UpdateTodoInput = { id: initialTodo.id, completed: true };

    const updatedTodo = await updateTodo(input);

    expect(updatedTodo).toBeDefined();
    expect(updatedTodo.id).toEqual(initialTodo.id);
    expect(updatedTodo.title).toEqual(initialTodo.title); // Should remain unchanged
    expect(updatedTodo.completed).toEqual(true);
    expect(updatedTodo.created_at).toEqual(initialTodo.created_at); // Should remain unchanged
    expect(updatedTodo.updated_at.getTime()).toBeGreaterThan(initialTodo.updated_at.getTime()); // updated_at should change

    // Verify in database
    const [dbTodo] = await db.select().from(todosTable).where(eq(todosTable.id, initialTodo.id)).execute();
    expect(dbTodo).toBeDefined();
    expect(dbTodo.completed).toEqual(true);
    expect(dbTodo.title).toEqual(initialTodo.title);
    expect(dbTodo.created_at.getTime()).toEqual(initialTodo.created_at.getTime());
    expect(dbTodo.updated_at.getTime()).toBeGreaterThan(initialTodo.updated_at.getTime());
  });

  it('should update both title and completed status of an existing todo', async () => {
    const initialTodo = await createTestTodo('Old Title', false);
    const newTitle = 'New Title for Task';
    const input: UpdateTodoInput = { id: initialTodo.id, title: newTitle, completed: true };

    const updatedTodo = await updateTodo(input);

    expect(updatedTodo).toBeDefined();
    expect(updatedTodo.id).toEqual(initialTodo.id);
    expect(updatedTodo.title).toEqual(newTitle);
    expect(updatedTodo.completed).toEqual(true);
    expect(updatedTodo.created_at).toEqual(initialTodo.created_at);
    expect(updatedTodo.updated_at.getTime()).toBeGreaterThan(initialTodo.updated_at.getTime());

    // Verify in database
    const [dbTodo] = await db.select().from(todosTable).where(eq(todosTable.id, initialTodo.id)).execute();
    expect(dbTodo).toBeDefined();
    expect(dbTodo.title).toEqual(newTitle);
    expect(dbTodo.completed).toEqual(true);
    expect(dbTodo.created_at.getTime()).toEqual(initialTodo.created_at.getTime());
    expect(dbTodo.updated_at.getTime()).toBeGreaterThan(initialTodo.updated_at.getTime());
  });

  it('should throw an error if the todo ID does not exist', async () => {
    const nonExistentId = 9999;
    const input: UpdateTodoInput = { id: nonExistentId, title: 'Non-existent task' };

    await expect(updateTodo(input)).rejects.toThrow(`Todo with ID ${nonExistentId} not found.`);
  });

  it('should update updated_at even if no other fields are changed or values are identical', async () => {
    const initialTodo = await createTestTodo('Only updated_at test');
    const initialUpdatedAt = initialTodo.updated_at;

    // Wait a short moment to ensure timestamp difference for comparison
    await new Promise(resolve => setTimeout(resolve, 10));

    // Input values are identical to current, but still trigger an update
    const input: UpdateTodoInput = {
      id: initialTodo.id,
      title: initialTodo.title,
      completed: initialTodo.completed
    };

    const updatedTodo = await updateTodo(input);

    expect(updatedTodo).toBeDefined();
    expect(updatedTodo.id).toEqual(initialTodo.id);
    expect(updatedTodo.title).toEqual(initialTodo.title);
    expect(updatedTodo.completed).toEqual(initialTodo.completed);
    expect(updatedTodo.created_at).toEqual(initialTodo.created_at);
    // updated_at should be different (newer) even if values are identical
    expect(updatedTodo.updated_at.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());

    // Verify in database
    const [dbTodo] = await db.select().from(todosTable).where(eq(todosTable.id, initialTodo.id)).execute();
    expect(dbTodo).toBeDefined();
    expect(dbTodo.updated_at.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
  });

  it('should handle partial updates where only ID is provided (no effect on data but updates timestamp)', async () => {
    const initialTodo = await createTestTodo('Partial update test');
    const initialUpdatedAt = initialTodo.updated_at;

    // Wait a short moment
    await new Promise(resolve => setTimeout(resolve, 10));

    // Only ID provided, no title or completed fields
    const input: UpdateTodoInput = { id: initialTodo.id };

    const updatedTodo = await updateTodo(input);

    expect(updatedTodo).toBeDefined();
    expect(updatedTodo.id).toEqual(initialTodo.id);
    expect(updatedTodo.title).toEqual(initialTodo.title); // Should be unchanged
    expect(updatedTodo.completed).toEqual(initialTodo.completed); // Should be unchanged
    expect(updatedTodo.created_at).toEqual(initialTodo.created_at);
    expect(updatedTodo.updated_at.getTime()).toBeGreaterThan(initialUpdatedAt.getTime()); // Timestamp should still update

    // Verify in database
    const [dbTodo] = await db.select().from(todosTable).where(eq(todosTable.id, initialTodo.id)).execute();
    expect(dbTodo).toBeDefined();
    expect(dbTodo.title).toEqual(initialTodo.title);
    expect(dbTodo.completed).toEqual(initialTodo.completed);
    expect(dbTodo.updated_at.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
  });
});
