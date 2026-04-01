import { randomUUID } from 'node:crypto'

export function normalizeInvoicePeriod(month: number, year: number) {
  return { month, year }
}

export function buildInvoiceDueDate(year: number, month: number, dueDay: number) {
  return new Date(Date.UTC(year, month - 1, dueDay))
}

export function createInstallmentGroupId() {
  return randomUUID()
}
