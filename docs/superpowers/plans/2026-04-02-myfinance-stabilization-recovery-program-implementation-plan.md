# MyFinance Stabilization Recovery Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recover production trust by fixing schema drift, dashboard staleness, broken edit flows, weak verification gaps, and thin seeded data without introducing new hidden regressions.

**Architecture:** Execute in five waves. Start by containing production-visible failures, then harden schema discipline, then reconcile mutation-to-dashboard behavior, then complete edit flows and rich seed scenarios, and finally formalize publish governance. Every task follows TDD and requires focused verification before broader verification.

**Tech Stack:** Next.js 16 app router, TypeScript, Prisma/MySQL, React Hook Form, Vitest, ESLint, standalone deploy, multi-agent coordination.

---

## File Structure Map

### Production containment and DB parity

- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_goal_movement_kind/migration.sql`
- Modify: `prisma/seed.ts`
- Modify: `prisma.config.ts`
- Create: `tests/unit/prisma/migration-discipline.test.ts`
- Modify: `tests/unit/prisma/goals-schema.test.ts`
- Create: `docs/superpowers/reports/2026-04-02-stabilization-recovery-audit.md`

### Dashboard freshness and reconciliation

- Modify: `app/services/dashboardService.ts`
- Modify: `app/api/dashboard/route.ts`
- Modify: `app/api/transactions/route.ts`
- Modify: `app/api/transactions/[transactionId]/route.ts`
- Modify: `app/api/transfers/route.ts`
- Modify: `app/api/transfers/[transferId]/route.ts`
- Modify: `app/api/goals/[goalId]/contributions/route.ts`
- Modify: `app/api/invoices/[invoiceId]/route.ts`
- Modify: `app/components/transactions/TransactionForm.tsx`
- Modify: `app/components/goals/GoalMovementForm.tsx`
- Create: `tests/unit/financial-consistency/dashboard-refresh-regression.test.ts`
- Create: `tests/smoke/critical-financial-flows/dashboard-refresh-smoke.test.ts`

### Edit and action flows

- Modify: `app/dashboard/categories/[categoryId]/page.tsx`
- Modify: `app/dashboard/accounts/[accountId]/page.tsx`
- Modify: `app/dashboard/cards/[cardId]/edit/page.tsx`
- Modify: `app/dashboard/goals/[goalId]/edit/page.tsx`
- Modify: `app/dashboard/transfers/[transferId]/page.tsx`
- Modify: `app/dashboard/transactions/[transactionId]/page.tsx`
- Modify: `app/modules/categories/service.ts`
- Modify: `app/modules/accounts/service.ts`
- Modify: `app/modules/cards/service.ts`
- Modify: `app/modules/goals/service.ts`
- Modify: `app/modules/transfers/service.ts`
- Modify: `app/modules/transactions/service.ts`
- Modify: `tests/unit/categories/category-edit-page.test.tsx`
- Modify: `tests/unit/accounts/account-edit-page.test.tsx`
- Modify: `tests/unit/cards/card-edit-page.test.tsx`
- Modify: `tests/unit/goals/goal-edit-page.test.tsx`
- Modify: `tests/unit/transfers/transfer-edit-flow.test.tsx`
- Modify: `tests/unit/transactions/transaction-edit-flow.test.tsx`

### Seed and governance

- Modify: `prisma/seed.ts`
- Create: `tests/unit/prisma/seed-scenarios.test.ts`
- Create: `docs/superpowers/plans/notes/agent-execution-governance.md`
- Create: `docs/superpowers/plans/notes/publish-gates-checklist.md`

---

### Task 1: Audit and Contain the Reported Production Failures

**Files:**
- Create: `docs/superpowers/reports/2026-04-02-stabilization-recovery-audit.md`
- Test: `tests/unit/prisma/goals-schema.test.ts`
- Test: `tests/unit/categories/category-edit-page.test.tsx`
- Test: `tests/unit/financial-consistency/dashboard-refresh-regression.test.ts`

- [ ] **Step 1: Run the current focused failing surface before touching code**

Run:
```bash
yarn test tests/unit/prisma/goals-schema.test.ts tests/unit/categories/category-edit-page.test.tsx tests/unit/financial-consistency/dashboard-refresh-regression.test.ts
```

Expected:
- existing tests may pass locally
- `dashboard-refresh-regression.test.ts` may not exist yet
- this run establishes the exact pre-change baseline

- [ ] **Step 2: Write missing failing regression tests for the reported bugs**

Add tests that prove:

```ts
// tests/unit/categories/category-edit-page.test.tsx
it('awaits async route params and renders the edit form for an existing category', async () => {
  const page = await CategoryEditPage({
    params: Promise.resolve({ categoryId: '5' }),
  })
  render(page)
  expect(screen.getByDisplayValue('Moradia')).toBeInTheDocument()
})

