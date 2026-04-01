import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  createTransferForUser,
  listTransfersByUser,
  updateTransferForUser,
} from '@/modules/transfers/service'

const prismaMock = vi.hoisted(() => ({
  transfer: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('transfers service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists transfers by user ordered by competence date', async () => {
    prismaMock.transfer.findMany.mockResolvedValue([{ id: 1 }] as never)

    await listTransfersByUser('user-1')

    expect(prismaMock.transfer.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ competenceDate: 'desc' }, { createdAt: 'desc' }],
    })
  })

  it('creates an internal transfer with planned status by default', async () => {
    prismaMock.transfer.create.mockResolvedValue({
      id: 1,
      userId: 'user-1',
      sourceAccountId: 10,
      destinationAccountId: 11,
      amount: '150.00',
      description: 'Reserva mensal',
      competenceDate: new Date('2026-03-31'),
      dueDate: new Date('2026-04-01'),
      paidAt: null,
      status: 'PLANNED',
    } as never)

    await createTransferForUser('user-1', {
      sourceAccountId: 10,
      destinationAccountId: 11,
      amount: '150.00',
      description: 'Reserva mensal',
      competenceDate: '2026-03-31',
      dueDate: '2026-04-01',
    })

    expect(prismaMock.transfer.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        sourceAccountId: 10,
        destinationAccountId: 11,
        amount: '150.00',
        description: 'Reserva mensal',
        competenceDate: new Date('2026-03-31'),
        dueDate: new Date('2026-04-01'),
        paidAt: null,
        status: 'PLANNED',
      },
    })
  })

  it('rejects transfers that reuse the same account on both ends', async () => {
    await expect(
      createTransferForUser('user-1', {
        sourceAccountId: 10,
        destinationAccountId: 10,
        amount: '50.00',
        description: 'Movimentacao invalida',
        competenceDate: '2026-03-31',
        dueDate: '2026-04-01',
      }),
    ).rejects.toMatchObject({
      code: 'TRANSFER_SAME_ACCOUNT',
    })
  })

  it('updates transfers for the owning user', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      sourceAccountId: 10,
      destinationAccountId: 11,
    })
    prismaMock.transfer.update.mockResolvedValue({
      id: 5,
      status: 'PAID',
      paidAt: new Date('2026-03-31'),
    } as never)

    const result = await updateTransferForUser('user-1', 5, {
      status: 'PAID',
      paidAt: '2026-03-31',
    })

    expect(prismaMock.transfer.findFirst).toHaveBeenCalledWith({
      where: { id: 5, userId: 'user-1' },
    })
    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        status: 'PAID',
        paidAt: new Date('2026-03-31'),
      },
    })
    expect(result?.status).toBe('PAID')
  })
})
