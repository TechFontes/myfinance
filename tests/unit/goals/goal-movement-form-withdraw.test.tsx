// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

const defaultAccounts = [
  { id: 3, name: 'Conta reserva' },
  { id: 9, name: 'Conta principal' },
]

describe('GoalMovementForm withdraw endpoint routing', () => {
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

  it('calls /api/goals/:id/withdraw when action is withdraw', async () => {
    const user = userEvent.setup()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    })

    render(
      <GoalMovementForm
        goalId={5}
        goalName="Viagem"
        reserveAccountId={3}
        action="withdraw"
        accounts={defaultAccounts}
      />,
    )

    await user.type(screen.getByLabelText('Valor'), '100.00')
    fireEvent.change(screen.getByLabelText('Data do movimento'), {
      target: { value: '2026-04-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Confirmar resgate' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/goals/5/withdraw',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [url, request] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/goals/5/withdraw')
    const body = JSON.parse(request.body)
    expect(body).toEqual({ amount: '100.00' })
    expect(body).not.toHaveProperty('kind')
    expect(body).not.toHaveProperty('mode')
    expect(routerMock.refresh).toHaveBeenCalled()
  })

  it('calls /api/goals/:id/contributions when action is contribute', async () => {
    const user = userEvent.setup()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2 }),
    })

    render(
      <GoalMovementForm
        goalId={5}
        goalName="Viagem"
        reserveAccountId={null}
        action="contribute"
        accounts={defaultAccounts}
      />,
    )

    await user.type(screen.getByLabelText('Valor'), '200.00')
    fireEvent.change(screen.getByLabelText('Data do movimento'), {
      target: { value: '2026-04-01' },
    })
    await user.click(screen.getByRole('button', { name: 'Confirmar aporte' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/goals/5/contributions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/goals/5/contributions')
    expect(routerMock.refresh).toHaveBeenCalled()
  })
})
