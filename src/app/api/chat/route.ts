import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

const MAX_PAYLOAD_SIZE = 100 * 1024; // 100KB

export async function POST(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
    return NextResponse.json(
      { error: "Payload too large" },
      { status: 413 }
    );
  }

  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Failed to read request body" },
      { status: 400 }
    );
  }

  if (new TextEncoder().encode(bodyText).byteLength > MAX_PAYLOAD_SIZE) {
    return NextResponse.json(
      { error: "Payload too large" },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const { message, todos, history, filters, today } = body as Record<string, unknown>;

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'message' field" },
      { status: 400 }
    );
  }

  if (!Array.isArray(todos)) {
    return NextResponse.json(
      { error: "Missing or invalid 'todos' field" },
      { status: 400 }
    );
  }

  if (!Array.isArray(history)) {
    return NextResponse.json(
      { error: "Missing or invalid 'history' field" },
      { status: 400 }
    );
  }

  if (!filters || typeof filters !== "object") {
    return NextResponse.json(
      { error: "Missing or invalid 'filters' field" },
      { status: 400 }
    );
  }

  if (!today || typeof today !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'today' field" },
      { status: 400 }
    );
  }

  try {
    const response = await callGemini({
      message: message as string,
      todos: todos as Parameters<typeof callGemini>[0]["todos"],
      history: history as Parameters<typeof callGemini>[0]["history"],
      filters: filters as Parameters<typeof callGemini>[0]["filters"],
      today: today as string,
    });

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const statusCode = (error as { status?: number })?.status;
    if (statusCode === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const isConfigError = error instanceof Error && error.message.includes("GEMINI_API_KEY");
    return NextResponse.json(
      {
        error: isConfigError
          ? "Chat is unavailable — the AI service is not configured. Your todos are safe and the manual interface works normally."
          : "The AI service encountered an error. Please try again later. Your todos are unaffected.",
      },
      { status: 500 }
    );
  }
}
