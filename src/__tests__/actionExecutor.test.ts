import { describe, it, expect, vi } from "vitest";
import { parseAction, executeAction } from "@/lib/actionExecutor";
import { NLAction } from "@/types/actions";
import { Todo } from "@/types/todo";

describe("parseAction", () => {
  describe("ADD_TODO", () => {
    it("parses a valid ADD_TODO action", () => {
      const raw = JSON.stringify({
        type: "ADD_TODO",
        title: "Buy groceries",
        priority: "high",
      });
      const action = parseAction(raw);
      expect(action).toEqual({
        type: "ADD_TODO",
        title: "Buy groceries",
        priority: "high",
      });
    });

    it("parses ADD_TODO with all optional fields", () => {
      const raw = JSON.stringify({
        type: "ADD_TODO",
        title: "Buy groceries",
        description: "Milk, bread, eggs",
        priority: "low",
        dueDate: "2026-02-15",
      });
      const action = parseAction(raw);
      expect(action).toEqual({
        type: "ADD_TODO",
        title: "Buy groceries",
        description: "Milk, bread, eggs",
        priority: "low",
        dueDate: "2026-02-15",
      });
    });

    it("parses ADD_TODO with only required fields", () => {
      const raw = JSON.stringify({ type: "ADD_TODO", title: "Test" });
      const action = parseAction(raw);
      expect(action).toEqual({ type: "ADD_TODO", title: "Test" });
    });

    it("throws when ADD_TODO has no title", () => {
      const raw = JSON.stringify({ type: "ADD_TODO" });
      expect(() => parseAction(raw)).toThrow("ADD_TODO requires a 'title' string");
    });

    it("throws when ADD_TODO title is not a string", () => {
      const raw = JSON.stringify({ type: "ADD_TODO", title: 123 });
      expect(() => parseAction(raw)).toThrow("ADD_TODO requires a 'title' string");
    });

    it("throws when ADD_TODO has invalid priority", () => {
      const raw = JSON.stringify({ type: "ADD_TODO", title: "Test", priority: "urgent" });
      expect(() => parseAction(raw)).toThrow("priority");
    });

    it("throws when ADD_TODO description is not a string", () => {
      const raw = JSON.stringify({ type: "ADD_TODO", title: "Test", description: 123 });
      expect(() => parseAction(raw)).toThrow("description");
    });

    it("throws when ADD_TODO dueDate is not a string", () => {
      const raw = JSON.stringify({ type: "ADD_TODO", title: "Test", dueDate: 123 });
      expect(() => parseAction(raw)).toThrow("dueDate");
    });
  });

  describe("UPDATE_TODO", () => {
    it("parses a valid UPDATE_TODO action", () => {
      const raw = JSON.stringify({
        type: "UPDATE_TODO",
        id: "abc-123",
        updates: { status: "completed" },
      });
      const action = parseAction(raw);
      expect(action).toEqual({
        type: "UPDATE_TODO",
        id: "abc-123",
        updates: { status: "completed" },
      });
    });

    it("parses UPDATE_TODO with multiple update fields", () => {
      const raw = JSON.stringify({
        type: "UPDATE_TODO",
        id: "abc-123",
        updates: { title: "New title", priority: "high", dueDate: null },
      });
      const action = parseAction(raw);
      expect(action).toEqual({
        type: "UPDATE_TODO",
        id: "abc-123",
        updates: { title: "New title", priority: "high", dueDate: null },
      });
    });

    it("throws when UPDATE_TODO has no id", () => {
      const raw = JSON.stringify({ type: "UPDATE_TODO", updates: {} });
      expect(() => parseAction(raw)).toThrow("UPDATE_TODO requires an 'id' string");
    });

    it("throws when UPDATE_TODO has no updates", () => {
      const raw = JSON.stringify({ type: "UPDATE_TODO", id: "abc" });
      expect(() => parseAction(raw)).toThrow("UPDATE_TODO requires an 'updates' object");
    });

    it("throws when UPDATE_TODO has invalid status", () => {
      const raw = JSON.stringify({
        type: "UPDATE_TODO",
        id: "abc",
        updates: { status: "done" },
      });
      expect(() => parseAction(raw)).toThrow("status");
    });

    it("throws when UPDATE_TODO has invalid priority", () => {
      const raw = JSON.stringify({
        type: "UPDATE_TODO",
        id: "abc",
        updates: { priority: "critical" },
      });
      expect(() => parseAction(raw)).toThrow("priority");
    });
  });

  describe("DELETE_TODO", () => {
    it("parses a valid DELETE_TODO action", () => {
      const raw = JSON.stringify({ type: "DELETE_TODO", id: "abc-123" });
      const action = parseAction(raw);
      expect(action).toEqual({ type: "DELETE_TODO", id: "abc-123" });
    });

    it("throws when DELETE_TODO has no id", () => {
      const raw = JSON.stringify({ type: "DELETE_TODO" });
      expect(() => parseAction(raw)).toThrow("DELETE_TODO requires an 'id' string");
    });
  });

  describe("LIST_TODOS", () => {
    it("parses LIST_TODOS without filter", () => {
      const raw = JSON.stringify({ type: "LIST_TODOS" });
      const action = parseAction(raw);
      expect(action).toEqual({ type: "LIST_TODOS" });
    });

    it("parses LIST_TODOS with filter", () => {
      const raw = JSON.stringify({
        type: "LIST_TODOS",
        filter: { status: "pending", priority: "high" },
      });
      const action = parseAction(raw);
      expect(action).toEqual({
        type: "LIST_TODOS",
        filter: { status: "pending", priority: "high" },
      });
    });

    it("parses LIST_TODOS with date filters", () => {
      const raw = JSON.stringify({
        type: "LIST_TODOS",
        filter: { dueBefore: "2026-02-20", dueAfter: "2026-02-10" },
      });
      const action = parseAction(raw);
      expect(action).toEqual({
        type: "LIST_TODOS",
        filter: { dueBefore: "2026-02-20", dueAfter: "2026-02-10" },
      });
    });

    it("throws when LIST_TODOS filter has invalid status", () => {
      const raw = JSON.stringify({
        type: "LIST_TODOS",
        filter: { status: "done" },
      });
      expect(() => parseAction(raw)).toThrow("status");
    });

    it("throws when LIST_TODOS filter is not an object", () => {
      const raw = JSON.stringify({ type: "LIST_TODOS", filter: "all" });
      expect(() => parseAction(raw)).toThrow("filter");
    });
  });

  describe("CLARIFY", () => {
    it("parses a valid CLARIFY action", () => {
      const raw = JSON.stringify({
        type: "CLARIFY",
        message: "Which todo do you mean?",
      });
      const action = parseAction(raw);
      expect(action).toEqual({
        type: "CLARIFY",
        message: "Which todo do you mean?",
      });
    });

    it("throws when CLARIFY has no message", () => {
      const raw = JSON.stringify({ type: "CLARIFY" });
      expect(() => parseAction(raw)).toThrow("CLARIFY requires a 'message' string");
    });
  });

  describe("RESPONSE", () => {
    it("parses a valid RESPONSE action", () => {
      const raw = JSON.stringify({
        type: "RESPONSE",
        message: "You have 3 todos.",
      });
      const action = parseAction(raw);
      expect(action).toEqual({
        type: "RESPONSE",
        message: "You have 3 todos.",
      });
    });

    it("throws when RESPONSE has no message", () => {
      const raw = JSON.stringify({ type: "RESPONSE" });
      expect(() => parseAction(raw)).toThrow("RESPONSE requires a 'message' string");
    });
  });

  describe("general parsing", () => {
    it("throws on invalid JSON", () => {
      expect(() => parseAction("not json")).toThrow("Failed to parse response as JSON");
    });

    it("throws on non-object JSON", () => {
      expect(() => parseAction('"hello"')).toThrow("Response is not a JSON object");
    });

    it("throws on array JSON", () => {
      expect(() => parseAction("[]")).toThrow("Response is not a JSON object");
    });

    it("throws on missing type field", () => {
      expect(() => parseAction(JSON.stringify({ title: "test" }))).toThrow(
        "Missing or invalid 'type' field"
      );
    });

    it("throws on unknown action type", () => {
      expect(() => parseAction(JSON.stringify({ type: "UNKNOWN" }))).toThrow(
        "Unknown action type: UNKNOWN"
      );
    });

    it("strips markdown code fences from response", () => {
      const raw = '```json\n{"type": "RESPONSE", "message": "Hello"}\n```';
      const action = parseAction(raw);
      expect(action).toEqual({ type: "RESPONSE", message: "Hello" });
    });

    it("strips code fences without json label", () => {
      const raw = '```\n{"type": "RESPONSE", "message": "Hello"}\n```';
      const action = parseAction(raw);
      expect(action).toEqual({ type: "RESPONSE", message: "Hello" });
    });
  });
});

