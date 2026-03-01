"use client";

import { useState } from "react";
import { Todo, Priority } from "@/types/todo";
import { TodoForm } from "./TodoForm";

const priorityColors: Record<Priority, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

interface TodoItemProps {
  todo: Todo;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Todo, "title" | "description" | "priority" | "dueDate" | "status">>
  ) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleStatus = () => {
    onUpdate(todo.id, {
      status: todo.status === "pending" ? "completed" : "pending",
    });
  };

  const handleEdit = (data: {
    title: string;
    description?: string;
    priority?: Priority;
    dueDate?: string | null;
  }) => {
    onUpdate(todo.id, {
      title: data.title,
      description: data.description ?? "",
      priority: data.priority,
      dueDate: data.dueDate,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(todo.id);
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <TodoForm
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
          initialData={todo}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        todo.status === "completed"
          ? "border-gray-200 bg-gray-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleStatus}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
            todo.status === "completed"
              ? "border-blue-500 bg-blue-500 text-white"
              : "border-gray-300 hover:border-blue-400"
          }`}
          aria-label={
            todo.status === "completed"
              ? "Mark as pending"
              : "Mark as completed"
          }
        >
          {todo.status === "completed" && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-sm font-medium ${
                todo.status === "completed"
                  ? "text-gray-400 line-through"
                  : "text-gray-900"
              }`}
            >
              {todo.title}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                priorityColors[todo.priority]
              }`}
            >
              {todo.priority}
            </span>
          </div>
          {todo.description && (
            <p
              className={`mt-1 text-sm ${
                todo.status === "completed" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {todo.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            {todo.dueDate && (
              <span>
                Due: {new Date(todo.dueDate + "T00:00:00").toLocaleDateString()}
              </span>
            )}
            <span>
              Created: {new Date(todo.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Edit todo"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete todo"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
