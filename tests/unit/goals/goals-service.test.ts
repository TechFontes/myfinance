import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  createGoalForUser,
  listGoalsByUser,
  recordGoalContributionForUser,
  updateGoalForUser,
} from '@/modules/goals/service'

const prismaMock = vi.hoisted(() => ({
  goal: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  goalContribution: {
    create: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('goals service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
          { amount: '250.00' },
          { amount: '125.50' },
        ],
      },
    ] as never)

    const goals = await listGoalsByUser('user-1')

    expect(prismaMock.goal.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        contributions: {
          select: { amount: true },
        },
      },
    })
    expect(goals).toEqual([
      expect.objectContaining({
        id: 1,
        name: 'Reserva de emergencia',
        currentAmount: '375.50',
        targetAmount: '10000.00',
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
          select: { amount: true },
        },
      },
    })
  })

  it('updates a goal only for its owner', async () => {
    prismaMock.goal.findFirst.mockResolvedValueOnce({
      id: 9,
      userId: 'user-1',
    })
    prismaMock.goal.update.mockResolvedValueOnce({
      id: 9,
      userId: 'user-1',
      name: 'Meta ajustada',
      targetAmount: '6000.00',
      reserveAccountId: 8,
      status: 'COMPLETED',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const updated = await updateGoalForUser('user-1', 9, {
      name: 'Meta ajustada',
      targetAmount: '6000.00',
      reserveAccountId: 8,
      status: 'COMPLETED',
    })

    expect(prismaMock.goal.findFirst).toHaveBeenCalledWith({
      where: { id: 9, userId: 'user-1' },
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
          select: { amount: true },
        },
      },
    })
    expect(updated?.name).toBe('Meta ajustada')
  })

  it('records a contribution with optional financial reflection', async () => {
    prismaMock.goal.findFirst.mockResolvedValueOnce({
      id: 12,
      userId: 'user-1',
    })
    prismaMock.goalContribution.create.mockResolvedValueOnce({
      id: 31,
      goalId: 12,
      transferId: 44,
      amount: '300.00',
      reflectFinancially: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const contribution = await recordGoalContributionForUser('user-1', {
      goalId: 12,
      amount: '300.00',
      mode: 'TRANSFER_TO_RESERVE',
      note: 'aporte de abril',
      transferId: 44,
    })

    expect(prismaMock.goal.findFirst).toHaveBeenCalledWith({
      where: { id: 12, userId: 'user-1' },
    })
    expect(prismaMock.goalContribution.create).toHaveBeenCalledWith({
      data: {
        goalId: 12,
        amount: '300.00',
        reflectFinancially: true,
        transferId: 44,
      },
    })
    expect(contribution).toMatchObject({
      goalId: 12,
      reflectFinancially: true,
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
      reflectFinancially: false,
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
        reflectFinancially: false,
        transferId: null,
      },
    })
    expect(contribution).toMatchObject({
      goalId: 13,
      reflectFinancially: false,
      transferId: null,
    })
  })
})