// tests/unit/financial-consistency/dashboard-refresh-regression.test.ts
it('recomputes dashboard report after a paid transaction mutation', async () => {
  const before = await getDashboardReport('user-1', '2026-04')
  await createOrSettleTransactionForUser('user-1', paidExpensePayload)
  const after = await getDashboardReport('user-1', '2026-04')
  expect(after.summary.realizedExpense).not.toEqual(before.summary.realizedExpense)
})
```

- [ ] **Step 3: Run the new regression tests and verify they fail**

Run:
```bash
yarn test tests/unit/categories/category-edit-page.test.tsx tests/unit/financial-consistency/dashboard-refresh-regression.test.ts
```

Expected:
- fail on async params handling in category edit
- fail on stale dashboard behavior or missing reconciliation path

- [ ] **Step 4: Write the audit note documenting current root causes**

Record:
- goals schema drift
- category edit async params mismatch
- dashboard freshness gap after mutations
- test coverage gaps that let them ship

- [ ] **Step 5: Commit the audit-only checkpoint**

```bash
git add docs/superpowers/reports/2026-04-02-stabilization-recovery-audit.md tests/unit/categories/category-edit-page.test.tsx tests/unit/financial-consistency/dashboard-refresh-regression.test.ts
git commit -m "test: capture stabilization recovery regressions"
```

### Task 2: Restore Schema Discipline for Goal Movement Kind

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_goal_movement_kind/migration.sql`
- Create: `tests/unit/prisma/migration-discipline.test.ts`
- Modify: `tests/unit/prisma/goals-schema.test.ts`

- [ ] **Step 1: Add a failing migration-discipline test**

```ts
// tests/unit/prisma/migration-discipline.test.ts
it('requires a migration for GoalContribution.kind schema support', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8')
  const migrationHistory = readdirSync('prisma/migrations')
    .filter((entry) => entry !== 'migration_lock.toml')
    .sort()
    .map((entry) => readFileSync(`prisma/migrations/${entry}/migration.sql`, 'utf8'))
    .join('\n')
    .replace(/\s+/g, ' ')
    .trim()
  expect(schema).toContain('kind                 GoalMovementKind')
  expect(schema).not.toContain('reflectFinancially')
  expect(migrationHistory).toContain('`reflectFinancially` BOOLEAN NOT NULL DEFAULT false')
  expect(migrationHistory).toMatch(
    /ALTER TABLE `GoalContribution` .*DROP COLUMN `reflectFinancially`.*ADD COLUMN `kind` ENUM\('CONTRIBUTION', 'WITHDRAWAL', 'ADJUSTMENT'\) NOT NULL DEFAULT 'CONTRIBUTION'/,
  )
})
```

- [ ] **Step 2: Run the Prisma discipline tests and verify failure**

Run:
```bash
yarn test tests/unit/prisma/goals-schema.test.ts tests/unit/prisma/migration-discipline.test.ts
```

Expected:
- fail because migration history still leaves `reflectFinancially` unreconciled for `GoalContribution`

- [ ] **Step 3: Create the Prisma migration**

The migration must reconcile the baseline `reflectFinancially` column with the schema's `kind` field:

```sql
ALTER TABLE `GoalContribution`
  DROP COLUMN `reflectFinancially`,
  ADD COLUMN `kind` ENUM('CONTRIBUTION', 'WITHDRAWAL', 'ADJUSTMENT')
  NOT NULL DEFAULT 'CONTRIBUTION';
```

If MySQL requires enum creation inline, adapt the SQL to the generated Prisma form. This is still one schema-evolution step for `GoalContribution`: fresh databases built from migration history must end with `kind` and no legacy `reflectFinancially` column.

- [ ] **Step 4: Re-run Prisma discipline tests**

