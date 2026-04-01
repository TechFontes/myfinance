import { describe, expect, it } from "vitest"
import {
  transactionCreateSchema,
  transactionFiltersSchema,
  transactionStatuses,
  transactionTypes,
} from "@/modules/transactions"

describe("transaction contracts", () => {
  it("exposes the supported transaction types and statuses", () => {
    expect(transactionTypes).toEqual(["INCOME", "EXPENSE"])
    expect(transactionStatuses).toEqual([
      "PLANNED",
      "PENDING",
      "PAID",
      "CANCELED",
    ])
  })

  it("validates transaction creation payloads using the PRD fields", () => {
    const payload = transactionCreateSchema.parse({
      type: "EXPENSE",
      description: "Internet",
      value: "129.90",
      categoryId: 12,
      accountId: 3,
      creditCardId: 8,
      invoiceId: 4,
      competenceDate: "2026-03-01T00:00:00.000Z",
      dueDate: "2026-03-10T00:00:00.000Z",
      paidAt: "2026-03-09T00:00:00.000Z",
      status: "PENDING",
      fixed: true,
      installment: 1,
      installments: 3,
    })

    expect(payload.type).toBe("EXPENSE")
    expect(payload.description).toBe("Internet")
    expect(payload.value).toBe("129.90")
    expect(payload.categoryId).toBe(12)
    expect(payload.accountId).toBe(3)
    expect(payload.creditCardId).toBe(8)
    expect(payload.invoiceId).toBe(4)
    expect(payload.status).toBe("PENDING")
    expect(payload.fixed).toBe(true)
    expect(payload.installment).toBe(1)
    expect(payload.installments).toBe(3)
    expect(payload.competenceDate).toBeInstanceOf(Date)
    expect(payload.dueDate).toBeInstanceOf(Date)
    expect(payload.paidAt).toBeInstanceOf(Date)
  })

  it("validates filters for period, type, status and pagination", () => {
    const filters = transactionFiltersSchema.parse({
      search: "internet",
      type: "EXPENSE",
      status: "PENDING",
      categoryId: 12,
      accountId: 3,
      creditCardId: 8,
      periodStart: "2026-03-01T00:00:00.000Z",
      periodEnd: "2026-03-31T23:59:59.000Z",
      page: "2",
      pageSize: "25",
    })

    expect(filters.search).toBe("internet")
    expect(filters.type).toBe("EXPENSE")
    expect(filters.status).toBe("PENDING")
    expect(filters.categoryId).toBe(12)
    expect(filters.accountId).toBe(3)
    expect(filters.creditCardId).toBe(8)
    expect(filters.periodStart).toBeInstanceOf(Date)
    expect(filters.periodEnd).toBeInstanceOf(Date)
    expect(filters.page).toBe(2)
    expect(filters.pageSize).toBe(25)
  })
})
