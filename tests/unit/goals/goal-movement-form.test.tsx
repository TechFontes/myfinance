// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GoalMovementForm } from '@/components/goals/GoalMovementForm'

const routerMock = vi.hoisted(() => ({
  refresh: vi.fn(),
}))

const fetchMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
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

describe('GoalMovementForm', () => {
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

  it('submits a reserve-backed contribution with the selected source account', async () => {
    const user = userEvent.setup()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 91 }),
    })

    render(
      <GoalMovementForm
        goalId={7}
        goalName="Reserva de emergência"
        reserveAccountId={3}
        action="contribute"
        accounts={[
          { id: 3, name: 'Conta reserva' },
          { id: 9, name: 'Conta principal' },
        ]}
      />,
    )

    await user.type(screen.getByLabelText('Valor'), '250.00')
    await selectOption(user, 'Como registrar', 'Refletir também na conta de reserva')
    await selectOption(user, 'Conta de origem', 'Conta principal')
    fireEvent.change(screen.getByLabelText('Data do movimento'), {
      target: { value: '2026-04-02' },
    })
    await user.click(screen.getByRole('button', { name: 'Confirmar aporte' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/goals/7/contributions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      amount: '250.00',
      kind: 'CONTRIBUTION',
      mode: 'TRANSFER_TO_RESERVE',
      counterpartAccountId: 9,
      movementDate: '2026-04-02',
      note: null,
    })
    expect(routerMock.refresh).toHaveBeenCalled()
  })

  it('offers reserve withdrawals with destination account selection', async () => {
    render(
      <GoalMovementForm
        goalId={7}
        goalName="Reserva de emergência"
        reserveAccountId={3}
        action="withdraw"
        accounts={[
          { id: 3, name: 'Conta reserva' },
          { id: 9, name: 'Conta principal' },
        ]}
      />,
    )

    expect(screen.getByText('Resgatar da meta')).toBeInTheDocument()
    expect(screen.getByText('Conta de destino', { selector: 'label' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar resgate' })).toBeInTheDocument()
  })
})
