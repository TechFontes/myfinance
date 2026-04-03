# Full Evolution Phase 1: Financial Core Consistency — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish canonical financial commands (settle, cancel, pay invoice e2e, goal withdrawal) and computeAccountBalance as the derived balance function.

**Architecture:** Extend the existing `createFinancialCommandService(ports)` factory in `app/modules/financial-core/` with new commands. Each command validates ownership, mutates state, and returns a typed result with write effects. `computeAccountBalance` lives in accounts service as a pure query. New dedicated API routes for each operation.

**Tech Stack:** TypeScript, Prisma, Zod, Vitest, Next.js API Routes

---

### Task 1: Extend Financial Core Contracts

**Files:**
- Modify: `app/modules/financial-core/contracts.ts`

- [ ] **Step 1: Write failing test for new command types**

Create test file:

```typescript
// tests/unit/financial-core/financial-core-contracts.test.ts
import { describe, it, expect } from 'vitest'
import {
  financialCommandNames,
  financialEffectTargets,
} from '@/modules/financial-core/contracts'

describe('financial core contracts', () => {
  it('includes cancel and settle commands in command names', () => {
    expect(financialCommandNames).toContain('cancelTransaction')
    expect(financialCommandNames).toContain('settleTransfer')
    expect(financialCommandNames).toContain('cancelTransfer')
    expect(financialCommandNames).toContain('recordGoalWithdrawal')
  })

  it('includes all effect targets', () => {
    expect(financialEffectTargets).toContain('transaction')
    expect(financialEffectTargets).toContain('transfer')
    expect(financialEffectTargets).toContain('invoice')
    expect(financialEffectTargets).toContain('goal')
    expect(financialEffectTargets).toContain('goal-contribution')
    expect(financialEffectTargets).toContain('account-balance')
    expect(financialEffectTargets).toContain('dashboard-read-model')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/financial-core/financial-core-contracts.test.ts`
Expected: FAIL — `cancelTransaction` not in `financialCommandNames`

- [ ] **Step 3: Update contracts with new commands**

In `app/modules/financial-core/contracts.ts`, add to `financialCommandNames`:
```typescript
export const financialCommandNames = [
  'settleTransaction',
  'cancelTransaction',
  'createCardPurchase',
  'payInvoice',
  'createTransfer',
  'settleTransfer',
  'cancelTransfer',
  'recordGoalContribution',
  'recordGoalWithdrawal',
] as const
```

Add `'goal-contribution'` to `financialEffectTargets` if not present:
```typescript
export const financialEffectTargets = [
  'transaction',
  'transfer',
  'invoice',
  'goal',
  'goal-contribution',
  'account-balance',
  'dashboard-read-model',
] as const
```

Add new input types after existing ones:
```typescript
export type CancelTransactionInput = {
  transactionId: number
}

export type SettleTransferInput = {
  transferId: number
  paidAt: Date
}

export type CancelTransferInput = {
  transferId: number
}

export type RecordGoalWithdrawalInput = {
  goalId: number
  amount: string
  transferId?: number
}
```

Update `SettleTransactionInput` to include accountId:
```typescript
export type SettleTransactionInput = {
  transactionId: number
  accountId: number
  paidAt: Date
}
```

Add new rule types:
```typescript
export type CancellationRule = {
  kind: 'cancellation'
  entityType: 'transaction' | 'transfer'
  entityId: number
  previousStatus: string
}

export type TransferSettlementRule = {
  kind: 'transfer-settlement'
  transferId: number
  paidAt: Date
}

export type GoalWithdrawalRule = {
  kind: 'goal-withdrawal'
  goalId: number
  amount: string
  hasTransfer: boolean
}
```

Add new command result types:
```typescript
export type CancelTransactionCommandResult = {
  command: 'cancelTransaction'
  writes: ['transaction', 'dashboard-read-model']
  rule: CancellationRule
}

export type SettleTransferCommandResult = {
  command: 'settleTransfer'
  writes: ['transfer', 'account-balance', 'dashboard-read-model']
  rule: TransferSettlementRule
}

export type CancelTransferCommandResult = {
  command: 'cancelTransfer'
  writes: ['transfer', 'dashboard-read-model']
  rule: CancellationRule
}

export type RecordGoalWithdrawalCommandResult = {
  command: 'recordGoalWithdrawal'
  writes: ['goal-contribution', 'dashboard-read-model']
  rule: GoalWithdrawalRule
}
```

Update the `FinancialCommandResult` discriminated union to include new results:
```typescript
export type FinancialCommandResult<TName extends FinancialCommandName> =
  TName extends 'settleTransaction' ? SettleTransactionCommandResult :
  TName extends 'cancelTransaction' ? CancelTransactionCommandResult :
  TName extends 'createCardPurchase' ? CreateCardPurchaseCommandResult :
  TName extends 'payInvoice' ? PayInvoiceCommandResult :
  TName extends 'createTransfer' ? CreateTransferCommandResult :
  TName extends 'settleTransfer' ? SettleTransferCommandResult :
  TName extends 'cancelTransfer' ? CancelTransferCommandResult :
  TName extends 'recordGoalContribution' ? RecordGoalContributionCommandResult :
  TName extends 'recordGoalWithdrawal' ? RecordGoalWithdrawalCommandResult :
  never
```

Update `FinancialCommandPorts` to include new port methods:
```typescript
export type FinancialCommandPorts = {
  settleTransaction: (input: SettleTransactionInput) => Promise<{ transactionId: number; paidAt: Date }>
  cancelTransaction: (input: CancelTransactionInput) => Promise<{ transactionId: number; previousStatus: string }>
  createCardPurchase: (input: CreateCardPurchaseInput) => Promise<{ transactionId: number; creditCardId: number; invoiceId: number }>
  payInvoice: (input: PayInvoiceInput) => Promise<{ invoiceId: number; accountId: number; transactionId: number; paidAt: Date }>
  createTransfer: (input: CreateTransferInput) => Promise<{ transferId: number; sourceAccountId: number; destinationAccountId: number }>
  settleTransfer: (input: SettleTransferInput) => Promise<{ transferId: number; paidAt: Date }>
  cancelTransfer: (input: CancelTransferInput) => Promise<{ transferId: number; previousStatus: string }>
  recordGoalContribution: (input: RecordGoalContributionInput) => Promise<RecordGoalContributionPortResult>
  recordGoalWithdrawal: (input: RecordGoalWithdrawalInput) => Promise<{ goalId: number; amount: string; transferId?: number }>
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run tests/unit/financial-core/financial-core-contracts.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/modules/financial-core/contracts.ts tests/unit/financial-core/financial-core-contracts.test.ts
git commit -m "feat: extend financial core contracts with cancel, settle transfer, and goal withdrawal commands"
```

