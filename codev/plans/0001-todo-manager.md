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
- [ ] Unit tests pass for todo CRUD logic
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
- Configure project for Railway deployment

#### Deliverables
- [ ] Next.js project initialized with App Router
- [ ] TypeScript configured
- [ ] Tailwind CSS configured
- [ ] `.env.example` with GEMINI_API_KEY
- [ ] `.gitignore` updated
- [ ] Basic app layout with responsive shell

#### Implementation Details
- Files to create/modify:
  - `package.json` — dependencies
  - `tsconfig.json` — TypeScript config
  - `tailwind.config.ts` — Tailwind config
  - `next.config.ts` — Next.js config
  - `.env.example` — environment template
  - `.gitignore` — ignore patterns
  - `src/app/layout.tsx` — root layout
  - `src/app/page.tsx` — main page (placeholder)
  - `src/app/globals.css` — global styles with Tailwind directives

#### Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] Tailwind classes render correctly
- [ ] `.env.example` documents GEMINI_API_KEY

#### Test Plan
- **Manual Testing**: `npm run dev` loads, `npm run build` succeeds

#### Rollback Strategy
Delete generated files; re-scaffold.

---

### Phase 2: Todo Data Layer & Types
**Dependencies**: Phase 1

#### Objectives
- Define TypeScript types for Todo model and NL actions
- Implement localStorage CRUD operations
- Create React hook for todo state management

#### Deliverables
- [ ] Todo type definitions
- [ ] NL action type definitions
- [ ] localStorage CRUD functions (create, read, update, delete, filter)
- [ ] `useTodos` React hook
- [ ] Unit tests for CRUD logic

#### Implementation Details
- Files to create:
  - `src/types/todo.ts` — Todo interface, Priority enum, Status enum
  - `src/types/actions.ts` — NL action types (ADD_TODO, UPDATE_TODO, DELETE_TODO, LIST_TODOS, CLARIFY, RESPONSE)
  - `src/lib/storage.ts` — localStorage CRUD operations (getTodos, saveTodos, addTodo, updateTodo, deleteTodo)
  - `src/hooks/useTodos.ts` — React hook wrapping storage operations with state, filtering
  - `src/__tests__/storage.test.ts` — unit tests for storage functions

#### Acceptance Criteria
- [ ] Todo type matches spec: id, title, description, priority, dueDate, status, createdAt, updatedAt
- [ ] CRUD operations work against localStorage
- [ ] Filtering by status and priority works
- [ ] Default sort order is createdAt descending
- [ ] Unit tests pass

#### Test Plan
- **Unit Tests**: CRUD operations, filtering, sorting, default values, edge cases (empty list, localStorage unavailable)

#### Rollback Strategy
Remove type and lib files; revert to Phase 1 state.

#### Risks
- **Risk**: localStorage mock complexity in tests
  - **Mitigation**: Use jest-localstorage-mock or manual mock

---

### Phase 3: Todo UI Components
**Dependencies**: Phase 2

#### Objectives
- Build the complete CRUD UI for managing todos
- Implement filtering controls
- Handle empty state and responsive layout

#### Deliverables
- [ ] Todo list component with filtering
- [ ] Todo creation form/dialog
- [ ] Todo edit inline or modal
- [ ] Delete confirmation
- [ ] Filter controls (status + priority)
- [ ] Empty state display
- [ ] Responsive layout (desktop sidebar + mobile stack)

#### Implementation Details
- Files to create/modify:
  - `src/components/TodoList.tsx` — list view with filtering
  - `src/components/TodoItem.tsx` — single todo display with actions (edit, delete, toggle status)
  - `src/components/TodoForm.tsx` — create/edit form (title, description, priority, due date)
  - `src/components/FilterBar.tsx` — status and priority filter controls
  - `src/components/EmptyState.tsx` — shown when no todos match
  - `src/app/page.tsx` — main page composing all components

#### Acceptance Criteria
- [ ] Can create a todo with all fields
- [ ] Can edit any todo field inline
- [ ] Can delete a todo
- [ ] Can toggle todo status (pending/completed)
- [ ] Filters work for status and priority
- [ ] Empty state shown when appropriate
- [ ] Responsive on mobile

