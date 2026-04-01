import Link from 'next/link'

import {
  portfolioCtas,
  portfolioHighlights,
  portfolioMetrics,
  portfolioNarrative,
} from './portfolio-home-content'

export function PortfolioHero() {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border/70 bg-white/86 p-6 shadow-[0_30px_100px_-62px_rgba(20,48,31,0.42)] backdrop-blur md:p-8 lg:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(61,153,96,0.13),_transparent_27%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(238,247,239,0.9))]" />

      <div className="relative space-y-10">
        <div className="flex flex-col gap-4 border-b border-border/70 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-muted-foreground">
              Case técnico premium
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="font-serif text-3xl tracking-tight text-foreground">MyFinance</span>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-emerald-600/60"
              />
              <span className="text-sm font-medium text-muted-foreground">
                Finanças pessoais com engenharia de produto
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {portfolioCtas.primary.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                target={cta.href.startsWith('http') ? '_blank' : undefined}
                rel={cta.href.startsWith('http') ? 'noreferrer' : undefined}
                className="inline-flex items-center rounded-full border border-border/70 bg-white/95 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-950"
              >
                {cta.label}
              </Link>
            ))}
            <Link
              href={portfolioCtas.login.href}
              className="inline-flex items-center rounded-full border border-border/70 px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-white hover:text-foreground"
            >
              {portfolioCtas.login.label}
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-900">
              {portfolioNarrative.hero.eyebrow}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                {portfolioNarrative.hero.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                {portfolioNarrative.hero.body}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {portfolioHighlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-border/70 bg-white/88 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-[0_10px_30px_-28px_rgba(15,23,42,0.24)]"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-emerald-200/80 bg-[linear-gradient(180deg,_rgba(243,250,244,0.96),_rgba(235,246,237,0.92))] p-5 shadow-[0_26px_80px_-58px_rgba(15,79,45,0.48)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
              Daniel Fontes
            </p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-emerald-950">
              Arquitetura, produto e qualidade técnica apresentados como evidência.
            </p>
            <p className="mt-3 text-sm leading-7 text-emerald-950/78">
              Esta home posiciona o projeto como portfólio de engenharia real:
              problema claro, decisões técnicas explícitas, interface refinada e
              prova visual do sistema funcionando.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {portfolioMetrics.map((metric) => (
                <div
                  key={metric.value}
                  className="rounded-[1.25rem] border border-emerald-300/45 bg-white/72 p-4"
                >
                  <p className="font-serif text-xl tracking-tight text-emerald-950">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-950/72">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
