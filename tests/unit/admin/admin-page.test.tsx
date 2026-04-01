// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const adminMock = vi.hoisted(() => ({
  getAdminFinancialOverview: vi.fn(),
  listAdminUsers: vi.fn(),
}))
const redirectMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/admin/service', () => adminMock)
vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

describe('admin page', () => {
  beforeEach(() => {
    redirectMock.mockReset()
    authMock.getUserFromRequest.mockReset()
    adminMock.listAdminUsers.mockReset()
    adminMock.getAdminFinancialOverview.mockReset()
  })

  it('renders the administrative entry point separate from the user dashboard', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    adminMock.listAdminUsers.mockResolvedValue([
      {
        id: 'admin-1',
        name: 'Tech Fontes',
        email: 'tech.fontes@example.com',
        role: 'ADMIN',
        blockedAt: null,
        blockedReason: null,
        createdAt: new Date('2026-03-31T00:00:00.000Z'),
        updatedAt: new Date('2026-03-31T00:00:00.000Z'),
      },
      {
        id: 'user-2',
        name: 'Marina Lima',
        email: 'marina@example.com',
        role: 'USER',
        blockedAt: new Date('2026-03-20T00:00:00.000Z'),
        blockedReason: 'Suporte administrativo',
        createdAt: new Date('2026-03-30T00:00:00.000Z'),
        updatedAt: new Date('2026-03-31T00:00:00.000Z'),
      },
    ])
    adminMock.getAdminFinancialOverview
      .mockResolvedValueOnce({
        summary: {
          pendingTransactions: 2,
        },
      })
      .mockResolvedValueOnce({
        summary: {
          pendingTransactions: 5,
        },
      })

    const { default: AdminPage } = await import('@/admin/page')
    render(await AdminPage())

    expect(screen.getByRole('heading', { name: 'Área administrativa técnica' })).toBeInTheDocument()
    expect(screen.getByText('Painel exclusivo para operação, suporte e leitura financeira restrita.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Leitura financeira' })).toBeInTheDocument()
    expect(screen.getByText('Somente leitura')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Usuários da plataforma' })).toBeInTheDocument()
    expect(adminMock.listAdminUsers).toHaveBeenCalledTimes(1)
    expect(adminMock.getAdminFinancialOverview).toHaveBeenCalledWith('admin-1')
    expect(adminMock.getAdminFinancialOverview).toHaveBeenCalledWith('user-2')
  }, 10000)

  it('redirects unauthenticated access to login instead of rendering admin chrome', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const { default: AdminPage } = await import('@/admin/page')
    await AdminPage()

    expect(redirectMock).toHaveBeenCalledWith('/login?callbackUrl=%2Fadmin')
    expect(adminMock.listAdminUsers).not.toHaveBeenCalled()
    expect(adminMock.getAdminFinancialOverview).not.toHaveBeenCalled()
  })
})
