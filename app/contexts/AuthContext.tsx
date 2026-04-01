// contexts/AuthContext.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { resolveSessionUser } from './authSessionState'

type User = {
  id: string
  name: string | null
  email: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const authVersionRef = useRef(0)
  const userRef = useRef<User | null>(null)

  function setAuthUser(nextUser: User | null) {
    userRef.current = nextUser
    setUser(nextUser)
  }

  // Fetch user on mount
  useEffect(() => {
    const snapshotVersion = authVersionRef.current

    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
          credentials: 'include',
        })
        const fetchedUser = res.ok ? (await res.json()).user : null

        setAuthUser(
          resolveSessionUser({
            currentUser: userRef.current,
            currentVersion: authVersionRef.current,
            fetchedUser,
            snapshotVersion,
          }),
        )
      } catch (error) {
        console.error('Error loading user', error)
        setAuthUser(
          resolveSessionUser({
            currentUser: userRef.current,
            currentVersion: authVersionRef.current,
            fetchedUser: null,
            snapshotVersion,
          }),
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  async function login(email: string, password: string) {
    authVersionRef.current += 1

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      throw new Error('Credenciais inválidas')
    }

    const data = await res.json()
    setAuthUser(data.user)
  }

  async function logout() {
    authVersionRef.current += 1

    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    setAuthUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
