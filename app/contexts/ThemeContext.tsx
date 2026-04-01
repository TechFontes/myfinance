// contexts/ThemeContext.tsx
'use client'

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'myfinance-theme'
let currentTheme: Theme = 'light'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
const themeListeners = new Set<() => void>()

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

function emitThemeChange() {
  for (const listener of themeListeners) {
    listener()
  }
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener)

  if (typeof window === 'undefined') {
    return () => {
      themeListeners.delete(listener)
    }
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      listener()
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    themeListeners.delete(listener)
    window.removeEventListener('storage', handleStorage)
  }
}

function getThemeSnapshot(): Theme {
  return currentTheme
}

function getServerThemeSnapshot(): Theme {
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<Theme>(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  )

  useEffect(() => {
    const storedTheme = readStoredTheme()

    if (storedTheme !== currentTheme) {
      currentTheme = storedTheme
      emitThemeChange()
      return
    }

    applyTheme(currentTheme)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((nextTheme: Theme) => {
    currentTheme = nextTheme
    applyTheme(nextTheme)
    emitThemeChange()
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [setTheme, theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
