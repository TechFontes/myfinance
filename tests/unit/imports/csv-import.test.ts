import { describe, expect, it } from 'vitest'
import {
  buildTransactionImportPreview,
  parseCsvImportText,
  transactionImportTypes,
} from '@/modules/imports'

describe('csv import foundation', () => {
  it('parses a csv file with quoted commas and preserves rows', () => {
    const result = parseCsvImportText(
      [
        'type,description,value,competenceDate,dueDate,status,category',
        'EXPENSE,"Mercado, bairro",123.45,2026-03-01,2026-03-10,PENDING,Alimentacao',
      ].join('\n'),
    )

    expect(result.headers).toEqual([
      'type',
      'description',
      'value',
      'competenceDate',
      'dueDate',
      'status',
      'category',
    ])
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]).toMatchObject({
      type: 'EXPENSE',
      description: 'Mercado, bairro',
      category: 'Alimentacao',
    })
  })

  it('builds a transaction preview with category mapping and ready-to-persist rows', () => {
    const preview = buildTransactionImportPreview(
      [
        'type,description,value,competenceDate,dueDate,status,category,fixed',
        'EXPENSE,Uber,27.50,2026-03-01,2026-03-02,PENDING,Mobilidade,true',
        'INCOME,Salario,5000,2026-03-01,2026-03-05,PAID,Receita,false',
      ].join('\n'),
      [
        { id: 11, name: 'Mobilidade' },
        { id: 22, name: 'Receita' },
      ],
    )

    expect(transactionImportTypes).toEqual(['TRANSACTION'])
    expect(preview.rows).toHaveLength(2)
    expect(preview.rows[0]).toMatchObject({
      line: 2,
      readyToPersist: true,
      mappedCategoryId: 11,
      transaction: {
        type: 'EXPENSE',
        description: 'Uber',
        value: '27.50',
        status: 'PENDING',
        fixed: true,
      },
    })
    expect(preview.rows[1]).toMatchObject({
      line: 3,
      readyToPersist: true,
      mappedCategoryId: 22,
    })
    expect(preview.summary).toMatchObject({
      totalRows: 2,
      readyRows: 2,
      invalidRows: 0,
      missingCategoryRows: 0,
      duplicateRows: 0,
    })
    expect(preview.validRows).toHaveLength(2)
    expect(preview.invalidRows).toHaveLength(0)
  })

  it('maps categories ignoring accent and case differences while suggesting close matches', () => {
    const preview = buildTransactionImportPreview(
      [
        'type,description,value,competenceDate,dueDate,status,category',
        'EXPENSE,Feira,100.00,2026-03-01,2026-03-02,PENDING,Alimentacao',
        'EXPENSE,Onibus,10.00,2026-03-01,2026-03-02,PENDING,Transporte',
      ].join('\n'),
      [
        { id: 11, name: 'Alimentação' },
        { id: 22, name: 'Transporte Urbano' },
        { id: 33, name: 'Transporte Público' },
      ],
    )

    expect(preview.rows).toHaveLength(2)
    expect(preview.validRows).toHaveLength(1)
    expect(preview.invalidRows).toHaveLength(1)
    expect(preview.validRows[0]).toMatchObject({
      line: 2,
      readyToPersist: true,
      mappedCategoryId: 11,
    })
    expect(preview.invalidRows[0]).toMatchObject({
      line: 3,
      readyToPersist: false,
      mappedCategoryId: null,
    })
    expect(preview.invalidRows[0].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'missing_category',
          field: 'categoryName',
        }),
      ]),
    )
    expect(preview.pendingCategoryMappings).toEqual([
      expect.objectContaining({
        sourceName: 'Transporte',
        needsMapping: true,
        suggestedCategoryIds: [22, 33],
      }),
    ])
    expect(preview.summary).toMatchObject({
      totalRows: 2,
      readyRows: 1,
      invalidRows: 1,
      missingCategoryRows: 1,
      duplicateRows: 0,
    })
    expect(preview.readyToCommit).toBe(false)
  })

  it('marks repeated rows as duplicate candidates before persistence', () => {
    const preview = buildTransactionImportPreview(
      [
        'type,description,value,competenceDate,dueDate,status,category',
        'EXPENSE,Uber,27.50,2026-03-01,2026-03-02,PENDING,Transporte',
        'EXPENSE,uber,27.50,2026-03-01,2026-03-02,PENDING,Transporte',
      ].join('\n'),
      [],
    )

    expect(preview.rows).toHaveLength(2)
    expect(preview.rows[0].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'missing_category' }),
        expect.objectContaining({ code: 'duplicate_row' }),
      ]),
    )
    expect(preview.rows[1].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'missing_category' }),
        expect.objectContaining({ code: 'duplicate_row' }),
      ]),
    )
    expect(preview.summary).toMatchObject({
      totalRows: 2,
      readyRows: 0,
      invalidRows: 2,
      missingCategoryRows: 2,
      duplicateRows: 2,
    })
    expect(preview.possibleDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ lineNumber: 2 }),
        expect.objectContaining({ lineNumber: 3 }),
      ]),
    )
    expect(preview.readyToCommit).toBe(false)
  })
})
