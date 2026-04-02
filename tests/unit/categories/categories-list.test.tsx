// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CategoriesList } from '@/components/categories/CategoriesList'

describe('CategoriesList', () => {
  it('renders an edit CTA for each category card', () => {
    render(
      <CategoriesList
        categories={[
          {
            id: 1,
            userId: 'user-1',
            name: 'Moradia',
            type: 'EXPENSE',
            parentId: null,
            active: true,
          },
          {
            id: 2,
            userId: 'user-1',
            name: 'Aluguel',
            type: 'EXPENSE',
            parentId: 1,
            active: false,
          },
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Editar categoria Moradia' })).toHaveAttribute(
      'href',
      '/dashboard/categories/1',
    )
    expect(screen.getByRole('link', { name: 'Editar categoria Aluguel' })).toHaveAttribute(
      'href',
      '/dashboard/categories/2',
    )
  })
})