Run:
```bash
yarn test tests/unit/prisma/goals-schema.test.ts tests/unit/prisma/migration-discipline.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Verify migration state locally**

Run:
```bash
npx prisma migrate status
```

Expected:
- Prisma reports the migration set and current schema state clearly

- [ ] **Step 6: Commit the DB parity checkpoint**

```bash
git add prisma/schema.prisma prisma/migrations tests/unit/prisma/goals-schema.test.ts tests/unit/prisma/migration-discipline.test.ts
git commit -m "fix: add migration discipline for goal movement kind"
```

### Task 3: Fix Category Edit Under Real Next.js Route Param Semantics

**Files:**
- Modify: `app/dashboard/categories/[categoryId]/page.tsx`
- Modify: `tests/unit/categories/category-edit-page.test.tsx`

- [ ] **Step 1: Confirm the page test fails with async params**

Run:
```bash
yarn test tests/unit/categories/category-edit-page.test.tsx
```

Expected:
- fail while using `params: Promise.resolve({ categoryId: '5' })`

- [ ] **Step 2: Update the page to match runtime semantics**

Refactor the page shape to:

```ts
type CategoryEditPageProps = {
  params: Promise<{ categoryId: string }>
}

export default async function CategoryEditPage({ params }: CategoryEditPageProps) {
  const { categoryId } = await params
  // existing logic continues with categoryId
}
```

Prefer direct id handling with explicit parse and guard instead of silently comparing against `NaN`.

- [ ] **Step 3: Add not-found coverage for invalid ids**

```ts
it('renders the not-found card when category id is invalid', async () => {
  const page = await CategoryEditPage({ params: Promise.resolve({ categoryId: 'abc' }) })
  render(page)
  expect(screen.getByText('Categoria não encontrada.')).toBeInTheDocument()
})
```

- [ ] **Step 4: Re-run the category edit tests**

Run:
```bash
yarn test tests/unit/categories/category-edit-page.test.tsx tests/unit/api/categories/categories-route.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Commit the category edit fix**

```bash
git add app/dashboard/categories/[categoryId]/page.tsx tests/unit/categories/category-edit-page.test.tsx tests/unit/api/categories/categories-route.test.ts
git commit -m "fix: align category edit page with async route params"
```

### Task 4: Define Canonical Dashboard Freshness After Mutations

**Files:**
- Modify: `app/api/transactions/route.ts`
- Modify: `app/api/transactions/[transactionId]/route.ts`
- Modify: `app/api/transfers/route.ts`
- Modify: `app/api/transfers/[transferId]/route.ts`
- Modify: `app/api/goals/[goalId]/contributions/route.ts`
- Modify: `app/api/invoices/[invoiceId]/route.ts`
- Modify: `app/components/transactions/TransactionForm.tsx`
- Modify: `app/components/goals/GoalMovementForm.tsx`
- Modify: `tests/unit/financial-consistency/dashboard-refresh-regression.test.ts`
- Create: `tests/smoke/critical-financial-flows/dashboard-refresh-smoke.test.ts`

- [ ] **Step 1: Write failing tests for mutation-to-dashboard freshness**

Cover route-level behavior and read recomputation:

```ts
it('recomputes dashboard after marking a transaction as paid', async () => {
  await patchTransactionStatusToPaid(...)
  const report = await getDashboardReport('user-1', '2026-04')
  expect(report.summary.realizedExpense).toBe('125.00')
})

it('recomputes dashboard after reserve-backed goal contribution', async () => {
  await postGoalContribution(...)
  const report = await getDashboardReport('user-1', '2026-04')
  expect(report.accounts.find((a) => a.id === reserveId)?.balance).toBe('...')
})
```

- [ ] **Step 2: Run the dashboard freshness tests and verify failure**

Run:
```bash
yarn test tests/unit/financial-consistency/dashboard-refresh-regression.test.ts tests/smoke/critical-financial-flows/dashboard-refresh-smoke.test.ts
```

Expected:
- fail because one or more mutation paths do not produce fresh dashboard state

- [ ] **Step 3: Implement explicit post-mutation refresh strategy**

Use one consistent pattern across route handlers:

```ts
import { revalidatePath } from 'next/cache'

revalidatePath('/dashboard')
revalidatePath('/dashboard/transactions')
```

Apply the smallest set of affected paths per mutation. Do not scatter random invalidation; document which capability invalidates which reads.

- [ ] **Step 4: Ensure client flows also refresh after redirect targets**

For client forms that return to dashboard-adjacent pages, keep:

```ts
router.push('/dashboard/transactions')
router.refresh()
```

but only after route-level invalidation is in place. Client refresh is supplemental, not the source of truth.

