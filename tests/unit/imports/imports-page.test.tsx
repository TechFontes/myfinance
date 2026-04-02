// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const categoriesMock = vi.hoisted(() => ({
  listCategoriesByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/categories/service', () => categoriesMock)
vi.mock('@/components/imports/CsvImportReviewPanel', () => ({
  CsvImportReviewPanel: ({ availableCategories }: { availableCategories: Array<{ name: string }> }) => (
    <section data-testid="csv-import-panel">
      <h2>Revisão da importação CSV</h2>
      <p>Carregue um CSV, revise o preview e só então confirme a importação.</p>
      <p>A confirmação só fica disponível depois da revisão do preview.</p>
      <label htmlFor="csv-file">Arquivo CSV</label>
      <input id="csv-file" type="file" />
      <button disabled type="button">
        Confirmar importação
      </button>
      <div>{availableCategories.map((category) => category.name).join(', ')}</div>
    </section>
  ),
}))

describe('imports page', () => {
  it('renders the csv review surface for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([
      { id: 1, name: 'Alimentação' },
      { id: 2, name: 'Mobilidade' },
    ])

    const { default: ImportsPage } = await import('@/dashboard/imports/page')
    render(await ImportsPage())

    expect(screen.getByRole('heading', { name: 'Importações' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Revisão da importação CSV' })).toBeInTheDocument()
    expect(
      screen.getByText('Carregue um CSV, revise o preview e só então confirme a importação.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('A confirmação só fica disponível depois da revisão do preview.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Arquivo CSV')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar importação' })).toBeDisabled()
    expect(categoriesMock.listCategoriesByUser).toHaveBeenCalledWith('user-1')
  }, 30000)
})
