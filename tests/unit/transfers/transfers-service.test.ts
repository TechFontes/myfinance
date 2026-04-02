import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createTransferForUser,
  getTransferByUser,
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
  account: {
    findMany: vi.fn(),
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
    prismaMock.transfer.findMany.mockResolvedValue([{ id: 1, amount: '10.00' }] as never)

    await listTransfersByUser('user-1')

    expect(prismaMock.transfer.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ competenceDate: 'desc' }, { createdAt: 'desc' }],
    })
  })

  it('creates an internal transfer with planned status by default', async () => {
    prismaMock.account.findMany.mockResolvedValue([
      { id: 10 },
      { id: 11 },
    ] as never)
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

    expect(prismaMock.account.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        id: {
          in: [10, 11],
        },
      },
      select: { id: true },
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

  it('loads a transfer by id only for the owning user', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({
      id: 8,
      userId: 'user-1',
      sourceAccountId: 10,
      destinationAccountId: 11,
      amount: '90.00',
      description: 'Ajuste interno',
      competenceDate: new Date('2026-04-01'),
      dueDate: new Date('2026-04-02'),
      paidAt: null,
      status: 'PENDING',
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-01T00:00:00.000Z'),
    } as never)

    const transfer = await getTransferByUser('user-1', 8)

    expect(prismaMock.transfer.findFirst).toHaveBeenCalledWith({
      where: { id: 8, userId: 'user-1' },
    })
    expect(transfer).toMatchObject({
      id: 8,
      sourceAccountId: 10,
      destinationAccountId: 11,
      amount: '90.00',
      status: 'PENDING',
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
    prismaMock.account.findMany.mockResolvedValue([
      { id: 10 },
      { id: 11 },
    ] as never)
    prismaMock.transfer.findFirst.mockResolvedValue({
      id: 5,
      userId: 'user-1',
      sourceAccountId: 10,
      destinationAccountId: 11,
    })
    prismaMock.transfer.update.mockResolvedValue({
      id: 5,
      amount: '150.00',
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
    expect(prismaMock.account.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        id: {
          in: [10, 11],
        },
      },
      select: { id: true },
    })
    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        sourceAccountId: undefined,
        destinationAccountId: undefined,
        amount: undefined,
        description: undefined,
        competenceDate: undefined,
        dueDate: undefined,
        status: 'PAID',
        paidAt: new Date('2026-03-31'),
      },
    })
    expect(result?.status).toBe('PAID')
  })
})
