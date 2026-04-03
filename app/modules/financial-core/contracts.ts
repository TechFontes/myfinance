export const financialCommandNames = [
  'settleTransaction',
  'createCardPurchase',
  'payInvoice',
  'createTransfer',
  'recordGoalContribution',
  'cancelTransaction',
  'settleTransfer',
  'cancelTransfer',
  'recordGoalWithdrawal',
] as const

export const financialEffectTargets = [
  'transaction',
  'transfer',
  'invoice',
  'goal',
  'goal-contribution',
  'account-balance',
  'dashboard-read-model',
] as const

export const goalMovementModes = [
  'INFORMATION_ONLY',
  'TRANSFER_TO_RESERVE',
  'TRANSFER_FROM_RESERVE',
] as const

export type FinancialCommandName = (typeof financialCommandNames)[number]
export type FinancialEffectTarget = (typeof financialEffectTargets)[number]
export type GoalMovementMode = (typeof goalMovementModes)[number]

export type SettleTransactionInput = {
  transactionId: number
  accountId: number
  paidAt: Date
}

export type CreateCardPurchaseInput = {
  creditCardId: number
  amount: string
  competenceDate: Date
}

export type PayInvoiceInput = {
  invoiceId: number
  accountId: number
  paidAt: Date
}

export type CreateTransferInput = {
  sourceAccountId: number
  destinationAccountId: number
  amount: string
  competenceDate: Date
  dueDate: Date
}

export type RecordGoalContributionInformationInput = {
  goalId: number
  mode: 'INFORMATION_ONLY'
  amount: string
}

export type RecordGoalContributionReserveInput = {
  goalId: number
  mode: 'TRANSFER_TO_RESERVE'
  amount: string
  reserveAccountId: number
}

export type RecordGoalWithdrawalReserveInput = {
  goalId: number
  mode: 'TRANSFER_FROM_RESERVE'
  amount: string
  reserveAccountId: number
}

export type RecordGoalContributionInput =
  | RecordGoalContributionInformationInput
  | RecordGoalContributionReserveInput
  | RecordGoalWithdrawalReserveInput

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

export type CashSettlementRule = {
  kind: 'cash-settlement'
  transactionId: number
  paidAt: Date
}

export type CardPurchaseRule = {
  kind: 'card-purchase'
  transactionId: number
  creditCardId: number
  invoiceId: number
}

export type InvoicePaymentRule = {
  kind: 'invoice-payment'
  invoiceId: number
  accountId: number
  paidAt: Date
}

export type InternalTransferRule = {
  kind: 'internal-transfer'
  transferId: number
  sourceAccountId: number
  destinationAccountId: number
}

export type GoalContributionInformationRule = {
  kind: 'goal-contribution'
  goalId: number
  contributionId: number
  mode: 'INFORMATION_ONLY'
}

export type GoalContributionReserveRule = {
  kind: 'goal-contribution'
  goalId: number
  contributionId: number
  mode: 'TRANSFER_TO_RESERVE'
  reserveAccountId: number
  transferId: number
}

export type GoalWithdrawalReserveRule = {
  kind: 'goal-contribution'
  goalId: number
  contributionId: number
  mode: 'TRANSFER_FROM_RESERVE'
  reserveAccountId: number
  transferId: number
}

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

export type SettleTransactionCommandResult = {
  command: 'settleTransaction'
  writes: ['transaction', 'account-balance', 'dashboard-read-model']
  rule: CashSettlementRule
}

export type CreateCardPurchaseCommandResult = {
  command: 'createCardPurchase'
  writes: ['transaction', 'invoice', 'dashboard-read-model']
  rule: CardPurchaseRule
}

export type PayInvoiceCommandResult = {
  command: 'payInvoice'
  writes: ['invoice', 'account-balance', 'dashboard-read-model']
  rule: InvoicePaymentRule
}

export type CreateTransferCommandResult = {
  command: 'createTransfer'
  writes: ['transfer', 'account-balance', 'dashboard-read-model']
  rule: InternalTransferRule
}

export type RecordGoalContributionInformationCommandResult = {
  command: 'recordGoalContribution'
  writes: ['goal', 'dashboard-read-model']
  rule: GoalContributionInformationRule
}

export type RecordGoalContributionReserveCommandResult = {
  command: 'recordGoalContribution'
  writes: ['goal', 'transfer', 'account-balance', 'dashboard-read-model']
  rule: GoalContributionReserveRule
}

export type RecordGoalWithdrawalReserveCommandResult = {
  command: 'recordGoalContribution'
  writes: ['goal', 'transfer', 'account-balance', 'dashboard-read-model']
  rule: GoalWithdrawalReserveRule
}

export type RecordGoalContributionCommandResult =
  | RecordGoalContributionInformationCommandResult
  | RecordGoalContributionReserveCommandResult
  | RecordGoalWithdrawalReserveCommandResult

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

export type FinancialCommandResult<TName extends FinancialCommandName> =
  TName extends 'settleTransaction'
    ? SettleTransactionCommandResult
    : TName extends 'createCardPurchase'
      ? CreateCardPurchaseCommandResult
      : TName extends 'payInvoice'
        ? PayInvoiceCommandResult
        : TName extends 'createTransfer'
          ? CreateTransferCommandResult
          : TName extends 'recordGoalContribution'
            ? RecordGoalContributionCommandResult
            : TName extends 'cancelTransaction'
              ? CancelTransactionCommandResult
              : TName extends 'settleTransfer'
                ? SettleTransferCommandResult
                : TName extends 'cancelTransfer'
                  ? CancelTransferCommandResult
                  : TName extends 'recordGoalWithdrawal'
                    ? RecordGoalWithdrawalCommandResult
                    : never

export type FinancialCommandPorts = {
  settleTransaction(
    input: SettleTransactionInput,
  ): Promise<{ transactionId: number; paidAt?: Date | null }>
  createCardPurchase(input: CreateCardPurchaseInput): Promise<{
    transactionId: number
    creditCardId: number
    invoiceId: number
  }>
  payInvoice(input: PayInvoiceInput): Promise<{
    invoiceId: number
    accountId?: number | null
    paidAt?: Date | null
  }>
  createTransfer(input: CreateTransferInput): Promise<{
    transferId: number
  }>
  recordGoalContribution(input: RecordGoalContributionInput): Promise<
    | {
        goalId: number
        contributionId: number
      }
    | {
        goalId: number
        contributionId: number
        transferId: number
      }
  >
  cancelTransaction(
    input: CancelTransactionInput,
  ): Promise<{ transactionId: number; previousStatus: string }>
  settleTransfer(
    input: SettleTransferInput,
  ): Promise<{ transferId: number; paidAt: Date }>
  cancelTransfer(
    input: CancelTransferInput,
  ): Promise<{ transferId: number; previousStatus: string }>
  recordGoalWithdrawal(
    input: RecordGoalWithdrawalInput,
  ): Promise<{ goalId: number; amount: string; transferId?: number }>
}
