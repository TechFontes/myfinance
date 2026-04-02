# MyFinance Stabilization Recovery Program

Date: 2026-04-02

## Context

The current MyFinance codebase has advanced substantially in UI, financial flows, dashboard reporting, and product surface area. However, recent production validation exposed a critical mismatch between what the code claims to support and what the deployed system reliably executes.

The most important failures observed are:

- production schema drift:
  - code now depends on `GoalContribution.kind`
  - deploy target database does not have that column
- stale reporting after mutations:
  - creating or paying transactions does not consistently reflect in the dashboard
- edit flow mismatch:
  - category edit page can report `Categoria não encontrada` for an existing record
- insufficient publish confidence:
  - large feature waves were shipped with green local tests, but without enough cross-domain verification, migration enforcement, or runtime-like route coverage

This program is not a feature roadmap. It is a stabilization and recovery program intended to make the product trustworthy to evolve.

## Problem Statement

MyFinance currently suffers from four structural problems:

1. database and code are not governed together strongly enough
2. financial mutations do not enforce a single canonical post-mutation reconciliation strategy
3. tests prove many local contracts but not enough real user capabilities
4. agent execution and publish gates are not strong enough to prevent regressions from shipping

As a result, the system creates anxiety during implementation:

- a feature may appear complete in local tests but fail in production
- an edit flow may render, but the runtime contract may differ from the mocked test setup
- a schema change may pass code review while still lacking a corresponding migration path
- a dashboard may look correct while reading stale or partially refreshed data

## Program Goals

This program must deliver the following outcomes:

1. production-safe schema discipline
2. reliable post-mutation dashboard consistency
3. working edit and action flows for core financial entities
4. richer seeded data for realistic validation and demos
5. an auditable execution model for future multi-agent work

## Non-Goals

This program does not attempt to:

- redesign the full visual language again
- rewrite the application into a full ledger or event store
- replace the dashboard with a persisted reporting system in this phase
- introduce advanced budgeting models beyond stabilizing current concepts

## Design Principles

### 1. Database Reality Over Schema Intention

`schema.prisma` is not enough. A feature is not considered supported until:

- the schema defines it
- a migration exists for it
- the migration can be applied in deployment environments
- the runtime code reads and writes it successfully

### 2. Capabilities Over Screens

The system must be reasoned about as user capabilities, not component presence.

Examples:

- “mark transaction as paid”
- “edit category”
- “contribute to goal with reserve transfer”
- “open dashboard and see the latest financial state”

Each capability must be verifiable across domain, route, UI, and reporting impact.

### 3. Mutation Then Reconciliation

Every financial mutation must have an explicit reconciliation story:

- what was persisted
- which read models are now stale
- how those reads are refreshed or recomputed
- what invariants must remain true afterward

### 4. Runtime-Like Tests

Tests must stop overfitting to mocked assumptions that differ from runtime:

- route params must match actual Next.js behavior
- schema tests must verify migration discipline, not only schema text
- cross-domain financial tests must validate effects after mutation
- smoke tests must exercise real route contracts

### 5. Publish Is a Gate, Not a Habit

No large wave is publishable unless:

- database state is compatible
- critical flows are validated
- reporting reflects recent writes
- test, lint, and build evidence exist
- remaining risk is explicitly documented

## Target Recovery Architecture

The recovery program keeps the current modular architecture but hardens five boundaries.

### A. Schema and Migration Boundary

Changes to Prisma models must be backed by:

- migration generation
- drift detection
- deployment verification

The program should add a workflow where schema evolution without migrations becomes a blocking condition.

### B. Financial Mutation Boundary

Financial mutations should continue to live in domain services, but each mutation must produce a predictable effect envelope:

- primary write
- related aggregate impact
- read invalidation or refresh trigger

The goal is not to introduce a new architectural style. The goal is to make the current one deterministic.

### C. Dashboard Read Boundary

The dashboard remains a read model assembled from transactions, transfers, invoices, accounts, and goals. However, it must stop behaving as if refresh is incidental.

The period selection and reporting surface should remain server-driven, but mutation flows must force the relevant reads to refresh. The dashboard must become predictably fresh even if it is still computed on demand.

### D. Entity Edit Boundary

Edit pages must load records directly and safely under real runtime conventions.

They should not rely on brittle assumptions such as:

- synchronous route params when runtime provides async params
- list-then-filter behavior where direct fetch-by-id is safer
- mocked route inputs that differ from production

### E. Verification Boundary

The verification stack must be layered:

- domain invariants
- route integration
- UI flow behavior
- critical smoke coverage
- deploy/schema checks

No single layer is enough by itself.

## Program Structure

The stabilization recovery program is organized into five waves.

## Wave 0: Production Containment

### Objective

Stop the currently known production failures and restore trust in the most visible broken flows.

### Scope

- fix category edit route behavior
- reconcile goals schema drift around `GoalContribution.kind`
- verify deployed DB compatibility expectations
- verify dashboard freshness after transaction creation and payment

### Exit Criteria

