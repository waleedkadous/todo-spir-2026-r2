# Specification: Todo Manager

<!--
SPEC vs PLAN BOUNDARY:
This spec defines WHAT and WHY. The plan defines HOW and WHEN.
-->

## Metadata
- **ID**: spec-2026-02-13-todo-manager
- **Status**: draft
- **Created**: 2026-02-13

## Clarifying Questions Asked

Requirements were provided directly by the user. Key decisions already made:
1. **Framework**: Next.js 14+ with TypeScript and App Router
2. **Storage**: Browser-local (localStorage) — no backend database
3. **Deployment**: Railway-ready
4. **NL Backend**: Gemini 3.0 Flash (model ID: `gemini-2.0-flash`, or latest available Flash model)
5. **CRUD with metadata**: Priority (low/medium/high), due dates, status (pending/completed)
6. **Filtering**: By status and priority

## Problem Statement

Users need a modern, lightweight task management application that runs entirely in the browser without requiring server-side database infrastructure. The app must support natural language interaction so users can manage their todos conversationally — e.g., "show me all high priority todos due this week" or "mark the grocery shopping todo as done" — powered by a real LLM (Gemini Flash), not a simple parser.

## Current State

No application exists. This is a greenfield build.

## Desired State

A fully functional Todo Manager web application with:
- Traditional CRUD UI for creating, reading, updating, and deleting todos
- Each todo has: `id` (UUID, client-generated), title (string, required, max 200 chars), description (string, optional, max 2000 chars), priority (enum: low/medium/high, default: medium), due date (ISO 8601 date string, optional), status (enum: pending/completed, default: pending), createdAt (ISO 8601 timestamp), updatedAt (ISO 8601 timestamp)
- Default list sort order: by createdAt descending (newest first)
- Filtering controls for status and priority
- A natural language chat interface powered by Gemini Flash that can interpret user queries and commands against the todo list
- All data persisted in the browser (localStorage)
- Deployed and accessible on Railway

### Non-Goals (Out of Scope for v1)
- Multi-device sync
- User authentication / multi-user
- Data export/import
- Keyboard shortcuts
- Undo/redo for NL operations
- Offline NL support (CRUD UI works offline; NL requires network)

## Stakeholders
- **Primary Users**: Individual users managing personal tasks
- **Technical Team**: Single developer (AI-assisted)
- **Business Owners**: Project owner

## Success Criteria
- [ ] Users can create todos with title, optional description, priority (low/medium/high), optional due date
- [ ] Users can view all todos in a list (sorted newest first by default)
- [ ] Users can update any todo field (title, description, priority, due date, status)
- [ ] Users can delete todos
- [ ] Users can mark todos as completed or pending
- [ ] Users can filter todos by status (all/pending/completed)
- [ ] Users can filter todos by priority (all/low/medium/high)
- [ ] Natural language interface can execute CRUD operations via conversational commands
- [ ] Natural language interface handles ambiguity gracefully (e.g., asks for clarification when multiple todos match)
- [ ] NL interface supports date-aware queries (e.g., "what's due this week?")
- [ ] NL interface shows clear error when Gemini API is unavailable; CRUD UI remains fully functional
- [ ] All data persists across browser sessions via localStorage
- [ ] Application deploys successfully on Railway
- [ ] Application compiles without errors
- [ ] Unit tests pass for todo CRUD logic and NL action parsing
- [ ] Integration tests pass for API route with mocked Gemini
- [ ] Responsive UI that works on desktop and mobile
- [ ] Empty state shows helpful message when no todos exist

## Constraints

### Technical Constraints
- Next.js 14+ with App Router (no Pages Router)
- TypeScript throughout
- Browser-only storage (no server-side database)
- Gemini Flash for NL processing (requires API key via environment variable)
- Must be deployable on Railway (Node.js runtime)

### Business Constraints
- None beyond the technical requirements

## Assumptions
- Users have a modern browser with localStorage support
- A Gemini API key will be provided via GEMINI_API_KEY environment variable
- Railway deployment uses standard Node.js buildpack
- The NL interface sends todo data context plus conversation history to Gemini for processing
- Dates use the browser's local timezone; "this week" means Monday–Sunday of the current week
- Duplicate todo titles are allowed (disambiguation uses ID or contextual matching)

## Solution Approaches

### Approach 1: Next.js App Router with API Route for NL Processing (Recommended)

**Description**: Build a Next.js app with client-side todo management (localStorage) and a server-side API route (`/api/chat`) that proxies NL requests to Gemini Flash. The API route receives the user's message, conversation history, current todo list, and active filter state, sends it to Gemini with a system prompt defining available actions, and returns structured responses.

**Pros**:
- API key stays server-side (secure)
- Clean separation: UI logic in client components, NL processing via API route
- Standard Next.js patterns
- Gemini returns structured JSON actions that the client executes

**Cons**:
- Requires server runtime (not static export) — but Railway supports this
- NL requests require network round-trip

**Estimated Complexity**: Medium
**Risk Level**: Low

### Approach 2: Fully Client-Side with Direct Gemini API Calls

**Description**: All logic including Gemini calls happens in the browser.

**Pros**:
- Simpler architecture
- Could be statically exported

**Cons**:
- API key exposed in client-side code (security risk)
- CORS issues with Gemini API
- Not suitable for production

**Estimated Complexity**: Low
**Risk Level**: High

**Selected Approach**: Approach 1 — Server-side API route for Gemini, client-side for todo CRUD and storage.

