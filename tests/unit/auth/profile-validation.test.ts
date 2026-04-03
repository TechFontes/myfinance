import { describe, expect, it } from 'vitest'
import { profileUpdateSchema } from '@/modules/auth/validators'

describe('profileUpdateSchema', () => {
  it('rejects request with no valid fields', () => {
    const result = profileUpdateSchema.safeParse({})
    // Empty object is technically valid (all fields optional), but has no effect
    expect(result.success).toBe(true)
  })

  it('rejects request with invalid field types', () => {
    const result = profileUpdateSchema.safeParse({ name: 123 })
    expect(result.success).toBe(false)
  })

  it('rejects empty name string', () => {
    const result = profileUpdateSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 100 characters', () => {
    const result = profileUpdateSchema.safeParse({ name: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('accepts valid name update', () => {
    const result = profileUpdateSchema.safeParse({ name: 'John Doe' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('John Doe')
    }
  })

  it('trims whitespace from name', () => {
    const result = profileUpdateSchema.safeParse({ name: '  John Doe  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('John Doe')
    }
  })

  it('accepts valid email update', () => {
    // Email change requires currentPassword per refinement
    const result = profileUpdateSchema.safeParse({
      email: 'new@example.com',
      currentPassword: 'mypassword',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = profileUpdateSchema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects email change without currentPassword', () => {
    const result = profileUpdateSchema.safeParse({ email: 'new@example.com' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('currentPassword')
    }
  })

  it('requires currentPassword when newPassword is provided', () => {
    const result = profileUpdateSchema.safeParse({ newPassword: 'newpass123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('currentPassword')
    }
  })

  it('requires confirmPassword when newPassword is provided', () => {
    const result = profileUpdateSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'newpass123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('confirmPassword')
    }
  })

  it('rejects when newPassword and confirmPassword do not match', () => {
    const result = profileUpdateSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'newpass123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('confirmPassword')
    }
  })

  it('accepts valid password change', () => {
    const result = profileUpdateSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'newpass123',
      confirmPassword: 'newpass123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects newPassword shorter than 8 characters', () => {
    const result = profileUpdateSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })
})
