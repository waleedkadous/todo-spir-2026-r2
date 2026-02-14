"use client";

import { Todo, TodoFilters } from "@/types/todo";
import { TodoItem } from "./TodoItem";
import { EmptyState } from "./EmptyState";

interface TodoListProps {
  todos: Todo[];
  filters: TodoFilters;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Todo, "title" | "description" | "priority" | "dueDate" | "status">>
  ) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, filters, onUpdate, onDelete }: TodoListProps) {
  const hasFilters = filters.status !== "all" || filters.priority !== "all";

  if (todos.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
