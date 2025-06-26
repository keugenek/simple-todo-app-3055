
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB); // Recreates and migrates the database before each test
  afterEach(resetDB);  // Resets (drops) the database after each test

  it('should return an empty array if no todos exist', async () => {
    const todos = await getTodos();
    expect(todos).toEqual([]);
    expect(todos).toHaveLength(0);
  });

  it('should return all todos when multiple todos exist', async () => {
    // Insert test data directly into the database for isolation
    const insertResult = await db.insert(todosTable).values([
      { title: 'Buy groceries', completed: false },
      { title: 'Walk the dog', completed: true },
      { title: 'Call mom', completed: false },
    ]).returning().execute(); // .returning() to get the inserted records back, including auto-generated IDs and timestamps

    expect(insertResult).toHaveLength(3); // Ensure 3 records were inserted

    const todos = await getTodos();

    expect(todos).toHaveLength(3);

    // Sort both arrays by id for consistent comparison, as order from select is not guaranteed without orderBy
    const sortedTodos = todos.sort((a, b) => a.id - b.id);
    const sortedInsertResult = insertResult.sort((a, b) => a.id - b.id);

    // Verify content and types for each todo
    sortedTodos.forEach((todo, index) => {
      const insertedTodo = sortedInsertResult[index];

      // Basic field validation
      expect(todo.id).toBeDefined();
      expect(typeof todo.id).toBe('number');
      expect(todo.id).toEqual(insertedTodo.id);

      expect(todo.title).toEqual(insertedTodo.title);
      expect(typeof todo.title).toBe('string');

      expect(todo.completed).toEqual(insertedTodo.completed);
      expect(typeof todo.completed).toBe('boolean');

      // Verify date types and approximate values
      expect(todo.created_at).toBeInstanceOf(Date);
      expect(todo.updated_at).toBeInstanceOf(Date);
      // Use toBeCloseTo for timestamps as there might be a slight difference in milliseconds
      expect(todo.created_at.getTime()).toBeCloseTo(insertedTodo.created_at.getTime(), -3); // -3 for milliseconds precision
      expect(todo.updated_at.getTime()).toBeCloseTo(insertedTodo.updated_at.getTime(), -3);
    });

    // Specific content checks
    expect(sortedTodos[0].title).toEqual('Buy groceries');
    expect(sortedTodos[0].completed).toBeFalse();
    expect(sortedTodos[1].title).toEqual('Walk the dog');
    expect(sortedTodos[1].completed).toBeTrue();
    expect(sortedTodos[2].title).toEqual('Call mom');
    expect(sortedTodos[2].completed).toBeFalse();
  });

  it('should return a single todo correctly', async () => {
    // Insert a single todo
    const [insertedTodo] = await db.insert(todosTable).values({
      title: 'Single Todo Test',
      completed: false,
    }).returning().execute();

    const todos = await getTodos();

    expect(todos).toHaveLength(1);
    const retrievedTodo = todos[0];

    expect(retrievedTodo.id).toEqual(insertedTodo.id);
    expect(retrievedTodo.title).toEqual('Single Todo Test');
    expect(retrievedTodo.completed).toBeFalse();
    expect(retrievedTodo.created_at).toBeInstanceOf(Date);
    expect(retrievedTodo.updated_at).toBeInstanceOf(Date);
    expect(retrievedTodo.created_at.getTime()).toBeCloseTo(insertedTodo.created_at.getTime(), -3);
    expect(retrievedTodo.updated_at.getTime()).toBeCloseTo(insertedTodo.updated_at.getTime(), -3);
  });
});
