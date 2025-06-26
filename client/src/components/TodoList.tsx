
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Todo, UpdateTodoInput, DeleteTodoInput } from '../../../server/src/schema';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (data: UpdateTodoInput) => Promise<void>;
  onDelete: (data: DeleteTodoInput) => Promise<void>;
  isLoadingUpdate: boolean;
  isLoadingDelete: boolean;
}

export function TodoList({
  todos,
  onToggleComplete,
  onDelete,
  isLoadingUpdate,
  isLoadingDelete,
}: TodoListProps) {
  return (
    <div className="space-y-3">
      {todos.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-8">No todos yet. Add one above!</p>
      ) : (
        todos.map((todo: Todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-4 border rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={(checked: boolean) => {
                  onToggleComplete({ id: todo.id, completed: checked });
                }}
                disabled={isLoadingUpdate}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor={`todo-${todo.id}`}
                className={`text-lg font-medium cursor-pointer ${
                  todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}
              >
                {todo.title}
              </label>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete({ id: todo.id })}
              disabled={isLoadingDelete}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition-colors duration-200"
            >
              Delete
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
