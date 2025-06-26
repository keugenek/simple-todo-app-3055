
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  title: 'Buy groceries',
};

describe('createTodo', () => {
  // Setup and teardown for each test to ensure a clean database state
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo with the provided title and default completed status', async () => {
    const result = await createTodo(testInput);

    // Basic field validation of the returned object
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.title).toEqual(testInput.title);
    expect(result.completed).toBeFalse(); // Should default to false
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should persist the new todo in the database', async () => {
    const result = await createTodo(testInput);

    // Query the database directly to verify persistence
    const todosInDb = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todosInDb).toHaveLength(1);
    const storedTodo = todosInDb[0];

    expect(storedTodo.id).toEqual(result.id);
    expect(storedTodo.title).toEqual(testInput.title);
    expect(storedTodo.completed).toBeFalse();
    expect(storedTodo.created_at).toBeInstanceOf(Date);
    expect(storedTodo.updated_at).toBeInstanceOf(Date);

    // Check that created_at and updated_at are approximately now
    const now = new Date();
    // Allow a small margin for execution time difference
    expect(storedTodo.created_at.getTime()).toBeCloseTo(now.getTime(), -3000); // within 3 seconds
    expect(storedTodo.updated_at.getTime()).toBeCloseTo(now.getTime(), -3000); // within 3 seconds
  });

  it('should set created_at and updated_at to the same initial value', async () => {
    const result = await createTodo(testInput);

    // For a newly created record, created_at and updated_at should be identical
    expect(result.created_at.getTime()).toEqual(result.updated_at.getTime());

    // Verify this directly from the database as well
    const [storedTodo] = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(storedTodo.created_at.getTime()).toEqual(storedTodo.updated_at.getTime());
  });

  it('should handle a different title correctly', async () => {
    const customTitleInput: CreateTodoInput = {
      title: 'Learn Drizzle ORM',
    };
    const result = await createTodo(customTitleInput);

    expect(result.id).toBeDefined();
    expect(result.title).toEqual(customTitleInput.title);
    expect(result.completed).toBeFalse();

    const [storedTodo] = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(storedTodo.title).toEqual(customTitleInput.title);
  });
});
