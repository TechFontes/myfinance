// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

const loginMock = vi.fn()
const routerReplaceMock = vi.fn()
const routerRefreshMock = vi.fn()
const searchParamsState = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerReplaceMock,
    refresh: routerRefreshMock,
  }),
  useSearchParams: () => searchParamsState,
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}))

describe('login page', () => {
  afterEach(() => {
    loginMock.mockReset()
    routerReplaceMock.mockReset()
    routerRefreshMock.mockReset()
    for (const key of Array.from(searchParamsState.keys())) {
      searchParamsState.delete(key)
    }
  })

  it('submits through the auth context and redirects to the callback url', async () => {
    loginMock.mockResolvedValue(undefined)
    searchParamsState.set('callbackUrl', '/dashboard/transfers')

    const user = userEvent.setup()
    const { default: LoginPage } = await import('@/(auth)/login/page')

    render(<LoginPage />)

    await user.type(screen.getByLabelText('E-mail'), 'daniel@example.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('daniel@example.com', '123456')
    })
    expect(routerReplaceMock).toHaveBeenCalledWith('/dashboard/transfers')
    expect(routerRefreshMock).toHaveBeenCalledTimes(1)
  }, 10000)
})
