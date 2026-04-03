export type PatrimonyDataPoint = {
  month: string
  label: string
  realized: number
  forecast: number
}

type PatrimonyLineChartProps = {
  data: PatrimonyDataPoint[]
}

function formatCompactCurrency(value: number) {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return value.toFixed(0)
}

const CHART_PADDING = { top: 24, right: 20, bottom: 40, left: 64 }
const VIEWBOX_WIDTH = 800
const VIEWBOX_HEIGHT = 300

export function PatrimonyLineChart({ data }: PatrimonyLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30">
        <p className="text-sm text-muted-foreground">Sem dados para exibir o gráfico.</p>
      </div>
    )
  }

  const allValues = data.flatMap((point) => [point.realized, point.forecast])
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const valueRange = maxValue - minValue || 1
  const paddedMin = minValue - valueRange * 0.1
  const paddedMax = maxValue + valueRange * 0.1
  const paddedRange = paddedMax - paddedMin

  const plotWidth = VIEWBOX_WIDTH - CHART_PADDING.left - CHART_PADDING.right
  const plotHeight = VIEWBOX_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

  function toX(index: number) {
    if (data.length === 1) return CHART_PADDING.left + plotWidth / 2
    return CHART_PADDING.left + (index / (data.length - 1)) * plotWidth
  }

  function toY(value: number) {
    return CHART_PADDING.top + plotHeight - ((value - paddedMin) / paddedRange) * plotHeight
  }

  const gridLineCount = 4
  const gridLines = Array.from({ length: gridLineCount + 1 }, (_, i) => {
    const value = paddedMin + (paddedRange / gridLineCount) * i
    return { y: toY(value), label: formatCompactCurrency(value) }
  })

  function buildLinePath(accessor: (point: PatrimonyDataPoint) => number) {
    return data
      .map((point, index) => {
        const x = toX(index)
        const y = toY(accessor(point))
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  const realizedPath = buildLinePath((p) => p.realized)
  const forecastPath = buildLinePath((p) => p.forecast)

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Gráfico de patrimônio acumulado"
        data-testid="patrimony-line-chart"
      >
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={CHART_PADDING.left}
              y1={line.y}
              x2={VIEWBOX_WIDTH - CHART_PADDING.right}
              y2={line.y}
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeDasharray="4 4"
            />
            <text
              x={CHART_PADDING.left - 8}
              y={line.y + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={11}
            >
              {line.label}
            </text>
          </g>
        ))}

        <path
          d={forecastPath}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={2}
          strokeDasharray="6 4"
          data-testid="patrimony-forecast-line"
        />

        <path
          d={realizedPath}
          fill="none"
          stroke="currentColor"
          className="text-emerald-600 dark:text-emerald-400"
          strokeWidth={2.5}
          data-testid="patrimony-realized-line"
        />

        {data.map((point, index) => (
          <circle
            key={`forecast-${index}`}
            cx={toX(index)}
            cy={toY(point.forecast)}
            r={3}
            fill="currentColor"
            fillOpacity={0.35}
          />
        ))}

        {data.map((point, index) => (
          <circle
            key={`realized-${index}`}
            cx={toX(index)}
            cy={toY(point.realized)}
            r={3.5}
            className="text-emerald-600 dark:text-emerald-400"
            fill="currentColor"
          />
        ))}

        {data.map((point, index) => (
          <text
            key={`label-${index}`}
            x={toX(index)}
            y={VIEWBOX_HEIGHT - 8}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={11}
          >
            {point.label}
          </text>
        ))}
      </svg>

      <div className="flex items-center justify-center gap-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-5 rounded-full bg-emerald-600 dark:bg-emerald-400" aria-hidden="true" />
          Realizado
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-5 rounded-full bg-foreground/35" style={{ borderTop: '2px dashed' }} aria-hidden="true" />
          Previsto
        </span>
      </div>
    </div>
  )
}