#### Test Plan
- **Manual Testing**: Full CRUD workflow, filter combinations, mobile viewport
- **Unit Tests**: Component logic if applicable

#### Rollback Strategy
Remove component files; page reverts to placeholder.

---

### Phase 4: Natural Language Chat Interface
**Dependencies**: Phase 2, Phase 3

#### Objectives
- Build server-side API route for Gemini NL processing
- Build client-side chat panel UI
- Connect NL actions to todo CRUD operations

#### Deliverables
- [ ] `/api/chat` API route with Gemini integration
- [ ] System prompt for Gemini defining action schema
- [ ] Chat panel UI component
- [ ] Action executor connecting NL responses to CRUD
- [ ] Error handling (API failures, unparseable responses)
- [ ] Conversation history management

#### Implementation Details
- Files to create:
  - `src/app/api/chat/route.ts` — POST API route: receives message + todos + history + filters, calls Gemini, returns structured action
  - `src/lib/gemini.ts` — Gemini client setup and system prompt
  - `src/lib/actionExecutor.ts` — maps NL action responses to CRUD operations
  - `src/components/ChatPanel.tsx` — chat UI with message list, input, loading state
  - `src/components/ChatMessage.tsx` — individual message display (user/assistant)
  - `src/hooks/useChat.ts` — manages chat state, history, API calls
  - `src/app/page.tsx` — updated to include chat panel

- Gemini system prompt will:
  - Describe the todo schema and available actions
  - Include current todo list as context
  - Instruct Gemini to return JSON matching the action schema
  - Handle date interpretation ("this week", "tomorrow", etc.)

#### Acceptance Criteria
- [ ] Chat panel visible in UI
- [ ] Messages sent to `/api/chat` and responses displayed
- [ ] NL commands create/update/delete/list todos
- [ ] Ambiguous commands trigger CLARIFY response
- [ ] API errors show friendly message in chat
- [ ] Conversation history maintained (last 10 messages)
- [ ] CRUD UI remains functional when API is down

#### Test Plan
- **Integration Tests**: API route with mocked Gemini — test each action type, error cases
- **Manual Testing**: Conversational workflows, ambiguity handling, error states

#### Risks
- **Risk**: Gemini returns inconsistent JSON structure
  - **Mitigation**: Validate response against schema; fallback to error message

---

### Phase 5: Testing & Deployment Configuration
**Dependencies**: Phase 4

#### Objectives
- Ensure all tests pass
- Configure for Railway deployment
- Final build verification

#### Deliverables
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Railway deployment configuration
- [ ] Production build succeeds
- [ ] `.env.example` complete

#### Implementation Details
- Files to create/modify:
  - `src/__tests__/api-chat.test.ts` — integration tests for `/api/chat` route
  - `jest.config.ts` or `vitest.config.ts` — test configuration
  - `Dockerfile` or `nixpacks.toml` — Railway deployment (if needed beyond defaults)
  - `package.json` — verify build/start scripts

#### Acceptance Criteria
- [ ] `npm test` passes all tests
- [ ] `npm run build` succeeds
- [ ] App starts with `npm start` in production mode
- [ ] GEMINI_API_KEY properly read from environment

#### Test Plan
- **Unit Tests**: Run full suite
- **Integration Tests**: API route tests with mocked Gemini
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
1. **After Phase 1**: App scaffolds, builds, runs
2. **After Phase 2**: CRUD operations work, tests pass
3. **After Phase 3**: Full UI functional with filtering
4. **After Phase 4**: NL chat works end-to-end
5. **After Phase 5**: All tests pass, production build succeeds

## Approval
- [ ] Technical Lead Review
- [ ] Expert AI Consultation Complete

## Notes
- Each phase produces a single atomic commit: `[Spec 0001][Phase: phase_N] feat: Description`
- Tests are written alongside the code they test, not deferred to end
- Phase 5 is for final integration tests and deployment config, not a "write all tests" phase
