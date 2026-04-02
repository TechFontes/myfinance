# Master Program Reanalysis

Date: 2026-04-02

## Verification Matrix

- `yarn test`
- `yarn eslint .`
- `yarn build`
- `yarn test tests/unit/financial-consistency/financial-consistency-regression.test.ts tests/smoke/critical-financial-flows/financial-smoke.test.ts`

## What Improved

- Financial core boundaries now cover transaction settlement, card purchase, invoice payment, transfer creation, and goal movement semantics as explicit command results.
- Operational CRUD now includes edit flows for accounts, categories, cards, transfers, transactions, and goals, with payment-oriented transaction UX.
- Dashboard now uses an explicit period domain, year/month navigation, comparative summary chart, and view segmentation.
- Goals now support explicit contribution, withdrawal, and adjustment flows, including reserve-backed financial movements linked to transfers.
- Regression coverage now includes financial consistency and critical route-level smoke tests.

## Residual Risks

- Invoice payment remains operationally simplified: API and service mark the invoice as paid, but source-account selection and patrimonial settlement are not yet modeled end-to-end in the invoice route itself.
- Dashboard is still a read model assembled from source entities; it is more consistent now, but it is not yet backed by a dedicated persisted reporting snapshot.
- The product still relies on module-level orchestration rather than a full ledger or event-store architecture. This is acceptable for the current scope, but complex historical corrections may still be expensive.
- `baseline-browser-mapping` is outdated and emits warnings in lint and build; it does not block delivery, but it should be updated.

## Remaining Backlog

### High Priority

- Canonical invoice payment flow with source account, `paidAt`, and downstream account-balance effect persisted end-to-end.
- Stronger transaction settlement and cancellation command surface instead of status-only route updates.
- Manual browser smoke pass across the main financial flows after this batch is published.

### Medium Priority

- Persisted reporting or read-model strategy if dashboard complexity keeps growing.
- More explicit audit logging for high-impact financial actions.
- Expanded smoke coverage around recurrence generation and CSV import commit flows.

### Lower Priority

- Update `baseline-browser-mapping` dependency to remove build noise.
- Add more production-style health and observability checks around standalone deploy.
