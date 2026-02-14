"use client";

import { useState, useCallback } from "react";
import { Todo, TodoFilters, Priority } from "@/types/todo";
import { parseAction, executeAction } from "@/lib/actionExecutor";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY = 10;

export function useChat(callbacks: {
  addTodo: (input: { title: string; description?: string; priority?: Priority; dueDate?: string | null }) => Todo;
  updateTodo: (id: string, updates: Partial<Pick<Todo, "title" | "description" | "priority" | "dueDate" | "status">>) => Todo;
  deleteTodo: (id: string) => void;
  setFilters: (filters: TodoFilters) => void;
  todos: Todo[];
  filters: TodoFilters;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const history = [...messages, userMessage]
          .slice(-MAX_HISTORY)
          .map((m) => ({ role: m.role, content: m.content }));

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            todos: callbacks.todos,
            history,
            filters: callbacks.filters,
            today,
          }),
        });

        if (res.status === 429) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Rate limit reached. Please wait a moment and try again." },
          ]);
          return;
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: err.error || "Something went wrong. Please try again." },
          ]);
          return;
        }

        const data = await res.json();
        const rawResponse = data.response as string;

        let action;
        try {
          action = parseAction(rawResponse);
        } catch {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "I had trouble understanding the response. Please try again." },
          ]);
          return;
        }

        const result = executeAction(action, {
          addTodo: callbacks.addTodo,
          updateTodo: callbacks.updateTodo,
          deleteTodo: callbacks.deleteTodo,
          setFilters: callbacks.setFilters,
          todos: callbacks.todos,
        });

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.message },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Failed to connect to the server. Please check your connection." },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, callbacks]
  );

  return { messages, isLoading, sendMessage };
}
