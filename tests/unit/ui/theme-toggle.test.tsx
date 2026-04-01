// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

describe('theme toggle', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('restores the persisted dark theme after hydration and exposes an accessible toggle label', async () => {
    window.localStorage.setItem('myfinance-theme', 'dark')

    const container = document.createElement('div')
    container.innerHTML = renderToString(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    document.body.appendChild(container)

    expect(container).toHaveTextContent(/tema claro/i)

    hydrateRoot(
      container,
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
      expect(screen.getByRole('button', { name: /alternar tema/i })).toHaveTextContent(
        /tema escuro/i,
      )
    })
  })

  it('toggles between light and dark labels without emoji-only affordance', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    const button = screen.getByRole('button', { name: /alternar tema/i })
    expect(button).toHaveTextContent(/tema claro/i)

    await user.click(button)

    expect(document.documentElement).toHaveClass('dark')
    expect(button).toHaveTextContent(/tema escuro/i)
  })
})
