import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  transaction: {
    findMany: vi.fn(),
    groupBy: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('dashboard service alignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queries transactions by competenceDate for the monthly summary', async () => {
    const { getFinanceSummary } = await import('@/services/dashboardService')

    prismaMock.transaction.findMany.mockResolvedValueOnce([
      { type: 'INCOME', value: '100.00' },
      { type: 'EXPENSE', value: '25.00' },
    ])

    await getFinanceSummary('user-1', '2026-03')

    expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        userId: 'user-1',
        status: { not: 'CANCELED' },
        competenceDate: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      }),
    })
  })

  it('groups categories by competenceDate for the monthly totals', async () => {
    const { getCategoryTotals } = await import('@/services/dashboardService')

    prismaMock.transaction.groupBy.mockResolvedValueOnce([])

    await getCategoryTotals('user-1', '2026-03')

    expect(prismaMock.transaction.groupBy).toHaveBeenCalledWith({
      by: ['categoryId'],
      where: expect.objectContaining({
        userId: 'user-1',
        status: { not: 'CANCELED' },
        competenceDate: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      }),
      _sum: { value: true },
      orderBy: { _sum: { value: 'desc' } },
    })
  })

  it('lists available months from competenceDate values', async () => {
    const { getAvailableMonths } = await import('@/services/dashboardService')

    prismaMock.transaction.findMany.mockResolvedValueOnce([
      { competenceDate: new Date('2026-01-10T00:00:00.000Z') },
      { competenceDate: new Date('2026-03-02T00:00:00.000Z') },
    ])

    await expect(getAvailableMonths('user-1')).resolves.toEqual(['2026-01', '2026-03'])

    expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: { not: 'CANCELED' } },
      orderBy: { competenceDate: 'asc' },
      select: { competenceDate: true },
    })
  })
})
