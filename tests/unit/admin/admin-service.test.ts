import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  account: {
    findMany: vi.fn(),
  },
  creditCard: {
    findMany: vi.fn(),
  },
  transaction: {
    findMany: vi.fn(),
  },
  invoice: {
    findMany: vi.fn(),
  },
  goal: {
    findMany: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('admin service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists administrative user records with essential fields only', async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      {
        id: 'user-1',
        name: 'Ana',
        email: 'ana@example.com',
        role: 'USER',
        blockedAt: null,
        blockedReason: null,
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-02T00:00:00.000Z'),
      },
    ])

    const { listAdminUsers } = await import('@/modules/admin/service')
    const users = await listAdminUsers()

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: 'desc' }, { email: 'asc' }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blockedAt: true,
        blockedReason: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    expect(users).toEqual([
      expect.objectContaining({
        id: 'user-1',
        email: 'ana@example.com',
        role: 'USER',
      }),
    ])
  })

  it('updates only administrative user fields', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'user-1' })
    prismaMock.user.update.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Ana Admin',
      email: 'ana.admin@example.com',
      role: 'ADMIN',
    })

    const { updateAdminUser } = await import('@/modules/admin/service')
    const updated = await updateAdminUser('user-1', {
      name: 'Ana Admin',
      email: 'ana.admin@example.com',
      role: 'ADMIN',
    })

    expect(updated).toEqual(
      expect.objectContaining({
        name: 'Ana Admin',
        email: 'ana.admin@example.com',
        role: 'ADMIN',
      }),
    )
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        name: 'Ana Admin',
        email: 'ana.admin@example.com',
        role: 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blockedAt: true,
        blockedReason: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  })

  it('blocks and unblocks users with a reason', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'user-1' })
    prismaMock.user.update.mockResolvedValueOnce({
      id: 'user-1',
      blockedAt: new Date('2026-03-31T00:00:00.000Z'),
      blockedReason: 'policy violation',
    })
    prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'user-1' })
    prismaMock.user.update.mockResolvedValueOnce({
      id: 'user-1',
      blockedAt: null,
      blockedReason: null,
    })

    const { blockUserForAdmin, unblockUserForAdmin } = await import('@/modules/admin/service')
    const blocked = await blockUserForAdmin('user-1', 'policy violation')
    const unblocked = await unblockUserForAdmin('user-1')

    expect(blocked).toEqual(
      expect.objectContaining({
        blockedReason: 'policy violation',
      }),
    )
    expect(unblocked).toEqual(
      expect.objectContaining({
        blockedAt: null,
        blockedReason: null,
      }),
    )
  })

  it('returns a read-only financial overview for the requested user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      role: 'USER',
      blockedAt: null,
      blockedReason: null,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-02T00:00:00.000Z'),
    })
    prismaMock.account.findMany.mockResolvedValueOnce([
      { id: 1, name: 'Conta principal', type: 'BANK', active: true, initialBalance: '100.00' },
    ])
    prismaMock.creditCard.findMany.mockResolvedValueOnce([
      { id: 2, name: 'Cartão', active: true, limit: '3000.00', dueDay: 10, closeDay: 5 },
    ])
    prismaMock.transaction.findMany.mockResolvedValueOnce([
      {
        id: 3,
        type: 'EXPENSE',
        description: 'Mercado',
        value: '80.00',
        status: 'PAID',
        competenceDate: new Date('2026-03-10T00:00:00.000Z'),
        dueDate: new Date('2026-03-12T00:00:00.000Z'),
      },
    ])
    prismaMock.invoice.findMany.mockResolvedValueOnce([
      { id: 4, month: 3, year: 2026, status: 'OPEN', total: '80.00', dueDate: new Date('2026-03-20T00:00:00.000Z') },
    ])
    prismaMock.goal.findMany.mockResolvedValueOnce([
      { id: 5, name: 'Reserva', targetAmount: '1000.00', status: 'ACTIVE', reserveAccountId: null },
    ])

    const { getAdminFinancialOverview } = await import('@/modules/admin/service')
    const overview = await getAdminFinancialOverview('user-1')

    expect(overview).not.toBeNull()
    if (!overview) {
      return
    }

    expect(overview.user.email).toBe('ana@example.com')
    expect(overview.summary).toMatchObject({
      accounts: 1,
      activeAccounts: 1,
      cards: 1,
      activeCards: 1,
      transactions: 1,
      invoices: 1,
      goals: 1,
    })
    expect(overview.accounts).toHaveLength(1)
    expect(overview.transactions.items).toHaveLength(1)
    expect(overview.cards).toHaveLength(1)
    expect(overview.invoices).toHaveLength(1)
    expect(overview.goals).toHaveLength(1)
  })
})
