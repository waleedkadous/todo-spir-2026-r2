import { GoogleGenerativeAI } from "@google/generative-ai";
import { Todo, TodoFilters } from "@/types/todo";

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `You are a helpful todo manager assistant. You interpret natural language commands and return structured JSON actions.

## Available Actions

You MUST respond with exactly one JSON object matching one of these action types:

### ADD_TODO
Create a new todo.
\`\`\`json
{"type": "ADD_TODO", "title": "string (required)", "description": "string (optional)", "priority": "low|medium|high (optional, default medium)", "dueDate": "YYYY-MM-DD (optional)"}
\`\`\`

### UPDATE_TODO
Update an existing todo. Use the todo's id from the provided list.
\`\`\`json
{"type": "UPDATE_TODO", "id": "string (required)", "updates": {"title": "string", "description": "string", "priority": "low|medium|high", "dueDate": "YYYY-MM-DD or null", "status": "pending|completed"}}
\`\`\`

### DELETE_TODO
Delete a todo by id.
\`\`\`json
{"type": "DELETE_TODO", "id": "string (required)"}
\`\`\`

### LIST_TODOS
Filter or search todos.
\`\`\`json
{"type": "LIST_TODOS", "filter": {"status": "pending|completed", "priority": "low|medium|high", "dueBefore": "YYYY-MM-DD", "dueAfter": "YYYY-MM-DD"}}
\`\`\`

### CLARIFY
When the user's command is ambiguous (e.g., multiple todos could match), ask for clarification.
\`\`\`json
{"type": "CLARIFY", "message": "string describing what needs clarification"}
\`\`\`

### RESPONSE
For general conversational responses that don't require a todo action.
\`\`\`json
{"type": "RESPONSE", "message": "string"}
\`\`\`

## Date Interpretation Rules
- Use the browser's local date provided as "today" in the context
- "tomorrow" = today + 1 day
- "this week" = Monday through Sunday of the current week
- "next week" = Monday through Sunday of the following week
- Always use YYYY-MM-DD format for dates

## Rules
1. Respond with ONLY a JSON object — no markdown, no explanation, no code fences
2. When the user wants to modify a specific todo, find the best match from the provided todo list by title or description
3. If multiple todos could match a command, use CLARIFY to ask which one
4. For destructive operations on multiple items (e.g., "delete all completed"), execute directly
5. The id field in UPDATE_TODO and DELETE_TODO must be an actual id from the provided todo list
6. If no todos exist and the user asks to modify/delete one, use RESPONSE to explain there are no todos`;

export interface ChatRequest {
  message: string;
  todos: Todo[];
  history: { role: "user" | "assistant"; content: string }[];
  filters: TodoFilters;
  today: string;
}

export async function callGemini(request: ChatRequest): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });

  const todoContext = request.todos.length > 0
    ? `Current todos:\n${JSON.stringify(request.todos, null, 2)}`
    : "No todos exist yet.";

  const filterContext = `Active filters: status=${request.filters.status}, priority=${request.filters.priority}`;
  const dateContext = `Today's date: ${request.today}`;

  const contents = [
    ...request.history.map((msg) => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }],
    })),
    {
      role: "user" as const,
      parts: [
        {
          text: `${dateContext}\n${filterContext}\n${todoContext}\n\nUser message: ${request.message}`,
        },
      ],
    },
  ];

  const result = await model.generateContent({
    contents,
    systemInstruction: { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
  });

  const text = result.response.text();
  return text;
}
