# Issue Backlog For Shipping

This backlog captures all key points discussed: release blockers, security/cost controls, Spark decoupling, and premium rollout.

## 1) Secure LLM Endpoint With Auth
- Suggested title: Secure api/llm/complete with required user authentication
- Severity: Critical
- Labels: security, backend, ai, blocker
- Context: [api/llm/complete.ts](api/llm/complete.ts)
- Problem:
  - LLM endpoint can currently be called without guaranteed authenticated identity.
  - This allows abuse and uncontrolled cost.
- Scope:
  - Require authenticated user identity before processing requests.
  - Reject unauthenticated requests with 401.
- Acceptance criteria:
  - Unauthenticated call returns 401.
  - Authenticated call succeeds when within limits.
  - Identity is available for usage tracking and rate limiting.

## 2) Add AI Rate Limiting (Free And Premium)
- Suggested title: Add per-user AI rate limiting (10 per 10m, 50 per day free tier)
- Severity: Critical
- Labels: backend, ai, cost-control, blocker
- Context: [api/llm/complete.ts](api/llm/complete.ts), [api/_lib/rate-limit.ts](api/_lib/rate-limit.ts)
- Problem:
  - No enforced request quotas for free and premium users.
- Scope:
  - Enforce dual-window limits.
  - Add premium tier limits via env or subscription tier.
  - Return 429 with retry hints and remaining quotas.
- Acceptance criteria:
  - Free users are limited to default 10 per 10 minutes and 50 per day.
  - Premium users get higher limits.
  - Response includes enough metadata for client UX.

## 3) Validate Prompt And Payload Size
- Suggested title: Add prompt input validation and payload size guardrails for LLM API
- Severity: High
- Labels: backend, ai, security
- Context: [api/llm/complete.ts](api/llm/complete.ts)
- Problem:
  - Unbounded prompt size risks cost spikes and failures.
- Scope:
  - Add max prompt length.
  - Add max body size check where possible.
  - Return 400 for invalid or oversized input.
- Acceptance criteria:
  - Oversized prompts are rejected.
  - Empty prompt is rejected.
  - Valid prompts continue to work.

## 4) Add Usage Logging And Cost Telemetry
- Suggested title: Record AI usage metrics and estimated cost per request
- Severity: High
- Labels: backend, ai, analytics, cost-control
- Context: [api/llm/complete.ts](api/llm/complete.ts)
- Problem:
  - No backend visibility into request volume, token usage, or cost.
- Scope:
  - Log model, request status, and usage stats.
  - Prepare storage schema for future billing and abuse analysis.
- Acceptance criteria:
  - Usage event is recorded per request.
  - Failed and rate-limited requests are distinguishable.

## 5) Protect Auth And Preferences Endpoints
- Suggested title: Require authenticated access for auth/profile and preferences endpoints
- Severity: Critical
- Labels: security, backend, blocker
- Context: [api/auth/me.ts](api/auth/me.ts), [api/preferences.ts](api/preferences.ts)
- Problem:
  - Placeholder endpoints are not fully enforcing access control for user-scoped data.
- Scope:
  - Enforce identity checks before returning or updating user data.
- Acceptance criteria:
  - Unauthenticated requests receive 401.
  - User can only read/write own profile/preferences.

## 6) Implement Real Auth Provider Integration
- Suggested title: Wire api/auth/me to Supabase session-backed identity
- Severity: High
- Labels: backend, auth, migration
- Context: [api/auth/me.ts](api/auth/me.ts), [src/lib/auth-client.ts](src/lib/auth-client.ts)
- Problem:
  - Endpoint currently returns placeholder user null.
- Scope:
  - Resolve user from Supabase session/token.
  - Return normalized user payload expected by frontend.
- Acceptance criteria:
  - Logged-in users receive profile payload.
  - Logged-out users receive user null or 401 based on API contract.

## 7) Implement Persistent Preferences Storage
- Suggested title: Wire preferences endpoint to persistent storage (Supabase)
- Severity: High
- Labels: backend, data, migration
- Context: [api/preferences.ts](api/preferences.ts), [src/lib/preferences-client.ts](src/lib/preferences-client.ts)
- Problem:
  - Preferences endpoint is placeholder and not persistent across devices.
- Scope:
  - Persist notifications, email updates, auto-save, and personal voice sample.
- Acceptance criteria:
  - Preferences survive reload and device switch.
  - GET returns saved values.
  - PUT updates and returns stored values.

