import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const categoriesMock = vi.hoisted(() => ({
  listCategoriesByUser: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  listTransactionsByUser: vi.fn(),
  createTransactionForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/categories/service', () => categoriesMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)

import { POST as commitPOST } from '@/api/imports/transactions/commit/route'
import { POST as previewPOST } from '@/api/imports/transactions/preview/route'

describe('csv import api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized when preview is requested without a session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await previewPOST(
      new Request('http://localhost/api/imports/transactions/preview', {
        method: 'POST',
        body: JSON.stringify({ text: 'type,description\nEXPENSE,Uber' }),
      }) as never,
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('builds a preview token and surfaces duplicates plus pending category mappings', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([{ id: 11, name: 'Alimentação' }])
    transactionsMock.listTransactionsByUser.mockResolvedValue([
      {
        type: 'EXPENSE',
        description: 'Uber',
        value: '27.50',
        competenceDate: new Date('2026-03-01T00:00:00.000Z'),
        dueDate: new Date('2026-03-02T00:00:00.000Z'),
      },
    ])

    const response = await previewPOST(
      new Request('http://localhost/api/imports/transactions/preview', {
        method: 'POST',
        body: JSON.stringify({
          text: [
            'type,description,value,categoryName,competenceDate,dueDate,status,fixed',
            'EXPENSE,Uber,27.50,Alimentação,2026-03-01,2026-03-02,PENDING,true',
            'EXPENSE,Taxi,15.00,Transporte Urbano,2026-03-03,2026-03-04,PENDING,false',
          ].join('\n'),
        }),
      }) as never,
    )

    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.previewToken).toEqual(expect.any(String))
    expect(payload.preview.readyToCommit).toBe(false)
    expect(payload.preview.summary).toMatchObject({
      totalRows: 2,
      readyRows: 0,
      invalidRows: 2,
      missingCategoryRows: 1,
      duplicateRows: 1,
    })
    expect(payload.preview.possibleDuplicates).toEqual(
      expect.arrayContaining([expect.objectContaining({ lineNumber: 2 })]),
    )
    expect(payload.preview.pendingCategoryMappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceName: 'Transporte Urbano',
          needsMapping: true,
        }),
      ]),
    )
  })

  it('returns unauthorized when commit is requested without a session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await commitPOST(
      new Request('http://localhost/api/imports/transactions/commit', {
        method: 'POST',
        body: JSON.stringify({ previewToken: 'token' }),
      }) as never,
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('commits reviewed rows while skipping unaccepted duplicates', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([{ id: 11, name: 'Alimentação' }])
    transactionsMock.listTransactionsByUser.mockResolvedValue([])
    transactionsMock.createTransactionForUser
      .mockResolvedValueOnce({ id: 101, description: 'Mercado' })
      .mockResolvedValueOnce({ id: 102, description: 'Café' })

    const previewResponse = await previewPOST(
      new Request('http://localhost/api/imports/transactions/preview', {
        method: 'POST',
        body: JSON.stringify({
          text: [
            'type,description,value,categoryName,competenceDate,dueDate,status,fixed',
            'EXPENSE,Mercado,150.00,Alimentação,2026-03-01,2026-03-02,PENDING,false',
            'EXPENSE,Mercado,150.00,Alimentação,2026-03-01,2026-03-02,PENDING,false',
            'EXPENSE,Café,12.00,Alimentação,2026-03-03,2026-03-04,PENDING,false',
          ].join('\n'),
        }),
      }) as never,
    )
    const previewPayload = await previewResponse.json()

    const commitResponse = await commitPOST(
      new Request('http://localhost/api/imports/transactions/commit', {
        method: 'POST',
        body: JSON.stringify({
          previewToken: previewPayload.previewToken,
          acceptedDuplicateLineNumbers: [],
          categoryMappings: [],
        }),
      }) as never,
    )
    const commitPayload = await commitResponse.json()

    expect(commitResponse.status).toBe(201)
    expect(transactionsMock.createTransactionForUser).toHaveBeenCalledTimes(1)
    expect(transactionsMock.createTransactionForUser).toHaveBeenCalledWith('user-1', {
      type: 'EXPENSE',
      description: 'Café',
      value: '12.00',
      categoryId: 11,
      accountId: null,
      creditCardId: null,
      invoiceId: null,
      competenceDate: new Date('2026-03-03T00:00:00.000Z'),
      dueDate: new Date('2026-03-04T00:00:00.000Z'),
      paidAt: null,
      status: 'PENDING',
      fixed: false,
      installment: null,
      installments: null,
    })
    expect(commitPayload).toMatchObject({
      committedRows: 1,
      skippedRows: [
        expect.objectContaining({ line: 2 }),
        expect.objectContaining({ line: 3 }),
      ],
    })
  })

  it('rejects invalid preview tokens on commit', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([{ id: 11, name: 'Alimentação' }])

    const response = await commitPOST(
      new Request('http://localhost/api/imports/transactions/commit', {
        method: 'POST',
        body: JSON.stringify({ previewToken: 'malformed-token' }),
      }) as never,
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid preview token' })
  })
})
