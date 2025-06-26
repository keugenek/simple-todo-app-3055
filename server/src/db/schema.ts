
import { serial, text, pgTable, timestamp, boolean } from 'drizzle-orm/pg-core';

export const todosTable = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(), // Todo title, not null
  completed: boolean('completed').notNull().default(false), // Completion status, defaults to false, not null
  created_at: timestamp('created_at').defaultNow().notNull(), // Timestamp of creation, defaults to current time, not null
  updated_at: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()), // Timestamp of last update, updates on change, not null
});

// TypeScript type for the table schema for select operations
export type Todo = typeof todosTable.$inferSelect;
// TypeScript type for the table schema for insert operations
export type NewTodo = typeof todosTable.$inferInsert;

// Important: Export all tables and relations for proper query building
export const tables = { todos: todosTable };