## 8) Migrate Remaining Spark KV Dependencies
- Suggested title: Replace remaining Spark KV dependencies in core hooks and screens
- Severity: Critical
- Labels: migration, backend, blocker
- Context:
  - [src/hooks/use-journal-data.ts](src/hooks/use-journal-data.ts)
  - [src/hooks/use-language.tsx](src/hooks/use-language.tsx)
  - [src/hooks/use-night-mode.ts](src/hooks/use-night-mode.ts)
  - [src/components/screens/HomeScreen.tsx](src/components/screens/HomeScreen.tsx)
  - [src/components/screens/EntryEditScreen.tsx](src/components/screens/EntryEditScreen.tsx)
  - [src/main.tsx](src/main.tsx)
  - [vite.config.ts](vite.config.ts)
- Problem:
  - App remains partially Spark-coupled and not fully portable.
- Scope:
  - Replace Spark storage/runtime usage with provider-based adapters.
- Acceptance criteria:
  - App runs in non-Spark environment without Spark runtime import.

## 9) Remove Duplicate Source Tree
- Suggested title: Remove duplicate nested app tree and keep single source of truth
- Severity: High
- Labels: cleanup, architecture, blocker
- Status: Completed locally on 2026-03-18 (nested duplicate tree moved out of repository; root tree is canonical)
- Context: duplicate root and nested app directories
- Problem:
  - Duplicate trees increase drift risk and release mistakes.
- Scope:
  - Choose canonical app path.
  - Remove duplicate tree and update any scripts/docs.
- Acceptance criteria:
  - Single source tree remains.
  - Build and dev commands still succeed.

## 10) Add Minimal Test Coverage For Critical Paths
- Suggested title: Add smoke tests for APIs and critical parsing/adapters
- Severity: High
- Labels: testing, quality
- Context:
  - [api/llm/complete.ts](api/llm/complete.ts)
  - [api/preferences.ts](api/preferences.ts)
  - [src/lib/ai-client.ts](src/lib/ai-client.ts)
  - [src/lib/preferences-client.ts](src/lib/preferences-client.ts)
- Problem:
  - No automated test safety net for core backend and adapter logic.
- Scope:
  - Add test setup and baseline tests.
- Acceptance criteria:
  - CI test command exists and passes.
  - Critical endpoint behaviors are covered (success, invalid input, rate-limited).

## 11) Improve User-Facing Error Handling For AI/Location Failures
- Suggested title: Surface image analysis and geocoding failures with user-visible feedback
- Severity: Medium
- Labels: ux, reliability
- Context: [src/lib/entries.ts](src/lib/entries.ts), [src/lib/geocoding.ts](src/lib/geocoding.ts)
- Problem:
  - Some failures are logged but not surfaced clearly to users.
- Scope:
  - Add toasts/messages for recoverable failures.
  - Preserve fallback behavior.
- Acceptance criteria:
  - Users get clear error state and next-step guidance.

## 12) Add Premium Tier Foundation
- Suggested title: Add subscription tier model and premium gating for AI limits
- Severity: High
- Labels: billing, backend, product
- Context: [api/llm/complete.ts](api/llm/complete.ts)
- Problem:
  - No billing-aware user tier model yet.
- Scope:
  - Introduce user tier source (free or premium).
  - Connect rate limits to tier.
  - Start with env-driven or DB-driven tier mapping.
- Acceptance criteria:
  - Tier is resolved per request.
  - Premium users receive higher quotas.

## 13) Integrate Payment Provider For Premium
- Suggested title: Integrate Stripe subscription flow for premium plan
- Severity: Medium
- Labels: billing, payments, backend, frontend
- Problem:
  - Premium concept exists but no payment workflow.
- Scope:
  - Checkout session.
  - Webhook handling.
  - Subscription state sync.
- Acceptance criteria:
  - User can purchase premium.
  - Tier updates automatically and is reflected in API limits.

## 14) Add Usage Dashboard And Upgrade CTA
- Suggested title: Add usage quota dashboard and upgrade prompts in app
- Severity: Medium
- Labels: frontend, product, billing
- Problem:
  - Users need transparent usage visibility to reduce confusion and support upgrades.
- Scope:
  - Show remaining requests, reset times, and upgrade path.
- Acceptance criteria:
  - User sees quota usage in UI.
  - Rate-limit responses are translated into helpful UI messaging.

## 15) Document Deployment And Secrets Checklist
- Suggested title: Add production deployment checklist for Vercel, Supabase, and OpenAI secrets
- Severity: Medium
- Labels: docs, devops
- Problem:
  - Missing explicit production checklist increases misconfiguration risk.
- Scope:
  - Required env vars and defaults.
  - Security notes.
  - Rollback steps.
- Acceptance criteria:
  - README or docs include complete deployment checklist.
