// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function Consumer() {
  const { user, loading, login, logout } = useAuth()

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="email">{user?.email ?? 'none'}</div>
      <button onClick={() => login('user@example.com', '123456')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

describe('auth context', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads current user on mount and updates login/logout state', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ user: null }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: '1', name: 'User', email: 'user@example.com', role: 'USER' } }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me', {
      cache: 'no-store',
      credentials: 'include',
    })

    fireEvent.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('email').textContent).toBe('user@example.com'))

    fireEvent.click(screen.getByText('logout'))
    await waitFor(() => expect(screen.getByTestId('email').textContent).toBe('none'))
  })

})
