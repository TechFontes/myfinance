// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RecurrenceCreateForm } from '@/components/recurrence/RecurrenceCreateForm'

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}))

const fetchMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
}))

describe('recurrence create form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    cleanup()
  })

  it('submits the normalized recurrence payload through POST /api/recurrence and redirects to the list', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 15 }),
    })

    const user = userEvent.setup()

    render(
      <RecurrenceCreateForm
        options={{
          categories: [
            { id: 1, name: 'Salário', type: 'INCOME' },
            { id: 2, name: 'Academia', type: 'EXPENSE' },
          ],
          accounts: [{ id: 10, name: 'Conta principal' }],
          cards: [{ id: 20, name: 'Cartão Azul' }],
        }}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Tipo'), 'EXPENSE')
    await user.type(screen.getByLabelText('Descrição'), 'Academia')
    await user.type(screen.getByLabelText('Valor'), '120.00')
    await user.selectOptions(screen.getByLabelText('Categoria'), '2')
    await user.selectOptions(screen.getByLabelText('Conta'), '10')
    await user.selectOptions(screen.getByLabelText('Cartão'), '20')
    await user.selectOptions(screen.getByLabelText('Frequência'), 'MONTHLY')
    await user.type(screen.getByLabelText('Dia do mês'), '5')
    await user.type(screen.getByLabelText('Início'), '2026-04-05')
    await user.type(screen.getByLabelText('Fim'), '2026-12-05')
    await user.click(screen.getByRole('button', { name: 'Criar regra' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/recurrence',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      type: 'EXPENSE',
      description: 'Academia',
      value: '120',
      categoryId: 2,
      accountId: 10,
      creditCardId: 20,
      frequency: 'MONTHLY',
      dayOfMonth: 5,
      startDate: '2026-04-05',
      endDate: '2026-12-05',
      active: true,
    })
    expect(routerMock.push).toHaveBeenCalledWith('/dashboard/recurrence')
    expect(routerMock.refresh).toHaveBeenCalledTimes(1)
  })

  it('sends optional ids and dates as null when left empty', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 16 }),
    })

    const user = userEvent.setup()

    render(
      <RecurrenceCreateForm
        options={{
          categories: [{ id: 1, name: 'Salário', type: 'INCOME' }],
          accounts: [],
          cards: [],
        }}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Tipo'), 'INCOME')
    await user.type(screen.getByLabelText('Descrição'), 'Salário')
    await user.type(screen.getByLabelText('Valor'), '5000.00')
    await user.selectOptions(screen.getByLabelText('Categoria'), '1')
    await user.type(screen.getByLabelText('Início'), '2026-04-01')
    await user.click(screen.getByRole('button', { name: 'Criar regra' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      type: 'INCOME',
      description: 'Salário',
      value: '5000',
      categoryId: 1,
      accountId: null,
      creditCardId: null,
      frequency: 'MONTHLY',
      dayOfMonth: null,
      startDate: '2026-04-01',
      endDate: null,
      active: true,
    })
  })
})