## NL Interface Contract

### Action Schema
The API route returns JSON responses with one of the following action types:

```
Action types:
- ADD_TODO: { title, description?, priority?, dueDate? }
- UPDATE_TODO: { id, updates: { title?, description?, priority?, dueDate?, status? } }
- DELETE_TODO: { id }
- LIST_TODOS: { filter?: { status?, priority?, dueBefore?, dueAfter? } }
- CLARIFY: { message } — when the command is ambiguous
- RESPONSE: { message } — for general conversational responses
```

### Context Sent to Gemini
Each NL request includes:
- User's current message
- Conversation history (last 10 messages)
- Full todo list (with IDs)
- Current filter state

### Ambiguity Resolution
- When multiple todos match a command (e.g., "mark it as done" with no clear referent), Gemini returns a CLARIFY action listing matching todos
- Destructive NL operations on multiple todos (e.g., "delete all my completed todos") execute directly — the UI shows what was affected for transparency

### Error Handling
- Gemini API unavailable: Return error message; CRUD UI unaffected
- Unparseable Gemini response: Return friendly error message to chat
- Invalid action parameters: Validate on client; show error in chat
- Rate limit (429): Show "please wait" message

## Open Questions

### Critical (Blocks Progress)
- [x] None — all requirements are clear

### Important (Affects Design)
- [x] NL response format: Gemini returns structured JSON with action type and parameters, which the client interprets and executes against localStorage
- [x] Conversation history: Last 10 messages sent as context for follow-up handling
- [x] Date semantics: Browser local timezone, week = Monday–Sunday

### Nice-to-Know (Optimization)
- [ ] Should the NL interface support undo? (Out of scope for v1)
- [ ] localStorage schema versioning for future migrations (Out of scope for v1)

## Performance Requirements
- **Page Load**: < 2s initial load
- **Todo Operations**: Instant (localStorage is synchronous)
- **NL Response**: < 5s for Gemini round-trip (including network)
- **Resource Usage**: Minimal — client-side app with no database

## Security Considerations
- Gemini API key stored server-side only (never sent to client)
- No user authentication required (single-user, local data)
- Input sanitization for XSS prevention — React's default escaping for rendered content; no dangerouslySetInnerHTML
- NL interface constrained to defined action schema — Gemini system prompt restricts actions to the defined set; responses are validated against the schema before execution
- API route validates request payload size (max 100KB) and structure
- No todo content is logged server-side (privacy)

## Test Scenarios

### Functional Tests (Unit)
1. Create a todo with all fields populated — verify it appears in list
2. Create a todo with only required fields — verify defaults applied (priority: medium, status: pending)
3. Update a todo's priority — verify change persists in localStorage
4. Delete a todo — verify it's removed from list and storage
5. Mark a todo as completed — verify status change
6. Filter by status (pending) — verify only pending todos shown
7. Filter by priority (high) — verify only high priority todos shown
8. Combined filters (pending + high) — verify intersection shown
9. Empty state — verify helpful message shown when no todos exist
10. localStorage unavailable — verify graceful error

### Functional Tests (Integration — Mocked Gemini)
11. NL: "add a todo to buy groceries with high priority" — verify ADD_TODO action parsed and executed
12. NL: "show me all completed todos" — verify LIST_TODOS action with filter
13. NL: "mark buy groceries as done" — verify UPDATE_TODO action
14. NL: "what's due this week?" — verify date-aware LIST_TODOS filter
15. NL: ambiguous command (multiple matches) — verify CLARIFY action returned
16. NL: Gemini returns invalid JSON — verify error message shown in chat
17. NL: Gemini API returns 500 — verify error message, CRUD still works
18. Data persists after page reload

### Non-Functional Tests
1. App compiles without TypeScript errors
2. App builds successfully for production
3. Responsive layout works on mobile viewports

## Dependencies
- **External Services**: Google Gemini API (Flash model)
- **Libraries/Frameworks**: Next.js 14+, React 18+, TypeScript, Tailwind CSS (styling), @google/generative-ai (Gemini SDK)

## Risks and Mitigation
| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Gemini API unavailable | Low | Medium | CRUD UI fully functional without NL; clear error in chat |
| localStorage size limits (~5MB) | Low | Low | Sufficient for todo data; practical limit ~1000 todos |
| Gemini returns unparseable responses | Medium | Medium | Validate against action schema; show error in chat |
| API key misconfiguration on Railway | Low | High | .env.example file with clear instructions |
| localStorage unavailable (private browsing) | Low | Medium | Detect and show warning; app still renders |

## Expert Consultation

**Date**: 2026-02-13
**Models Consulted**: Gemini, Codex, Claude

**Key Feedback Incorporated**:
- **Gemini**: Added conversation history to NL context, defined action schema, clarified view-dependent reference handling
- **Codex**: Added NL action schema/validation rules, date/time semantics, error handling for storage/API failures, negative-path test coverage, non-goals section
- **Claude**: Added `id` to formal data model, default sort order, Gemini model name clarification, empty state handling, degradation behavior, test type specification

## Approval
- [ ] Technical Lead Review
- [ ] Product Owner Review
- [ ] Stakeholder Sign-off
- [x] Expert AI Consultation Complete

## Notes
- The NL interface should use Gemini's function calling / structured output capabilities to ensure reliable action parsing
- Todo IDs should be generated client-side (crypto.randomUUID())
- The UI should use a clean, modern design with Tailwind CSS
- The chat interface is a panel/section within the main view, not a separate page