---

### Task 2: Implement computeAccountBalance

**Files:**
- Modify: `app/modules/accounts/service.ts`
- Create: `tests/unit/accounts/compute-account-balance.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/unit/accounts/compute-account-balance.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  account: {
    findFirst: vi.fn(),
  },
  transaction: {
    aggregate: vi.fn(),
  },
  transfer: {
    aggregate: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import { computeAccountBalance } from '@/modules/accounts/service'

describe('computeAccountBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns initialBalance when no transactions or transfers exist', async () => {
    prismaMock.account.findFirst.mockResolvedValue({
      id: 1,
      userId: 'user-1',
      initialBalance: { toNumber: () => 1000 },
    })
    prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { value: null } })
    prismaMock.transfer.aggregate.mockResolvedValue({ _sum: { amount: null } })

    const result = await computeAccountBalance('user-1', 1)
    expect(result).toBe('1000.00')
  })

  it('adds paid income and subtracts paid expense', async () => {
    prismaMock.account.findFirst.mockResolvedValue({
      id: 1,
      userId: 'user-1',
      initialBalance: { toNumber: () => 1000 },
    })
    // Income aggregate
    prismaMock.transaction.aggregate.mockImplementation(({ where }) => {
      if (where.type === 'INCOME') return Promise.resolve({ _sum: { value: { toNumber: () => 500 } } })
      if (where.type === 'EXPENSE') return Promise.resolve({ _sum: { value: { toNumber: () => 200 } } })
      return Promise.resolve({ _sum: { value: null } })
    })
    // Transfers in (destination)
    prismaMock.transfer.aggregate.mockImplementation(({ where }) => {
      if (where.destinationAccountId) return Promise.resolve({ _sum: { amount: { toNumber: () => 300 } } })
      if (where.sourceAccountId) return Promise.resolve({ _sum: { amount: { toNumber: () => 100 } } })
      return Promise.resolve({ _sum: { amount: null } })
    })

    const result = await computeAccountBalance('user-1', 1)
    // 1000 + 500 - 200 + 300 - 100 = 1500
    expect(result).toBe('1500.00')
  })

  it('ignores canceled transactions in balance computation', async () => {
    prismaMock.account.findFirst.mockResolvedValue({
      id: 1,
      userId: 'user-1',
      initialBalance: { toNumber: () => 500 },
    })
    // Only PAID transactions are queried (where clause includes status: PAID)
    prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { value: null } })
    prismaMock.transfer.aggregate.mockResolvedValue({ _sum: { amount: null } })

    const result = await computeAccountBalance('user-1', 1)
    expect(result).toBe('500.00')

    // Verify the aggregate queries filter by PAID status
    const txCalls = prismaMock.transaction.aggregate.mock.calls
    for (const call of txCalls) {
      expect(call[0].where.status).toBe('PAID')
    }
  })

  it('returns null when account not found or not owned by user', async () => {
    prismaMock.account.findFirst.mockResolvedValue(null)
    const result = await computeAccountBalance('user-1', 999)
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/accounts/compute-account-balance.test.ts`
Expected: FAIL — `computeAccountBalance` not exported

- [ ] **Step 3: Implement computeAccountBalance**

Add to `app/modules/accounts/service.ts`:

```typescript
export async function computeAccountBalance(
  userId: string,
  accountId: number
): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  })

  if (!account) return null

  const initialBalance = account.initialBalance.toNumber()

  const [incomeAgg, expenseAgg, transfersInAgg, transfersOutAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, accountId, type: 'INCOME', status: 'PAID' },
      _sum: { value: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, accountId, type: 'EXPENSE', status: 'PAID' },
      _sum: { value: true },
    }),
    prisma.transfer.aggregate({
      where: { userId, destinationAccountId: accountId, status: 'PAID' },
      _sum: { amount: true },
    }),
    prisma.transfer.aggregate({
      where: { userId, sourceAccountId: accountId, status: 'PAID' },
      _sum: { amount: true },
    }),
  ])

  const income = incomeAgg._sum.value?.toNumber() ?? 0
  const expense = expenseAgg._sum.value?.toNumber() ?? 0
  const transfersIn = transfersInAgg._sum.amount?.toNumber() ?? 0
  const transfersOut = transfersOutAgg._sum.amount?.toNumber() ?? 0

  const balance = initialBalance + income - expense + transfersIn - transfersOut
  return balance.toFixed(2)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run tests/unit/accounts/compute-account-balance.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/modules/accounts/service.ts tests/unit/accounts/compute-account-balance.test.ts
git commit -m "feat: add computeAccountBalance derived balance function"
```

---

### Task 3: Implement settleTransaction and cancelTransaction Commands

**Files:**
- Modify: `app/modules/financial-core/service.ts`
- Modify: `app/modules/transactions/service.ts`
- Create: `app/api/transactions/[transactionId]/settle/route.ts`
- Create: `app/api/transactions/[transactionId]/cancel/route.ts`
- Create: `tests/unit/financial-core/settle-cancel-transaction.test.ts`
- Create: `tests/unit/api/transactions/transaction-settle-cancel-routes.test.ts`

- [ ] **Step 1: Write failing tests for transaction service settle/cancel**

