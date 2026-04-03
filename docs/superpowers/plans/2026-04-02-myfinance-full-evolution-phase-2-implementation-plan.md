# Full Evolution Phase 2: Operational Flows — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add quick action dialogs (settle, cancel, pay invoice) to transaction/transfer/invoice lists, and wire goal withdrawal to the new API.

**Architecture:** Client-side dialog components using existing Radix UI Dialog primitives. Each dialog makes a fetch call to the corresponding Phase 1 API route, then calls `router.refresh()` to update the list.

**Tech Stack:** React 19, Radix UI Dialog, TailwindCSS, Next.js App Router

---

### Task 1: SettleTransactionDialog Component

**Files:**
- Create: `app/components/transactions/SettleTransactionDialog.tsx`
- Create: `tests/unit/transactions/settle-transaction-dialog.test.tsx`

Client component dialog that collects accountId + paidAt, calls PATCH `/api/transactions/[id]/settle`.

Props: `{ transactionId: number; accounts: { id: number; name: string }[]; trigger: React.ReactNode; onSuccess?: () => void }`

Fields: account select (by name), date input (default today). Submit calls the API, shows error or calls onSuccess.

---

### Task 2: CancelConfirmDialog Component

**Files:**
- Create: `app/components/shared/CancelConfirmDialog.tsx`
- Create: `tests/unit/shared/cancel-confirm-dialog.test.tsx`

Generic confirmation dialog for cancel operations. Reusable for transactions and transfers.

Props: `{ entityType: 'transaction' | 'transfer'; entityId: number; entityDescription: string; trigger: React.ReactNode; onSuccess?: () => void }`

Calls PATCH `/api/transactions/[id]/cancel` or `/api/transfers/[id]/cancel` based on entityType. Shows confirmation message, loading state, error handling.

---

### Task 3: Quick Actions in TransactionsList

**Files:**
- Modify: `app/components/transactions/TransactionsList.tsx`
- Modify: `app/dashboard/transactions/page.tsx` (pass accounts to list)
- Create: `tests/unit/transactions/transactions-list-actions.test.tsx`

Add SettleTransactionDialog and CancelConfirmDialog triggers to each row:
- "Liquidar" visible when status is PLANNED or PENDING (not credit card transactions)
- "Cancelar" visible when status is not CANCELED
- Replace current "Informar pagamento" navigation with SettleTransactionDialog
- Pass accounts from server to TransactionsList as prop

---

### Task 4: Quick Actions in TransfersList + SettleTransferDialog

**Files:**
- Create: `app/components/transfers/SettleTransferDialog.tsx`
- Modify: `app/components/transfers/TransfersList.tsx`
- Create: `tests/unit/transfers/transfer-list-actions.test.tsx`

SettleTransferDialog: collects paidAt only (no account needed), calls PATCH `/api/transfers/[id]/settle`.

Add to TransfersList rows:
- "Liquidar" when PLANNED or PENDING
- "Cancelar" when not CANCELED (uses CancelConfirmDialog with entityType='transfer')

---

### Task 5: PayInvoiceDialog + Invoice Quick Action

**Files:**
- Create: `app/components/invoices/PayInvoiceDialog.tsx`
- Modify: `app/components/invoices/InvoiceDetails.tsx`
- Create: `tests/unit/invoices/pay-invoice-dialog.test.tsx`

PayInvoiceDialog: collects accountId + categoryId + paidAt, calls POST `/api/invoices/[id]/pay`.

Props: `{ invoiceId: number; accounts: { id: number; name: string }[]; categories: { id: number; name: string }[]; trigger: React.ReactNode; onSuccess?: () => void }`

Add "Pagar Fatura" button to InvoiceDetails when status is OPEN.

---

### Task 6: Wire Goal Withdrawal to New API

**Files:**
- Modify: `app/components/goals/GoalMovementForm.tsx`
- Create: `tests/unit/goals/goal-movement-form-withdraw.test.tsx`

Currently GoalMovementForm sends ALL actions (contribute, withdraw, adjust) to `/api/goals/[id]/contributions`. For withdraw action, change to call `/api/goals/[id]/withdraw` instead.

The withdraw payload is simpler: `{ amount, transferId? }`.

---

### Task 7: Phase 2 Verification

- [ ] Run `yarn test` — all pass
- [ ] Run `yarn lint` — 0 errors
- [ ] Run `yarn build` — success
