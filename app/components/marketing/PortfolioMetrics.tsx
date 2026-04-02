import { portfolioMetrics } from './portfolio-home-content'

export function PortfolioMetrics() {
  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {portfolioMetrics.map((metric) => (
        <div
          key={metric.value}
          className="rounded-xl border border-border/70 bg-white/80 px-3 py-3 text-center shadow-[0_10px_30px_-20px_rgba(20,48,31,0.16)] backdrop-blur"
        >
          <p className="text-xl font-bold tracking-tight text-foreground">{metric.value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{metric.label}</p>
        </div>
      ))}
    </section>
  )
}
