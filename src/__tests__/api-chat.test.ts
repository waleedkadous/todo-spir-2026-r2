import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the gemini module before importing the route
vi.mock("@/lib/gemini", () => ({
  callGemini: vi.fn(),
}));

import { POST } from "@/app/api/chat/route";
import { callGemini } from "@/lib/gemini";
import { NextRequest } from "next/server";

const mockedCallGemini = vi.mocked(callGemini);

function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  const bodyStr = JSON.stringify(body);
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    body: bodyStr,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(bodyStr.length),
      ...headers,
    },
  });
}

const validBody = {
  message: "add a todo to buy groceries",
  todos: [],
  history: [],
  filters: { status: "all", priority: "all" },
  today: "2026-02-13",
};

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Gemini response for a valid request", async () => {
    mockedCallGemini.mockResolvedValue(
      JSON.stringify({ type: "ADD_TODO", title: "Buy groceries" })
    );

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.response).toContain("ADD_TODO");
    expect(mockedCallGemini).toHaveBeenCalledWith({
      message: "add a todo to buy groceries",
      todos: [],
      history: [],
      filters: { status: "all", priority: "all" },
      today: "2026-02-13",
    });
  });

  it("returns 400 when message is missing", async () => {
    const body = { ...validBody, message: undefined };
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("message");
  });

  it("returns 400 when todos is not an array", async () => {
    const body = { ...validBody, todos: "not an array" };
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("todos");
  });

  it("returns 400 when history is not an array", async () => {
    const body = { ...validBody, history: "not an array" };
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("history");
  });

  it("returns 400 when filters is missing", async () => {
    const body = { ...validBody, filters: undefined };
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("filters");
  });

  it("returns 400 when today is missing", async () => {
    const body = { ...validBody, today: undefined };
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("today");
  });

  it("returns 413 when Content-Length header exceeds 100KB", async () => {
    const res = await POST(
      makeRequest(validBody, { "Content-Length": "200000" })
    );
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.error).toContain("Payload too large");
  });

  it("returns 413 when actual body exceeds 100KB", async () => {
    const largeBody = { ...validBody, message: "x".repeat(110 * 1024) };
    const bodyStr = JSON.stringify(largeBody);
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: bodyStr,
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.error).toContain("Payload too large");
  });

  it("returns 500 with AI service error when Gemini throws a generic error", async () => {
    mockedCallGemini.mockRejectedValue(new Error("Gemini error"));

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("AI service encountered an error");
  });

  it("returns 500 with config error when GEMINI_API_KEY is missing", async () => {
    mockedCallGemini.mockRejectedValue(
      new Error("GEMINI_API_KEY environment variable is not set")
    );

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("not configured");
  });

  it("returns 429 when Gemini throws a rate limit error", async () => {
    const rateLimitError = new Error("Rate limited") as Error & { status: number };
    rateLimitError.status = 429;
    mockedCallGemini.mockRejectedValue(rateLimitError);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain("Rate limit");
  });

  it("passes todos and history to Gemini", async () => {
    const todos = [
      {
        id: "1",
        title: "Existing todo",
        description: "",
        priority: "medium",
        dueDate: null,
        status: "pending",
        createdAt: "2026-02-13T00:00:00.000Z",
        updatedAt: "2026-02-13T00:00:00.000Z",
      },
    ];
    const history = [
      { role: "user", content: "hello" },
      { role: "assistant", content: "Hi! How can I help?" },
    ];

    mockedCallGemini.mockResolvedValue(
      JSON.stringify({ type: "RESPONSE", message: "Here are your todos." })
    );

    const body = { ...validBody, todos, history };
    await POST(makeRequest(body));

    expect(mockedCallGemini).toHaveBeenCalledWith(
      expect.objectContaining({
        todos,
        history,
      })
    );
  });
});
