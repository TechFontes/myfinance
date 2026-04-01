// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('register page', () => {
  it('renders register form fields', async () => {
    const { default: RegisterPage } = await import('@/(auth)/register/page')
    render(<RegisterPage />)

    expect(screen.getByRole('heading', { name: 'Criar conta' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument()
  }, 10000)
})
