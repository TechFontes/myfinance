import type {
  CancelTransactionInput,
  CancelTransactionCommandResult,
  CancelTransferInput,
  CancelTransferCommandResult,
  CreateCardPurchaseInput,
  CreateCardPurchaseCommandResult,
  CreateTransferInput,
  CreateTransferCommandResult,
  FinancialCommandPorts,
  PayInvoiceCommandResult,
  PayInvoiceInput,
  RecordGoalContributionCommandResult,
  RecordGoalContributionInput,
  RecordGoalWithdrawalInput,
  RecordGoalWithdrawalCommandResult,
  SettleTransactionCommandResult,
  SettleTransactionInput,
  SettleTransferInput,
  SettleTransferCommandResult,
} from './contracts'

function buildSettleTransactionResult(
  input: SettleTransactionInput,
  persisted: Awaited<ReturnType<FinancialCommandPorts['settleTransaction']>>,
): SettleTransactionCommandResult {
  return {
    command: 'settleTransaction',
    writes: ['transaction', 'account-balance', 'dashboard-read-model'],
    rule: {
      kind: 'cash-settlement',
      transactionId: persisted.transactionId,
      paidAt: persisted.paidAt ?? input.paidAt,
    },
  }
}

function buildCreateCardPurchaseResult(
  input: CreateCardPurchaseInput,
  persisted: Awaited<ReturnType<FinancialCommandPorts['createCardPurchase']>>,
): CreateCardPurchaseCommandResult {
  return {
    command: 'createCardPurchase',
    writes: ['transaction', 'invoice', 'dashboard-read-model'],
    rule: {
      kind: 'card-purchase',
      transactionId: persisted.transactionId,
      creditCardId: persisted.creditCardId ?? input.creditCardId,
      invoiceId: persisted.invoiceId,
    },
  }
}

function buildPayInvoiceResult(
  input: PayInvoiceInput,
  persisted: Awaited<ReturnType<FinancialCommandPorts['payInvoice']>>,
): PayInvoiceCommandResult {
  return {
    command: 'payInvoice',
    writes: ['invoice', 'account-balance', 'dashboard-read-model'],
    rule: {
      kind: 'invoice-payment',
      invoiceId: persisted.invoiceId,
      accountId: persisted.accountId ?? input.accountId,
      paidAt: persisted.paidAt ?? input.paidAt,
    },
  }
}

function buildCreateTransferResult(
  input: CreateTransferInput,
  persisted: Awaited<ReturnType<FinancialCommandPorts['createTransfer']>>,
): CreateTransferCommandResult {
  return {
    command: 'createTransfer',
    writes: ['transfer', 'account-balance', 'dashboard-read-model'],
    rule: {
      kind: 'internal-transfer',
      transferId: persisted.transferId,
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
    },
  }
}

function assertReserveBackedGoalContribution(
  input: RecordGoalContributionInput,
): asserts input is Extract<
  RecordGoalContributionInput,
  { mode: 'TRANSFER_TO_RESERVE' | 'TRANSFER_FROM_RESERVE' }
> {
  if (
    (input.mode !== 'TRANSFER_TO_RESERVE' && input.mode !== 'TRANSFER_FROM_RESERVE') ||
    typeof input.reserveAccountId !== 'number' ||
    Number.isNaN(input.reserveAccountId)
  ) {
    throw new Error(
      'Reserve-backed goal contributions require reserveAccountId and transferId',
    )
  }
}

