import { describe, expect, it } from 'vitest'
import {
  csvImportFieldNames,
  csvImportPreviewSchema,
  csvImportRowSchema,
  importRowStatuses,
} from '@/modules/imports'

describe('csv import contract', () => {
  it('exports the expected row statuses and field names', () => {
    expect(importRowStatuses).toEqual(['VALID', 'INVALID'])
    expect(csvImportFieldNames).toEqual([
      'type',
      'description',
      'value',
      'categoryName',
      'competenceDate',
      'dueDate',
      'paidAt',
      'accountName',
      'creditCardName',
      'status',
      'fixed',
      'installment',
      'installments',
    ])
  })

  it('validates a preview with invalid rows, possible duplicates and category mappings', () => {
    const preview = csvImportPreviewSchema.parse({
      sourceName: 'import.csv',
      totalRows: 2,
      validRows: 1,
      invalidRows: 1,
      readyToCommit: false,
      rows: [
        csvImportRowSchema.parse({
          lineNumber: 1,
          type: 'EXPENSE',
          description: 'Supermercado',
          value: '120.50',
          categoryName: 'Alimentacao',
          competenceDate: '2026-03-01',
          dueDate: '2026-03-10',
        }),
        {
          lineNumber: 2,
          status: 'INVALID',
          raw: {
            type: 'EXPENSE',
            description: '',
            value: 'abc',
          },
          errors: ['description is required', 'value must be numeric'],
        },
      ],
      possibleDuplicates: [
        {
          lineNumber: 1,
          reason: 'same description and amount as an existing transaction',
          matchedTransactionId: 99,
          matchedAt: '2026-03-01T00:00:00.000Z',
        },
      ],
      pendingCategoryMappings: [
        {
          sourceName: 'Alimentacao',
          needsMapping: true,
          suggestedCategoryIds: [10, 12],
        },
      ],
    })

    expect(preview.readyToCommit).toBe(false)
    expect(preview.possibleDuplicates).toHaveLength(1)
    expect(preview.pendingCategoryMappings[0]?.sourceName).toBe('Alimentacao')
  })
})
