# Plan: Todo Manager

## Metadata
- **ID**: plan-2026-02-13-todo-manager
- **Status**: draft
- **Specification**: codev/specs/0001-todo-manager.md
- **Created**: 2026-02-13

## Executive Summary

Implement a Next.js 14+ Todo Manager with localStorage persistence and Gemini Flash-powered natural language interface. The selected approach uses client-side CRUD with a server-side API route (`/api/chat`) proxying NL requests to Gemini. Implementation is broken into 5 phases: project scaffolding, core todo data layer, UI components, NL chat interface, and testing/deployment.

## Success Metrics
- [ ] All specification success criteria met
- [ ] Unit tests pass for todo CRUD logic and NL action parsing
- [ ] Integration tests pass for API route (mocked Gemini)
- [ ] App compiles and builds without errors
- [ ] Deployable on Railway

## Phases (Machine Readable)

```json
{
  "phases": [
    {"id": "phase_1", "title": "Project Scaffolding & Configuration"},
    {"id": "phase_2", "title": "Todo Data Layer & Types"},
    {"id": "phase_3", "title": "Todo UI Components"},
    {"id": "phase_4", "title": "Natural Language Chat Interface"},
    {"id": "phase_5", "title": "Testing & Deployment Configuration"}
  ]
}
```

## Phase Breakdown

### Phase 1: Project Scaffolding & Configuration
**Dependencies**: None

#### Objectives
- Set up Next.js 14+ project with TypeScript, Tailwind CSS, App Router
- Configure test runner (Vitest) for subsequent phases
- Configure project for Railway deployment

#### Deliverables
- [ ] Next.js project initialized with App Router
- [ ] TypeScript configured
- [ ] Tailwind CSS configured
- [ ] Vitest configured with test runner ready
- [ ] `.env.example` with GEMINI_API_KEY
- [ ] `.gitignore` updated
- [ ] Basic app layout with responsive shell

#### Implementation Details
- Files to create/modify:
  - `package.json` — dependencies (including vitest, @testing-library/react)
  - `tsconfig.json` — TypeScript config
  - `tailwind.config.ts` — Tailwind config
  - `next.config.ts` — Next.js config
  - `vitest.config.ts` — test runner configuration
  - `.env.example` — environment template
  - `.gitignore` — ignore patterns
  - `src/app/layout.tsx` — root layout
  - `src/app/page.tsx` — main page (placeholder)
  - `src/app/globals.css` — global styles with Tailwind directives

#### Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] `npm test` runs (even if no tests yet)
- [ ] Tailwind classes render correctly
- [ ] `.env.example` documents GEMINI_API_KEY

#### Test Plan
- **Manual Testing**: `npm run dev` loads, `npm run build` succeeds, `npm test` runs

#### Rollback Strategy
Delete generated files; re-scaffold.

---

### Phase 2: Todo Data Layer & Types
**Dependencies**: Phase 1

#### Objectives
- Define TypeScript types for Todo model and NL actions
- Implement localStorage CRUD operations with field validation
- Create React hook for todo state management

#### Deliverables
- [ ] Todo type definitions with field constraints (title max 200 chars, description max 2000 chars)
- [ ] NL action type definitions
- [ ] localStorage CRUD functions (create, read, update, delete, filter)
- [ ] `useTodos` React hook
- [ ] Unit tests for CRUD logic

#### Implementation Details
- Files to create:
  - `src/types/todo.ts` — Todo interface, Priority enum, Status enum
  - `src/types/actions.ts` — NL action types (ADD_TODO, UPDATE_TODO, DELETE_TODO, LIST_TODOS, CLARIFY, RESPONSE)
  - `src/lib/storage.ts` — localStorage CRUD operations (getTodos, saveTodos, addTodo, updateTodo, deleteTodo); uses `crypto.randomUUID()` for ID generation; enforces title max 200 chars, description max 2000 chars
  - `src/hooks/useTodos.ts` — React hook wrapping storage operations with state, filtering
  - `src/__tests__/storage.test.ts` — unit tests for storage functions

