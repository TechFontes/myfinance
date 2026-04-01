import { portfolioEvidenceCards } from './portfolio-home-content'

export function PortfolioEvidenceGrid() {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {portfolioEvidenceCards.map((card) => (
        <article
          key={card.title}
          className="rounded-[1.5rem] border border-border/70 bg-white/78 p-6 shadow-[0_18px_56px_-44px_rgba(20,48,31,0.24)] backdrop-blur"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            {card.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {card.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
            {card.body}
          </p>
        </article>
      ))}
    </section>
  )
}