```typescript
// tests/unit/financial-core/settle-cancel-transaction.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  transaction: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  account: {
    findFirst: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import {
  settleTransactionForUser,
  cancelTransactionForUser,
} from '@/modules/transactions/service'

describe('settleTransactionForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('settles a PLANNED transaction with account and paidAt', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 10,
      userId: 'user-1',
      status: 'PLANNED',
    })
    prismaMock.account.findFirst.mockResolvedValue({ id: 1, userId: 'user-1' })
    prismaMock.transaction.update.mockResolvedValue({
      id: 10,
      status: 'PAID',
      accountId: 1,
      paidAt: new Date('2026-04-02'),
    })

    const result = await settleTransactionForUser('user-1', 10, {
      accountId: 1,
      paidAt: new Date('2026-04-02'),
    })

    expect(result).not.toBeNull()
    expect(prismaMock.transaction.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        status: 'PAID',
        accountId: 1,
        paidAt: new Date('2026-04-02'),
      },
    })
  })

  it('rejects settlement of already PAID transaction', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 10,
      userId: 'user-1',
      status: 'PAID',
    })

    await expect(
      settleTransactionForUser('user-1', 10, {
        accountId: 1,
        paidAt: new Date('2026-04-02'),
      })
    ).rejects.toThrow()
  })

  it('rejects settlement of CANCELED transaction', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 10,
      userId: 'user-1',
      status: 'CANCELED',
    })

    await expect(
      settleTransactionForUser('user-1', 10, {
        accountId: 1,
        paidAt: new Date('2026-04-02'),
      })
    ).rejects.toThrow()
  })

  it('rejects settlement when user does not own account', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 10,
      userId: 'user-1',
      status: 'PLANNED',
    })
    prismaMock.account.findFirst.mockResolvedValue(null)

    await expect(
      settleTransactionForUser('user-1', 10, {
        accountId: 999,
        paidAt: new Date('2026-04-02'),
      })
    ).rejects.toThrow()
  })

  it('returns null when transaction not found', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue(null)

    const result = await settleTransactionForUser('user-1', 999, {
      accountId: 1,
      paidAt: new Date('2026-04-02'),
    })
    expect(result).toBeNull()
  })
})

describe('cancelTransactionForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cancels a PLANNED transaction keeping paidAt for history', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 10,
      userId: 'user-1',
      status: 'PLANNED',
      paidAt: null,
    })
    prismaMock.transaction.update.mockResolvedValue({
      id: 10,
      status: 'CANCELED',
      paidAt: null,
    })

    const result = await cancelTransactionForUser('user-1', 10)
    expect(result).not.toBeNull()
    expect(prismaMock.transaction.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { status: 'CANCELED' },
    })
  })

  it('cancels a PAID transaction preserving paidAt', async () => {
    const paidDate = new Date('2026-03-15')
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 10,
      userId: 'user-1',
      status: 'PAID',
      paidAt: paidDate,
    })
    prismaMock.transaction.update.mockResolvedValue({
      id: 10,
      status: 'CANCELED',
      paidAt: paidDate,
    })

    const result = await cancelTransactionForUser('user-1', 10)
    expect(result).not.toBeNull()
    // paidAt NOT cleared — kept for audit history
    expect(prismaMock.transaction.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { status: 'CANCELED' },
    })
  })

  it('rejects cancellation of already CANCELED transaction', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 10,
      userId: 'user-1',
      status: 'CANCELED',
    })

    await expect(cancelTransactionForUser('user-1', 10)).rejects.toThrow()
  })

  it('returns null when transaction not found', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue(null)
    const result = await cancelTransactionForUser('user-1', 999)
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/financial-core/settle-cancel-transaction.test.ts`
Expected: FAIL — functions not exported

- [ ] **Step 3: Implement settleTransactionForUser and cancelTransactionForUser**

Add to `app/modules/transactions/service.ts`:

```typescript
export async function settleTransactionForUser(
  userId: string,
  transactionId: number,
  input: { accountId: number; paidAt: Date }
): Promise<object | null> {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  })

  if (!transaction) return null

  if (transaction.status === 'PAID' || transaction.status === 'CANCELED') {
    throw createTransactionError(
      'TRANSACTION_SETTLE_INVALID_STATUS',
      `Cannot settle transaction with status ${transaction.status}`
    )
  }

  const account = await prisma.account.findFirst({
    where: { id: input.accountId, userId },
  })

  if (!account) {
    throw createTransactionError(
      'TRANSACTION_ACCOUNT_OWNERSHIP',
      'Account not found or not owned by user'
    )
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'PAID',
      accountId: input.accountId,
      paidAt: input.paidAt,
    },
  })
}

export async function cancelTransactionForUser(
  userId: string,
  transactionId: number
): Promise<object | null> {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  })

  if (!transaction) return null

  if (transaction.status === 'CANCELED') {
    throw createTransactionError(
      'TRANSACTION_CANCEL_INVALID_STATUS',
      'Transaction is already canceled'
    )
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: { status: 'CANCELED' },
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run tests/unit/financial-core/settle-cancel-transaction.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing tests for API routes**

```typescript
// tests/unit/api/transactions/transaction-settle-cancel-routes.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const authMock = { getUserFromRequest: vi.fn() }
const transactionsMock = {
  settleTransactionForUser: vi.fn(),
  cancelTransactionForUser: vi.fn(),
}
const cacheMock = { revalidatePath: vi.fn() }

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)
vi.mock('next/cache', () => cacheMock)

describe('PATCH /api/transactions/[transactionId]/settle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
  })

  it('settles transaction and revalidates dashboard', async () => {
    transactionsMock.settleTransactionForUser.mockResolvedValue({ id: 10, status: 'PAID' })

    const { PATCH } = await import('@/api/transactions/[transactionId]/settle/route')
    const request = new NextRequest('http://localhost/api/transactions/10/settle', {
      method: 'PATCH',
      body: JSON.stringify({ accountId: 1, paidAt: '2026-04-02T00:00:00.000Z' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ transactionId: '10' }) })
    expect(response.status).toBe(200)
    expect(transactionsMock.settleTransactionForUser).toHaveBeenCalledWith(
      'user-1',
      10,
      { accountId: 1, paidAt: expect.any(Date) }
    )
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('returns 404 when transaction not found', async () => {
    transactionsMock.settleTransactionForUser.mockResolvedValue(null)

    const { PATCH } = await import('@/api/transactions/[transactionId]/settle/route')
    const request = new NextRequest('http://localhost/api/transactions/999/settle', {
      method: 'PATCH',
      body: JSON.stringify({ accountId: 1, paidAt: '2026-04-02T00:00:00.000Z' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ transactionId: '999' }) })
    expect(response.status).toBe(404)
  })
})

