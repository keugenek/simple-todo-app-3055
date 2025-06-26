
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { CreateTodoInput } from '../../../server/src/schema';

interface TodoFormProps {
  onSubmit: (data: CreateTodoInput) => Promise<void>;
  isLoading?: boolean;
}

export function TodoForm({ onSubmit, isLoading = false }: TodoFormProps) {
  const [title, setTitle] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      await onSubmit({ title });
      setTitle(''); // Reset form after submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-8">
      <Input
        placeholder="What needs to be done?"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        className="flex-grow border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
      >
        {isLoading ? 'Adding...' : 'Add Todo'}
      </Button>
    </form>
  );
}