describe("executeAction", () => {
  const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
    id: "todo-1",
    title: "Buy groceries",
    description: "",
    priority: "medium",
    dueDate: null,
    status: "pending",
    createdAt: "2026-02-13T00:00:00.000Z",
    updatedAt: "2026-02-13T00:00:00.000Z",
    ...overrides,
  });

  const makeCallbacks = () => ({
    addTodo: vi.fn().mockReturnValue(makeTodo()),
    updateTodo: vi.fn().mockReturnValue(makeTodo()),
    deleteTodo: vi.fn(),
    setFilters: vi.fn(),
    todos: [makeTodo()],
  });

  describe("ADD_TODO", () => {
    it("calls addTodo and returns confirmation", () => {
      const cb = makeCallbacks();
      const action: NLAction = { type: "ADD_TODO", title: "Buy groceries", priority: "high" };
      const result = executeAction(action, cb);
      expect(cb.addTodo).toHaveBeenCalledWith({
        title: "Buy groceries",
        description: undefined,
        priority: "high",
        dueDate: undefined,
      });
      expect(result.message).toContain("Buy groceries");
      expect(result.todoUpdated).toBe(true);
    });
  });

  describe("UPDATE_TODO", () => {
    it("calls updateTodo and returns confirmation", () => {
      const cb = makeCallbacks();
      const action: NLAction = {
        type: "UPDATE_TODO",
        id: "todo-1",
        updates: { status: "completed" },
      };
      const result = executeAction(action, cb);
      expect(cb.updateTodo).toHaveBeenCalledWith("todo-1", { status: "completed" });
      expect(result.message).toContain("Buy groceries");
      expect(result.todoUpdated).toBe(true);
    });

    it("returns error if todo not found", () => {
      const cb = makeCallbacks();
      cb.todos = [];
      const action: NLAction = {
        type: "UPDATE_TODO",
        id: "nonexistent",
        updates: { status: "completed" },
      };
      const result = executeAction(action, cb);
      expect(cb.updateTodo).not.toHaveBeenCalled();
      expect(result.message).toContain("Could not find");
    });
  });

  describe("DELETE_TODO", () => {
    it("calls deleteTodo and returns confirmation", () => {
      const cb = makeCallbacks();
      const action: NLAction = { type: "DELETE_TODO", id: "todo-1" };
      const result = executeAction(action, cb);
      expect(cb.deleteTodo).toHaveBeenCalledWith("todo-1");
      expect(result.message).toContain("Buy groceries");
      expect(result.todoUpdated).toBe(true);
    });

    it("returns error if todo not found", () => {
      const cb = makeCallbacks();
      cb.todos = [];
      const action: NLAction = { type: "DELETE_TODO", id: "nonexistent" };
      const result = executeAction(action, cb);
      expect(cb.deleteTodo).not.toHaveBeenCalled();
      expect(result.message).toContain("Could not find");
    });
  });

  describe("LIST_TODOS", () => {
    it("calls setFilters with filter values and reports matching count", () => {
      const cb = makeCallbacks();
      const action: NLAction = {
        type: "LIST_TODOS",
        filter: { status: "pending", priority: "medium" },
      };
      const result = executeAction(action, cb);
      expect(cb.setFilters).toHaveBeenCalledWith({
        status: "pending",
        priority: "medium",
        dueBefore: undefined,
        dueAfter: undefined,
      });
      expect(result.message).toContain("matching");
    });

    it("defaults missing filter fields to 'all'", () => {
      const cb = makeCallbacks();
      const action: NLAction = {
        type: "LIST_TODOS",
        filter: { status: "completed" },
      };
      executeAction(action, cb);
      expect(cb.setFilters).toHaveBeenCalledWith({
        status: "completed",
        priority: "all",
        dueBefore: undefined,
        dueAfter: undefined,
      });
    });

    it("passes date filters through to setFilters", () => {
      const cb = makeCallbacks();
      const action: NLAction = {
        type: "LIST_TODOS",
        filter: { dueBefore: "2026-02-20", dueAfter: "2026-02-10" },
      };
      executeAction(action, cb);
      expect(cb.setFilters).toHaveBeenCalledWith({
        status: "all",
        priority: "all",
        dueBefore: "2026-02-20",
        dueAfter: "2026-02-10",
      });
    });

    it("reports count without filter", () => {
      const cb = makeCallbacks();
      const action: NLAction = { type: "LIST_TODOS" };
      const result = executeAction(action, cb);
      expect(cb.setFilters).not.toHaveBeenCalled();
      expect(result.message).toContain("1 todo");
    });
  });

  describe("CLARIFY", () => {
    it("returns the clarification message", () => {
      const cb = makeCallbacks();
      const action: NLAction = { type: "CLARIFY", message: "Which one?" };
      const result = executeAction(action, cb);
      expect(result.message).toBe("Which one?");
      expect(result.todoUpdated).toBeUndefined();
    });
  });

  describe("RESPONSE", () => {
    it("returns the response message", () => {
      const cb = makeCallbacks();
      const action: NLAction = { type: "RESPONSE", message: "You have 3 todos." };
      const result = executeAction(action, cb);
      expect(result.message).toBe("You have 3 todos.");
      expect(result.todoUpdated).toBeUndefined();
    });
  });
});