function buildRecordGoalContributionResult(
  input: RecordGoalContributionInput,
  persisted: Awaited<ReturnType<FinancialCommandPorts['recordGoalContribution']>>,
): RecordGoalContributionCommandResult {
  if (input.mode === 'TRANSFER_TO_RESERVE' || input.mode === 'TRANSFER_FROM_RESERVE') {
    assertReserveBackedGoalContribution(input)
    if (!('transferId' in persisted) || typeof persisted.transferId !== 'number') {
      throw new Error(
        'Reserve-backed goal contributions require reserveAccountId and transferId',
      )
    }

    if (input.mode === 'TRANSFER_TO_RESERVE') {
      return {
        command: 'recordGoalContribution',
        writes: ['goal', 'transfer', 'account-balance', 'dashboard-read-model'],
        rule: {
          kind: 'goal-contribution',
          goalId: persisted.goalId,
          contributionId: persisted.contributionId,
          mode: 'TRANSFER_TO_RESERVE',
          reserveAccountId: input.reserveAccountId,
          transferId: persisted.transferId,
        },
      }
    }

    return {
      command: 'recordGoalContribution',
      writes: ['goal', 'transfer', 'account-balance', 'dashboard-read-model'],
      rule: {
        kind: 'goal-contribution',
        goalId: persisted.goalId,
        contributionId: persisted.contributionId,
        mode: 'TRANSFER_FROM_RESERVE',
        reserveAccountId: input.reserveAccountId,
        transferId: persisted.transferId,
      },
    }
  }

  return {
    command: 'recordGoalContribution',
    writes: ['goal', 'dashboard-read-model'],
    rule: {
      kind: 'goal-contribution',
      goalId: persisted.goalId,
      contributionId: persisted.contributionId,
      mode: input.mode,
    },
  }
}

function buildCancelTransactionResult(
  portResult: { transactionId: number; previousStatus: string },
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
  portResult: { transferId: number; paidAt: Date },
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
  portResult: { transferId: number; previousStatus: string },
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
  portResult: { goalId: number; amount: string; transferId?: number },
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

export function createFinancialCommandService(ports: FinancialCommandPorts) {
  return {
    async settleTransactionCommand(
      input: SettleTransactionInput,
    ): Promise<SettleTransactionCommandResult> {
      const persisted = await ports.settleTransaction(input)
      return buildSettleTransactionResult(input, persisted)
    },
    async createCardPurchaseCommand(
      input: CreateCardPurchaseInput,
    ): Promise<CreateCardPurchaseCommandResult> {
      const persisted = await ports.createCardPurchase(input)
      return buildCreateCardPurchaseResult(input, persisted)
    },
    async payInvoiceCommand(input: PayInvoiceInput): Promise<PayInvoiceCommandResult> {
      const persisted = await ports.payInvoice(input)
      return buildPayInvoiceResult(input, persisted)
    },
    async createTransferCommand(
      input: CreateTransferInput,
    ): Promise<CreateTransferCommandResult> {
      const persisted = await ports.createTransfer(input)
      return buildCreateTransferResult(input, persisted)
    },
    async recordGoalContributionCommand(
      input: RecordGoalContributionInput,
    ): Promise<RecordGoalContributionCommandResult> {
      if (input.mode === 'TRANSFER_TO_RESERVE' || input.mode === 'TRANSFER_FROM_RESERVE') {
        assertReserveBackedGoalContribution(input)
      }

      const persisted = await ports.recordGoalContribution(input)
      return buildRecordGoalContributionResult(input, persisted)
    },
    async cancelTransactionCommand(
      input: CancelTransactionInput,
    ): Promise<CancelTransactionCommandResult> {
      const portResult = await ports.cancelTransaction(input)
      return buildCancelTransactionResult(portResult)
    },
    async settleTransferCommand(
      input: SettleTransferInput,
    ): Promise<SettleTransferCommandResult> {
      const portResult = await ports.settleTransfer(input)
      return buildSettleTransferResult(portResult)
    },
    async cancelTransferCommand(
      input: CancelTransferInput,
    ): Promise<CancelTransferCommandResult> {
      const portResult = await ports.cancelTransfer(input)
      return buildCancelTransferResult(portResult)
    },
    async recordGoalWithdrawalCommand(
      input: RecordGoalWithdrawalInput,
    ): Promise<RecordGoalWithdrawalCommandResult> {
      const portResult = await ports.recordGoalWithdrawal(input)
      return buildRecordGoalWithdrawalResult(portResult)
    },
  }
}