- [ ] **Step 5: Re-run the focused regression and smoke suite**

Run:
```bash
yarn test tests/unit/financial-consistency/dashboard-refresh-regression.test.ts tests/smoke/critical-financial-flows/dashboard-refresh-smoke.test.ts tests/unit/dashboard/dashboard-service.test.ts tests/unit/api/dashboard/dashboard-route.test.ts
```

Expected:
- PASS

- [ ] **Step 6: Commit the dashboard freshness checkpoint**

```bash
git add app/api/transactions app/api/transfers app/api/goals/[goalId]/contributions/route.ts app/api/invoices/[invoiceId]/route.ts app/components/transactions/TransactionForm.tsx app/components/goals/GoalMovementForm.tsx tests/unit/financial-consistency/dashboard-refresh-regression.test.ts tests/smoke/critical-financial-flows/dashboard-refresh-smoke.test.ts tests/unit/dashboard/dashboard-service.test.ts tests/unit/api/dashboard/dashboard-route.test.ts
git commit -m "fix: revalidate dashboard reads after financial mutations"
```

### Task 5: Harden Financial Command and Reporting Integration

**Files:**
- Modify: `app/modules/financial-core/service.ts`
- Modify: `app/modules/goals/service.ts`
- Modify: `app/modules/invoices/service.ts`
- Modify: `app/services/dashboardService.ts`
- Modify: `tests/unit/financial-core/financial-command-service.test.ts`
- Modify: `tests/unit/invoices/invoice-reconciliation.test.ts`
- Modify: `tests/unit/financial-consistency/financial-consistency-regression.test.ts`

- [ ] **Step 1: Add failing cross-domain tests for side effects**

Focus on:
- paid transaction updates account snapshot and realized totals
- invoice payment affects invoice state and account-facing reporting
- goal withdrawal keeps signed amount semantics and transfer linkage

- [ ] **Step 2: Run the focused financial-core suite and verify failure**

Run:
```bash
yarn test tests/unit/financial-core/financial-command-service.test.ts tests/unit/invoices/invoice-reconciliation.test.ts tests/unit/financial-consistency/financial-consistency-regression.test.ts
```

Expected:
- at least one assertion fails because side effects are under-specified or stale

- [ ] **Step 3: Implement the minimal reconciliation fixes**

Only adjust:
- command result contracts
- service reconciliation logic
- dashboard aggregation boundaries

Do not introduce a new architecture in this wave.

- [ ] **Step 4: Re-run the financial-core suite**

Run:
```bash
yarn test tests/unit/financial-core/financial-command-service.test.ts tests/unit/invoices/invoice-reconciliation.test.ts tests/unit/financial-consistency/financial-consistency-regression.test.ts tests/unit/dashboard/dashboard-report.test.ts tests/unit/dashboard/dashboard-service.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Commit the reconciliation checkpoint**

```bash
git add app/modules/financial-core/service.ts app/modules/goals/service.ts app/modules/invoices/service.ts app/services/dashboardService.ts tests/unit/financial-core/financial-command-service.test.ts tests/unit/invoices/invoice-reconciliation.test.ts tests/unit/financial-consistency/financial-consistency-regression.test.ts tests/unit/dashboard/dashboard-report.test.ts tests/unit/dashboard/dashboard-service.test.ts
git commit -m "fix: harden financial reconciliation side effects"
```

### Task 6: Expand the Seed Into a Six-Month Validation Dataset

**Files:**
- Modify: `prisma/seed.ts`
- Create: `tests/unit/prisma/seed-scenarios.test.ts`

- [ ] **Step 1: Write the failing seed coverage test**

The test should assert that the seed source code contains or constructs:
- six monthly periods
- at least three accounts
- hierarchical categories
- transactions, transfers, cards, invoices, goals, and recurring rules

Example:

```ts
it('defines a six-month seeded scenario across the main financial modules', () => {
  const seed = readFileSync('prisma/seed.ts', 'utf8')
  expect(seed).toContain('2026-01')
  expect(seed).toContain('creditCard')
  expect(seed).toContain('recurring')
  expect(seed).toContain('goal')
  expect(seed).toContain('transfer')
})
```

- [ ] **Step 2: Run the seed coverage test and verify failure**

Run:
```bash
yarn test tests/unit/prisma/seed-scenarios.test.ts
```

Expected:
- FAIL because the current seed is too thin

- [ ] **Step 3: Implement the richer idempotent seed**

The seed must include:
- one primary user with six months of activity
- accounts, nested categories, transactions, recurring rules
- one or more credit cards with invoices and installments
- transfers between accounts
- two goals with contribution, withdrawal, and adjustment histories

Maintain idempotence by:
- `upsert` on user
- `findFirst` or unique business keys for reusable entities
- deterministic descriptions and dates for transactions

- [ ] **Step 4: Re-run the seed test**

Run:
```bash
yarn test tests/unit/prisma/seed-scenarios.test.ts tests/unit/prisma/goals-schema.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Validate the seed behavior manually in a safe environment**

