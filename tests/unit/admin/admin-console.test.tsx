// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AdminConsole } from '@/components/admin/AdminConsole'

afterEach(() => {
  cleanup()
})

describe('admin console', () => {
  it('renders the technical area with users, action buttons and a read-only financial panel', () => {
    render(
      <AdminConsole
        users={[
          {
            id: 'admin-1',
            name: 'Tech Fontes',
            email: 'tech.fontes@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            blockedAt: null,
            blockedReason: null,
            financialSummary: {
              consolidatedBalance: '12500.00',
              forecastBalance: '13200.00',
              realizedBalance: '11850.00',
              pendingCount: 2,
            },
          },
          {
            id: 'user-2',
            name: 'Marina Lima',
            email: 'marina@example.com',
            role: 'USER',
            status: 'BLOCKED',
            blockedAt: '2026-03-20T00:00:00.000Z',
            blockedReason: 'Suporte administrativo',
            financialSummary: {
              consolidatedBalance: '4800.00',
              forecastBalance: '5400.00',
              realizedBalance: '4200.00',
              pendingCount: 5,
            },
          },
        ]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Área administrativa técnica' })).toBeInTheDocument()
    expect(
      screen.getByText('Área separada do dashboard do usuário final, com leitura financeira somente leitura.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tech Fontes' })).toBeInTheDocument()
    expect(screen.getByText('Marina Lima')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bloquear Tech Fontes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desbloquear Marina Lima' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar cadastro de Tech Fontes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Leitura financeira' })).toBeInTheDocument()
    expect(screen.getByText('Somente leitura')).toBeInTheDocument()
    expect(screen.getByText('R$ 12.500,00')).toBeInTheDocument()
    expect(screen.getByText('Pendências')).toBeInTheDocument()
  })

  it('updates the financial panel when another user is selected', async () => {
    render(
      <AdminConsole
        users={[
          {
            id: 'admin-1',
            name: 'Tech Fontes',
            email: 'tech.fontes@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            blockedAt: null,
            blockedReason: null,
            financialSummary: {
              consolidatedBalance: '12500.00',
              forecastBalance: '13200.00',
              realizedBalance: '11850.00',
              pendingCount: 2,
            },
          },
          {
            id: 'user-2',
            name: 'Marina Lima',
            email: 'marina@example.com',
            role: 'USER',
            status: 'BLOCKED',
            blockedAt: '2026-03-20T00:00:00.000Z',
            blockedReason: 'Suporte administrativo',
            financialSummary: {
              consolidatedBalance: '4800.00',
              forecastBalance: '5400.00',
              realizedBalance: '4200.00',
              pendingCount: 5,
            },
          },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ver leitura de Marina Lima' }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Marina Lima' })).toBeInTheDocument(),
    )
    expect(screen.getByText('R$ 4.800,00')).toBeInTheDocument()
    expect(screen.getByText('Bloqueado desde 20/03/2026')).toBeInTheDocument()
  })
})
