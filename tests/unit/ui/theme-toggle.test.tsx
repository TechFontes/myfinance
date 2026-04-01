// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

describe('theme toggle', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('restores the persisted dark theme and exposes an accessible toggle label', () => {
    window.localStorage.setItem('myfinance-theme', 'dark')

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('button', { name: /alternar tema/i })).toHaveTextContent(
      /tema escuro/i,
    )
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
