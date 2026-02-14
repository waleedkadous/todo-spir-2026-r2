import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getTodos,
  saveTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  filterTodos,
  sortTodosByCreatedAt,
} from "@/lib/storage";
import { Todo, TodoFilters } from "@/types/todo";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => "test-uuid-" + Math.random().toString(36).slice(2, 9)),
});

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("getTodos", () => {
  it("returns empty array when no data in localStorage", () => {
    expect(getTodos()).toEqual([]);
  });

  it("returns parsed todos from localStorage", () => {
    const todos: Todo[] = [
      {
        id: "1",
        title: "Test",
        description: "",
        priority: "medium",
        dueDate: null,
        status: "pending",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    localStorageMock.setItem("todo-manager-todos", JSON.stringify(todos));
    expect(getTodos()).toEqual(todos);
  });

  it("returns empty array on invalid JSON", () => {
    localStorageMock.setItem("todo-manager-todos", "not json");
    expect(getTodos()).toEqual([]);
  });
});

describe("saveTodos", () => {
  it("saves todos to localStorage", () => {
    const todos: Todo[] = [
      {
        id: "1",
        title: "Test",
        description: "",
        priority: "medium",
        dueDate: null,
        status: "pending",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    saveTodos(todos);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "todo-manager-todos",
      JSON.stringify(todos)
    );
  });
});

describe("localStorage unavailable", () => {
  it("throws when localStorage.setItem fails on save", () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => saveTodos([])).toThrow("Failed to save todos");
  });

  it("throws when addTodo cannot persist", () => {
    // First setItem call succeeds (for the initial read), but we need
    // to make the save fail
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = vi.fn(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => addTodo({ title: "Test" })).toThrow("Failed to save todos");
    localStorageMock.setItem = originalSetItem;
  });

  it("returns empty array when localStorage.getItem throws", () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error("SecurityError");
    });
    expect(getTodos()).toEqual([]);
  });
});

describe("addTodo", () => {
  it("creates a todo with all fields", () => {
    const todo = addTodo({
      title: "Buy groceries",
      description: "Milk, eggs, bread",
      priority: "high",
      dueDate: "2026-02-15",
    });

    expect(todo.title).toBe("Buy groceries");
    expect(todo.description).toBe("Milk, eggs, bread");
    expect(todo.priority).toBe("high");
    expect(todo.dueDate).toBe("2026-02-15");
    expect(todo.status).toBe("pending");
    expect(todo.id).toBeDefined();
    expect(todo.createdAt).toBeDefined();
    expect(todo.updatedAt).toBeDefined();
  });

  it("applies default values for optional fields", () => {
    const todo = addTodo({ title: "Simple todo" });

    expect(todo.description).toBe("");
    expect(todo.priority).toBe("medium");
    expect(todo.dueDate).toBeNull();
    expect(todo.status).toBe("pending");
  });

  it("trims whitespace from title", () => {
    const todo = addTodo({ title: "  Trimmed title  " });
    expect(todo.title).toBe("Trimmed title");
  });

  it("throws error for empty title", () => {
    expect(() => addTodo({ title: "" })).toThrow("Title is required");
  });

  it("throws error for whitespace-only title", () => {
    expect(() => addTodo({ title: "   " })).toThrow("Title is required");
  });

  it("throws error for title exceeding 200 characters", () => {
    const longTitle = "a".repeat(201);
    expect(() => addTodo({ title: longTitle })).toThrow(
      "Title must be 200 characters or less"
    );
  });

  it("throws error for description exceeding 2000 characters", () => {
    const longDescription = "a".repeat(2001);
    expect(() =>
      addTodo({ title: "Test", description: longDescription })
    ).toThrow("Description must be 2000 characters or less");
  });

  it("accepts title at exactly 200 characters", () => {
    const title = "a".repeat(200);
    const todo = addTodo({ title });
    expect(todo.title).toBe(title);
  });

  it("accepts description at exactly 2000 characters", () => {
    const description = "a".repeat(2000);
    const todo = addTodo({ title: "Test", description });
    expect(todo.description).toBe(description);
  });

  it("persists to localStorage", () => {
    addTodo({ title: "Persisted todo" });
    const stored = getTodos();
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("Persisted todo");
  });

  it("appends to existing todos", () => {
    addTodo({ title: "First" });
    addTodo({ title: "Second" });
    const stored = getTodos();
    expect(stored).toHaveLength(2);
  });
});

