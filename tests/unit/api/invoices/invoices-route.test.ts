import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const invoicesMock = vi.hoisted(() => ({
  listInvoicesByCard: vi.fn(),
}))

const prismaMock = vi.hoisted(() => ({
  invoice: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/invoices/service', () => invoicesMock)
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import { GET } from '@/api/invoices/route'
import { GET as GET_BY_ID, PATCH } from '@/api/invoices/[invoiceId]/route'

describe('invoices api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized for requests without session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/api/invoices?creditCardId=1') as never)

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('lists invoices for a credit card when authenticated', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    invoicesMock.listInvoicesByCard.mockResolvedValue([{ id: 1, total: '120.00' }])

    const response = await GET(new Request('http://localhost/api/invoices?creditCardId=7') as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(invoicesMock.listInvoicesByCard).toHaveBeenCalledWith(7)
    expect(payload).toEqual([{ id: 1, total: '120.00' }])
  })

  it('returns bad request when creditCardId is missing from the list route', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const response = await GET(new Request('http://localhost/api/invoices') as never)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'creditCardId is required' })
  })

  it('returns the invoice detail for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10,
      status: 'OPEN',
      creditCardId: 7,
    })

    const response = await GET_BY_ID(
      new Request('http://localhost/api/invoices/10') as never,
      { params: { invoiceId: '10' } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(prismaMock.invoice.findFirst).toHaveBeenCalled()
    expect(payload).toEqual({
      id: 10,
      status: 'OPEN',
      creditCardId: 7,
    })
  })

  it('returns not found when the invoice does not belong to the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    prismaMock.invoice.findFirst.mockResolvedValue(null)

    const response = await GET_BY_ID(
      new Request('http://localhost/api/invoices/999') as never,
      { params: { invoiceId: '999' } },
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not found' })
  })

  it('updates an invoice status for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10,
      status: 'OPEN',
      creditCardId: 7,
    })
    prismaMock.invoice.update.mockResolvedValue({
      id: 10,
      status: 'PAID',
      creditCardId: 7,
    })

    const response = await PATCH(
      new Request('http://localhost/api/invoices/10', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 10,
          status: 'PAID',
        }),
      }) as never,
      { params: { invoiceId: '10' } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(prismaMock.invoice.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        status: 'PAID',
      },
    })
    expect(payload).toEqual({
      id: 10,
      status: 'PAID',
      creditCardId: 7,
    })
  })

  it('returns a validation error when trying to send an unsupported source account with invoice updates', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10,
      status: 'OPEN',
      creditCardId: 7,
    })

    const response = await PATCH(
      new Request('http://localhost/api/invoices/10', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 10,
          status: 'PAID',
          sourceAccountId: 2,
        }),
      }) as never,
      { params: { invoiceId: '10' } },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Unsupported invoice update field: sourceAccountId',
    })
  })
})