- category edit page opens correctly for existing records
- goals page no longer breaks due to missing DB column
- a paid transaction is visible in dashboard reporting after the mutation path completes
- production deploy instructions explicitly include migration verification

## Wave 1: Schema Discipline and DB Parity

### Objective

Ensure no future schema-backed feature can ship without a real migration and deploy-compatible database state.

### Scope

- create migrations for all schema changes introduced since baseline
- add drift checks to the local verification workflow
- add schema-versus-migration test coverage
- document deploy expectations around Prisma

### Exit Criteria

- runtime schema matches database in target environments
- new schema features are migration-backed
- tests fail if schema evolves without migration support

## Wave 2: Financial Reconciliation and Dashboard Freshness

### Objective

Make financial mutations and dashboard reporting behave as a coherent system.

### Scope

- audit all mutation paths that affect dashboard reads
- define and implement explicit invalidation or refresh behavior
- strengthen cross-domain reconciliation tests
- verify transactions, transfers, invoices, and goal movements all update reporting consistently

### Exit Criteria

- creating, editing, paying, or canceling relevant financial entities refreshes the dashboard correctly
- tests prove post-mutation reporting updates
- the dashboard is no longer relying on incidental refresh behavior

## Wave 3: Edit and Action Flow Hardening

### Objective

Make the core operational flows behave reliably under real runtime conditions.

### Scope

- category edit
- account edit
- card edit
- goal edit
- transfer edit
- transaction edit and payment actions

### Exit Criteria

- every core entity has a working edit path
- route params and runtime expectations are tested realistically
- edit and action flows validate ownership and error handling

## Wave 4: Rich Seed and Validation Scenarios

### Objective

Provide realistic data for manual QA, smoke validation, product demos, and future regression testing.

### Scope

- replace the thin seed with a six-month coherent dataset
- cover all major modules with realistic relationships
- maintain idempotence

### Seed Dataset Requirements

The primary seeded user must have:

- at least 3 accounts
- nested categories for income and expense
- 6 months of transactions with:
  - paid
  - pending
  - planned
  - canceled
- at least 1 active credit card with:
  - open invoice
  - paid invoice
  - card purchases
  - installments
- transfers between accounts
- at least 2 goals with:
  - informational adjustment
  - reserve-backed contribution
  - reserve-backed withdrawal
- recurrence rules producing realistic future expectations

### Exit Criteria

- seed is idempotent
- seeded user can exercise all core modules without manual setup
- dashboard has enough temporal density for period navigation validation

## Wave 5: Governance and Publish Confidence

### Objective

Make future multi-agent execution auditable and less fragile.

### Scope

- define owner, integration, and verification roles
- define capability-level gates
- define publish checklist
- define minimal evidence standard for reports and merge claims

### Governance Model

Each capability must have:

- one owner agent
- one integration reviewer
- one verification reviewer

Each capability must pass:

1. design gate
2. red-test gate
3. integration gate
4. publish gate

## Testing Strategy

### Domain Tests

Must validate:

- settlement effects
- signed goal movement semantics
- invoice reconciliation
- balance derivation invariants

### Route Tests

Must validate:

- real request payloads
- realistic route params
- authorization and ownership
- not-found and invalid-id behavior

### UI Flow Tests

Must validate:

- create/edit/pay flows by user intent
- redirects and refresh behavior
- realistic form contracts

### Smoke Tests

Must validate:

- critical route-level financial flows
- dashboard reporting after mutation
- seeded-user capabilities

### Schema Discipline Tests

Must validate:

- migration presence for schema evolution
- deploy readiness around Prisma state

## Agent Coordination Model

The implementation must be executed with an explicit controller role and specialized workers.

### Controller

Owns:

- scope breakdown
- dependency order
- gate approval
- integration decisions

### Worker A: DB Parity

Owns:

- migrations
- drift detection
- schema discipline

### Worker B: Financial Core

Owns:

- mutation effects
- reconciliation
- dashboard freshness contracts

### Worker C: Operational Flows

Owns:

- edit pages
- action flows
- route/runtime alignment

### Worker D: Test and Audit

Owns:

- cross-domain test coverage
- smoke coverage
- verification hardening

### Worker E: Seed and Scenario Data

Owns:

- six-month dataset
- idempotence
- realism of scenario coverage

## Risks

### 1. Unknown Production Drift

The server database may differ from the local database already validated in development.

### 2. Overconfidence From Existing Green Tests

Many current tests are valid but too local. They should not be treated as proof of runtime correctness by themselves.

### 3. Dashboard Read Model Complexity

Even with refresh fixes, the dashboard is still an assembled read model. It can remain correct, but it requires deliberate coverage.

## Success Criteria

This program is successful when:

- the reported production failures are resolved
- schema-backed features do not ship without migrations
- dashboard reporting reliably reflects financial mutations
- core edit and action flows work under real runtime conditions
- seeded data supports realistic validation across all main modules
- future multi-agent work follows explicit gates and publish discipline

## Deliverables

The program must produce:

- one stabilization implementation plan
- migration discipline changes
- corrected runtime flows
- stronger regression and smoke coverage
- six-month seed dataset
- governance notes for future agent execution