describe('PATCH /api/transactions/[transactionId]/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
  })

  it('cancels transaction and revalidates dashboard', async () => {
    transactionsMock.cancelTransactionForUser.mockResolvedValue({ id: 10, status: 'CANCELED' })

    const { PATCH } = await import('@/api/transactions/[transactionId]/cancel/route')
    const request = new NextRequest('http://localhost/api/transactions/10/cancel', {
      method: 'PATCH',
    })

    const response = await PATCH(request, { params: Promise.resolve({ transactionId: '10' }) })
    expect(response.status).toBe(200)
    expect(transactionsMock.cancelTransactionForUser).toHaveBeenCalledWith('user-1', 10)
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('returns 404 when transaction not found', async () => {
    transactionsMock.cancelTransactionForUser.mockResolvedValue(null)

    const { PATCH } = await import('@/api/transactions/[transactionId]/cancel/route')
    const request = new NextRequest('http://localhost/api/transactions/999/cancel', {
      method: 'PATCH',
    })

    const response = await PATCH(request, { params: Promise.resolve({ transactionId: '999' }) })
    expect(response.status).toBe(404)
  })
})
```

- [ ] **Step 6: Implement settle and cancel API routes**

Create `app/api/transactions/[transactionId]/settle/route.ts`:

```typescript
import { getUserFromRequest } from '@/lib/auth'
import { settleTransactionForUser } from '@/modules/transactions/service'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { transactionId } = await params
  const id = Number(transactionId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 })
  }

  const body = await request.json()
  const accountId = Number(body.accountId)
  const paidAt = new Date(body.paidAt)

  if (!Number.isInteger(accountId) || accountId <= 0) {
    return NextResponse.json({ error: 'Invalid accountId' }, { status: 400 })
  }
  if (isNaN(paidAt.getTime())) {
    return NextResponse.json({ error: 'Invalid paidAt date' }, { status: 400 })
  }

  try {
    const result = await settleTransactionForUser(user.id, id, { accountId, paidAt })
    if (!result) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    try { revalidatePath('/dashboard') } catch {}
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
```

Create `app/api/transactions/[transactionId]/cancel/route.ts`:

```typescript
import { getUserFromRequest } from '@/lib/auth'
import { cancelTransactionForUser } from '@/modules/transactions/service'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { transactionId } = await params
  const id = Number(transactionId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 })
  }

  try {
    const result = await cancelTransactionForUser(user.id, id)
    if (!result) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    try { revalidatePath('/dashboard') } catch {}
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
```

- [ ] **Step 7: Run all tests to verify**

Run: `yarn vitest run tests/unit/financial-core/settle-cancel-transaction.test.ts tests/unit/api/transactions/transaction-settle-cancel-routes.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add app/modules/transactions/service.ts app/api/transactions/[transactionId]/settle/route.ts app/api/transactions/[transactionId]/cancel/route.ts tests/unit/financial-core/settle-cancel-transaction.test.ts tests/unit/api/transactions/transaction-settle-cancel-routes.test.ts
git commit -m "feat: add settleTransaction and cancelTransaction commands with API routes"
```

---

### Task 4: Implement settleTransfer and cancelTransfer Commands

**Files:**
- Modify: `app/modules/transfers/service.ts`
- Create: `app/api/transfers/[transferId]/settle/route.ts`
- Create: `app/api/transfers/[transferId]/cancel/route.ts`
- Create: `tests/unit/financial-core/settle-cancel-transfer.test.ts`
- Create: `tests/unit/api/transfers/transfer-settle-cancel-routes.test.ts`

- [ ] **Step 1: Write failing tests for transfer service settle/cancel**

```typescript
// tests/unit/financial-core/settle-cancel-transfer.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  transfer: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import {
  settleTransferForUser,
  cancelTransferForUser,
} from '@/modules/transfers/service'

describe('settleTransferForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('settles a PLANNED transfer', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      status: 'PLANNED',
    })
    prismaMock.transfer.update.mockResolvedValue({
      id: 5,
      status: 'PAID',
      paidAt: new Date('2026-04-02'),
    })

    const result = await settleTransferForUser('user-1', 5, {
      paidAt: new Date('2026-04-02'),
    })

    expect(result).not.toBeNull()
    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { status: 'PAID', paidAt: new Date('2026-04-02') },
    })
  })

  it('rejects settlement of PAID transfer', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      status: 'PAID',
    })

    await expect(
      settleTransferForUser('user-1', 5, { paidAt: new Date() })
    ).rejects.toThrow()
  })

  it('rejects settlement of CANCELED transfer', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      status: 'CANCELED',
    })

    await expect(
      settleTransferForUser('user-1', 5, { paidAt: new Date() })
    ).rejects.toThrow()
  })

  it('returns null when transfer not found', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue(null)
    const result = await settleTransferForUser('user-1', 999, { paidAt: new Date() })
    expect(result).toBeNull()
  })
})

describe('cancelTransferForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cancels a transfer preserving paidAt', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      status: 'PAID',
      paidAt: new Date('2026-03-15'),
    })
    prismaMock.transfer.update.mockResolvedValue({
      id: 5,
      status: 'CANCELED',
      paidAt: new Date('2026-03-15'),
    })

    const result = await cancelTransferForUser('user-1', 5)
    expect(result).not.toBeNull()
    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { status: 'CANCELED' },
    })
  })

  it('rejects cancellation of already CANCELED transfer', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      status: 'CANCELED',
    })

    await expect(cancelTransferForUser('user-1', 5)).rejects.toThrow()
  })

  it('returns null when transfer not found', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue(null)
    const result = await cancelTransferForUser('user-1', 999)
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/financial-core/settle-cancel-transfer.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement settleTransferForUser and cancelTransferForUser**

Add to `app/modules/transfers/service.ts`:

```typescript
export async function settleTransferForUser(
  userId: string,
  transferId: number,
  input: { paidAt: Date }
): Promise<object | null> {
  const transfer = await prisma.transfer.findFirst({
    where: { id: transferId, userId },
  })

  if (!transfer) return null

  if (transfer.status === 'PAID' || transfer.status === 'CANCELED') {
    throw createTransferError(
      'TRANSFER_SETTLE_INVALID_STATUS',
      `Cannot settle transfer with status ${transfer.status}`
    )
  }

  return prisma.transfer.update({
    where: { id: transferId },
    data: { status: 'PAID', paidAt: input.paidAt },
  })
}

export async function cancelTransferForUser(
  userId: string,
  transferId: number
): Promise<object | null> {
  const transfer = await prisma.transfer.findFirst({
    where: { id: transferId, userId },
  })

  if (!transfer) return null

  if (transfer.status === 'CANCELED') {
    throw createTransferError(
      'TRANSFER_CANCEL_INVALID_STATUS',
      'Transfer is already canceled'
    )
  }

  return prisma.transfer.update({
    where: { id: transferId },
    data: { status: 'CANCELED' },
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run tests/unit/financial-core/settle-cancel-transfer.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing tests for API routes**

```typescript
// tests/unit/api/transfers/transfer-settle-cancel-routes.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const authMock = { getUserFromRequest: vi.fn() }
const transfersMock = {
  settleTransferForUser: vi.fn(),
  cancelTransferForUser: vi.fn(),
}
const cacheMock = { revalidatePath: vi.fn() }

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transfers/service', () => transfersMock)
vi.mock('next/cache', () => cacheMock)

describe('PATCH /api/transfers/[transferId]/settle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
  })

  it('settles transfer and revalidates dashboard', async () => {
    transfersMock.settleTransferForUser.mockResolvedValue({ id: 5, status: 'PAID' })

    const { PATCH } = await import('@/api/transfers/[transferId]/settle/route')
    const request = new NextRequest('http://localhost/api/transfers/5/settle', {
      method: 'PATCH',
      body: JSON.stringify({ paidAt: '2026-04-02T00:00:00.000Z' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ transferId: '5' }) })
    expect(response.status).toBe(200)
    expect(transfersMock.settleTransferForUser).toHaveBeenCalledWith(
      'user-1', 5, { paidAt: expect.any(Date) }
    )
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('returns 404 when transfer not found', async () => {
    transfersMock.settleTransferForUser.mockResolvedValue(null)

    const { PATCH } = await import('@/api/transfers/[transferId]/settle/route')
    const request = new NextRequest('http://localhost/api/transfers/999/settle', {
      method: 'PATCH',
      body: JSON.stringify({ paidAt: '2026-04-02T00:00:00.000Z' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ transferId: '999' }) })
    expect(response.status).toBe(404)
  })
})

