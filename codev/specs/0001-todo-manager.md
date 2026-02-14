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
2. **Storage**: Browser-local (localStorage or IndexedDB) — no backend database
3. **Deployment**: Railway-ready
4. **NL Backend**: Gemini 3.0 Flash (not regex/grammar parsing)
5. **CRUD with metadata**: Priority (low/medium/high), due dates, status (pending/completed)
6. **Filtering**: By status and priority

## Problem Statement

Users need a modern, lightweight task management application that runs entirely in the browser without requiring server-side database infrastructure. The app must support natural language interaction so users can manage their todos conversationally — e.g., "show me all high priority todos due this week" or "mark the grocery shopping todo as done" — powered by a real LLM (Gemini 3.0 Flash), not a simple parser.

## Current State

No application exists. This is a greenfield build.

## Desired State

A fully functional Todo Manager web application with:
- Traditional CRUD UI for creating, reading, updating, and deleting todos
- Each todo has: title, description (optional), priority (low/medium/high), due date (optional), status (pending/completed), created/updated timestamps
- Filtering controls for status and priority
- A natural language chat interface powered by Gemini 3.0 Flash that can interpret arbitrary user queries and commands against the todo list
- All data persisted in the browser (localStorage)
- Deployed and accessible on Railway

## Stakeholders
- **Primary Users**: Individual users managing personal tasks
- **Technical Team**: Single developer (AI-assisted)
- **Business Owners**: Project owner

## Success Criteria
- [ ] Users can create todos with title, optional description, priority (low/medium/high), optional due date
- [ ] Users can view all todos in a list
- [ ] Users can update any todo field (title, description, priority, due date, status)
- [ ] Users can delete todos
- [ ] Users can mark todos as completed or pending
- [ ] Users can filter todos by status (all/pending/completed)
- [ ] Users can filter todos by priority (all/low/medium/high)
- [ ] Natural language interface understands arbitrary phrasing for todo queries
- [ ] Natural language interface can execute CRUD operations via conversational commands
- [ ] Natural language interface handles ambiguity gracefully (e.g., asks for clarification when multiple todos match)
- [ ] NL interface supports complex queries (e.g., "show high priority todos due this week")
- [ ] All data persists across browser sessions via localStorage
- [ ] Application deploys successfully on Railway
- [ ] Application compiles without errors
- [ ] Tests pass
- [ ] Responsive UI that works on desktop and mobile

## Constraints

### Technical Constraints
- Next.js 14+ with App Router (no Pages Router)
- TypeScript throughout
- Browser-only storage (no server-side database)
- Gemini 3.0 Flash for NL processing (requires API key via environment variable)
- Must be deployable on Railway (Node.js runtime)

### Business Constraints
- None beyond the technical requirements

## Assumptions
- Users have a modern browser with localStorage support
- A Gemini API key will be provided via GEMINI_API_KEY environment variable
- Railway deployment uses standard Node.js buildpack
- The NL interface sends todo data context to Gemini for processing

## Solution Approaches

### Approach 1: Next.js App Router with API Route for NL Processing (Recommended)

**Description**: Build a Next.js app with client-side todo management (localStorage) and a server-side API route (`/api/chat`) that proxies NL requests to Gemini 3.0 Flash. The API route receives the user's message plus current todo state, sends it to Gemini with a system prompt defining available actions, and returns structured responses.

**Pros**:
- API key stays server-side (secure)
- Clean separation: UI logic in client components, NL processing via API route
- Standard Next.js patterns
- Gemini can return structured JSON actions that the client executes

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

## Open Questions

### Critical (Blocks Progress)
- [x] None — all requirements are clear

### Important (Affects Design)
- [x] NL response format: Gemini will return structured JSON with action type and parameters, which the client interprets and executes against localStorage

### Nice-to-Know (Optimization)
- [ ] Should the NL interface support undo? (Out of scope for v1)
- [ ] Should there be keyboard shortcuts? (Out of scope for v1)

## Performance Requirements
- **Page Load**: < 2s initial load
- **Todo Operations**: Instant (localStorage is synchronous)
- **NL Response**: < 3s for Gemini round-trip
- **Resource Usage**: Minimal — client-side app with no database

## Security Considerations
- Gemini API key stored server-side only (never sent to client)
- No user authentication required (single-user, local data)
- Input sanitization for XSS prevention in todo content
- NL interface should not be exploitable for prompt injection that bypasses intended behavior

## Test Scenarios

### Functional Tests
1. Create a todo with all fields populated — verify it appears in list
2. Create a todo with only required fields — verify defaults are applied
3. Update a todo's priority — verify change persists
4. Delete a todo — verify it's removed from list and storage
5. Mark a todo as completed — verify status change
6. Filter by status (pending) — verify only pending todos shown
7. Filter by priority (high) — verify only high priority todos shown
8. Combined filters (pending + high) — verify intersection shown
9. NL: "add a todo to buy groceries with high priority" — verify todo created
10. NL: "show me all completed todos" — verify filtered response
11. NL: "mark buy groceries as done" — verify status updated
12. NL: "what's due this week?" — verify date-aware query
13. NL: ambiguous command (multiple matches) — verify clarification requested
14. Data persists after page reload

### Non-Functional Tests
1. App compiles without TypeScript errors
2. App builds successfully for production
3. Lighthouse accessibility score > 80
4. Responsive layout works on mobile viewports

## Dependencies
- **External Services**: Google Gemini API (Gemini 3.0 Flash model)
- **Libraries/Frameworks**: Next.js 14+, React 18+, TypeScript, Tailwind CSS (styling), @google/generative-ai (Gemini SDK)

## Risks and Mitigation
| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Gemini API rate limits | Low | Medium | Implement basic rate limiting / error messaging |
| localStorage size limits (~5MB) | Low | Low | Sufficient for todo data; warn if approaching limit |
| Gemini returns unparseable responses | Medium | Medium | Robust JSON parsing with fallback error messages |
| API key misconfiguration on Railway | Low | High | Clear documentation and .env.example file |

## Expert Consultation
<!-- Will be filled after multi-agent consultation -->

## Approval
- [ ] Technical Lead Review
- [ ] Product Owner Review
- [ ] Stakeholder Sign-off
- [ ] Expert AI Consultation Complete

## Notes
- The NL interface should use Gemini's function calling / structured output capabilities to ensure reliable action parsing
- Todo IDs should be generated client-side (UUID or timestamp-based)
- The UI should use a clean, modern design with Tailwind CSS
