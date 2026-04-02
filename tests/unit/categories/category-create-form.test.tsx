// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
}))

const categories = [
  {
    id: 1,
    name: 'Moradia',
    type: 'EXPENSE' as const,
    parentId: null,
    active: true,
  },
  {
    id: 2,
    name: 'Salário',
    type: 'INCOME' as const,
    parentId: null,
    active: true,
  },
]

describe('CategoryCreateForm', () => {
  beforeEach(() => {
    routerMock.push.mockReset()
    routerMock.refresh.mockReset()
    vi.stubGlobal('fetch', vi.fn())
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

  function getSelectTrigger(labelText: string) {
    const label = screen.getByText(labelText, { selector: 'label' })
    const field = label.closest('div.space-y-2')

    if (!field) {
      throw new Error(`Missing field wrapper for select "${labelText}"`)
    }

    const trigger = within(field).getByRole('combobox', { name: labelText })
    const triggerId = trigger.getAttribute('id')

    if (!triggerId) {
      throw new Error(`Missing trigger id for select "${labelText}"`)
    }

    const element = document.getElementById(triggerId)

    if (!element) {
      throw new Error(`Missing select trigger element for "${labelText}"`)
    }

    return element
  }

  async function selectOption(user: ReturnType<typeof userEvent.setup>, labelText: string, optionText: string) {
    await user.click(getSelectTrigger(labelText))
    await user.click(await screen.findByRole('option', { name: optionText }))
  }

  it('submits category data and redirects after success', async () => {
    const fetchMock = vi.mocked(globalThis.fetch)
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 10, name: 'Academia' }),
    } as never)

    const { CategoryCreateForm } = await import('@/components/categories/CategoryCreateForm')
    render(<CategoryCreateForm categories={categories} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'Academia')
    await selectOption(user, 'Tipo', 'Despesa')
    await selectOption(user, 'Categoria pai', 'Moradia')
    await user.click(screen.getByRole('button', { name: 'Salvar categoria' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/categories',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, requestInit] = fetchMock.mock.calls[0]
    expect(JSON.parse((requestInit as RequestInit).body as string)).toEqual({
      name: 'Academia',
      type: 'EXPENSE',
      parentId: 1,
    })
    expect(routerMock.push).toHaveBeenCalledWith('/dashboard/categories')
    expect(routerMock.refresh).toHaveBeenCalled()
  }, 10000)
})
