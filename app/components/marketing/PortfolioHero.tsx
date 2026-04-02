import Link from 'next/link'

import { portfolioCtas } from './portfolio-home-content'

export function PortfolioHero() {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-white/85 px-5 py-4 shadow-[0_18px_56px_-46px_rgba(20,48,31,0.24)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-foreground">MyFinance</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-emerald-600/60" />
          <span className="text-sm text-muted-foreground">por Daniel Fontes</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Sistema de finanças pessoais · Next.js 16 · App Router · Prisma/MySQL · TDD
        </p>
      </div>

      <nav className="flex flex-wrap items-center gap-2">
        {portfolioCtas.primary.map((cta) => (
          <Link
            key={cta.label}
            href={cta.href}
            target={cta.href.startsWith('http') ? '_blank' : undefined}
            rel={cta.href.startsWith('http') ? 'noreferrer' : undefined}
            className="rounded-full border border-border/70 bg-white/95 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-emerald-50"
          >
            {cta.label}
          </Link>
        ))}
        <Link
          href={portfolioCtas.login.href}
          className="rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-white"
        >
          Login →
        </Link>
      </nav>
    </section>
  )
}