describe("updateTodo", () => {
  it("updates a todo's priority", () => {
    const todo = addTodo({ title: "Test" });
    const updated = updateTodo(todo.id, { priority: "high" });
    expect(updated.priority).toBe("high");
  });

  it("updates a todo's status", () => {
    const todo = addTodo({ title: "Test" });
    const updated = updateTodo(todo.id, { status: "completed" });
    expect(updated.status).toBe("completed");
  });

  it("updates a todo's title", () => {
    const todo = addTodo({ title: "Old title" });
    const updated = updateTodo(todo.id, { title: "New title" });
    expect(updated.title).toBe("New title");
  });

  it("validates title on update", () => {
    const todo = addTodo({ title: "Test" });
    expect(() => updateTodo(todo.id, { title: "" })).toThrow(
      "Title is required"
    );
  });

  it("validates description on update", () => {
    const todo = addTodo({ title: "Test" });
    expect(() =>
      updateTodo(todo.id, { description: "a".repeat(2001) })
    ).toThrow("Description must be 2000 characters or less");
  });

  it("updates the updatedAt timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const todo = addTodo({ title: "Test" });

    vi.setSystemTime(new Date("2026-01-02T00:00:00.000Z"));
    const updated = updateTodo(todo.id, { priority: "high" });
    expect(updated.updatedAt).not.toBe(todo.updatedAt);
    expect(updated.updatedAt).toBe("2026-01-02T00:00:00.000Z");
    vi.useRealTimers();
  });

  it("throws error for non-existent todo", () => {
    expect(() => updateTodo("nonexistent", { priority: "high" })).toThrow(
      "Todo with id nonexistent not found"
    );
  });

  it("persists changes to localStorage", () => {
    const todo = addTodo({ title: "Test" });
    updateTodo(todo.id, { priority: "high" });
    const stored = getTodos();
    expect(stored[0].priority).toBe("high");
  });
});

describe("deleteTodo", () => {
  it("removes a todo from storage", () => {
    const todo = addTodo({ title: "To delete" });
    deleteTodo(todo.id);
    expect(getTodos()).toHaveLength(0);
  });

  it("throws error for non-existent todo", () => {
    expect(() => deleteTodo("nonexistent")).toThrow(
      "Todo with id nonexistent not found"
    );
  });

  it("only removes the specified todo", () => {
    const todo1 = addTodo({ title: "Keep" });
    const todo2 = addTodo({ title: "Delete" });
    deleteTodo(todo2.id);
    const stored = getTodos();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(todo1.id);
  });
});

describe("filterTodos", () => {
  const todos: Todo[] = [
    {
      id: "1",
      title: "High pending",
      description: "",
      priority: "high",
      dueDate: null,
      status: "pending",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      title: "Low completed",
      description: "",
      priority: "low",
      dueDate: null,
      status: "completed",
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    },
    {
      id: "3",
      title: "Medium pending",
      description: "",
      priority: "medium",
      dueDate: null,
      status: "pending",
      createdAt: "2026-01-03T00:00:00.000Z",
      updatedAt: "2026-01-03T00:00:00.000Z",
    },
    {
      id: "4",
      title: "High completed",
      description: "",
      priority: "high",
      dueDate: null,
      status: "completed",
      createdAt: "2026-01-04T00:00:00.000Z",
      updatedAt: "2026-01-04T00:00:00.000Z",
    },
  ];

  it("returns all todos with no filters", () => {
    const filters: TodoFilters = { status: "all", priority: "all" };
    expect(filterTodos(todos, filters)).toHaveLength(4);
  });

  it("filters by status pending", () => {
    const filters: TodoFilters = { status: "pending", priority: "all" };
    const result = filterTodos(todos, filters);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.status === "pending")).toBe(true);
  });

  it("filters by status completed", () => {
    const filters: TodoFilters = { status: "completed", priority: "all" };
    const result = filterTodos(todos, filters);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.status === "completed")).toBe(true);
  });

  it("filters by priority high", () => {
    const filters: TodoFilters = { status: "all", priority: "high" };
    const result = filterTodos(todos, filters);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.priority === "high")).toBe(true);
  });

  it("filters by combined status and priority", () => {
    const filters: TodoFilters = { status: "pending", priority: "high" };
    const result = filterTodos(todos, filters);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("High pending");
  });

  it("returns empty array when no matches", () => {
    const filters: TodoFilters = { status: "completed", priority: "medium" };
    const result = filterTodos(todos, filters);
    expect(result).toHaveLength(0);
  });
});

describe("sortTodosByCreatedAt", () => {
  it("sorts todos by createdAt descending (newest first)", () => {
    const todos: Todo[] = [
      {
        id: "1",
        title: "First",
        description: "",
        priority: "medium",
        dueDate: null,
        status: "pending",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        title: "Second",
        description: "",
        priority: "medium",
        dueDate: null,
        status: "pending",
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-03T00:00:00.000Z",
      },
      {
        id: "3",
        title: "Third",
        description: "",
        priority: "medium",
        dueDate: null,
        status: "pending",
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ];

    const sorted = sortTodosByCreatedAt(todos);
    expect(sorted[0].title).toBe("Second");
    expect(sorted[1].title).toBe("Third");
    expect(sorted[2].title).toBe("First");
  });

  it("does not mutate the original array", () => {
    const todos: Todo[] = [
      {
        id: "1",
        title: "First",
        description: "",
        priority: "medium",
        dueDate: null,
        status: "pending",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    const sorted = sortTodosByCreatedAt(todos);
    expect(sorted).not.toBe(todos);
  });

  it("handles empty array", () => {
    expect(sortTodosByCreatedAt([])).toEqual([]);
  });
});
