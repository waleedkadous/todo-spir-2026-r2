"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useChat } from "@/hooks/useChat";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { FilterBar } from "@/components/FilterBar";
import { ChatPanel } from "@/components/ChatPanel";

export default function Home() {
  const { todos, filteredTodos, filters, setFilters, addTodo, updateTodo, deleteTodo } =
    useTodos();
  const [showForm, setShowForm] = useState(false);
  const { messages, isLoading, sendMessage } = useChat({
    addTodo,
    updateTodo,
    deleteTodo,
    setFilters,
    todos,
    filters,
  });

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Todo panel — full width on mobile, left column on desktop */}
      <main className="flex-1 p-4 pb-24 lg:overflow-y-auto lg:h-screen">
        <div className="mx-auto max-w-3xl">
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
        </div>
      </main>

      {/* Chat sidebar — stacks below on mobile, right column on desktop */}
      <aside className="w-full border-t border-gray-200 bg-white lg:w-96 lg:border-l lg:border-t-0 lg:h-screen lg:overflow-hidden">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
        />
      </aside>
    </div>
  );
}
