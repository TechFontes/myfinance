import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createGoalForUser,
  listGoalsByUser,
  recordGoalContributionForUser,
  updateGoalForUser,
} from '@/modules/goals/service'

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  goal: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  goalContribution: {
    create: vi.fn(),
  },
  transfer: {
    create: vi.fn(),
  },
  account: {
    findFirst: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('goals service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => unknown) =>
      callback(prismaMock as never),
    )
  })

  it('lists goals by user with derived progress from contributions', async () => {
    prismaMock.goal.findMany.mockResolvedValueOnce([
      {
        id: 1,
        userId: 'user-1',
        name: 'Reserva de emergencia',
        targetAmount: '10000.00',
        reserveAccountId: 7,
        status: 'ACTIVE',
        description: 'Meta principal',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        contributions: [
          { amount: '250.00', kind: 'CONTRIBUTION' },
          { amount: '125.50', kind: 'CONTRIBUTION' },
        ],
      },
    ] as never)

    const goals = await listGoalsByUser('user-1')

    expect(prismaMock.goal.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        contributions: {
          select: { amount: true, kind: true },
        },
      },
    })
    expect(goals).toEqual([
      expect.objectContaining({
        id: 1,
        name: 'Reserva de emergencia',
        currentAmount: '375.50',
        targetAmount: '10000.00',
        description: null,
      }),
    ])
  })

  it('creates a goal with PRD defaults', async () => {
    prismaMock.goal.create.mockResolvedValueOnce({
      id: 1,
      userId: 'user-1',
      name: 'Aposentadoria',
      targetAmount: '50000.00',
      reserveAccountId: null,
      status: 'ACTIVE',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    await createGoalForUser('user-1', {
      name: 'Aposentadoria',
      targetAmount: '50000.00',
      description: 'Construir reserva de longo prazo',
    })

    expect(prismaMock.goal.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: 'Aposentadoria',
        targetAmount: '50000.00',
        reserveAccountId: null,
        status: 'ACTIVE',
      },
      include: {
        contributions: {
          select: { amount: true, kind: true },
        },
      },
    })
  })

  it('updates a goal only for its owner', async () => {
    prismaMock.goal.findFirst.mockResolvedValueOnce({
      id: 9,
      userId: 'user-1',
    })
    prismaMock.account.findFirst.mockResolvedValueOnce({
      id: 8,
      userId: 'user-1',
    })
    prismaMock.goal.update.mockResolvedValueOnce({
      id: 9,
      userId: 'user-1',
      name: 'Meta ajustada',
      targetAmount: '6000.00',
      reserveAccountId: 8,
      status: 'COMPLETED',
      description: 'Meta revisada após aporte extra',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const updated = await updateGoalForUser('user-1', 9, {
      name: 'Meta ajustada',
      targetAmount: '6000.00',
      reserveAccountId: 8,
      status: 'COMPLETED',
      description: 'Meta revisada após aporte extra',
    })

    expect(prismaMock.goal.findFirst).toHaveBeenCalledWith({
      where: { id: 9, userId: 'user-1' },
    })
    expect(prismaMock.account.findFirst).toHaveBeenCalledWith({
      where: { id: 8, userId: 'user-1' },
      select: { id: true },
    })
    expect(prismaMock.goal.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: {
        name: 'Meta ajustada',
        targetAmount: '6000.00',
        reserveAccountId: 8,
        status: 'COMPLETED',
      },
      include: {
        contributions: {
          select: { amount: true, kind: true },
        },
      },
    })
    expect(updated).toEqual(
      expect.objectContaining({
        name: 'Meta ajustada',
        description: null,
      }),
    )
  })

  it('records a financial contribution only when the goal has a reserve account', async () => {
    prismaMock.goal.findFirst.mockResolvedValueOnce({
      id: 12,
      userId: 'user-1',
      name: 'Reserva mensal',
      reserveAccountId: 8,
    })
    prismaMock.account.findFirst
      .mockResolvedValueOnce({ id: 4, userId: 'user-1' })
      .mockResolvedValueOnce({ id: 8, userId: 'user-1' })
    prismaMock.transfer.create.mockResolvedValueOnce({
      id: 44,
      userId: 'user-1',
      sourceAccountId: 4,
      destinationAccountId: 8,
      amount: '300.00',
      description: 'Aporte para meta: Reserva mensal',
      competenceDate: new Date('2026-04-10T00:00:00.000Z'),
      dueDate: new Date('2026-04-10T00:00:00.000Z'),
      paidAt: new Date('2026-04-10T00:00:00.000Z'),
      status: 'PAID',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
    prismaMock.goalContribution.create.mockResolvedValueOnce({
      id: 31,
      goalId: 12,
      transferId: 44,
      amount: '300.00',
      kind: 'CONTRIBUTION',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const contribution = await recordGoalContributionForUser('user-1', {
      goalId: 12,
      amount: '300.00',
      kind: 'CONTRIBUTION',
      mode: 'TRANSFER_TO_RESERVE',
      counterpartAccountId: 4,
      movementDate: '2026-04-10',
    })

    expect(prismaMock.goal.findFirst).toHaveBeenCalledWith({
      where: { id: 12, userId: 'user-1' },
    })
    expect(prismaMock.goalContribution.create).toHaveBeenCalledWith({
      data: {
        goalId: 12,
        amount: '300.00',
        kind: 'CONTRIBUTION',
        transferId: 44,
      },
    })
    expect(contribution).toMatchObject({
      goalId: 12,
      kind: 'CONTRIBUTION',
      transferId: 44,
    })
  })

  it('records an informational contribution without linking a transfer', async () => {
    prismaMock.goal.findFirst.mockResolvedValueOnce({
      id: 13,
      userId: 'user-1',
    })
    prismaMock.goalContribution.create.mockResolvedValueOnce({
      id: 32,
      goalId: 13,
      transferId: null,
      amount: '150.00',
      kind: 'CONTRIBUTION',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const contribution = await recordGoalContributionForUser('user-1', {
      goalId: 13,
      amount: '150.00',
      mode: 'INFORMATION_ONLY',
    })

    expect(prismaMock.goalContribution.create).toHaveBeenCalledWith({
      data: {
        goalId: 13,
        amount: '150.00',
        kind: 'CONTRIBUTION',
        transferId: null,
      },
    })
    expect(contribution).toMatchObject({
      goalId: 13,
      kind: 'CONTRIBUTION',
      transferId: null,
    })
  })

  it('creates a paid transfer when contributing financially to a reserve-backed goal', async () => {
    prismaMock.goal.findFirst.mockResolvedValueOnce({
      id: 15,
      userId: 'user-1',
      name: 'Reserva de emergência',
      reserveAccountId: 9,
    })
    prismaMock.account.findFirst
      .mockResolvedValueOnce({ id: 4, userId: 'user-1' })
      .mockResolvedValueOnce({ id: 9, userId: 'user-1' })
    prismaMock.transfer.create.mockResolvedValueOnce({
      id: 77,
      userId: 'user-1',
      sourceAccountId: 4,
      destinationAccountId: 9,
      amount: '300.00',
      description: 'Aporte para meta: Reserva de emergência',
      competenceDate: new Date('2026-04-02T00:00:00.000Z'),
      dueDate: new Date('2026-04-02T00:00:00.000Z'),
      paidAt: new Date('2026-04-02T00:00:00.000Z'),
      status: 'PAID',
      createdAt: new Date('2026-04-02T00:00:00.000Z'),
      updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    } as never)
    prismaMock.goalContribution.create.mockResolvedValueOnce({
      id: 41,
      goalId: 15,
      transferId: 77,
      amount: '300.00',
      kind: 'CONTRIBUTION',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const contribution = await recordGoalContributionForUser('user-1', {
      goalId: 15,
      amount: '300.00',
      kind: 'CONTRIBUTION',
      mode: 'TRANSFER_TO_RESERVE',
      counterpartAccountId: 4,
      movementDate: '2026-04-02',
    })

    expect(prismaMock.transfer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        sourceAccountId: 4,
        destinationAccountId: 9,
        amount: '300.00',
        description: 'Aporte para meta: Reserva de emergência',
        status: 'PAID',
      }),
    })
    expect(prismaMock.goalContribution.create).toHaveBeenCalledWith({
      data: {
        goalId: 15,
        amount: '300.00',
        kind: 'CONTRIBUTION',
        transferId: 77,
      },
    })
    expect(contribution).toMatchObject({
      goalId: 15,
      transferId: 77,
      kind: 'CONTRIBUTION',
    })
  })

  it('creates a paid transfer when withdrawing financially from the reserve account', async () => {
    prismaMock.goal.findFirst.mockResolvedValueOnce({
      id: 16,
      userId: 'user-1',
      name: 'Viagem',
      reserveAccountId: 9,
    })
    prismaMock.account.findFirst
      .mockResolvedValueOnce({ id: 9, userId: 'user-1' })
      .mockResolvedValueOnce({ id: 6, userId: 'user-1' })
    prismaMock.transfer.create.mockResolvedValueOnce({
      id: 88,
      userId: 'user-1',
      sourceAccountId: 9,
      destinationAccountId: 6,
      amount: '120.00',
      description: 'Resgate da meta: Viagem',
      competenceDate: new Date('2026-04-03T00:00:00.000Z'),
      dueDate: new Date('2026-04-03T00:00:00.000Z'),
      paidAt: new Date('2026-04-03T00:00:00.000Z'),
      status: 'PAID',
      createdAt: new Date('2026-04-03T00:00:00.000Z'),
      updatedAt: new Date('2026-04-03T00:00:00.000Z'),
    } as never)
    prismaMock.goalContribution.create.mockResolvedValueOnce({
      id: 42,
      goalId: 16,
      transferId: 88,
      amount: '120.00',
      kind: 'WITHDRAWAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const contribution = await recordGoalContributionForUser('user-1', {
      goalId: 16,
      amount: '120.00',
      kind: 'WITHDRAWAL',
      mode: 'TRANSFER_FROM_RESERVE',
      counterpartAccountId: 6,
      movementDate: '2026-04-03',
    })

    expect(prismaMock.transfer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        sourceAccountId: 9,
        destinationAccountId: 6,
        amount: '120.00',
        description: 'Resgate da meta: Viagem',
        status: 'PAID',
      }),
    })
    expect(contribution).toMatchObject({
      goalId: 16,
      transferId: 88,
      kind: 'WITHDRAWAL',
    })
  })
})
