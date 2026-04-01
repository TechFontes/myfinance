// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll } from 'vitest'
import { describe, expect, it } from 'vitest'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

describe('select', () => {
  beforeAll(() => {
    Object.defineProperty(Element.prototype, 'hasPointerCapture', {
      configurable: true,
      value: () => false,
    })
    Object.defineProperty(Element.prototype, 'setPointerCapture', {
      configurable: true,
      value: () => undefined,
    })
    Object.defineProperty(Element.prototype, 'releasePointerCapture', {
      configurable: true,
      value: () => undefined,
    })
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: () => undefined,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('uses a solid trigger surface', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Category">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Category' })
    const classes = trigger.className.split(/\s+/)

    expect(classes).toContain('bg-input')
    expect(classes).not.toContain('bg-transparent')
  })

  it('opens a visible option list', async () => {
    const user = userEvent.setup()

    render(
      <Select>
        <SelectTrigger aria-label="Category">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="food">Food</SelectItem>
          <SelectItem value="rent">Rent</SelectItem>
        </SelectContent>
      </Select>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Category' })
    trigger.focus()
    await user.keyboard('{ArrowDown}')

    expect(await screen.findByRole('listbox')).toBeVisible()
    expect(screen.getByRole('option', { name: 'Food' })).toBeVisible()
    expect(screen.getByRole('option', { name: 'Rent' })).toBeVisible()
  })
})
