// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TransferCreateForm } from '@/components/transfers/TransferCreateForm'

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
}))

const fetchMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerMock.push,
    back: routerMock.back,
  }),
}))

describe('transfer create form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    cleanup()
  })

  it('submits the transfer payload and redirects back to the transfers list', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 91 }),
    })

    render(
      <TransferCreateForm
        accounts={[
          { id: 11, name: 'Conta principal' },
          { id: 22, name: 'Reserva' },
        ]}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Conta de origem'), '11')
    await user.selectOptions(screen.getByLabelText('Conta de destino'), '22')
    await user.type(screen.getByLabelText('Valor'), '150.75')
    await user.type(screen.getByLabelText('Descrição'), 'Aporte mensal')
    await user.type(screen.getByLabelText('Competência'), '2026-04-01')
    await user.type(screen.getByLabelText('Vencimento'), '2026-04-01')
    await user.click(screen.getByRole('button', { name: 'Salvar transferência' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/transfers',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      sourceAccountId: 11,
      destinationAccountId: 22,
      amount: '150.75',
      description: 'Aporte mensal',
      competenceDate: '2026-04-01',
      dueDate: '2026-04-01',
    })
    expect(routerMock.push).toHaveBeenCalledWith('/dashboard/transfers')
  })
})
