import { NLAction, NLActionType } from "@/types/actions";
import { Todo, TodoFilters, Priority, Status } from "@/types/todo";
import { filterTodos } from "@/lib/storage";

const VALID_ACTION_TYPES: NLActionType[] = [
  "ADD_TODO",
  "UPDATE_TODO",
  "DELETE_TODO",
  "LIST_TODOS",
  "CLARIFY",
  "RESPONSE",
];

const VALID_PRIORITIES: Priority[] = ["low", "medium", "high"];
const VALID_STATUSES: Status[] = ["pending", "completed"];

export function parseAction(raw: string): NLAction {
  let cleaned = raw.trim();
  // Strip markdown code fences if Gemini wraps the response
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse response as JSON");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Response is not a JSON object");
  }

  const obj = parsed as Record<string, unknown>;

  if (!obj.type || typeof obj.type !== "string") {
    throw new Error("Missing or invalid 'type' field");
  }

  if (!VALID_ACTION_TYPES.includes(obj.type as NLActionType)) {
    throw new Error(`Unknown action type: ${obj.type}`);
  }

  switch (obj.type) {
    case "ADD_TODO":
      return validateAddTodo(obj);
    case "UPDATE_TODO":
      return validateUpdateTodo(obj);
    case "DELETE_TODO":
      return validateDeleteTodo(obj);
    case "LIST_TODOS":
      return validateListTodos(obj);
    case "CLARIFY":
      return validateClarify(obj);
    case "RESPONSE":
      return validateResponse(obj);
    default:
      throw new Error(`Unknown action type: ${obj.type}`);
  }
}

