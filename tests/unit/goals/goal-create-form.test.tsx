// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GoalCreateForm } from '@/components/goals/GoalCreateForm'

const routerMock = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}))

const fetchMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerMock.replace,
    refresh: routerMock.refresh,
  }),
}))

const elementPrototype = HTMLElement.prototype as HTMLElement & {
  hasPointerCapture?: (pointerId: number) => boolean
  releasePointerCapture?: (pointerId: number) => void
  setPointerCapture?: (pointerId: number) => void
  scrollIntoView?: (options?: ScrollIntoViewOptions) => void
}

const originalHasPointerCapture = elementPrototype.hasPointerCapture
const originalReleasePointerCapture = elementPrototype.releasePointerCapture
const originalSetPointerCapture = elementPrototype.setPointerCapture
const originalScrollIntoView = elementPrototype.scrollIntoView

function applyElementShims() {
  elementPrototype.hasPointerCapture = () => false
  elementPrototype.releasePointerCapture = () => undefined
  elementPrototype.setPointerCapture = () => undefined
  elementPrototype.scrollIntoView = () => undefined
}

function restoreElementShims() {
  const restorations: Array<[keyof typeof elementPrototype, ((...args: never[]) => unknown) | undefined]> = [
    ['hasPointerCapture', originalHasPointerCapture],
    ['releasePointerCapture', originalReleasePointerCapture],
    ['setPointerCapture', originalSetPointerCapture],
    ['scrollIntoView', originalScrollIntoView],
  ]

  for (const [key, original] of restorations) {
    if (original === undefined) {
      delete elementPrototype[key]
      continue
    }

    elementPrototype[key] = original as never
  }
}

function getSelectField(labelText: string) {
  const label = screen.getByText(labelText, { selector: 'label' })
  const field = label.closest('div.space-y-2')

  if (!field) {
    throw new Error(`Missing field wrapper for select "${labelText}"`)
  }

  return field
}

function getSelectTrigger(labelText: string) {
  const field = getSelectField(labelText)
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

describe('goal create form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    applyElementShims()
  })

  afterEach(() => {
    cleanup()
    restoreElementShims()
  })

  it('submits a new goal through POST /api/goals and returns to the list page', async () => {
    const user = userEvent.setup()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 11, name: 'Reserva viagem' }),
    })

    render(
      <GoalCreateForm
        accounts={[
          {
            id: 7,
            name: 'Conta principal',
          },
        ]}
      />,
    )

    await user.type(screen.getByLabelText('Nome'), 'Reserva viagem')
    await user.type(screen.getByLabelText('Meta'), '15000.00')
    await selectOption(user, 'Conta de reserva', 'Conta principal')
    await selectOption(user, 'Status', 'Ativa')
    await user.type(screen.getByLabelText('Descrição'), 'Meta para viagem internacional')
    await user.click(screen.getByRole('button', { name: 'Criar meta' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/goals',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      name: 'Reserva viagem',
      targetAmount: '15000.00',
      reserveAccountId: 7,
      status: 'ACTIVE',
      description: 'Meta para viagem internacional',
    })
    expect(routerMock.replace).toHaveBeenCalledWith('/dashboard/goals')
    expect(routerMock.refresh).toHaveBeenCalled()
  })

  it('sends null reserve account and default active status when optional fields are left empty', async () => {
    const user = userEvent.setup()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 12, name: 'Reserva emergência' }),
    })

    render(<GoalCreateForm accounts={[]} />)

    await user.type(screen.getByLabelText('Nome'), 'Reserva emergência')
    await user.type(screen.getByLabelText('Meta'), '25000.00')
    await user.click(screen.getByRole('button', { name: 'Criar meta' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      name: 'Reserva emergência',
      targetAmount: '25000.00',
      reserveAccountId: null,
      status: 'ACTIVE',
      description: null,
    })
  })

  it('supports edit mode through PATCH with prefilled values', async () => {
    const user = userEvent.setup()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 12, name: 'Reserva ajustada' }),
    })

    render(
      <GoalCreateForm
        accounts={[
          {
            id: 7,
            name: 'Conta principal',
          },
        ]}
        initialValues={{
          id: 12,
          name: 'Reserva viagem',
          targetAmount: '15000.00',
          reserveAccountId: 7,
          status: 'ACTIVE',
          description: 'Meta para viagem internacional',
        }}
        mode="edit"
      />,
    )

    const nameInput = screen.getByLabelText('Nome')
    await user.clear(nameInput)
    await user.type(nameInput, 'Reserva ajustada')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/goals/12',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      id: 12,
      name: 'Reserva ajustada',
      targetAmount: '15000.00',
      reserveAccountId: 7,
      status: 'ACTIVE',
      description: 'Meta para viagem internacional',
    })
    expect(routerMock.replace).toHaveBeenCalledWith('/dashboard/goals')
    expect(routerMock.refresh).toHaveBeenCalled()
  })
})
