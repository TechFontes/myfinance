// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('dashboard loading state', () => {
  it('keeps a useful patrimonial loading shell while dashboard data resolves', async () => {
    const { default: DashboardLoading } = await import('@/dashboard/loading')

    render(<DashboardLoading />)

    expect(screen.getByText('Carregando visão geral')).toBeInTheDocument()
    expect(screen.getByText('Sincronizando saldos, pendências e posições do período.')).toBeInTheDocument()
    expect(screen.getByText('Nova transação')).toBeInTheDocument()
    expect(screen.getAllByTestId('dashboard-loading-panel')).toHaveLength(4)
  })
})
