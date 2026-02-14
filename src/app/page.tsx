"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { FilterBar } from "@/components/FilterBar";

export default function Home() {
  const { filteredTodos, filters, setFilters, addTodo, updateTodo, deleteTodo } =
    useTodos();
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="mx-auto max-w-3xl p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Todo Manager</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your tasks with a natural language interface.
        </p>
      </div>

      <div className="mb-4 flex items-end justify-between gap-4 flex-wrap">
        <FilterBar filters={filters} onFilterChange={setFilters} />
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + New Todo
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-900">
            Create New Todo
          </h2>
          <TodoForm
            onSubmit={(data) => {
              addTodo(data);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <TodoList
        todos={filteredTodos}
        filters={filters}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
      />
    </main>
  );
}
