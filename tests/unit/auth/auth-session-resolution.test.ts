import { describe, expect, it } from 'vitest'

import { resolveSessionUser } from '@/contexts/authSessionState'

describe('auth session state', () => {
  it('applies the fetched session user when the auth version still matches', () => {
    const currentUser = { id: '1', name: 'Atual', email: 'atual@example.com' }
    const fetchedUser = { id: '2', name: 'Novo', email: 'novo@example.com' }

    expect(
      resolveSessionUser({
        currentUser,
        currentVersion: 2,
        fetchedUser,
        snapshotVersion: 2,
      }),
    ).toEqual(fetchedUser)
  })

  it('keeps the newer user when an older session bootstrap resolves late', () => {
    const currentUser = { id: '2', name: 'Novo', email: 'novo@example.com' }

    expect(
      resolveSessionUser({
        currentUser,
        currentVersion: 3,
        fetchedUser: null,
        snapshotVersion: 2,
      }),
    ).toEqual(currentUser)
  })
})
