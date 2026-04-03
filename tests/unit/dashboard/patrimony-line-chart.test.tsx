// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PatrimonyLineChart } from '@/components/dashboard/PatrimonyLineChart'

afterEach(() => {
  cleanup()
})

describe('PatrimonyLineChart', () => {
  it('renders an SVG chart with expected structure', () => {
    render(
      <PatrimonyLineChart
        data={[
          { month: '2026-01', label: 'jan', realized: 1000, forecast: 1200 },
          { month: '2026-02', label: 'fev', realized: 1500, forecast: 1800 },
          { month: '2026-03', label: 'mar', realized: 2000, forecast: 2300 },
        ]}
      />,
    )

    const svg = screen.getByTestId('patrimony-line-chart')
    expect(svg).toBeInTheDocument()
    expect(svg.tagName).toBe('svg')

    expect(screen.getByTestId('patrimony-realized-line')).toBeInTheDocument()
    expect(screen.getByTestId('patrimony-forecast-line')).toBeInTheDocument()

    expect(screen.getByText('jan')).toBeInTheDocument()
    expect(screen.getByText('fev')).toBeInTheDocument()
    expect(screen.getByText('mar')).toBeInTheDocument()
  })

  it('renders the forecast line as dashed', () => {
    render(
      <PatrimonyLineChart
        data={[
          { month: '2026-01', label: 'jan', realized: 1000, forecast: 1200 },
          { month: '2026-02', label: 'fev', realized: 1500, forecast: 1800 },
        ]}
      />,
    )

    const forecastLine = screen.getByTestId('patrimony-forecast-line')
    expect(forecastLine.getAttribute('stroke-dasharray')).toBe('6 4')
  })

  it('renders the legend labels', () => {
    render(
      <PatrimonyLineChart
        data={[
          { month: '2026-01', label: 'jan', realized: 1000, forecast: 1200 },
        ]}
      />,
    )

    expect(screen.getByText('Realizado')).toBeInTheDocument()
    expect(screen.getByText('Previsto')).toBeInTheDocument()
  })

  it('renders empty state when no data is provided', () => {
    render(<PatrimonyLineChart data={[]} />)

    expect(screen.getByText('Sem dados para exibir o gráfico.')).toBeInTheDocument()
    expect(screen.queryByTestId('patrimony-line-chart')).not.toBeInTheDocument()
  })

  it('shows tooltip on hover and hides on mouse leave', () => {
    render(
      <PatrimonyLineChart
        data={[
          { month: '2026-01', label: 'jan', realized: 1000, forecast: 1200 },
          { month: '2026-02', label: 'fev', realized: 1500, forecast: 1800 },
        ]}
      />,
    )

    expect(screen.queryByTestId('patrimony-tooltip')).not.toBeInTheDocument()

    const realizedPoint = screen.getByTestId('realized-point-0')
    fireEvent.mouseEnter(realizedPoint)

    const tooltip = screen.getByTestId('patrimony-tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(screen.getByText('R$ 1.000,00', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('R$ 1.200,00', { exact: false })).toBeInTheDocument()

    fireEvent.mouseLeave(realizedPoint)
    expect(screen.queryByTestId('patrimony-tooltip')).not.toBeInTheDocument()
  })

  it('shows tooltip on forecast point hover', () => {
    render(
      <PatrimonyLineChart
        data={[
          { month: '2026-01', label: 'jan', realized: 1000, forecast: 1200 },
        ]}
      />,
    )

    const forecastPoint = screen.getByTestId('forecast-point-0')
    fireEvent.mouseEnter(forecastPoint)

    expect(screen.getByTestId('patrimony-tooltip')).toBeInTheDocument()
  })
})
