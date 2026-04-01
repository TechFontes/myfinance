// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('admin page', () => {
  it('renders the administrative entry point separate from the user dashboard', async () => {
    const { default: AdminPage } = await import('@/admin/page')
    render(await AdminPage())

    expect(screen.getByRole('heading', { name: 'Área administrativa técnica' })).toBeInTheDocument()
    expect(screen.getByText('Painel exclusivo para operação, suporte e leitura financeira restrita.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Leitura financeira' })).toBeInTheDocument()
    expect(screen.getByText('Somente leitura')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Usuários da plataforma' })).toBeInTheDocument()
  })
})
