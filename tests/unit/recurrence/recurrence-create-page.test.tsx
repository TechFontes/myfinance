// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const categoriesMock = vi.hoisted(() => ({
  listCategoriesByUser: vi.fn(),
}))

const accountsMock = vi.hoisted(() => ({
  listAccountsByUser: vi.fn(),
}))

const cardsMock = vi.hoisted(() => ({
  listCardsByUser: vi.fn(),
}))

const formMock = vi.hoisted(() => ({
  RecurrenceCreateForm: vi.fn(
    ({
      options,
    }: {
      options: {
        categories: Array<{ id: number; name: string; type: 'INCOME' | 'EXPENSE' }>
        accounts: Array<{ id: number; name: string }>
        cards: Array<{ id: number; name: string }>
      }
    }) => <div data-testid="recurrence-create-form">{JSON.stringify(options)}</div>,
  ),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/categories/service', () => categoriesMock)
vi.mock('@/modules/accounts/service', () => accountsMock)
vi.mock('@/modules/cards/service', () => cardsMock)
vi.mock('@/components/recurrence/RecurrenceCreateForm', () => formMock)

describe('recurrence create page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads active categories, accounts, and cards with human-friendly names for the create form', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([
      { id: 1, name: 'Salário', type: 'INCOME', active: true },
      { id: 2, name: 'Academia', type: 'EXPENSE', active: true },
      { id: 3, name: 'Arquivada', type: 'EXPENSE', active: false },
    ])
    accountsMock.listAccountsByUser.mockResolvedValue([
      { id: 10, name: 'Conta principal', active: true },
      { id: 11, name: 'Conta inativa', active: false },
    ])
    cardsMock.listCardsByUser.mockResolvedValue([
      { id: 20, name: 'Cartão Azul', active: true },
      { id: 21, name: 'Cartão Antigo', active: false },
    ])

    const { default: RecurrenceCreatePage } = await import('@/dashboard/recurrence/new/page')
    render(await RecurrenceCreatePage())

    expect(categoriesMock.listCategoriesByUser).toHaveBeenCalledWith('user-1')
    expect(accountsMock.listAccountsByUser).toHaveBeenCalledWith('user-1')
    expect(cardsMock.listCardsByUser).toHaveBeenCalledWith('user-1')
    expect(formMock.RecurrenceCreateForm).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          categories: [
            { id: 1, name: 'Salário', type: 'INCOME' },
            { id: 2, name: 'Academia', type: 'EXPENSE' },
          ],
          accounts: [{ id: 10, name: 'Conta principal' }],
          cards: [{ id: 20, name: 'Cartão Azul' }],
        },
      }),
      undefined,
    )
    expect(screen.getByTestId('recurrence-create-form')).toHaveTextContent('Academia')
    expect(screen.getByTestId('recurrence-create-form')).toHaveTextContent('Conta principal')
    expect(screen.getByTestId('recurrence-create-form')).toHaveTextContent('Cartão Azul')
    expect(screen.getByTestId('recurrence-create-form')).not.toHaveTextContent('Arquivada')
    expect(screen.getByTestId('recurrence-create-form')).not.toHaveTextContent('Conta inativa')
    expect(screen.getByTestId('recurrence-create-form')).not.toHaveTextContent('Cartão Antigo')
  })
})
