import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  createCardForUser,
  deactivateCardForUser,
  listCardsByUser,
  updateCardForUser,
} from '@/modules/cards/service'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    creditCard: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('cards service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists cards by user ordered by name', async () => {
    vi.mocked(prisma.creditCard.findMany).mockResolvedValue([] as never)

    await listCardsByUser('user-1')

    expect(prisma.creditCard.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
    })
  })

  it('creates a card with PRD defaults', async () => {
    vi.mocked(prisma.creditCard.create).mockResolvedValue({
      id: 1,
      userId: 'user-1',
      name: 'Nubank',
      limit: '5000.00',
      closeDay: 10,
      dueDay: 15,
      color: '#7a2cff',
      icon: 'credit-card',
      active: true,
      createdAt: new Date(),
    } as never)

    await createCardForUser('user-1', {
      name: 'Nubank',
      limit: '5000.00',
      closeDay: 10,
      dueDay: 15,
      color: '#7a2cff',
      icon: 'credit-card',
    })

    expect(prisma.creditCard.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: 'Nubank',
        limit: '5000.00',
        closeDay: 10,
        dueDay: 15,
        active: true,
      },
    })
  })

  it('updates a card only for its owner', async () => {
    vi.mocked(prisma.creditCard.findFirst).mockResolvedValue({
      id: 10,
      userId: 'user-1',
    } as never)
    vi.mocked(prisma.creditCard.update).mockResolvedValue({
      id: 10,
      userId: 'user-1',
      name: 'Cartao atualizado',
      limit: '6000.00',
      closeDay: 12,
      dueDay: 18,
      color: null,
      icon: null,
      active: false,
      createdAt: new Date(),
    } as never)

    const updated = await updateCardForUser('user-1', 10, {
      name: 'Cartao atualizado',
      limit: '6000.00',
      closeDay: 12,
      dueDay: 18,
      active: false,
    })

    expect(prisma.creditCard.findFirst).toHaveBeenCalledWith({
      where: { id: 10, userId: 'user-1' },
    })
    expect(prisma.creditCard.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        name: 'Cartao atualizado',
        limit: '6000.00',
        closeDay: 12,
        dueDay: 18,
        active: false,
      },
    })
    expect(updated?.name).toBe('Cartao atualizado')
  })

  it('returns null when updating a missing card', async () => {
    vi.mocked(prisma.creditCard.findFirst).mockResolvedValue(null)

    const updated = await deactivateCardForUser('user-1', 10)

    expect(updated).toBeNull()
    expect(prisma.creditCard.update).not.toHaveBeenCalled()
  })
})
