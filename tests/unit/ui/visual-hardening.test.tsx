// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

describe('visual hardening', () => {
  afterEach(() => {
    cleanup()
  })

  describe('input component', () => {
    it('renders with solid background, not transparent', () => {
      render(<Input aria-label="Test input" />)
      const input = screen.getByRole('textbox', { name: 'Test input' })
      const classes = input.className.split(/\s+/)

      expect(classes).toContain('bg-input')
      expect(classes).not.toContain('bg-transparent')
    })

    it('has visible focus-visible ring', () => {
      render(<Input aria-label="Test input" />)
      const input = screen.getByRole('textbox', { name: 'Test input' })
      const className = input.className

      expect(className).toContain('focus-visible:ring-2')
      expect(className).toContain('focus-visible:ring-ring/20')
    })
  })

  describe('button component', () => {
    it('default variant has primary background', () => {
      render(<Button>Save</Button>)
      const button = screen.getByRole('button', { name: 'Save' })
      const classes = button.className.split(/\s+/)

      expect(classes).toContain('bg-primary')
    })

    it('destructive variant has destructive background', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button', { name: 'Delete' })
      const className = button.className

      expect(className).toContain('bg-destructive')
    })

    it('outline variant has border and background', () => {
      render(<Button variant="outline">Cancel</Button>)
      const button = screen.getByRole('button', { name: 'Cancel' })
      const className = button.className

      expect(className).toContain('border')
      expect(className).toContain('bg-background')
    })

    it('ghost variant does not have solid background', () => {
      render(<Button variant="ghost">Menu</Button>)
      const button = screen.getByRole('button', { name: 'Menu' })
      const classes = button.className.split(/\s+/)

      expect(classes).not.toContain('bg-primary')
      expect(classes).not.toContain('bg-background')
    })

    it('all button variants have focus-visible ring', () => {
      render(<Button>Focused</Button>)
      const button = screen.getByRole('button', { name: 'Focused' })
      const className = button.className

      expect(className).toContain('focus-visible:ring-2')
      expect(className).toContain('focus-visible:ring-ring/20')
    })
  })

  describe('dark mode token completeness', () => {
    const cssPath = resolve(__dirname, '../../../app/globals.css')
    const css = readFileSync(cssPath, 'utf8')

    const themeTokens = [
      '--color-background',
      '--color-foreground',
      '--color-card',
      '--color-card-foreground',
      '--color-popover',
      '--color-popover-foreground',
      '--color-primary',
      '--color-primary-foreground',
      '--color-secondary',
      '--color-secondary-foreground',
      '--color-muted',
      '--color-muted-foreground',
      '--color-accent',
      '--color-accent-foreground',
      '--color-destructive',
      '--color-destructive-foreground',
      '--color-border',
      '--color-input',
      '--color-ring',
      '--color-success',
      '--color-success-foreground',
    ]

    // Extract the .dark { ... } block
    const darkBlockMatch = css.match(/^\.dark\s*\{([^}]+)\}/m)

    it('has a .dark block defined', () => {
      expect(darkBlockMatch).not.toBeNull()
    })

    const darkBlock = darkBlockMatch?.[1] ?? ''

    for (const token of themeTokens) {
      it(`dark mode defines ${token}`, () => {
        expect(darkBlock).toContain(token)
      })
    }
  })
})
