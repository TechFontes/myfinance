import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const schema = readFileSync('prisma/schema.prisma', 'utf8')

describe('accounts and categories prisma schema alignment', () => {
  it('stores account setup fields required by the PRD', () => {
    expect(schema).toContain('initialBalance Decimal')
    expect(schema).toMatch(/institution\s+String\?/) 
    expect(schema).toMatch(/color\s+String\?/) 
    expect(schema).toMatch(/icon\s+String\?/) 
    expect(schema).toContain('active         Boolean         @default(true)')
  })

  it('stores category lifecycle fields required by the PRD', () => {
    expect(schema).toContain('model Category {')
    expect(schema).toContain('parentId       Int?')
    expect(schema).toContain('active         Boolean         @default(true)')
    expect(schema).toContain('createdAt      DateTime        @default(now())')
    expect(schema).toContain('updatedAt      DateTime        @updatedAt')
  })
})