function validateAddTodo(obj: Record<string, unknown>): NLAction {
  if (!obj.title || typeof obj.title !== "string") {
    throw new Error("ADD_TODO requires a 'title' string");
  }
  const action: NLAction = { type: "ADD_TODO", title: obj.title };
  if (obj.description !== undefined) {
    if (typeof obj.description !== "string") {
      throw new Error("ADD_TODO 'description' must be a string");
    }
    action.description = obj.description;
  }
  if (obj.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(obj.priority as Priority)) {
      throw new Error(`ADD_TODO 'priority' must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }
    action.priority = obj.priority as Priority;
  }
  if (obj.dueDate !== undefined) {
    if (typeof obj.dueDate !== "string") {
      throw new Error("ADD_TODO 'dueDate' must be a string");
    }
    action.dueDate = obj.dueDate;
  }
  return action;
}

function validateUpdateTodo(obj: Record<string, unknown>): NLAction {
  if (!obj.id || typeof obj.id !== "string") {
    throw new Error("UPDATE_TODO requires an 'id' string");
  }
  if (!obj.updates || typeof obj.updates !== "object" || Array.isArray(obj.updates)) {
    throw new Error("UPDATE_TODO requires an 'updates' object");
  }
  const updates = obj.updates as Record<string, unknown>;
  const validated: Record<string, unknown> = {};

  if (updates.title !== undefined) {
    if (typeof updates.title !== "string") throw new Error("'title' must be a string");
    validated.title = updates.title;
  }
  if (updates.description !== undefined) {
    if (typeof updates.description !== "string") throw new Error("'description' must be a string");
    validated.description = updates.description;
  }
  if (updates.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(updates.priority as Priority)) {
      throw new Error(`'priority' must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }
    validated.priority = updates.priority;
  }
  if (updates.dueDate !== undefined) {
    if (updates.dueDate !== null && typeof updates.dueDate !== "string") {
      throw new Error("'dueDate' must be a string or null");
    }
    validated.dueDate = updates.dueDate;
  }
  if (updates.status !== undefined) {
    if (!VALID_STATUSES.includes(updates.status as Status)) {
      throw new Error(`'status' must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    validated.status = updates.status;
  }

  return {
    type: "UPDATE_TODO",
    id: obj.id as string,
    updates: validated as NLAction extends { type: "UPDATE_TODO" } ? NLAction["updates"] : never,
  } as NLAction;
}

function validateDeleteTodo(obj: Record<string, unknown>): NLAction {
  if (!obj.id || typeof obj.id !== "string") {
    throw new Error("DELETE_TODO requires an 'id' string");
  }
  return { type: "DELETE_TODO", id: obj.id as string };
}

function validateListTodos(obj: Record<string, unknown>): NLAction {
  const action: NLAction = { type: "LIST_TODOS" };
  if (obj.filter !== undefined) {
    if (typeof obj.filter !== "object" || obj.filter === null || Array.isArray(obj.filter)) {
      throw new Error("LIST_TODOS 'filter' must be an object");
    }
    const filter = obj.filter as Record<string, unknown>;
    const validated: Record<string, unknown> = {};

    if (filter.status !== undefined) {
      if (!VALID_STATUSES.includes(filter.status as Status)) {
        throw new Error(`'status' must be one of: ${VALID_STATUSES.join(", ")}`);
      }
      validated.status = filter.status;
    }
    if (filter.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(filter.priority as Priority)) {
        throw new Error(`'priority' must be one of: ${VALID_PRIORITIES.join(", ")}`);
      }
      validated.priority = filter.priority;
    }
    if (filter.dueBefore !== undefined) {
      if (typeof filter.dueBefore !== "string") throw new Error("'dueBefore' must be a string");
      validated.dueBefore = filter.dueBefore;
    }
    if (filter.dueAfter !== undefined) {
      if (typeof filter.dueAfter !== "string") throw new Error("'dueAfter' must be a string");
      validated.dueAfter = filter.dueAfter;
    }

    (action as { filter: Record<string, unknown> }).filter = validated;
  }
  return action;
}

function validateClarify(obj: Record<string, unknown>): NLAction {
  if (!obj.message || typeof obj.message !== "string") {
    throw new Error("CLARIFY requires a 'message' string");
  }
  return { type: "CLARIFY", message: obj.message };
}

function validateResponse(obj: Record<string, unknown>): NLAction {
  if (!obj.message || typeof obj.message !== "string") {
    throw new Error("RESPONSE requires a 'message' string");
  }
  return { type: "RESPONSE", message: obj.message };
}

export interface ActionResult {
  message: string;
  todoUpdated?: boolean;
}

export function executeAction(
  action: NLAction,
  callbacks: {
    addTodo: (input: { title: string; description?: string; priority?: Priority; dueDate?: string | null }) => Todo;
    updateTodo: (id: string, updates: Partial<Pick<Todo, "title" | "description" | "priority" | "dueDate" | "status">>) => Todo;
    deleteTodo: (id: string) => void;
    setFilters: (filters: TodoFilters) => void;
    todos: Todo[];
  }
): ActionResult {
  switch (action.type) {
    case "ADD_TODO": {
      const todo = callbacks.addTodo({
        title: action.title,
        description: action.description,
        priority: action.priority,
        dueDate: action.dueDate,
      });
      return {
        message: `Created todo: "${todo.title}"`,
        todoUpdated: true,
      };
    }

    case "UPDATE_TODO": {
      const existing = callbacks.todos.find((t) => t.id === action.id);
      if (!existing) {
        return { message: `Could not find a todo with that ID.` };
      }
      callbacks.updateTodo(action.id, action.updates);
      return {
        message: `Updated todo: "${existing.title}"`,
        todoUpdated: true,
      };
    }

    case "DELETE_TODO": {
      const existing = callbacks.todos.find((t) => t.id === action.id);
      if (!existing) {
        return { message: `Could not find a todo with that ID.` };
      }
      callbacks.deleteTodo(action.id);
      return {
        message: `Deleted todo: "${existing.title}"`,
        todoUpdated: true,
      };
    }

    case "LIST_TODOS": {
      const filter = action.filter;
      if (filter) {
        const newFilters: TodoFilters = {
          status: filter.status ?? "all",
          priority: filter.priority ?? "all",
          dueBefore: filter.dueBefore,
          dueAfter: filter.dueAfter,
        };
        callbacks.setFilters(newFilters);
        const matchCount = filterTodos(callbacks.todos, newFilters).length;
        return {
          message: `Found ${matchCount} matching todo${matchCount !== 1 ? "s" : ""}.`,
        };
      }
      callbacks.setFilters({ status: "all", priority: "all" });
      const count = callbacks.todos.length;
      return {
        message: `Showing all ${count} todo${count !== 1 ? "s" : ""}.`,
      };
    }

    case "CLARIFY":
      return { message: action.message };

    case "RESPONSE":
      return { message: action.message };
  }
}
