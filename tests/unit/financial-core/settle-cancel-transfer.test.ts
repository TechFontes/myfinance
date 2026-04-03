import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  transfer: { findFirst: vi.fn(), update: vi.fn() },
}))
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import { settleTransferForUser, cancelTransferForUser } from '@/modules/transfers/service'

describe('settleTransferForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('settles a PLANNED transfer', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({ id: 5, userId: 'user-1', status: 'PLANNED' })
    prismaMock.transfer.update.mockResolvedValue({
      id: 5, userId: 'user-1', sourceAccountId: 1, destinationAccountId: 2,
      amount: '100.00', description: null, competenceDate: new Date('2026-04-01'),
      dueDate: new Date('2026-04-02'), paidAt: new Date('2026-04-02'),
      status: 'PAID', createdAt: new Date(), updatedAt: new Date(),
    })

    const result = await settleTransferForUser('user-1', 5, { paidAt: new Date('2026-04-02') })

    expect(result).not.toBeNull()
    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { status: 'PAID', paidAt: new Date('2026-04-02') },
    })
  })

  it('rejects settlement of PAID transfer', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({ id: 5, userId: 'user-1', status: 'PAID' })

    await expect(settleTransferForUser('user-1', 5, { paidAt: new Date() })).rejects.toThrow(
      'Cannot settle transfer with status PAID',
    )
  })

  it('rejects settlement of CANCELED transfer', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({ id: 5, userId: 'user-1', status: 'CANCELED' })

    await expect(settleTransferForUser('user-1', 5, { paidAt: new Date() })).rejects.toThrow(
      'Cannot settle transfer with status CANCELED',
    )
  })

  it('returns null when not found', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue(null)

    const result = await settleTransferForUser('user-1', 999, { paidAt: new Date() })
    expect(result).toBeNull()
  })
})

describe('cancelTransferForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cancels a transfer (only changes status)', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({ id: 5, userId: 'user-1', status: 'PAID' })
    prismaMock.transfer.update.mockResolvedValue({
      id: 5, userId: 'user-1', sourceAccountId: 1, destinationAccountId: 2,
      amount: '100.00', description: null, competenceDate: new Date('2026-04-01'),
      dueDate: new Date('2026-04-02'), paidAt: new Date('2026-04-02'),
      status: 'CANCELED', createdAt: new Date(), updatedAt: new Date(),
    })

    const result = await cancelTransferForUser('user-1', 5)

    expect(result).not.toBeNull()
    expect(prismaMock.transfer.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { status: 'CANCELED' },
    })
  })

  it('rejects cancellation of already CANCELED transfer', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue({ id: 5, userId: 'user-1', status: 'CANCELED' })

    await expect(cancelTransferForUser('user-1', 5)).rejects.toThrow(
      'Transfer is already canceled',
    )
  })

  it('returns null when not found', async () => {
    prismaMock.transfer.findFirst.mockResolvedValue(null)

    const result = await cancelTransferForUser('user-1', 999)
    expect(result).toBeNull()
  })
})
