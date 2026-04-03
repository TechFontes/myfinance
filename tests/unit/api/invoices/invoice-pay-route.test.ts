import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const serviceMock = vi.hoisted(() => ({
  payInvoiceForUserE2E: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/invoices/service', () => serviceMock)

import { POST } from '@/api/invoices/[invoiceId]/pay/route'

function makeRequest(body: object) {
  return new Request('http://localhost/api/invoices/10/pay', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }) as never
}

describe('POST /api/invoices/[invoiceId]/pay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 and pays the invoice successfully', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    serviceMock.payInvoiceForUserE2E.mockResolvedValue({ id: 10, status: 'PAID' })

    const response = await POST(
      makeRequest({ accountId: 1, categoryId: 5, paidAt: '2026-04-10' }),
      { params: Promise.resolve({ invoiceId: '10' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ id: 10, status: 'PAID' })
    expect(serviceMock.payInvoiceForUserE2E).toHaveBeenCalledWith(
      'user-1', 10, { accountId: 1, categoryId: 5, paidAt: expect.any(Date) },
    )
  })

  it('returns 401 when user is not authenticated', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await POST(
      makeRequest({ accountId: 1, categoryId: 5, paidAt: '2026-04-10' }),
      { params: Promise.resolve({ invoiceId: '10' }) },
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 400 when accountId is missing', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const response = await POST(
      makeRequest({ paidAt: '2026-04-10' }),
      { params: Promise.resolve({ invoiceId: '10' }) },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'accountId is required' })
  })

  it('returns 404 when invoice is not found', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    serviceMock.payInvoiceForUserE2E.mockResolvedValue(null)

    const response = await POST(
      makeRequest({ accountId: 1, categoryId: 5, paidAt: '2026-04-10' }),
      { params: Promise.resolve({ invoiceId: '999' }) },
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Invoice not found' })
  })

  it('returns 400 when service throws an error', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    serviceMock.payInvoiceForUserE2E.mockRejectedValue(
      Object.assign(new Error('Cannot pay invoice with status PAID'), { code: 'INVALID_STATUS' }),
    )

    const response = await POST(
      makeRequest({ accountId: 1, categoryId: 5, paidAt: '2026-04-10' }),
      { params: Promise.resolve({ invoiceId: '10' }) },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Cannot pay invoice with status PAID' })
  })

  it('returns 400 for invalid invoice ID', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const response = await POST(
      makeRequest({ accountId: 1, categoryId: 5, paidAt: '2026-04-10' }),
      { params: Promise.resolve({ invoiceId: 'abc' }) },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid invoice ID' })
  })
})
