"use client";

import { useState, useCallback, useEffect } from "react";
import { Todo, TodoFilters } from "@/types/todo";
import {
  getTodos,
  addTodo as addTodoToStorage,
  updateTodo as updateTodoInStorage,
  deleteTodo as deleteTodoFromStorage,
  filterTodos,
  sortTodosByCreatedAt,
} from "@/lib/storage";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filters, setFilters] = useState<TodoFilters>({
    status: "all",
    priority: "all",
  });

  useEffect(() => {
    setTodos(getTodos());
  }, []);

  const addTodo = useCallback(
    (input: Parameters<typeof addTodoToStorage>[0]) => {
      const newTodo = addTodoToStorage(input);
      setTodos(getTodos());
      return newTodo;
    },
    []
  );

  const updateTodo = useCallback(
    (id: string, updates: Parameters<typeof updateTodoInStorage>[1]) => {
      const updated = updateTodoInStorage(id, updates);
      setTodos(getTodos());
      return updated;
    },
    []
  );

  const deleteTodo = useCallback((id: string) => {
    deleteTodoFromStorage(id);
    setTodos(getTodos());
  }, []);

  const filteredTodos = sortTodosByCreatedAt(filterTodos(todos, filters));

  return {
    todos,
    filteredTodos,
    filters,
    setFilters,
    addTodo,
    updateTodo,
    deleteTodo,
  };
}
