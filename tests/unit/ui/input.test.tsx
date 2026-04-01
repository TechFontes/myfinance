// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/ui/input'

describe('input', () => {
  afterEach(() => {
    cleanup()
  })

  it('uses a solid input surface', () => {
    render(<Input aria-label="Amount" />)

    const input = screen.getByRole('textbox', { name: 'Amount' })
    const classes = input.className.split(/\s+/)

    expect(classes).toContain('bg-input')
    expect(classes).not.toContain('bg-transparent')
  })
})
