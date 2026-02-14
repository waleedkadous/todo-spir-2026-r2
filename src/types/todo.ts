export type Priority = "low" | "medium" | "high";
export type Status = "pending" | "completed";

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFilters {
  status: Status | "all";
  priority: Priority | "all";
  dueBefore?: string;
  dueAfter?: string;
}
