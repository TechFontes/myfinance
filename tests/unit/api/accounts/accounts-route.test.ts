import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const accountsMock = vi.hoisted(() => ({
  listAccountsByUser: vi.fn(),
  createAccountForUser: vi.fn(),
  updateAccountForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/accounts/service', () => accountsMock)

import { GET, POST } from '@/api/accounts/route'
import { PATCH } from '@/api/accounts/[accountId]/route'

describe('accounts api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists accounts for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    accountsMock.listAccountsByUser.mockResolvedValue([{ id: 1, name: 'Conta' }])

    const response = await GET(new Request('http://localhost/api/accounts') as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual([{ id: 1, name: 'Conta' }])
  })

  it('creates an account for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    accountsMock.createAccountForUser.mockResolvedValue({ id: 10, name: 'Nubank' })

    const response = await POST(
      new Request('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify({ name: 'Nubank', type: 'BANK' }),
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(accountsMock.createAccountForUser).toHaveBeenCalledWith('user-1', {
      name: 'Nubank',
      type: 'BANK',
    })
    expect(payload).toEqual({ id: 10, name: 'Nubank' })
  })

  it('updates an account by id for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    accountsMock.updateAccountForUser.mockResolvedValue({ id: 10, name: 'Carteira' })

    const response = await PATCH(
      new Request('http://localhost/api/accounts/10', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Carteira' }),
      }) as never,
      { params: { accountId: '10' } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(accountsMock.updateAccountForUser).toHaveBeenCalledWith('user-1', 10, {
      name: 'Carteira',
    })
    expect(payload).toEqual({ id: 10, name: 'Carteira' })
  })
})
