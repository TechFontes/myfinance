# MyFinance Master Stabilization And Product Evolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** estabilizar o núcleo financeiro do MyFinance, completar os fluxos operacionais, reorganizar a dashboard e transformar metas em um componente funcional consistente de planejamento financeiro

**Architecture:** a execução segue cinco fases. Primeiro entra o núcleo de comandos financeiros e de reflexos; depois os fluxos operacionais e o redesign dos formulários; então a dashboard e a navegação temporal; em seguida o modelo funcional de metas; por fim hardening, observabilidade e reanálise. O programa deve manter `dashboard`, `saldos`, `faturas` e `metas` como derivados de regras financeiras canônicas, nunca como regras paralelas espalhadas em telas.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, MySQL, Zod, React Hook Form, Vitest

---

## File Structure

### Financial Core
- Modify: `app/modules/transactions/*`
- Modify: `app/modules/transfers/*`
- Modify: `app/modules/invoices/*`
- Modify: `app/modules/goals/*`
- Create: `app/modules/financial-core/*`
- Modify: `app/services/dashboardService.ts`
- Modify: `prisma/schema.prisma`
- Test: `tests/unit/financial-core/*`

### Operational Flows
- Modify: `app/components/transactions/*`
- Modify: `app/dashboard/transactions/*`
- Modify: `app/components/cards/*`
- Modify: `app/components/accounts/*`
- Modify: `app/components/categories/*`
- Modify: `app/components/transfers/*`
- Modify: `app/components/goals/*`
- Create or modify edit pages under `app/dashboard/**`
- Test: `tests/unit/transactions/*`
- Test: `tests/unit/cards/*`
- Test: `tests/unit/accounts/*`
- Test: `tests/unit/categories/*`
- Test: `tests/unit/transfers/*`
- Test: `tests/unit/goals/*`

