// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routerPushMock = vi.hoisted(() => vi.fn())
const routerRefreshMock = vi.hoisted(() => vi.fn())
const fetchMock = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
    refresh: routerRefreshMock,
  }),
}))

describe('account create form', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    routerPushMock.mockReset()
    routerRefreshMock.mockReset()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(Element.prototype, 'hasPointerCapture', {
      configurable: true,
      value: () => false,
    })
    Object.defineProperty(Element.prototype, 'setPointerCapture', {
      configurable: true,
      value: () => undefined,
    })
    Object.defineProperty(Element.prototype, 'releasePointerCapture', {
      configurable: true,
      value: () => undefined,
    })
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: () => undefined,
    })
  })

  it('renders the required and optional fields for the account payload', async () => {
    const { AccountCreateForm } = await import('@/components/accounts/AccountCreateForm')

    render(<AccountCreateForm />)

    expect(screen.getByText('Cadastro de conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument()
    expect(screen.getByLabelText('Saldo inicial')).toBeInTheDocument()
    expect(screen.getByLabelText('Instituição')).toBeInTheDocument()
    expect(screen.getByLabelText('Cor')).toBeInTheDocument()
    expect(screen.getByLabelText('Ícone')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar conta' })).toBeInTheDocument()
  }, 30000)

  it('submits the account payload and redirects back to the list', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    })

    const { AccountCreateForm } = await import('@/components/accounts/AccountCreateForm')

    const user = userEvent.setup()
    render(<AccountCreateForm />)

    await user.type(screen.getByLabelText('Nome'), 'Nubank')
    await user.type(screen.getByPlaceholderText('0,00'), '1200.50')
    await user.type(screen.getByLabelText('Instituição'), 'Nubank')
    await user.type(screen.getByPlaceholderText('#7a2cff'), '#7a2cff')
    await user.type(screen.getByPlaceholderText('wallet'), 'wallet')
    await user.click(screen.getByRole('button', { name: 'Salvar conta' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/accounts',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      )
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/accounts',
      expect.objectContaining({
        body: JSON.stringify({
          name: 'Nubank',
          type: 'BANK',
          initialBalance: '1200.50',
          institution: 'Nubank',
          color: '#7a2cff',
          icon: 'wallet',
        }),
      }),
    )
    expect(routerPushMock).toHaveBeenCalledWith('/dashboard/accounts')
    expect(routerRefreshMock).toHaveBeenCalledTimes(1)
  }, 10000)
})