#### Acceptance Criteria
- [ ] Todo type matches spec: id, title, description, priority, dueDate, status, createdAt, updatedAt
- [ ] CRUD operations work against localStorage
- [ ] Field validation enforced (title max 200, description max 2000)
- [ ] Default values applied (priority: medium, status: pending)
- [ ] Filtering by status and priority works
- [ ] Default sort order is createdAt descending
- [ ] Unit tests pass

#### Test Plan
- **Unit Tests**: CRUD operations, filtering, sorting, default values, field validation, edge cases (empty list, localStorage unavailable)

#### Rollback Strategy
Remove type and lib files; revert to Phase 1 state.

#### Risks
- **Risk**: localStorage mock complexity in tests
  - **Mitigation**: Use manual mock in vitest

---

### Phase 3: Todo UI Components
**Dependencies**: Phase 2

#### Objectives
- Build the complete CRUD UI for managing todos
- Implement filtering controls
- Handle empty state and responsive layout
- Enforce field constraints in form inputs

#### Deliverables
- [ ] Todo list component with filtering
- [ ] Todo creation form with validation (title required, max lengths)
- [ ] Todo edit inline or modal
- [ ] Delete confirmation
- [ ] Filter controls (status + priority)
- [ ] Empty state display
- [ ] Responsive layout (desktop sidebar + mobile stack)

#### Implementation Details
- Files to create/modify:
  - `src/components/TodoList.tsx` — list view with filtering
  - `src/components/TodoItem.tsx` — single todo display with actions (edit, delete, toggle status)
  - `src/components/TodoForm.tsx` — create/edit form with validation (title required, max 200 chars; description max 2000 chars)
  - `src/components/FilterBar.tsx` — status and priority filter controls
  - `src/components/EmptyState.tsx` — shown when no todos match
  - `src/app/page.tsx` — main page composing all components

#### Acceptance Criteria
- [ ] Can create a todo with all fields
- [ ] Form validation enforces field constraints
- [ ] Can edit any todo field inline
- [ ] Can delete a todo
- [ ] Can toggle todo status (pending/completed)
- [ ] Filters work for status and priority
- [ ] Empty state shown when appropriate
- [ ] Responsive on mobile

#### Test Plan
- **Manual Testing**: Full CRUD workflow, filter combinations, mobile viewport, validation errors

#### Rollback Strategy
Remove component files; page reverts to placeholder.

---

### Phase 4: Natural Language Chat Interface
**Dependencies**: Phase 2, Phase 3

#### Objectives
- Build server-side API route for Gemini NL processing
- Build client-side chat panel UI
- Connect NL actions to todo CRUD operations
- Implement action executor with unit tests

#### Deliverables
- [ ] `/api/chat` API route with Gemini integration
- [ ] Request payload validation (max 100KB, structure validation)
- [ ] System prompt for Gemini defining action schema and date semantics
- [ ] Chat panel UI component
- [ ] Action executor connecting NL responses to CRUD with schema validation
- [ ] Unit tests for action executor (parsing and execution)
- [ ] Error handling (API failures, unparseable responses, rate limits)
- [ ] Conversation history management

#### Implementation Details
- Files to create:
  - `src/app/api/chat/route.ts` — POST API route: validates payload size (max 100KB) and structure, receives message + todos + history + filters, calls Gemini, returns structured action
  - `src/lib/gemini.ts` — Gemini client setup and system prompt
  - `src/lib/actionExecutor.ts` — maps NL action responses to CRUD operations; validates response against action schema before execution
  - `src/components/ChatPanel.tsx` — chat UI with message list, input, loading state
  - `src/components/ChatMessage.tsx` — individual message display (user/assistant)
  - `src/hooks/useChat.ts` — manages chat state, history, API calls
  - `src/app/page.tsx` — updated to include chat panel
  - `src/__tests__/actionExecutor.test.ts` — unit tests for action parsing and execution
  - `src/__tests__/api-chat.test.ts` — integration tests for API route with mocked Gemini

- Gemini system prompt will:
  - Describe the todo schema and available actions
  - Include current todo list as context
  - Instruct Gemini to return JSON matching the action schema
  - Handle date interpretation: browser local timezone, "this week" = Monday–Sunday of current week, "tomorrow", "today", etc.

