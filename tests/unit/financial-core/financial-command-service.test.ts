import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  createFinancialCommandService,
} from '@/modules/financial-core'
import type { RecordGoalContributionInput } from '@/modules/financial-core'

describe('financial command service', () => {
  function createPorts() {
    return {
      settleTransaction: vi.fn().mockResolvedValue({ transactionId: 10 }),
      createCardPurchase: vi
        .fn()
        .mockResolvedValue({ transactionId: 11, creditCardId: 2, invoiceId: 8 }),
      payInvoice: vi.fn().mockResolvedValue({ invoiceId: 9 }),
      createTransfer: vi.fn().mockResolvedValue({ transferId: 15 }),
      recordGoalContribution: vi
        .fn()
        .mockResolvedValue({ contributionId: 3, goalId: 7, transferId: 19 }),
      cancelTransaction: vi
        .fn()
        .mockResolvedValue({ transactionId: 10, previousStatus: 'PAID' }),
      settleTransfer: vi
        .fn()
        .mockResolvedValue({ transferId: 5, paidAt: new Date('2026-04-02T00:00:00.000Z') }),
      cancelTransfer: vi
        .fn()
        .mockResolvedValue({ transferId: 5, previousStatus: 'PENDING' }),
      recordGoalWithdrawal: vi
        .fn()
        .mockResolvedValue({ goalId: 5, amount: '200.00' }),
    }
  }

  it('requires transfer context in the reserve-backed goal contribution contract', () => {
    type ReserveContributionInput = Extract<
      RecordGoalContributionInput,
      { mode: 'TRANSFER_TO_RESERVE' }
    >
    type ReserveWithdrawalInput = Extract<
      RecordGoalContributionInput,
      { mode: 'TRANSFER_FROM_RESERVE' }
    >

    expectTypeOf<ReserveContributionInput>().toEqualTypeOf<{
      goalId: number
      mode: 'TRANSFER_TO_RESERVE'
      amount: string
      reserveAccountId: number
    }>()
    expectTypeOf<ReserveWithdrawalInput>().toEqualTypeOf<{
      goalId: number
      mode: 'TRANSFER_FROM_RESERVE'
      amount: string
      reserveAccountId: number
    }>()

    // @ts-expect-error reserve-backed contribution must require reserveAccountId and transferId
    const invalidContribution: RecordGoalContributionInput = {
      goalId: 7,
      mode: 'TRANSFER_TO_RESERVE',
      amount: '150.00',
    }

    expect(invalidContribution).toBeDefined()
  })

  it('settles a cash transaction through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.settleTransactionCommand({
      transactionId: 10,
      paidAt: new Date('2026-04-02T00:00:00.000Z'),
    })

    expect(ports.settleTransaction).toHaveBeenCalledWith({
      transactionId: 10,
      paidAt: new Date('2026-04-02T00:00:00.000Z'),
    })
    expect(result).toMatchObject({
      command: 'settleTransaction',
      writes: ['transaction', 'account-balance', 'dashboard-read-model'],
      rule: {
        kind: 'cash-settlement',
        transactionId: 10,
        paidAt: new Date('2026-04-02T00:00:00.000Z'),
      },
    })
  })

  it('creates a card purchase through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.createCardPurchaseCommand({
      creditCardId: 2,
      amount: '120.00',
      competenceDate: new Date('2026-04-03T00:00:00.000Z'),
    })

    expect(ports.createCardPurchase).toHaveBeenCalledWith({
      creditCardId: 2,
      amount: '120.00',
      competenceDate: new Date('2026-04-03T00:00:00.000Z'),
    })
    expect(result).toMatchObject({
      command: 'createCardPurchase',
      writes: ['transaction', 'invoice', 'dashboard-read-model'],
      rule: {
        kind: 'card-purchase',
        transactionId: 11,
        creditCardId: 2,
        invoiceId: 8,
      },
    })
    expect(result.writes).not.toContain('account-balance')
  })

  it('pays an invoice through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.payInvoiceCommand({
      invoiceId: 9,
      accountId: 4,
      paidAt: new Date('2026-04-02T00:00:00.000Z'),
    })

    expect(ports.payInvoice).toHaveBeenCalledWith({
      invoiceId: 9,
      accountId: 4,
      paidAt: new Date('2026-04-02T00:00:00.000Z'),
    })
    expect(result).toMatchObject({
      command: 'payInvoice',
      writes: ['invoice', 'account-balance', 'dashboard-read-model'],
      rule: {
        kind: 'invoice-payment',
        invoiceId: 9,
        accountId: 4,
        paidAt: new Date('2026-04-02T00:00:00.000Z'),
      },
    })
  })

  it('creates a transfer through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.createTransferCommand({
      sourceAccountId: 1,
      destinationAccountId: 2,
      amount: '250.00',
      competenceDate: new Date('2026-04-03T00:00:00.000Z'),
      dueDate: new Date('2026-04-03T00:00:00.000Z'),
    })

    expect(ports.createTransfer).toHaveBeenCalledWith({
      sourceAccountId: 1,
      destinationAccountId: 2,
      amount: '250.00',
      competenceDate: new Date('2026-04-03T00:00:00.000Z'),
      dueDate: new Date('2026-04-03T00:00:00.000Z'),
    })
    expect(result).toMatchObject({
      command: 'createTransfer',
      writes: ['transfer', 'account-balance', 'dashboard-read-model'],
      rule: {
        kind: 'internal-transfer',
        transferId: 15,
        sourceAccountId: 1,
        destinationAccountId: 2,
      },
    })
  })

  it('records a reserve-backed goal contribution through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.recordGoalContributionCommand({
      goalId: 7,
      mode: 'TRANSFER_TO_RESERVE',
      amount: '300.00',
      reserveAccountId: 5,
    })

    expect(ports.recordGoalContribution).toHaveBeenCalledWith({
      goalId: 7,
      mode: 'TRANSFER_TO_RESERVE',
      amount: '300.00',
      reserveAccountId: 5,
    })
    expect(result).toMatchObject({
      command: 'recordGoalContribution',
      writes: ['goal', 'transfer', 'account-balance', 'dashboard-read-model'],
      rule: {
        kind: 'goal-contribution',
        goalId: 7,
        contributionId: 3,
        mode: 'TRANSFER_TO_RESERVE',
        reserveAccountId: 5,
        transferId: 19,
      },
    })
  })

  it('records a reserve-backed goal withdrawal through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.recordGoalContributionCommand({
      goalId: 7,
      mode: 'TRANSFER_FROM_RESERVE',
      amount: '120.00',
      reserveAccountId: 5,
    })

    expect(ports.recordGoalContribution).toHaveBeenCalledWith({
      goalId: 7,
      mode: 'TRANSFER_FROM_RESERVE',
      amount: '120.00',
      reserveAccountId: 5,
    })
    expect(result).toMatchObject({
      command: 'recordGoalContribution',
      writes: ['goal', 'transfer', 'account-balance', 'dashboard-read-model'],
      rule: {
        kind: 'goal-contribution',
        goalId: 7,
        contributionId: 3,
        mode: 'TRANSFER_FROM_RESERVE',
        reserveAccountId: 5,
        transferId: 19,
      },
    })
  })

  it('records an informational goal contribution without patrimonial movement', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.recordGoalContributionCommand({
      goalId: 7,
      mode: 'INFORMATION_ONLY',
      amount: '150.00',
    })

    expect(ports.recordGoalContribution).toHaveBeenCalledWith({
      goalId: 7,
      mode: 'INFORMATION_ONLY',
      amount: '150.00',
    })
    expect(result).toMatchObject({
      command: 'recordGoalContribution',
      writes: ['goal', 'dashboard-read-model'],
      rule: {
        kind: 'goal-contribution',
        goalId: 7,
        contributionId: 3,
        mode: 'INFORMATION_ONLY',
      },
    })
    expect(result.writes).not.toContain('transfer')
    expect(result.writes).not.toContain('account-balance')
  })

  it('rejects malformed reserve-backed goal contribution commands at runtime', async () => {
    const service = createFinancialCommandService(createPorts())

    await expect(() =>
      service.recordGoalContributionCommand({
        goalId: 7,
        mode: 'TRANSFER_TO_RESERVE',
        amount: '150.00',
      } as unknown as RecordGoalContributionInput),
    ).rejects.toThrow(
      'Reserve-backed goal contributions require reserveAccountId and transferId',
    )
  })

  it('rejects null transfer context for reserve-backed goal contribution commands at runtime', async () => {
    const service = createFinancialCommandService(createPorts())

    await expect(() =>
      service.recordGoalContributionCommand({
        goalId: 7,
        mode: 'TRANSFER_TO_RESERVE',
        amount: '150.00',
        reserveAccountId: null,
        transferId: null,
      } as unknown as RecordGoalContributionInput),
    ).rejects.toThrow(
      'Reserve-backed goal contributions require reserveAccountId and transferId',
    )
  })

  it('cancels a transaction through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.cancelTransactionCommand({
      transactionId: 10,
    })

    expect(ports.cancelTransaction).toHaveBeenCalledWith({
      transactionId: 10,
    })
    expect(result).toMatchObject({
      command: 'cancelTransaction',
      writes: ['transaction', 'dashboard-read-model'],
      rule: {
        kind: 'cancellation',
        entityType: 'transaction',
        entityId: 10,
        previousStatus: 'PAID',
      },
    })
  })

  it('settles a transfer through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.settleTransferCommand({
      transferId: 5,
      paidAt: new Date('2026-04-02T00:00:00.000Z'),
    })

    expect(ports.settleTransfer).toHaveBeenCalledWith({
      transferId: 5,
      paidAt: new Date('2026-04-02T00:00:00.000Z'),
    })
    expect(result).toMatchObject({
      command: 'settleTransfer',
      writes: ['transfer', 'account-balance', 'dashboard-read-model'],
      rule: {
        kind: 'transfer-settlement',
        transferId: 5,
        paidAt: new Date('2026-04-02T00:00:00.000Z'),
      },
    })
  })

  it('cancels a transfer through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.cancelTransferCommand({
      transferId: 5,
    })

    expect(ports.cancelTransfer).toHaveBeenCalledWith({
      transferId: 5,
    })
    expect(result).toMatchObject({
      command: 'cancelTransfer',
      writes: ['transfer', 'dashboard-read-model'],
      rule: {
        kind: 'cancellation',
        entityType: 'transfer',
        entityId: 5,
        previousStatus: 'PENDING',
      },
    })
  })

  it('records a goal withdrawal through one command boundary', async () => {
    const ports = createPorts()
    const service = createFinancialCommandService(ports)

    const result = await service.recordGoalWithdrawalCommand({
      goalId: 5,
      amount: '200.00',
    })

    expect(ports.recordGoalWithdrawal).toHaveBeenCalledWith({
      goalId: 5,
      amount: '200.00',
    })
    expect(result).toMatchObject({
      command: 'recordGoalWithdrawal',
      writes: ['goal-contribution', 'dashboard-read-model'],
      rule: {
        kind: 'goal-withdrawal',
        goalId: 5,
        amount: '200.00',
        hasTransfer: false,
      },
    })
  })
})
