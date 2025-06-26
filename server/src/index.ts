
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import Zod schemas for input validation
import {
  createTodoInputSchema,
  updateTodoInputSchema,
  deleteTodoInputSchema,
} from './schema';

// Import handlers for business logic
import { createTodo } from './handlers/create_todo';
import { getTodos } from './handlers/get_todos';
import { updateTodo } from './handlers/update_todo';
import { deleteTodo } from './handlers/delete_todo';

const t = initTRPC.create({
  transformer: superjson, // Use superjson for handling Dates and other complex types
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Todos API
  createTodo: publicProcedure
    .input(createTodoInputSchema)
    .mutation(({ input }) => createTodo(input)),

  getTodos: publicProcedure
    .query(() => getTodos()),

  updateTodo: publicProcedure
    .input(updateTodoInputSchema)
    .mutation(({ input }) => updateTodo(input)),

  deleteTodo: publicProcedure
    .input(deleteTodoInputSchema)
    .mutation(({ input }) => deleteTodo(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      // Apply CORS middleware
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      // Context can be used to pass database connections, user info, etc.
      // For this simple app, it's empty.
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