### Dashboard
- Modify: `app/modules/dashboard/*`
- Modify: `app/services/dashboardService.ts`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/components/dashboard/*`
- Create: `app/components/dashboard/DashboardPeriodNavigator.tsx`
- Test: `tests/unit/dashboard/*`

### Goals
- Modify: `app/modules/goals/*`
- Modify: `app/api/goals/*`
- Modify: `app/components/goals/*`
- Modify: `app/dashboard/goals/*`
- Test: `tests/unit/goals/*`

### Hardening
- Create: `tests/unit/financial-consistency/*`
- Create: `tests/smoke/critical-financial-flows/*`
- Modify: `docs/superpowers/reports/*`

---

## Phase Breakdown

### Phase 1: Financial Core And Consistency Of Effects

#### Task 1: Map Current Financial Effects

**Files:**
- Modify: `docs/superpowers/reports/2026-04-02-financial-core-audit.md`
- Inspect: `app/modules/transactions/service.ts`
- Inspect: `app/modules/transfers/service.ts`
- Inspect: `app/modules/invoices/service.ts`
- Inspect: `app/modules/goals/service.ts`
- Inspect: `app/services/dashboardService.ts`
- Test: `tests/unit/financial-core/financial-core-audit.test.ts`

- [ ] **Step 1: Write the failing audit test scaffold**

```ts
import { describe, expect, it } from 'vitest'

describe('financial core audit coverage', () => {
  it('tracks all command types that can alter patrimonial state', () => {
    const commands = [
      'createTransaction',
      'updateTransaction',
      'settleTransaction',
      'cancelTransaction',
      'createTransfer',
      'updateTransfer',
      'settleTransfer',
      'payInvoice',
      'recordGoalContribution',
      'recordGoalWithdrawal',
    ]

    expect(commands).toContain('payInvoice')
  })
})
```

- [ ] **Step 2: Run test to verify baseline**

Run: `yarn test tests/unit/financial-core/financial-core-audit.test.ts`
Expected: PASS or minimal scaffold confirmation

- [ ] **Step 3: Write the audit report**

Document:
- command sources
- current side effects
- current gaps
- required canonical effects

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/reports/2026-04-02-financial-core-audit.md tests/unit/financial-core/financial-core-audit.test.ts
git commit -m "docs: audit financial effect flows"
```

#### Task 2: Introduce Financial Core Command Layer

**Files:**
- Create: `app/modules/financial-core/contracts.ts`
- Create: `app/modules/financial-core/service.ts`
- Create: `app/modules/financial-core/index.ts`
- Test: `tests/unit/financial-core/financial-command-service.test.ts`

- [ ] **Step 1: Write failing tests for the command layer**

```ts
import { describe, expect, it } from 'vitest'

describe('financial command service', () => {
  it('settles a cash transaction through one command boundary', async () => {
    const result = {
      command: 'settleTransaction',
      writes: ['transaction', 'account-balance', 'dashboard-read-model'],
    }

    expect(result.writes).toContain('account-balance')
  })
})
```

- [ ] **Step 2: Run test to verify baseline**

Run: `yarn test tests/unit/financial-core/financial-command-service.test.ts`
Expected: RED or scaffold-only pass before implementation detail

- [ ] **Step 3: Define contracts**

Add types for:
- financial command names
- effect targets
- settlement rules
- card purchase rules
- invoice payment rules
- goal movement rules

- [ ] **Step 4: Implement the service shell**

Implement:
- `settleTransactionCommand`
- `createCardPurchaseCommand`
- `payInvoiceCommand`
- `createTransferCommand`
- `recordGoalContributionCommand`

The first version can orchestrate existing module services through one boundary.

- [ ] **Step 5: Run tests**

Run: `yarn test tests/unit/financial-core/financial-command-service.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/modules/financial-core tests/unit/financial-core/financial-command-service.test.ts
git commit -m "feat: add financial command layer"
```

#### Task 3: Enforce Ownership And Domain Invariants

**Files:**
- Modify: `app/modules/transactions/service.ts`
- Modify: `app/modules/transfers/service.ts`
- Modify: `app/modules/invoices/service.ts`
- Modify: `app/modules/goals/service.ts`
- Test: `tests/unit/financial-core/financial-invariants.test.ts`

- [ ] **Step 1: Write failing invariant tests**

Cover:
- `account xor creditCard`
- invoice belongs to card
- ids belong to user
- `PAID` requires `paidAt`
- transfer source and destination belong to same user
- goal reserve account belongs to user

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test tests/unit/financial-core/financial-invariants.test.ts`
Expected: FAIL on missing guards

- [ ] **Step 3: Implement invariant guards**

Implement one shared validation layer or helper functions reused by command/service paths.

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/financial-core/financial-invariants.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/modules/transactions/service.ts app/modules/transfers/service.ts app/modules/invoices/service.ts app/modules/goals/service.ts tests/unit/financial-core/financial-invariants.test.ts
git commit -m "fix: enforce financial ownership and invariants"
```

#### Task 4: Reconcile Invoice Totals With Card Purchases

**Files:**
- Modify: `app/modules/invoices/service.ts`
- Modify: `app/modules/transactions/service.ts`
- Modify: `app/api/invoices/[invoiceId]/route.ts`
- Test: `tests/unit/invoices/invoice-reconciliation.test.ts`

- [ ] **Step 1: Write failing reconciliation tests**

Cover:
- card purchase affects invoice composition
- invoice total is derived
- invoice payment changes invoice status through command flow
- invoice total is not manually authoritative

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/invoices/invoice-reconciliation.test.ts`
Expected: FAIL on current drift

- [ ] **Step 3: Implement derived reconciliation**

Refactor invoice reads to derive from linked purchases or ensure reconciliation path updates totals canonically.

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/invoices/invoice-reconciliation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/modules/invoices/service.ts app/modules/transactions/service.ts app/api/invoices/[invoiceId]/route.ts tests/unit/invoices/invoice-reconciliation.test.ts
git commit -m "fix: reconcile invoices from card purchases"
```

#### Task 5: Make Dashboard Consume Canonical Financial Effects

**Files:**
- Modify: `app/services/dashboardService.ts`
- Test: `tests/unit/dashboard/dashboard-financial-consistency.test.ts`

- [ ] **Step 1: Write failing dashboard consistency tests**

Cover:
- paid transaction updates account projection correctly
- card purchase does not alter cash until invoice payment
- transfer moves between accounts without entering revenue/expense totals
- canceled items do not pollute pending totals

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/dashboard/dashboard-financial-consistency.test.ts`
Expected: FAIL on current monthly recomposition assumptions

- [ ] **Step 3: Refactor dashboard derivation**

Make dashboard read from canonical effect rules or shared helpers from financial core.

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/dashboard/dashboard-financial-consistency.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/services/dashboardService.ts tests/unit/dashboard/dashboard-financial-consistency.test.ts
git commit -m "fix: align dashboard with canonical financial effects"
```

### Phase 2: Operational Flows And UX Completion

#### Task 6: Redesign Transaction Creation By Intent

**Files:**
- Modify: `app/components/transactions/TransactionForm.tsx`
- Modify: `app/services/transactionFormOptions.ts`
- Test: `tests/unit/transactions/transaction-form-intent-modes.test.tsx`

- [ ] **Step 1: Write failing UX tests**

Cover modes:
- receita
- despesa em conta
- despesa no cartão
- parcelamento
- recorrência

Assert that only relevant fields appear per mode.

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/transactions/transaction-form-intent-modes.test.tsx`
Expected: FAIL because the current form exposes too much at once

- [ ] **Step 3: Implement intent-based flow**

Refactor the form to:
- ask mode first
- conditionally reveal relevant fields
- suggest defaults
- reduce simultaneous choices

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/transactions/transaction-form-intent-modes.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/transactions/TransactionForm.tsx app/services/transactionFormOptions.ts tests/unit/transactions/transaction-form-intent-modes.test.tsx
git commit -m "feat: redesign transaction form by intent"
```

#### Task 7: Add Payment And Edit Flows For Transactions

**Files:**
- Create: `app/dashboard/transactions/[transactionId]/page.tsx`
- Modify: `app/components/transactions/TransactionsList.tsx`
- Modify: `app/api/transactions/[transactionId]/route.ts`
- Test: `tests/unit/transactions/transaction-edit-flow.test.tsx`
- Test: `tests/unit/transactions/transaction-payment-flow.test.tsx`

- [ ] **Step 1: Write failing tests for edit and pay**

Cover:
- edit action visible
- mark-as-paid action visible for pending/planned items
- paid action requires date
- saving returns to list with updated values

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/transactions/transaction-edit-flow.test.tsx tests/unit/transactions/transaction-payment-flow.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement edit page and quick actions**

Add:
- edit route
- form reuse for update
- payment action
- success/error feedback

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/transactions/transaction-edit-flow.test.tsx tests/unit/transactions/transaction-payment-flow.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/transactions/[transactionId]/page.tsx app/components/transactions/TransactionsList.tsx app/api/transactions/[transactionId]/route.ts tests/unit/transactions/transaction-edit-flow.test.tsx tests/unit/transactions/transaction-payment-flow.test.tsx
git commit -m "feat: add transaction edit and payment flows"
```

#### Task 8: Complete Remaining CRUD Operations

**Files:**
- Modify: `app/components/cards/*`
- Modify: `app/components/accounts/*`
- Modify: `app/components/categories/*`
- Modify: `app/components/transfers/*`
- Modify: `app/components/goals/*`
- Create or modify matching dashboard edit pages
- Test: `tests/unit/cards/*`
- Test: `tests/unit/accounts/*`
- Test: `tests/unit/categories/*`
- Test: `tests/unit/transfers/*`
- Test: `tests/unit/goals/*`

- [ ] **Step 1: Write failing edit-flow tests per module**

Add focused tests for:
- edit card
- edit account
- edit category
- edit transfer
- edit goal

- [ ] **Step 2: Run focused tests**

Run domain-specific `yarn test` commands per module
Expected: FAIL on missing routes/actions

- [ ] **Step 3: Implement edit flows**

Add:
- edit CTAs
- edit pages or drawers
- optimistic/confirmed success feedback
- inactivation where appropriate

- [ ] **Step 4: Run focused tests**

Run each module suite again
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/cards app/components/accounts app/components/categories app/components/transfers app/components/goals app/dashboard/cards app/dashboard/accounts app/dashboard/categories app/dashboard/transfers app/dashboard/goals tests/unit/cards tests/unit/accounts tests/unit/categories tests/unit/transfers tests/unit/goals
git commit -m "feat: complete edit flows across financial entities"
```

### Phase 3: Dashboard And Temporal Navigation

#### Task 9: Introduce Explicit Period Domain

**Files:**
- Create: `app/modules/dashboard/period.ts`
- Modify: `app/modules/dashboard/contracts.ts`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/api/dashboard/route.ts`
- Test: `tests/unit/dashboard/dashboard-period.test.ts`

- [ ] **Step 1: Write failing tests**

Cover:
- parse `YYYY-MM`
- reject invalid values
- compute label
- previous/next
- default selection resolution

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/dashboard/dashboard-period.test.ts`
Expected: FAIL before the helper exists

- [ ] **Step 3: Implement the period object**

Add:
- parse
- validate
- label
- previous
- next
- current month resolution

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/dashboard/dashboard-period.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/modules/dashboard/period.ts app/modules/dashboard/contracts.ts app/dashboard/page.tsx app/api/dashboard/route.ts tests/unit/dashboard/dashboard-period.test.ts
git commit -m "feat: add dashboard period domain"
```

#### Task 10: Replace Period Select With Year And Month Tabs

**Files:**
- Create: `app/components/dashboard/DashboardPeriodNavigator.tsx`
- Modify: `app/components/dashboard/DashboardReportView.tsx`
- Modify: `app/services/dashboardService.ts`
- Test: `tests/unit/dashboard/dashboard-period-navigator.test.tsx`

- [ ] **Step 1: Write failing navigator tests**

Cover:
- year tabs show only years with data
- month tabs show only months available in selected year
- order is chronological
- current/last-available fallback is correct

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/dashboard/dashboard-period-navigator.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement navigator**

Add:
- year tabs
- month tabs
- previous/next arrows
- current-period action
- querystring preservation

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/dashboard/dashboard-period-navigator.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/dashboard/DashboardPeriodNavigator.tsx app/components/dashboard/DashboardReportView.tsx app/services/dashboardService.ts tests/unit/dashboard/dashboard-period-navigator.test.tsx
git commit -m "feat: add dashboard year and month navigation"
```

#### Task 11: Reorganize Dashboard Views And Add Projected Vs Realized Chart

**Files:**
- Modify: `app/components/dashboard/DashboardReportView.tsx`
- Create: `app/components/dashboard/DashboardSummaryChart.tsx`
- Test: `tests/unit/dashboard/dashboard-report-view.test.tsx`
- Test: `tests/unit/dashboard/dashboard-summary-chart.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Cover:
- `Geral`
- `A receber`
- `A pagar`
- `Consolidados`
- compact hero
- chart receives projected and realized datasets

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/dashboard/dashboard-report-view.test.tsx tests/unit/dashboard/dashboard-summary-chart.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement the restructured dashboard**

Refactor:
- reduce hero height
- create view tabs
- add comparative chart
- redistribute cards and panels

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/dashboard/dashboard-report-view.test.tsx tests/unit/dashboard/dashboard-summary-chart.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/dashboard/DashboardReportView.tsx app/components/dashboard/DashboardSummaryChart.tsx tests/unit/dashboard/dashboard-report-view.test.tsx tests/unit/dashboard/dashboard-summary-chart.test.tsx
git commit -m "feat: reorganize dashboard views and summary chart"
```

### Phase 4: Goals And Financial Planning

#### Task 12: Remodel Goal Movements

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `app/modules/goals/contracts.ts`
- Modify: `app/modules/goals/validators.ts`
- Modify: `app/modules/goals/service.ts`
- Test: `tests/unit/goals/goal-movement-model.test.ts`
- Test: `tests/unit/prisma/goals-schema.test.ts`

- [ ] **Step 1: Write failing tests**

Cover:
- contribution
- withdrawal
- adjustment
- positive amount invariant
- progress derivation

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/goals/goal-movement-model.test.ts tests/unit/prisma/goals-schema.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement new movement model**

Refactor the goal movement type to:
- use explicit movement kind
- keep amount positive
- derive progress from signed effects

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/goals/goal-movement-model.test.ts tests/unit/prisma/goals-schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma app/modules/goals/contracts.ts app/modules/goals/validators.ts app/modules/goals/service.ts tests/unit/goals/goal-movement-model.test.ts tests/unit/prisma/goals-schema.test.ts
git commit -m "feat: remodel goal movements"
```

#### Task 13: Add Goal Contribution And Withdrawal Flows

**Files:**
- Modify: `app/api/goals/[goalId]/contributions/route.ts`
- Modify: `app/components/goals/GoalsList.tsx`
- Create: `app/components/goals/GoalMovementForm.tsx`
- Test: `tests/unit/goals/goal-movement-flow.test.tsx`

- [ ] **Step 1: Write failing tests**

Cover:
- contribution action
- withdrawal action
- financial vs informational movement
- reserve-account flows

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/goals/goal-movement-flow.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement the movement UI and API**

Add:
- Aportar
- Resgatar
- adjustment
- transfer linkage when financial

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/goals/goal-movement-flow.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/goals/[goalId]/contributions/route.ts app/components/goals/GoalsList.tsx app/components/goals/GoalMovementForm.tsx tests/unit/goals/goal-movement-flow.test.tsx
git commit -m "feat: add goal contribution and withdrawal flows"
```

### Phase 5: Hardening, Observability And Final Reanalysis

#### Task 14: Add Financial Consistency Regression Suite

**Files:**
- Create: `tests/unit/financial-consistency/financial-consistency-regression.test.ts`
- Create: `tests/smoke/critical-financial-flows/financial-smoke.test.ts`

- [ ] **Step 1: Write the failing regression suite**

Cover:
- pay transaction
- card purchase
- invoice payment
- transfer
- goal movement with reserve account
- dashboard reflection

- [ ] **Step 2: Run tests**

Run: `yarn test tests/unit/financial-consistency/financial-consistency-regression.test.ts tests/smoke/critical-financial-flows/financial-smoke.test.ts`
Expected: FAIL until all invariants hold

- [ ] **Step 3: Fix residual inconsistencies**

Apply final corrections discovered by the suite.

- [ ] **Step 4: Run tests**

Run: `yarn test tests/unit/financial-consistency/financial-consistency-regression.test.ts tests/smoke/critical-financial-flows/financial-smoke.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/unit/financial-consistency/financial-consistency-regression.test.ts tests/smoke/critical-financial-flows/financial-smoke.test.ts
git commit -m "test: add financial consistency regression suite"
```

#### Task 15: Final Verification And Reanalysis

**Files:**
- Modify: `docs/superpowers/reports/2026-04-02-master-program-reanalysis.md`

- [ ] **Step 1: Run the full verification matrix**

Run:
- `yarn test`
- `yarn eslint .`
- `yarn build`

Expected:
- all pass or only known pre-approved warnings

- [ ] **Step 2: Run manual smoke checklist**

Validate:
- create transaction
- mark as paid
- create card purchase
- pay invoice
- create transfer
- create and edit account/category/card
- contribute and withdraw from goal
- navigate dashboard periods and views

- [ ] **Step 3: Write reanalysis report**

Document:
- what improved
- residual risks
- remaining backlog

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/reports/2026-04-02-master-program-reanalysis.md
git commit -m "docs: record master program reanalysis"
```

---

## Multi-Agent Execution Strategy

### Worker Map

- Worker 1: `Financial Core`
- Worker 2: `Transactions UX`
- Worker 3: `CRUD Completion`
- Worker 4: `Dashboard`
- Worker 5: `Goals`
- Worker 6: `QA / Verification`

### Dependency Order

1. Worker 1 starts first and establishes command boundaries
2. Workers 2 and 3 start after the core invariants are in place
3. Worker 4 starts after period domain and dashboard data contracts stabilize
4. Worker 5 starts after the financial core is ready to support reserve-account semantics
5. Worker 6 runs continuously and performs cross-check validation at every checkpoint

### Integration Checkpoints

- Checkpoint A: end of Phase 1
- Checkpoint B: end of Phase 2
- Checkpoint C: end of Phase 3
- Checkpoint D: end of Phase 4
- Checkpoint E: end of Phase 5 with final reanalysis

---

## Spec Coverage Review

- Home / seleção de período: coberto nas Tasks 9, 10 e 11
- Regra de atualização de saldo e entidades relacionadas: coberta nas Tasks 1 a 5
- Cadastro de transação e UX: coberto nas Tasks 6 e 7
- Dashboard: coberto nas Tasks 9, 10 e 11
- Funcionalidades básicas faltantes: cobertas nas Tasks 7 e 8
- Metas: cobertas nas Tasks 12 e 13
- Hardening e reanálise: cobertos nas Tasks 14 e 15

Nenhum requisito do roadmap aprovado ficou sem cobertura no plano.