Run:
```bash
npx prisma db seed
npx prisma db seed
```

Expected:
- second run does not duplicate scenario data unexpectedly

- [ ] **Step 6: Commit the seed checkpoint**

```bash
git add prisma/seed.ts tests/unit/prisma/seed-scenarios.test.ts
git commit -m "feat: seed six months of portfolio-grade financial data"
```

### Task 7: Formalize Governance and Publish Gates

**Files:**
- Create: `docs/superpowers/plans/notes/agent-execution-governance.md`
- Create: `docs/superpowers/plans/notes/publish-gates-checklist.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Write the governance notes**

Document:
- owner agent
- integration reviewer
- verification reviewer
- four gates:
  - design
  - red
  - integration
  - publish

- [ ] **Step 2: Update `AGENTS.md` with the new non-negotiable gates**

Add conventions requiring:
- migration verification for schema-backed changes
- runtime-like route param tests for dynamic pages
- cross-domain regression tests for financial mutations
- explicit publish evidence before claiming production-ready

- [ ] **Step 3: Review the notes for contradictions and overlap**

Check:
- no duplicated or conflicting rules
- publish checklist reflects actual repo commands

- [ ] **Step 4: Commit the governance checkpoint**

```bash
git add AGENTS.md docs/superpowers/plans/notes/agent-execution-governance.md docs/superpowers/plans/notes/publish-gates-checklist.md
git commit -m "docs: add governance and publish gates for agent execution"
```

### Task 8: Run the Full Stabilization Verification Matrix

**Files:**
- Test: `tests/unit/prisma/migration-discipline.test.ts`
- Test: `tests/unit/financial-consistency/dashboard-refresh-regression.test.ts`
- Test: `tests/smoke/critical-financial-flows/dashboard-refresh-smoke.test.ts`
- Test: `tests/unit/categories/category-edit-page.test.tsx`
- Test: `tests/unit/prisma/seed-scenarios.test.ts`
- Modify: `docs/superpowers/reports/2026-04-02-stabilization-recovery-audit.md`

- [ ] **Step 1: Run the focused stabilization matrix**

Run:
```bash
yarn test tests/unit/prisma/migration-discipline.test.ts tests/unit/financial-consistency/dashboard-refresh-regression.test.ts tests/smoke/critical-financial-flows/dashboard-refresh-smoke.test.ts tests/unit/categories/category-edit-page.test.tsx tests/unit/prisma/seed-scenarios.test.ts
```

Expected:
- PASS

- [ ] **Step 2: Run the broader verification layer**

Run:
```bash
yarn test
yarn eslint .
yarn build
npx prisma migrate status
```

Expected:
- all commands succeed
- any non-blocking warning must be documented, not ignored silently

- [ ] **Step 3: Update the stabilization audit report with evidence**

Record:
- what was fixed
- what verification passed
- what residual risks remain

- [ ] **Step 4: Commit the final stabilization checkpoint**

```bash
git add docs/superpowers/reports/2026-04-02-stabilization-recovery-audit.md
git commit -m "docs: finalize stabilization recovery verification"
```

## Self-Review

### Spec coverage

This plan covers:
- production containment
- schema discipline
- dashboard freshness
- edit flow hardening
- rich seed
- governance and publish gates

No major requirement from the stabilization recovery spec is intentionally omitted.

### Placeholder scan

The plan intentionally avoids `TBD` and `TODO`. Where migration timestamps or concrete data values must be generated at execution time, the plan names the exact scope and expected content rather than leaving the implementation undefined.

### Type consistency

The plan consistently uses:
- `GoalContribution.kind`
- async `params` for dynamic pages
- route-level invalidation plus client refresh
- focused stabilization audit artifacts

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-02-myfinance-stabilization-recovery-program-implementation-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
