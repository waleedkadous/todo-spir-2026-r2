import { Todo, Priority, TodoFilters } from "@/types/todo";

const STORAGE_KEY = "todo-manager-todos";
const TITLE_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 2000;

export function getTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Todo[];
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    throw new Error(
      `Failed to save todos: ${e instanceof Error ? e.message : "localStorage unavailable"}`,
      { cause: e }
    );
  }
}

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error("Title is required");
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    throw new Error(`Title must be ${TITLE_MAX_LENGTH} characters or less`);
  }
  return trimmed;
}

function validateDescription(description: string): string {
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    throw new Error(
      `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`
    );
  }
  return description;
}

export function addTodo(input: {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
}): Todo {
  const title = validateTitle(input.title);
  const description = validateDescription(input.description ?? "");
  const now = new Date().toISOString();

  const todo: Todo = {
    id: crypto.randomUUID(),
    title,
    description,
    priority: input.priority ?? "medium",
    dueDate: input.dueDate ?? null,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const todos = getTodos();
  todos.push(todo);
  saveTodos(todos);
  return todo;
}

export function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "title" | "description" | "priority" | "dueDate" | "status">>
): Todo {
  const todos = getTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`Todo with id ${id} not found`);
  }

  if (updates.title !== undefined) {
    updates.title = validateTitle(updates.title);
  }
  if (updates.description !== undefined) {
    updates.description = validateDescription(updates.description);
  }

  const updated: Todo = {
    ...todos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  todos[index] = updated;
  saveTodos(todos);
  return updated;
}

export function deleteTodo(id: string): void {
  const todos = getTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`Todo with id ${id} not found`);
  }
  todos.splice(index, 1);
  saveTodos(todos);
}

export function filterTodos(
  todos: Todo[],
  filters: TodoFilters
): Todo[] {
  return todos.filter((todo) => {
    if (filters.status !== "all" && todo.status !== filters.status) {
      return false;
    }
    if (filters.priority !== "all" && todo.priority !== filters.priority) {
      return false;
    }
    if (filters.dueBefore && todo.dueDate) {
      if (todo.dueDate > filters.dueBefore) return false;
    }
    if (filters.dueAfter && todo.dueDate) {
      if (todo.dueDate < filters.dueAfter) return false;
    }
    if ((filters.dueBefore || filters.dueAfter) && !todo.dueDate) {
      return false;
    }
    return true;
  });
}

export function sortTodosByCreatedAt(todos: Todo[]): Todo[] {
  return [...todos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