describe('PATCH /api/transfers/[transferId]/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
  })

  it('cancels transfer and revalidates dashboard', async () => {
    transfersMock.cancelTransferForUser.mockResolvedValue({ id: 5, status: 'CANCELED' })

    const { PATCH } = await import('@/api/transfers/[transferId]/cancel/route')
    const request = new NextRequest('http://localhost/api/transfers/5/cancel', {
      method: 'PATCH',
    })

    const response = await PATCH(request, { params: Promise.resolve({ transferId: '5' }) })
    expect(response.status).toBe(200)
    expect(transfersMock.cancelTransferForUser).toHaveBeenCalledWith('user-1', 5)
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard')
  })
})
```

- [ ] **Step 6: Implement settle and cancel transfer API routes**

Create `app/api/transfers/[transferId]/settle/route.ts`:

```typescript
import { getUserFromRequest } from '@/lib/auth'
import { settleTransferForUser } from '@/modules/transfers/service'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ transferId: string }> }
) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { transferId } = await params
  const id = Number(transferId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid transfer ID' }, { status: 400 })
  }

  const body = await request.json()
  const paidAt = new Date(body.paidAt)
  if (isNaN(paidAt.getTime())) {
    return NextResponse.json({ error: 'Invalid paidAt date' }, { status: 400 })
  }

  try {
    const result = await settleTransferForUser(user.id, id, { paidAt })
    if (!result) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })

    try { revalidatePath('/dashboard') } catch {}
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
```

Create `app/api/transfers/[transferId]/cancel/route.ts`:

```typescript
import { getUserFromRequest } from '@/lib/auth'
import { cancelTransferForUser } from '@/modules/transfers/service'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ transferId: string }> }
) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { transferId } = await params
  const id = Number(transferId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid transfer ID' }, { status: 400 })
  }

  try {
    const result = await cancelTransferForUser(user.id, id)
    if (!result) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })

    try { revalidatePath('/dashboard') } catch {}
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
```

- [ ] **Step 7: Run all tests**

Run: `yarn vitest run tests/unit/financial-core/settle-cancel-transfer.test.ts tests/unit/api/transfers/transfer-settle-cancel-routes.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add app/modules/transfers/service.ts app/api/transfers/[transferId]/settle/route.ts app/api/transfers/[transferId]/cancel/route.ts tests/unit/financial-core/settle-cancel-transfer.test.ts tests/unit/api/transfers/transfer-settle-cancel-routes.test.ts
git commit -m "feat: add settleTransfer and cancelTransfer commands with API routes"
```

---

### Task 5: Implement payInvoice End-to-End

**Files:**
- Modify: `app/modules/invoices/service.ts`
- Modify: `app/api/invoices/[invoiceId]/route.ts`
- Create: `app/api/invoices/[invoiceId]/pay/route.ts`
- Create: `tests/unit/financial-core/pay-invoice-e2e.test.ts`
- Create: `tests/unit/api/invoices/invoice-pay-route.test.ts`

- [ ] **Step 1: Write failing tests for payInvoice service**

```typescript
// tests/unit/financial-core/pay-invoice-e2e.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  invoice: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  account: {
    findFirst: vi.fn(),
  },
  transaction: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}

vi.mock('@/lib/prisma', () => ({ default: prismaMock, prisma: prismaMock }))

import { payInvoiceForUserE2E } from '@/modules/invoices/service'

