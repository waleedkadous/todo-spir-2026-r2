import { Priority, Status } from "./todo";

export type NLActionType =
  | "ADD_TODO"
  | "UPDATE_TODO"
  | "DELETE_TODO"
  | "LIST_TODOS"
  | "CLARIFY"
  | "RESPONSE";

export interface AddTodoAction {
  type: "ADD_TODO";
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
}

export interface UpdateTodoAction {
  type: "UPDATE_TODO";
  id: string;
  updates: {
    title?: string;
    description?: string;
    priority?: Priority;
    dueDate?: string | null;
    status?: Status;
  };
}

export interface DeleteTodoAction {
  type: "DELETE_TODO";
  id: string;
}

export interface ListTodosAction {
  type: "LIST_TODOS";
  filter?: {
    status?: Status;
    priority?: Priority;
    dueBefore?: string;
    dueAfter?: string;
  };
}

export interface ClarifyAction {
  type: "CLARIFY";
  message: string;
}

export interface ResponseAction {
  type: "RESPONSE";
  message: string;
}

export type NLAction =
  | AddTodoAction
  | UpdateTodoAction
  | DeleteTodoAction
  | ListTodosAction
  | ClarifyAction
  | ResponseAction;
