// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CardCreateForm } from '@/components/cards/CardCreateForm'

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}))

const fetchMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerMock.push,
  }),
}))

describe('card create form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    cleanup()
  })

  it('submits the normalized card payload and redirects to the cards list', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 9 }),
    })

    const user = userEvent.setup()
    render(<CardCreateForm />)

    await user.type(screen.getByLabelText('Nome'), 'Nubank')
    await user.type(screen.getByLabelText('Limite'), '5000.00')
    await user.type(screen.getByLabelText('Dia de fechamento'), '10')
    await user.type(screen.getByLabelText('Dia de vencimento'), '17')
    await user.click(screen.getByRole('button', { name: 'Salvar cartão' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/cards',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      name: 'Nubank',
      limit: '5000.00',
      closeDay: 10,
      dueDay: 17,
      color: null,
      icon: null,
      active: true,
    })
    expect(routerMock.push).toHaveBeenCalledWith('/dashboard/cards')
  })

  it('supports edit mode through PATCH with prefilled values', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 9 }),
    })

    const user = userEvent.setup()
    render(
      <CardCreateForm
        initialValues={{
          id: 9,
          name: 'Nubank',
          limit: '5000.00',
          closeDay: 10,
          dueDay: 17,
          color: '#7a2cff',
          icon: 'credit-card',
          active: true,
        }}
        mode="edit"
      />,
    )

    const nameInput = screen.getByLabelText('Nome')
    await user.clear(nameInput)
    await user.type(nameInput, 'Nubank Black')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/cards/9',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      id: 9,
      name: 'Nubank Black',
      limit: '5000.00',
      closeDay: 10,
      dueDay: 17,
      color: '#7a2cff',
      icon: 'credit-card',
      active: true,
    })
    expect(routerMock.push).toHaveBeenCalledWith('/dashboard/cards')
  })
})
