// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CsvImportReviewPanel } from '@/components/imports/CsvImportReviewPanel'
import { buildTransactionImportPreview } from '@/modules/imports'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
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

    const heroCard = screen
      .getByRole('heading', { name: 'Revisão da importação CSV' })
      .closest('.rounded-xl')
    const heroNotice = screen.getByText('A confirmação só fica disponível depois da revisão do preview.').closest('.rounded-2xl')

    expect(heroCard).toHaveClass('bg-background/95')
    expect(heroCard).toHaveClass('border-border/80')
    expect(heroCard).toHaveClass('ring-1')
    expect(heroNotice).toHaveClass('bg-background/80')
  })

  it('keeps the real commit blocked until the preview is validated on the server and reviewed', async () => {
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
    const syncButton = screen.getByRole('button', { name: 'Validar preview no servidor' })

    expect(confirmButton).toBeDisabled()
    expect(syncButton).toBeEnabled()

    fireEvent.click(confirmCheckbox)

    expect(confirmButton).toBeDisabled()

    const preview = buildTransactionImportPreview(
      [
        'type,description,value,categoryName,competenceDate,dueDate,status,fixed',
        'EXPENSE,Almoço,32.90,Alimentação,2026-03-01,2026-03-02,PENDING,true',
      ].join('\n'),
      [{ id: 1, name: 'Alimentação' }],
    )

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          sourceName: 'Conteúdo colado',
          preview,
          previewToken: 'preview-token',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    fireEvent.click(syncButton)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/imports/transactions/preview',
        expect.objectContaining({
          method: 'POST',
        }),
      )
    })

    expect(confirmButton).toBeEnabled()
  })

  it('commits the reviewed import after a successful server preview', async () => {
    render(
      <CsvImportReviewPanel
        availableCategories={[{ id: 1, name: 'Alimentação' }]}
        initialCsvText={[
          'type,description,value,categoryName,competenceDate,dueDate,status,fixed',
          'EXPENSE,Almoço,32.90,Alimentação,2026-03-01,2026-03-02,PENDING,true',
        ].join('\n')}
      />,
    )

    const preview = buildTransactionImportPreview(
      [
        'type,description,value,categoryName,competenceDate,dueDate,status,fixed',
        'EXPENSE,Almoço,32.90,Alimentação,2026-03-01,2026-03-02,PENDING,true',
      ].join('\n'),
      [{ id: 1, name: 'Alimentação' }],
    )

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sourceName: 'Conteúdo colado',
            preview,
            previewToken: 'preview-token',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            committedRows: 1,
            skippedRows: [],
            transactions: [{ id: 10, description: 'Almoço' }],
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        ),
      )

    fireEvent.click(screen.getByRole('button', { name: 'Validar preview no servidor' }))

    await screen.findByText('Preview validado no servidor. A importação já pode ser confirmada.')

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Revisei o preview e confirmo que os dados estão prontos',
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar importação' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/api/imports/transactions/commit',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            previewToken: 'preview-token',
            acceptedDuplicateLineNumbers: [],
            categoryMappings: [],
          }),
        }),
      )
    })

    expect(
      screen.getByText('Importação concluída com sucesso. 1 linha foi enviada para persistência.'),
    ).toBeInTheDocument()
  })

  it('shows commit errors returned by the real route', async () => {
    render(
      <CsvImportReviewPanel
        availableCategories={[{ id: 1, name: 'Alimentação' }]}
        initialCsvText={[
          'type,description,value,categoryName,competenceDate,dueDate,status,fixed',
          'EXPENSE,Almoço,32.90,Alimentação,2026-03-01,2026-03-02,PENDING,true',
        ].join('\n')}
      />,
    )

    const preview = buildTransactionImportPreview(
      [
        'type,description,value,categoryName,competenceDate,dueDate,status,fixed',
        'EXPENSE,Almoço,32.90,Alimentação,2026-03-01,2026-03-02,PENDING,true',
      ].join('\n'),
      [{ id: 1, name: 'Alimentação' }],
    )

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sourceName: 'Conteúdo colado',
            preview,
            previewToken: 'preview-token',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 'No rows were ready to commit',
            skippedRows: [{ line: 2, reasons: ['duplicate row was not reviewed'] }],
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        ),
      )

    fireEvent.click(screen.getByRole('button', { name: 'Validar preview no servidor' }))
    await screen.findByText('Preview validado no servidor. A importação já pode ser confirmada.')

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Revisei o preview e confirmo que os dados estão prontos',
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar importação' }))

    expect(await screen.findByText('No rows were ready to commit')).toBeInTheDocument()
    expect(screen.getByText('Linha 2: duplicate row was not reviewed')).toBeInTheDocument()
  })
})
