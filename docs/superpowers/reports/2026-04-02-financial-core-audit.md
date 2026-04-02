# Financial Core Audit

Date: 2026-04-02

## Command Sources

- `rg -n "createTransaction|updateTransaction|settleTransaction|cancelTransaction|createTransfer|updateTransfer|settleTransfer|payInvoice|recordGoalContribution|recordGoalWithdrawal" app tests/unit -g '!node_modules'`
- `sed -n '1,260p' app/modules/transactions/service.ts`
- `sed -n '1,260p' app/modules/transfers/service.ts`
- `sed -n '1,260p' app/modules/invoices/service.ts`
- `sed -n '1,260p' app/modules/goals/service.ts`
- `sed -n '1,260p' app/services/dashboardService.ts`

## Current Side Effects

- `app/modules/transactions/service.ts`
  - `createTransactionForUser` persists a transaction with PRD defaults such as `status: 'PLANNED'`, nullable account/card/invoice links, and `fixed: false` when omitted.
  - `updateTransactionByUser` first verifies ownership with `findFirst`, then updates the transaction by id.
  - The service exposes listing and counting helpers, but no settle/cancel command.
- `app/modules/transfers/service.ts`
  - `createTransferForUser` blocks same-account transfers, then persists a planned transfer with `paidAt: null`.
  - `updateTransferForUser` verifies ownership, re-checks distinct source/destination accounts, and persists requested field changes.
  - The service exposes list/create/update behavior, but no settle command.
- `app/modules/invoices/service.ts`
  - The module is read-only from a persistence perspective in its current form.
  - `listInvoicesByCard` reads invoices and includes credit card plus ordered transactions.
  - Helper functions calculate due dates, totals, and installment grouping only.
- `app/modules/goals/service.ts`
  - `createGoalForUser` and `updateGoalForUser` persist goal records with ownership checks on update.
  - `recordGoalContributionForUser` verifies ownership, then creates a contribution with `reflectFinancially` derived from the contribution mode and optional `transferId`.
  - No withdrawal command exists in this module.
- `app/services/dashboardService.ts`
  - This service is read-only and aggregates data for reporting.
  - It queries transactions, transfers, invoices, and accounts to produce summary, pending, category, account, invoice, and transfer snapshots.

## Current Gaps

- There is no canonical settlement/cancellation command for transactions in the inspected services.
- There is no canonical settlement command for transfers in the inspected services.
- There is no invoice payment command in the inspected services.
- There is no goal withdrawal command in the inspected services.
- The dashboard service reflects existing state, but it does not orchestrate or mutate financial state.

## Required Canonical Effects

The financial core should expose and/or support the following command effects as the canonical patrimonial surface:

- `createTransaction`
- `updateTransaction`
- `settleTransaction`
- `cancelTransaction`
- `createTransfer`
- `updateTransfer`
- `settleTransfer`
- `payInvoice`
- `recordGoalContribution`
- `recordGoalWithdrawal`

## Audit Summary

- Present in inspected services: `createTransaction`, `updateTransaction`, `createTransfer`, `updateTransfer`, `recordGoalContribution`.
- Missing in inspected services: `settleTransaction`, `cancelTransaction`, `settleTransfer`, `payInvoice`, `recordGoalWithdrawal`.
