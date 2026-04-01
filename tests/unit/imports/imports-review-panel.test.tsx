// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CsvImportReviewPanel } from '@/components/imports/CsvImportReviewPanel'

afterEach(() => {
  cleanup()
})

describe('csv import review panel', () => {
  it('shows the preview breakdown and keeps confirmation blocked until the review is acknowledged', () => {
    render(
      <CsvImportReviewPanel
        availableCategories={[
          { id: 1, name: 'Alimentação' },
          { id: 2, name: 'Transporte' },
        ]}
        initialCsvText={[
          'type,description,value,categoryName,competenceDate,dueDate,status,fixed',
          'EXPENSE,Almoço,32.90,Alimentação,2026-03-01,2026-03-02,PENDING,true',
          'EXPENSE,Uber,,Mobilidade,2026-03-01,2026-03-02,PENDING,false',
          'EXPENSE,Café,12.00,Alimentação,2026-03-01,2026-03-02,PENDING,false',
          'EXPENSE,Café,12.00,Alimentação,2026-03-01,2026-03-02,PENDING,false',
        ].join('\n')}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Revisão da importação CSV' })).toBeInTheDocument()
    expect(screen.getByText('A confirmação só fica disponível depois da revisão do preview.')).toBeInTheDocument()
    expect(screen.getByText(/1 linha válida/)).toBeInTheDocument()
    expect(screen.getByText(/3 linhas inválidas/)).toBeInTheDocument()
    expect(screen.getByText(/1 categoria pendente/)).toBeInTheDocument()
    expect(screen.getByText(/2 duplicidades possíveis/)).toBeInTheDocument()
    expect(screen.getByText('Almoço')).toBeInTheDocument()
    expect(screen.getByText('Mobilidade')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar importação' })).toBeDisabled()
  })

  it('enables the confirm action only after the preview is clean and reviewed', async () => {
    render(
      <CsvImportReviewPanel
        availableCategories={[{ id: 1, name: 'Alimentação' }]}
        initialCsvText={[
          'type,description,value,categoryName,competenceDate,dueDate,status,fixed',
          'EXPENSE,Almoço,32.90,Alimentação,2026-03-01,2026-03-02,PENDING,true',
        ].join('\n')}
      />,
    )

    const confirmCheckbox = screen.getByRole('checkbox', {
      name: 'Revisei o preview e confirmo que os dados estão prontos',
    })
    const confirmButton = screen.getByRole('button', { name: 'Confirmar importação' })

    expect(confirmButton).toBeDisabled()

    fireEvent.click(confirmCheckbox)

    await waitFor(() => expect(confirmButton).toBeEnabled())

    fireEvent.click(confirmButton)

    expect(
      screen.getByText(
        'Revisão confirmada. A confirmação real fica pronta para a integração da API.',
      ),
    ).toBeInTheDocument()
  })
})
