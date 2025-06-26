
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';

// Type-only imports
import type { Todo, CreateTodoInput, UpdateTodoInput, DeleteTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState<boolean>(false);
  const [isCreatingTodo, setIsCreatingTodo] = useState<boolean>(false);
  const [isUpdatingTodo, setIsUpdatingTodo] = useState<boolean>(false);
  const [isDeletingTodo, setIsDeletingTodo] = useState<boolean>(false);

  const loadTodos = useCallback(async () => {
    setIsLoadingTodos(true);
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoadingTodos(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = useCallback(async (data: CreateTodoInput) => {
    setIsCreatingTodo(true);
    try {
      const newTodo = await trpc.createTodo.mutate(data);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsCreatingTodo(false);
    }
  }, []);

  const handleToggleComplete = useCallback(async (data: UpdateTodoInput) => {
    setIsUpdatingTodo(true);
    try {
      const updatedTodo = await trpc.updateTodo.mutate(data);
      setTodos((prev: Todo[]) =>
        prev.map((todo: Todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
    } catch (error) {
      console.error('Failed to update todo:', error);
    } finally {
      setIsUpdatingTodo(false);
    }
  }, []);

  const handleDeleteTodo = useCallback(async (data: DeleteTodoInput) => {
    setIsDeletingTodo(true);
    try {
      await trpc.deleteTodo.mutate(data);
      setTodos((prev: Todo[]) => prev.filter((todo: Todo) => todo.id !== data.id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    } finally {
      setIsDeletingTodo(false);
    }
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-lg bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-700">
        My Awesome Todo List <span role="img" aria-label="sparkles">✨</span>
      </h1>

      <TodoForm onSubmit={handleCreateTodo} isLoading={isCreatingTodo} />

      {isLoadingTodos ? (
        <p className="text-center text-gray-500 text-lg">Loading todos...</p>
      ) : (
        <TodoList
          todos={todos}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
          isLoadingUpdate={isUpdatingTodo}
          isLoadingDelete={isDeletingTodo}
        />
      )}
    </div>
  );
}

export default App;
