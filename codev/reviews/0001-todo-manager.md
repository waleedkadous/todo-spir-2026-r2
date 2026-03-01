# Review: Todo Manager

## Summary

Implemented a complete Todo Manager web application using Next.js 16 with TypeScript and App Router. The app features traditional CRUD UI for todo management with localStorage persistence, filtering by status and priority, and a natural language chat interface powered by Gemini 2.0 Flash. The server-side API route proxies NL requests to Gemini, which returns structured JSON actions that the client executes against the todo list. The app is configured for Railway deployment with standalone output mode.

## Spec Compliance

- [x] Users can create todos with title, optional description, priority, optional due date
- [x] Users can view all todos in a list (sorted newest first by default)
- [x] Users can update any todo field (title, description, priority, due date, status)
- [x] Users can delete todos
- [x] Users can mark todos as completed or pending
- [x] Users can filter todos by status (all/pending/completed)
- [x] Users can filter todos by priority (all/low/medium/high)
- [x] Natural language interface can execute CRUD operations via conversational commands
- [x] Natural language interface handles ambiguity gracefully (CLARIFY action type)
- [x] NL interface supports date-aware queries (dueBefore/dueAfter filters)
- [x] NL interface shows clear error when Gemini API is unavailable; CRUD UI remains fully functional
- [x] All data persists across browser sessions via localStorage
- [x] Application configured for Railway deployment (standalone output)
- [x] Application compiles without errors (99 tests, clean build, clean lint)
- [x] Unit tests pass for todo CRUD logic and NL action parsing
- [x] Integration tests pass for API route with mocked Gemini
- [x] Responsive UI that works on desktop and mobile (flex-col lg:flex-row layout)
- [x] Empty state shows helpful message when no todos exist

## Deviations from Plan

- **Phase 1**: Plan specified `tailwind.config.ts` but Tailwind CSS v4 (shipped with Next.js 16) uses CSS-first configuration via `@import "tailwindcss"` in `globals.css`. No config file needed.
- **Phase 3**: Plan called for "delete confirmation" — implemented as a window.confirm() dialog rather than a custom modal, which was appropriate for the scope.
- **Phase 5**: Plan mentioned optional `Dockerfile` or `nixpacks.toml` — neither was needed since Railway auto-detects Next.js with `output: "standalone"`. This was the correct decision.
- **No deviation in architecture**: The API route, action executor pattern, and dependency-injected callbacks all followed the plan precisely.

## Lessons Learned

### What Went Well
- **Action executor pattern with dependency injection**: Injecting CRUD callbacks into `executeAction()` made the NL logic fully unit-testable without touching localStorage or the DOM
- **Incremental 3-way consultation**: Each phase review caught real issues (date filtering gap, lazy API key loading, byte-accurate payload checks, filtered count accuracy) that improved code quality
- **Type-driven development**: Defining `NLAction` as a discriminated union in `types/actions.ts` first made the action executor implementation straightforward with exhaustive type checking
- **Dual payload validation**: Both Content-Length header and actual body byte-length checks provide defense in depth against oversized payloads

### Challenges Encountered
- **Tailwind CSS v4 migration**: Next.js 16 ships with Tailwind v4 which uses CSS-first config instead of `tailwind.config.ts`. Initial ESLint config also needed adjustment for the new setup.
- **`@google/generative-ai` peer deps**: The Gemini SDK had peer dependency conflicts with React 19; resolved with `--legacy-peer-deps`.
- **UTC vs local date**: Initial implementation used `toISOString().split("T")[0]` for "today" which gives UTC date. Fixed to use manual `getFullYear()/getMonth()/getDate()` construction for local timezone.
- **GEMINI_API_KEY top-level crash**: Initial implementation threw at module import time when the key was missing, crashing the entire API route module. Fixed by making it lazy via a `getGenAI()` function.
- **Codex sandbox false positives**: Codex's restricted sandbox environment couldn't bind ports, causing Turbopack build failures and `npm start` failures that weren't code issues. Required rebuttals in two phases.

### What Would Be Done Differently
- **Start with lazy initialization for all environment-dependent modules**: The top-level GEMINI_API_KEY throw was a predictable issue that could have been avoided from the start.
- **Use TextEncoder for payload validation from the start**: String `.length` vs byte length is a well-known discrepancy for UTF-8 content; should have used byte-accurate checks initially.
- **Date handling utility**: Rather than inline date construction, a small `getLocalDateString()` helper would have been cleaner and more testable.

### Methodology Improvements
- **SPIR consultation is high-value**: The 3-way review process caught 8+ real issues across 5 phases that would have shipped as bugs without it.
- **Codex sandbox limitations are a known factor**: Turbopack port-binding failures in Codex's environment are not code issues. The rebuttal mechanism handled this well.
- **Phase granularity was appropriate**: 5 phases with clear boundaries made each consultation focused and manageable.

## Technical Debt

- **`setup.test.ts` canary test**: The `expect(true).toBe(true)` test was useful during Phase 1 scaffolding but is now redundant with 98 real tests. Harmless but adds no value.
- **No E2E tests**: Only unit and integration tests with mocked Gemini. No Playwright/Cypress E2E tests against a running app. Acceptable for v1 scope.
- **No localStorage schema versioning**: If the Todo schema changes in v2, there's no migration path for existing data. Noted as out of scope in the spec.

## Follow-up Items

- Deploy to Railway and verify production behavior with real Gemini API key
- Consider adding E2E tests with Playwright if the app grows
- Monitor Gemini response consistency in production and adjust system prompt if needed
- Consider localStorage schema versioning if a v2 is planned
