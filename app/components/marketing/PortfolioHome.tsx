import { ForceLightMode } from './ForceLightMode'
import { PortfolioDomainMap } from './PortfolioDomainMap'
import { PortfolioFooter } from './PortfolioFooter'
import { PortfolioHero } from './PortfolioHero'
import { PortfolioMetrics } from './PortfolioMetrics'
import { PortfolioProcessMap } from './PortfolioProcessMap'
import { PortfolioScreenshotCarousel } from './PortfolioScreenshotCarousel'

export function PortfolioHome() {
  return (
    <main className="force-light min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,168,107,0.16),_transparent_28%),radial-gradient(circle_at_85%_0%,_rgba(112,166,132,0.12),_transparent_22%),linear-gradient(180deg,_#fbfdfb_0%,_#f5f9f4_44%,_#edf5ee_100%)] text-foreground">
      <ForceLightMode />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <PortfolioHero />
        <PortfolioDomainMap />
        <PortfolioProcessMap />
        <PortfolioMetrics />
        <PortfolioScreenshotCarousel />
        <PortfolioFooter />
      </div>
    </main>
  )
}
