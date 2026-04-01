import Link from 'next/link'

import { PortfolioArchitectureSection } from './PortfolioArchitectureSection'
import { PortfolioEvidenceGrid } from './PortfolioEvidenceGrid'
import { PortfolioHero } from './PortfolioHero'
import { PortfolioScreenshots } from './PortfolioScreenshots'
import { portfolioCtas } from './portfolio-home-content'

export function PortfolioHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,168,107,0.16),_transparent_28%),radial-gradient(circle_at_85%_0%,_rgba(112,166,132,0.12),_transparent_22%),linear-gradient(180deg,_#fbfdfb_0%,_#f5f9f4_44%,_#edf5ee_100%)] text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12">
        <PortfolioHero />
        <PortfolioEvidenceGrid />
        <PortfolioArchitectureSection />
        <PortfolioScreenshots />

        <footer className="rounded-[1.75rem] border border-border/70 bg-white/75 px-6 py-5 shadow-[0_18px_56px_-46px_rgba(20,48,31,0.24)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                Projeto autoral
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                MyFinance foi concebido e desenvolvido por Daniel Fontes como case técnico
                de engenharia e produto.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {portfolioCtas.primary.map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  target={cta.href.startsWith('http') ? '_blank' : undefined}
                  rel={cta.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="inline-flex items-center rounded-full border border-border/70 bg-background/90 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white"
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
