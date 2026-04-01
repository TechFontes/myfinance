import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const adminMock = vi.hoisted(() => ({
  listAdminUsers: vi.fn(),
  updateAdminUser: vi.fn(),
  blockUserForAdmin: vi.fn(),
  unblockUserForAdmin: vi.fn(),
  getAdminFinancialOverview: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/admin/service', () => adminMock)

import { GET as listUsersGET } from '@/api/admin/users/route'
import { PATCH as updateUserPATCH } from '@/api/admin/users/[userId]/route'
import {
  DELETE as unblockUserDELETE,
  POST as blockUserPOST,
} from '@/api/admin/users/[userId]/block/route'
import { GET as financialOverviewGET } from '@/api/admin/users/[userId]/financial-overview/route'

describe('admin api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized without a session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await listUsersGET()
    expect(response).toBeDefined()
    if (!response) return

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns forbidden for non-admin sessions', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1', role: 'USER' })

    const response = await listUsersGET()
    expect(response).toBeDefined()
    if (!response) return

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'Forbidden' })
  })

  it('lists users for an admin session', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    adminMock.listAdminUsers.mockResolvedValue([{ id: 'user-1', email: 'ana@example.com' }])

    const response = await listUsersGET()
    expect(response).toBeDefined()
    if (!response) return

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([{ id: 'user-1', email: 'ana@example.com' }])
  })

  it('updates administrative user data without mutating password or finances', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    adminMock.updateAdminUser.mockResolvedValue({
      id: 'user-1',
      name: 'Ana Admin',
      email: 'ana.admin@example.com',
    })

    const response = await updateUserPATCH(
      new Request('http://localhost/api/admin/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Ana Admin',
          email: 'ana.admin@example.com',
          role: 'ADMIN',
          password: 'should-not-be-allowed',
        }),
      }) as never,
      { params: Promise.resolve({ userId: 'user-1' }) },
    )
    expect(response).toBeDefined()
    if (!response) return

    expect(response.status).toBe(200)
    expect(adminMock.updateAdminUser).toHaveBeenCalledWith('user-1', {
      name: 'Ana Admin',
      email: 'ana.admin@example.com',
      role: 'ADMIN',
    })
  })

  it('blocks a user with a reason and unblocks via delete', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    adminMock.blockUserForAdmin.mockResolvedValue({
      id: 'user-1',
      blockedReason: 'policy violation',
    })
    adminMock.unblockUserForAdmin.mockResolvedValue({
      id: 'user-1',
      blockedReason: null,
    })

    const blockResponse = await blockUserPOST(
      new Request('http://localhost/api/admin/users/user-1/block', {
        method: 'POST',
        body: JSON.stringify({ reason: 'policy violation' }),
      }) as never,
      { params: Promise.resolve({ userId: 'user-1' }) },
    )
    const unblockResponse = await unblockUserDELETE(
      new Request('http://localhost/api/admin/users/user-1/block', {
        method: 'DELETE',
      }) as never,
      { params: Promise.resolve({ userId: 'user-1' }) },
    )
    expect(blockResponse).toBeDefined()
    expect(unblockResponse).toBeDefined()
    if (!blockResponse || !unblockResponse) return

    expect(blockResponse.status).toBe(200)
    expect(unblockResponse.status).toBe(200)
    expect(adminMock.blockUserForAdmin).toHaveBeenCalledWith('user-1', 'policy violation')
    expect(adminMock.unblockUserForAdmin).toHaveBeenCalledWith('user-1')
  })

  it('returns a read-only financial overview for the requested user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    adminMock.getAdminFinancialOverview.mockResolvedValue({
      user: { id: 'user-1', email: 'ana@example.com' },
      summary: { accounts: 1, cards: 1, transactions: 1, invoices: 1, goals: 1 },
      accounts: [],
      cards: [],
      transactions: { total: 1, items: [] },
      invoices: [],
      goals: [],
    })

    const response = await financialOverviewGET(
      new Request('http://localhost/api/admin/users/user-1/financial-overview') as never,
      { params: Promise.resolve({ userId: 'user-1' }) },
    )
    expect(response).toBeDefined()
    if (!response) return

    expect(response.status).toBe(200)
    expect(adminMock.getAdminFinancialOverview).toHaveBeenCalledWith('user-1')
  })
})
