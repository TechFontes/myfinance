import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  createAccountForUser,
  deactivateAccountForUser,
  listAccountsByUser,
  updateAccountForUser,
} from '@/modules/accounts/service'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    account: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('account service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists accounts by user ordered by name', async () => {
    vi.mocked(prisma.account.findMany).mockResolvedValue([] as never)

    await listAccountsByUser('user-1')

    expect(prisma.account.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
    })
  })

  it('creates account with defaults for initial balance and active state', async () => {
    vi.mocked(prisma.account.create).mockResolvedValue({
      id: 1,
      userId: 'user-1',
      name: 'Nubank',
      type: 'BANK',
      initialBalance: '0.00',
      institution: null,
      color: null,
      icon: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    await createAccountForUser('user-1', {
      name: 'Nubank',
      type: 'BANK',
    })

    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: 'Nubank',
        type: 'BANK',
        initialBalance: '0.00',
        institution: null,
        color: null,
        icon: null,
        active: true,
      },
    })
  })

  it('updates an existing account only for its owner', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue({
      id: 10,
      userId: 'user-1',
    } as never)
    vi.mocked(prisma.account.update).mockResolvedValue({
      id: 10,
      userId: 'user-1',
      name: 'Carteira atualizada',
      type: 'WALLET',
      initialBalance: '250.00',
      institution: null,
      color: null,
      icon: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const updated = await updateAccountForUser('user-1', 10, {
      name: 'Carteira atualizada',
      type: 'WALLET',
      initialBalance: '250.00',
    })

    expect(updated?.name).toBe('Carteira atualizada')
    expect(prisma.account.findFirst).toHaveBeenCalledWith({
      where: { id: 10, userId: 'user-1' },
    })
    expect(prisma.account.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        name: 'Carteira atualizada',
        type: 'WALLET',
        initialBalance: '250.00',
        institution: undefined,
        color: undefined,
        icon: undefined,
        active: undefined,
      },
    })
  })

  it('returns null when updating a foreign or missing account', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null)

    const updated = await deactivateAccountForUser('user-1', 10)

    expect(updated).toBeNull()
    expect(prisma.account.update).not.toHaveBeenCalled()
  })
})
