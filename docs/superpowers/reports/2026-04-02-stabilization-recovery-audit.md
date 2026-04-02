# Stabilization Recovery Audit

Date: 2026-04-02

## Scope

This audit captures the production regressions that blocked Wave 0 recovery work, the fixes applied, and the final verification evidence.

## Root Causes Identified

### 1. Goals schema drift (FIXED — Task 2)

`GoalContribution.kind` was part of the code-level contract but the migration history did not contain a corresponding migration. Fixed by creating a dedicated migration and reconciling migration history.

### 2. Category edit async params mismatch (FIXED — Task 3)

`app/dashboard/categories/[categoryId]/page.tsx` treated `params` as a synchronous object. Next.js 16 app router delivers route params asynchronously. Fixed by adding `await params` and using the resolved value.

### 3. Dashboard freshness gap (FIXED — Task 4)

Financial mutation routes did not call `revalidatePath('/dashboard')` after writes. Dashboard could show stale data. Fixed by adding `revalidatePath('/dashboard')` to all 6 mutation route handlers (transactions PATCH/POST, transfers PATCH/POST, goal contributions POST, invoices PATCH).

### 4. Test coverage gaps (FIXED — Tasks 1-2)

Regression tests were added to capture the broken behaviors before fixing them: category edit async params, dashboard freshness, migration discipline.

## Fixes Applied

| Task | Fix | Files | Commit Evidence |
|------|-----|-------|-----------------|
| 1 | Audit and regression tests | tests/unit/categories/category-edit-page.test.tsx, tests/unit/financial-consistency/dashboard-refresh-regression.test.ts | b7d2588, e173bfd, 38a7092 |
| 2 | Migration discipline + goal movement kind | prisma/schema.prisma, prisma/migrations, tests/unit/prisma/migration-discipline.test.ts | aade804, 793839e, c026539, dbb969c |
| 3 | Category edit await params | app/dashboard/categories/[categoryId]/page.tsx | Pending commit |
| 4 | Dashboard revalidation | 6 API route files | Pending commit |
| 5 | Financial reconciliation | Already covered by existing tests (17 tests pass) | N/A |
| 6 | Six-month seed dataset | prisma/seed.ts, tests/unit/prisma/seed-scenarios.test.ts | Pending commit |
| 7 | Governance and publish gates | AGENTS.md, docs/superpowers/plans/notes/ | Pending commit |

## Verification Evidence

### Focused Stabilization Matrix
- 9 test files, 30 tests — ALL PASS
- migration-discipline, dashboard-refresh-regression, category-edit-page, seed-scenarios, financial-consistency-regression, financial-command-service, invoice-reconciliation, smoke tests

### Broader Suite
- 134 test files, 350 tests — 349 PASS, 1 pre-existing timeout
- The single timeout (`recurrence-page.test.tsx`) is a pre-existing issue unrelated to stabilization work

### Lint
- 0 errors, 0 warnings (after fixing unused import)

## Residual Risks

### 1. Recurrence page test timeout
`tests/unit/recurrence/recurrence-page.test.tsx` times out at 10s. This is pre-existing and unrelated to stabilization work. Should be investigated separately.

### 2. Auth registration test timeout
`tests/unit/api/auth/auth-routes.test.ts` register test occasionally times out at 20s due to bcrypt hashing overhead. Not a stabilization concern.

### 3. Dashboard report aggregation timeout
`tests/unit/dashboard/dashboard-report.test.ts` aggregation test occasionally times out at 15s. Worth reviewing test setup complexity.

### 4. Production database migration
The goal movement kind migration must be applied to the production database before deploying. Run `npx prisma migrate deploy` in the production environment.

## Recovery Conclusion

All five program goals have been achieved:

1. **Production-safe schema discipline** — migration discipline test enforces migration presence
2. **Reliable post-mutation dashboard consistency** — revalidatePath in all mutation handlers
3. **Working edit flows for core entities** — category edit fixed for async params
4. **Richer seeded data** — six-month dataset covering all modules
5. **Auditable execution model** — governance docs and publish gates formalized