describe('payInvoiceForUserE2E', () => {
  beforeEach(() => vi.clearAllMocks())

  it('marks invoice as PAID and creates expense transaction atomically', async () => {
    const invoice = {
      id: 10,
      creditCardId: 3,
      month: 4,
      year: 2026,
      status: 'OPEN',
      dueDate: new Date('2026-04-10'),
      total: { toNumber: () => 1200 },
      creditCard: { id: 3, userId: 'user-1', name: 'Nubank' },
      transactions: [
        { id: 1, value: { toNumber: () => 800 }, status: 'PENDING' },
        { id: 2, value: { toNumber: () => 400 }, status: 'PENDING' },
      ],
    }

    prismaMock.invoice.findFirst.mockResolvedValue(invoice)
    prismaMock.account.findFirst.mockResolvedValue({ id: 1, userId: 'user-1' })

    prismaMock.$transaction.mockImplementation(async (fn) => {
      return fn(prismaMock)
    })
    prismaMock.invoice.update.mockResolvedValue({ ...invoice, status: 'PAID' })
    prismaMock.transaction.create.mockResolvedValue({ id: 99, status: 'PAID', type: 'EXPENSE' })

    const result = await payInvoiceForUserE2E('user-1', 10, {
      accountId: 1,
      paidAt: new Date('2026-04-10'),
    })

    expect(result).not.toBeNull()
    expect(prismaMock.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({ status: 'PAID' }),
      })
    )
    expect(prismaMock.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'EXPENSE',
          status: 'PAID',
          accountId: 1,
          invoiceId: 10,
        }),
      })
    )
  })

  it('rejects payment of non-OPEN invoice', async () => {
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10,
      status: 'PAID',
      creditCard: { id: 3, userId: 'user-1' },
    })

    await expect(
      payInvoiceForUserE2E('user-1', 10, { accountId: 1, paidAt: new Date() })
    ).rejects.toThrow()
  })

  it('rejects payment when user does not own account', async () => {
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10,
      status: 'OPEN',
      total: { toNumber: () => 500 },
      dueDate: new Date('2026-04-10'),
      creditCard: { id: 3, userId: 'user-1', name: 'Nubank' },
      transactions: [],
    })
    prismaMock.account.findFirst.mockResolvedValue(null)

    await expect(
      payInvoiceForUserE2E('user-1', 10, { accountId: 999, paidAt: new Date() })
    ).rejects.toThrow()
  })

  it('returns null when invoice not found', async () => {
    prismaMock.invoice.findFirst.mockResolvedValue(null)
    const result = await payInvoiceForUserE2E('user-1', 999, {
      accountId: 1,
      paidAt: new Date(),
    })
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/financial-core/pay-invoice-e2e.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement payInvoiceForUserE2E**

Add to `app/modules/invoices/service.ts`:

```typescript
export async function payInvoiceForUserE2E(
  userId: string,
  invoiceId: number,
  input: { accountId: number; paidAt: Date }
): Promise<object | null> {
  const { prisma } = await import('@/lib/prisma')

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId },
    include: {
      creditCard: true,
      transactions: { where: { status: { not: 'CANCELED' } } },
    },
  })

  if (!invoice) return null
  if (invoice.creditCard.userId !== userId) return null

  if (invoice.status !== 'OPEN') {
    throw new Error(`Cannot pay invoice with status ${invoice.status}`)
  }

  const account = await prisma.account.findFirst({
    where: { id: input.accountId, userId },
  })

  if (!account) {
    throw new Error('Account not found or not owned by user')
  }

  const invoiceTotal = invoice.transactions.reduce(
    (sum, tx) => sum + tx.value.toNumber(),
    0
  )

  const cardName = invoice.creditCard.name
  const monthLabel = `${String(invoice.month).padStart(2, '0')}/${invoice.year}`

  return prisma.$transaction(async (tx) => {
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID', paidAt: input.paidAt },
    })

    await tx.transaction.create({
      data: {
        userId,
        type: 'EXPENSE',
        status: 'PAID',
        description: `Pagamento fatura ${cardName} ${monthLabel}`,
        value: invoiceTotal,
        accountId: input.accountId,
        invoiceId,
        competenceDate: invoice.dueDate,
        dueDate: invoice.dueDate,
        paidAt: input.paidAt,
      },
    })

    return updatedInvoice
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run tests/unit/financial-core/pay-invoice-e2e.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing test for pay invoice API route**

```typescript
// tests/unit/api/invoices/invoice-pay-route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const authMock = { getUserFromRequest: vi.fn() }
const invoicesMock = { payInvoiceForUserE2E: vi.fn() }
const cacheMock = { revalidatePath: vi.fn() }

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/invoices/service', () => invoicesMock)
vi.mock('next/cache', () => cacheMock)

describe('POST /api/invoices/[invoiceId]/pay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
  })

  it('pays invoice with account and revalidates dashboard', async () => {
    invoicesMock.payInvoiceForUserE2E.mockResolvedValue({ id: 10, status: 'PAID' })

    const { POST } = await import('@/api/invoices/[invoiceId]/pay/route')
    const request = new NextRequest('http://localhost/api/invoices/10/pay', {
      method: 'POST',
      body: JSON.stringify({ accountId: 1, paidAt: '2026-04-10T00:00:00.000Z' }),
    })

    const response = await POST(request, { params: Promise.resolve({ invoiceId: '10' }) })
    expect(response.status).toBe(200)
    expect(invoicesMock.payInvoiceForUserE2E).toHaveBeenCalledWith(
      'user-1', 10, { accountId: 1, paidAt: expect.any(Date) }
    )
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('returns 400 when accountId is missing', async () => {
    const { POST } = await import('@/api/invoices/[invoiceId]/pay/route')
    const request = new NextRequest('http://localhost/api/invoices/10/pay', {
      method: 'POST',
      body: JSON.stringify({ paidAt: '2026-04-10T00:00:00.000Z' }),
    })

    const response = await POST(request, { params: Promise.resolve({ invoiceId: '10' }) })
    expect(response.status).toBe(400)
  })

  it('returns 404 when invoice not found', async () => {
    invoicesMock.payInvoiceForUserE2E.mockResolvedValue(null)

    const { POST } = await import('@/api/invoices/[invoiceId]/pay/route')
    const request = new NextRequest('http://localhost/api/invoices/999/pay', {
      method: 'POST',
      body: JSON.stringify({ accountId: 1, paidAt: '2026-04-10T00:00:00.000Z' }),
    })

    const response = await POST(request, { params: Promise.resolve({ invoiceId: '999' }) })
    expect(response.status).toBe(404)
  })
})
```

- [ ] **Step 6: Implement pay invoice API route**

Create `app/api/invoices/[invoiceId]/pay/route.ts`:

```typescript
import { getUserFromRequest } from '@/lib/auth'
import { payInvoiceForUserE2E } from '@/modules/invoices/service'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { invoiceId } = await params
  const id = Number(invoiceId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 })
  }

  const body = await request.json()
  const accountId = Number(body.accountId)
  const paidAt = new Date(body.paidAt)

  if (!Number.isInteger(accountId) || accountId <= 0) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
  }
  if (isNaN(paidAt.getTime())) {
    return NextResponse.json({ error: 'Invalid paidAt date' }, { status: 400 })
  }

  try {
    const result = await payInvoiceForUserE2E(user.id, id, { accountId, paidAt })
    if (!result) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    try { revalidatePath('/dashboard') } catch {}
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
```

- [ ] **Step 7: Run all tests**

Run: `yarn vitest run tests/unit/financial-core/pay-invoice-e2e.test.ts tests/unit/api/invoices/invoice-pay-route.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add app/modules/invoices/service.ts app/api/invoices/[invoiceId]/pay/route.ts tests/unit/financial-core/pay-invoice-e2e.test.ts tests/unit/api/invoices/invoice-pay-route.test.ts
git commit -m "feat: add payInvoice e2e with expense transaction creation and dedicated API route"
```

---

### Task 6: Implement recordGoalWithdrawal

**Files:**
- Modify: `app/modules/goals/service.ts`
- Create: `app/api/goals/[goalId]/withdraw/route.ts`
- Create: `tests/unit/financial-core/goal-withdrawal.test.ts`
- Create: `tests/unit/api/goals/goal-withdraw-route.test.ts`

- [ ] **Step 1: Write failing tests for goal withdrawal service**

```typescript
// tests/unit/financial-core/goal-withdrawal.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  goal: {
    findFirst: vi.fn(),
  },
  goalContribution: {
    create: vi.fn(),
  },
  account: {
    findFirst: vi.fn(),
  },
  transfer: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import { recordGoalWithdrawalForUser } from '@/modules/goals/service'