- API route security:
  - Validate Content-Length / payload size (max 100KB)
  - Validate request structure (message, todos, history fields required)
  - No todo content logged server-side (privacy)
  - Rate limit 429 responses → show "please wait" in chat

#### Acceptance Criteria
- [ ] Chat panel visible in UI
- [ ] Messages sent to `/api/chat` and responses displayed
- [ ] NL commands create/update/delete/list todos
- [ ] Ambiguous commands trigger CLARIFY response
- [ ] API errors show friendly message in chat
- [ ] Rate limit (429) shows "please wait" message
- [ ] Conversation history maintained (last 10 messages)
- [ ] CRUD UI remains functional when API is down
- [ ] Action executor unit tests pass
- [ ] API route integration tests pass (mocked Gemini)
- [ ] Payload size validation enforced

#### Test Plan
- **Unit Tests**: Action executor — test each action type parsing, invalid JSON handling, schema validation failures
- **Integration Tests**: API route with mocked Gemini — test each action type, error cases (500, 429, invalid response)
- **Manual Testing**: Conversational workflows, ambiguity handling, error states

#### Risks
- **Risk**: Gemini returns inconsistent JSON structure
  - **Mitigation**: Validate response against schema; fallback to error message

---

### Phase 5: Deployment Configuration & Final Verification
**Dependencies**: Phase 4

#### Objectives
- Configure for Railway deployment
- Final build and test verification
- Ensure all spec success criteria are met

#### Deliverables
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Railway deployment configuration
- [ ] Production build succeeds
- [ ] `.env.example` complete

#### Implementation Details
- Files to create/modify:
  - `Dockerfile` or `nixpacks.toml` — Railway deployment (if needed beyond defaults)
  - `package.json` — verify build/start scripts

#### Acceptance Criteria
- [ ] `npm test` passes all tests
- [ ] `npm run build` succeeds
- [ ] App starts with `npm start` in production mode
- [ ] GEMINI_API_KEY properly read from environment

#### Test Plan
- **Unit Tests**: Run full suite
- **Integration Tests**: Run full suite
- **Manual Testing**: Production build locally, verify all features

#### Rollback Strategy
Fix failing tests; do not deploy until green.

---

## Dependency Map
```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5
                 └──────────────────────┘
```

## Integration Points

### External Systems
- **Google Gemini API**
  - **Integration Type**: REST API via @google/generative-ai SDK
  - **Phase**: Phase 4
  - **Fallback**: Chat shows error; CRUD UI unaffected

## Risk Analysis

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini response format inconsistency | Medium | Medium | Schema validation + error fallback |
| localStorage unavailable | Low | Medium | Detect and warn; app still renders |
| Next.js App Router API route edge cases | Low | Low | Follow official docs |

## Validation Checkpoints
1. **After Phase 1**: App scaffolds, builds, runs, test runner works
2. **After Phase 2**: CRUD operations work, unit tests pass
3. **After Phase 3**: Full UI functional with filtering and validation
4. **After Phase 4**: NL chat works end-to-end, all tests pass
5. **After Phase 5**: Production build succeeds, deployment ready

## Expert Review

**Date**: 2026-02-13
**Models Consulted**: Gemini, Codex, Claude

**Key Feedback Incorporated**:
- **Gemini**: APPROVE — noted action executor should accept CRUD functions as arguments, icon library consideration
- **Codex**: REQUEST_CHANGES — added payload/privacy validation, NL action parsing unit tests, field constraint enforcement, date semantics in plan
- **Claude**: COMMENT — moved test config to Phase 1, added actionExecutor unit tests, added security/validation details to Phase 4, noted crypto.randomUUID() and date semantics

## Approval
- [ ] Technical Lead Review
- [x] Expert AI Consultation Complete

## Notes
- Each phase produces a single atomic commit: `[Spec 0001][Phase: implement] feat: Description`
- Tests are written alongside the code they test, not deferred to end
- Phase 5 is for deployment config and final verification, not a "write all tests" phase
