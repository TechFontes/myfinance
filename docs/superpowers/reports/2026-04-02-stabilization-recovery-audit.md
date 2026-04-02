# Stabilization Recovery Audit

Date: 2026-04-02

## Scope

This audit captures the current production regressions that block Wave 0 recovery work and the test gaps that allowed them to ship.

## Root Causes

### 1. Goals schema drift

`GoalContribution.kind` is now part of the code-level contract, but the production database path is not aligned yet. The schema intent has moved ahead of the deployed migration state, so goal-related writes can fail even though the app code and local tests suggest support exists.

### 2. Category edit async params mismatch

`app/dashboard/categories/[categoryId]/page.tsx` still treats `params` as a synchronous object. Next.js runtime semantics now deliver route params asynchronously in the app router, so the edit page can resolve `categoryId` too early and fall back to the not-found branch for an existing category.

### 3. Dashboard freshness gap

Paid transaction mutations do not currently enforce a dashboard refresh boundary. The mutation path updates the transaction record, but the dashboard read path is not explicitly invalidated or refreshed, so the dashboard can continue showing stale totals until a later navigation happens to force a reload.

### 4. Test coverage gaps

The existing test suite covered the happy-path category edit and the financial consistency aggregate, but it did not model the runtime async `params` contract or the post-mutation dashboard freshness boundary. That left the two regressions above unguarded.

## Evidence Read

- `app/dashboard/categories/[categoryId]/page.tsx`
- `app/api/transactions/[transactionId]/route.ts`
- `app/api/dashboard/route.ts`
- `app/services/dashboardService.ts`
- `tests/unit/categories/category-edit-page.test.tsx`
- `tests/unit/financial-consistency/financial-consistency-regression.test.ts`

## Recovery Note

Wave 0 should keep these failures visible until the production code is corrected. The new regression tests in this checkpoint intentionally capture the broken behavior so the subsequent implementation steps can fix them without ambiguity.