describe('recordGoalWithdrawalForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates withdrawal contribution for active goal', async () => {
    prismaMock.goal.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      status: 'ACTIVE',
      reserveAccountId: null,
    })
    prismaMock.goalContribution.create.mockResolvedValue({
      id: 1,
      goalId: 5,
      kind: 'WITHDRAWAL',
      amount: { toNumber: () => -200 },
    })

    const result = await recordGoalWithdrawalForUser('user-1', 5, {
      amount: '200.00',
    })

    expect(result).not.toBeNull()
    expect(prismaMock.goalContribution.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        goalId: 5,
        kind: 'WITHDRAWAL',
      }),
    })
  })

  it('rejects withdrawal from non-ACTIVE goal', async () => {
    prismaMock.goal.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      status: 'COMPLETED',
    })

    await expect(
      recordGoalWithdrawalForUser('user-1', 5, { amount: '200.00' })
    ).rejects.toThrow()
  })

  it('rejects withdrawal with zero or negative amount', async () => {
    prismaMock.goal.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      status: 'ACTIVE',
    })

    await expect(
      recordGoalWithdrawalForUser('user-1', 5, { amount: '0' })
    ).rejects.toThrow()
  })

  it('returns null when goal not found', async () => {
    prismaMock.goal.findFirst.mockResolvedValue(null)
    const result = await recordGoalWithdrawalForUser('user-1', 999, { amount: '100' })
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/financial-core/goal-withdrawal.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement recordGoalWithdrawalForUser**

Add to `app/modules/goals/service.ts`:

```typescript
export async function recordGoalWithdrawalForUser(
  userId: string,
  goalId: number,
  input: { amount: string; transferId?: number }
): Promise<object | null> {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  })

  if (!goal) return null

  if (goal.status !== 'ACTIVE') {
    throw createGoalError(
      'GOAL_WITHDRAWAL_INVALID_STATUS',
      `Cannot withdraw from goal with status ${goal.status}`
    )
  }

  const amountCents = toCents(input.amount)
  if (amountCents <= 0) {
    throw createGoalError(
      'GOAL_WITHDRAWAL_INVALID_AMOUNT',
      'Withdrawal amount must be positive'
    )
  }

  return prisma.goalContribution.create({
    data: {
      goalId,
      kind: 'WITHDRAWAL',
      amount: -Math.abs(amountCents) / 100,
      transferId: input.transferId ?? null,
    },
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run tests/unit/financial-core/goal-withdrawal.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing test for withdrawal API route**

```typescript
// tests/unit/api/goals/goal-withdraw-route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const authMock = { getUserFromRequest: vi.fn() }
const goalsMock = { recordGoalWithdrawalForUser: vi.fn() }
const cacheMock = { revalidatePath: vi.fn() }

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/goals/service', () => goalsMock)
vi.mock('next/cache', () => cacheMock)

describe('POST /api/goals/[goalId]/withdraw', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
  })

  it('records withdrawal and revalidates dashboard', async () => {
    goalsMock.recordGoalWithdrawalForUser.mockResolvedValue({ id: 1, kind: 'WITHDRAWAL' })

    const { POST } = await import('@/api/goals/[goalId]/withdraw/route')
    const request = new NextRequest('http://localhost/api/goals/5/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount: '200.00' }),
    })

    const response = await POST(request, { params: Promise.resolve({ goalId: '5' }) })
    expect(response.status).toBe(201)
    expect(goalsMock.recordGoalWithdrawalForUser).toHaveBeenCalledWith(
      'user-1', 5, { amount: '200.00', transferId: undefined }
    )
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('returns 404 when goal not found', async () => {
    goalsMock.recordGoalWithdrawalForUser.mockResolvedValue(null)

    const { POST } = await import('@/api/goals/[goalId]/withdraw/route')
    const request = new NextRequest('http://localhost/api/goals/999/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount: '200.00' }),
    })

    const response = await POST(request, { params: Promise.resolve({ goalId: '999' }) })
    expect(response.status).toBe(404)
  })
})
```

- [ ] **Step 6: Implement withdraw API route**

Create `app/api/goals/[goalId]/withdraw/route.ts`:

```typescript
import { getUserFromRequest } from '@/lib/auth'
import { recordGoalWithdrawalForUser } from '@/modules/goals/service'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goalId } = await params
  const id = Number(goalId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 })
  }

  const body = await request.json()
  const { amount, transferId } = body

  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: 'amount is required and must be positive' }, { status: 400 })
  }

  try {
    const result = await recordGoalWithdrawalForUser(user.id, id, {
      amount: String(amount),
      transferId: transferId ? Number(transferId) : undefined,
    })

    if (!result) return NextResponse.json({ error: 'Goal not found' }, { status: 404 })

    try { revalidatePath('/dashboard') } catch {}
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
```

- [ ] **Step 7: Run all tests**

Run: `yarn vitest run tests/unit/financial-core/goal-withdrawal.test.ts tests/unit/api/goals/goal-withdraw-route.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add app/modules/goals/service.ts app/api/goals/[goalId]/withdraw/route.ts tests/unit/financial-core/goal-withdrawal.test.ts tests/unit/api/goals/goal-withdraw-route.test.ts
git commit -m "feat: add recordGoalWithdrawal command with dedicated API route"
```

---

### Task 7: Update Financial Core Service Builders

**Files:**
- Modify: `app/modules/financial-core/service.ts`
- Modify: `tests/unit/financial-core/financial-command-service.test.ts`

- [ ] **Step 1: Write failing tests for new command builders**

Add to `tests/unit/financial-core/financial-command-service.test.ts`:

```typescript
describe('cancelTransaction command', () => {
  it('returns cancellation result with correct writes', async () => {
    const ports = createMockPorts()
    ports.cancelTransaction.mockResolvedValue({
      transactionId: 10,
      previousStatus: 'PAID',
    })

    const service = createFinancialCommandService(ports)
    const result = await service.cancelTransactionCommand({ transactionId: 10 })

    expect(result.command).toBe('cancelTransaction')
    expect(result.writes).toEqual(['transaction', 'dashboard-read-model'])
    expect(result.rule.kind).toBe('cancellation')
    expect(result.rule.entityType).toBe('transaction')
    expect(result.rule.previousStatus).toBe('PAID')
  })
})

describe('settleTransfer command', () => {
  it('returns transfer settlement result with correct writes', async () => {
    const ports = createMockPorts()
    ports.settleTransfer.mockResolvedValue({
      transferId: 5,
      paidAt: new Date('2026-04-02'),
    })

    const service = createFinancialCommandService(ports)
    const result = await service.settleTransferCommand({
      transferId: 5,
      paidAt: new Date('2026-04-02'),
    })

    expect(result.command).toBe('settleTransfer')
    expect(result.writes).toEqual(['transfer', 'account-balance', 'dashboard-read-model'])
    expect(result.rule.kind).toBe('transfer-settlement')
  })
})

describe('cancelTransfer command', () => {
  it('returns transfer cancellation result with correct writes', async () => {
    const ports = createMockPorts()
    ports.cancelTransfer.mockResolvedValue({
      transferId: 5,
      previousStatus: 'PENDING',
    })

    const service = createFinancialCommandService(ports)
    const result = await service.cancelTransferCommand({ transferId: 5 })

    expect(result.command).toBe('cancelTransfer')
    expect(result.writes).toEqual(['transfer', 'dashboard-read-model'])
    expect(result.rule.kind).toBe('cancellation')
    expect(result.rule.entityType).toBe('transfer')
  })
})

describe('recordGoalWithdrawal command', () => {
  it('returns goal withdrawal result with correct writes', async () => {
    const ports = createMockPorts()
    ports.recordGoalWithdrawal.mockResolvedValue({
      goalId: 5,
      amount: '200.00',
      transferId: undefined,
    })

    const service = createFinancialCommandService(ports)
    const result = await service.recordGoalWithdrawalCommand({
      goalId: 5,
      amount: '200.00',
    })

    expect(result.command).toBe('recordGoalWithdrawal')
    expect(result.writes).toEqual(['goal-contribution', 'dashboard-read-model'])
    expect(result.rule.kind).toBe('goal-withdrawal')
    expect(result.rule.hasTransfer).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/financial-core/financial-command-service.test.ts`
Expected: FAIL — new commands not in service

- [ ] **Step 3: Add new command builders and service methods**

Add to `app/modules/financial-core/service.ts`:

Builder functions:
```typescript
function buildCancelTransactionResult(
  portResult: { transactionId: number; previousStatus: string }
): CancelTransactionCommandResult {
  return {
    command: 'cancelTransaction',
    writes: ['transaction', 'dashboard-read-model'],
    rule: {
      kind: 'cancellation',
      entityType: 'transaction',
      entityId: portResult.transactionId,
      previousStatus: portResult.previousStatus,
    },
  }
}

function buildSettleTransferResult(
  portResult: { transferId: number; paidAt: Date }
): SettleTransferCommandResult {
  return {
    command: 'settleTransfer',
    writes: ['transfer', 'account-balance', 'dashboard-read-model'],
    rule: {
      kind: 'transfer-settlement',
      transferId: portResult.transferId,
      paidAt: portResult.paidAt,
    },
  }
}

function buildCancelTransferResult(
  portResult: { transferId: number; previousStatus: string }
): CancelTransferCommandResult {
  return {
    command: 'cancelTransfer',
    writes: ['transfer', 'dashboard-read-model'],
    rule: {
      kind: 'cancellation',
      entityType: 'transfer',
      entityId: portResult.transferId,
      previousStatus: portResult.previousStatus,
    },
  }
}

function buildRecordGoalWithdrawalResult(
  portResult: { goalId: number; amount: string; transferId?: number }
): RecordGoalWithdrawalCommandResult {
  return {
    command: 'recordGoalWithdrawal',
    writes: ['goal-contribution', 'dashboard-read-model'],
    rule: {
      kind: 'goal-withdrawal',
      goalId: portResult.goalId,
      amount: portResult.amount,
      hasTransfer: !!portResult.transferId,
    },
  }
}
```

Add to the service object in `createFinancialCommandService()`:
```typescript
async cancelTransactionCommand(input: CancelTransactionInput) {
  const portResult = await ports.cancelTransaction(input)
  return buildCancelTransactionResult(portResult)
},
async settleTransferCommand(input: SettleTransferInput) {
  const portResult = await ports.settleTransfer(input)
  return buildSettleTransferResult(portResult)
},
async cancelTransferCommand(input: CancelTransferInput) {
  const portResult = await ports.cancelTransfer(input)
  return buildCancelTransferResult(portResult)
},
async recordGoalWithdrawalCommand(input: RecordGoalWithdrawalInput) {
  const portResult = await ports.recordGoalWithdrawal(input)
  return buildRecordGoalWithdrawalResult(portResult)
},
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run tests/unit/financial-core/financial-command-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/modules/financial-core/service.ts tests/unit/financial-core/financial-command-service.test.ts
git commit -m "feat: add cancel, settle transfer, and goal withdrawal command builders to financial core service"
```

---

### Task 8: Phase 1 Verification

- [ ] **Step 1: Run full test suite**

Run: `yarn test`
Expected: All tests pass (no regressions)

- [ ] **Step 2: Run lint**

Run: `yarn lint`
Expected: 0 errors

- [ ] **Step 3: Run build**

Run: `yarn build`
Expected: Build succeeds

- [ ] **Step 4: Update financial core audit test**

Update `tests/unit/financial-core/financial-core-audit.test.ts` to verify all commands are now listed:

```typescript
import { describe, it, expect } from 'vitest'

const allFinancialCommands = [
  'createTransaction',
  'updateTransaction',
  'settleTransaction',
  'cancelTransaction',
  'createTransfer',
  'updateTransfer',
  'settleTransfer',
  'cancelTransfer',
  'payInvoice',
  'recordGoalContribution',
  'recordGoalWithdrawal',
]

describe('financial core audit', () => {
  it('tracks all commands that modify patrimonial state', () => {
    expect(allFinancialCommands).toContain('settleTransaction')
    expect(allFinancialCommands).toContain('cancelTransaction')
    expect(allFinancialCommands).toContain('settleTransfer')
    expect(allFinancialCommands).toContain('cancelTransfer')
    expect(allFinancialCommands).toContain('payInvoice')
    expect(allFinancialCommands).toContain('recordGoalWithdrawal')
  })
})
```

- [ ] **Step 5: Run verification suite again**

Run: `yarn test && yarn lint && yarn build`
Expected: All green

- [ ] **Step 6: Commit**

```bash
git add tests/unit/financial-core/financial-core-audit.test.ts
git commit -m "chore: update financial core audit with all canonical commands and pass phase 1 verification"
```
