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

  it('separates valid and invalid rows and surfaces line-specific validation errors', () => {
    const preview = buildTransactionImportPreview(
      [
        'type,description,value,competenceDate,dueDate,status,category',
        'EXPENSE,Uber,27.50,2026-03-01,2026-03-02,PENDING,Transporte',
        'EXPENSE,,abc,2026-03-01,,PENDING,',
      ].join('\n'),
      [{ id: 9, name: 'Transporte' }],
    )

    expect(preview.rows).toHaveLength(2)
    expect(preview.validRows).toHaveLength(1)
    expect(preview.invalidRows).toHaveLength(1)
    expect(preview.validRows[0]).toMatchObject({
      line: 2,
      readyToPersist: true,
      mappedCategoryId: 9,
    })
    expect(preview.invalidRows[0]).toMatchObject({
      line: 3,
      readyToPersist: false,
      mappedCategoryId: null,
    })
    expect(preview.invalidRows[0].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'missing_field',
          field: 'description',
        }),
        expect.objectContaining({
          code: 'invalid_value',
          field: 'value',
        }),
        expect.objectContaining({
          code: 'missing_field',
          field: 'dueDate',
        }),
        expect.objectContaining({
          code: 'missing_category',
          field: 'categoryName',
        }),
      ]),
    )
    expect(preview.summary).toMatchObject({
      totalRows: 2,
      readyRows: 1,
      invalidRows: 1,
      missingCategoryRows: 1,
      duplicateRows: 0,
    })
    expect(preview.readyToCommit).toBe(false)
  })
})
