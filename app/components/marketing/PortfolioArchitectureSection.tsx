import { portfolioNarrative } from './portfolio-home-content'

const sectionCards = [
  {
    id: 'problem',
    eyebrow: 'Dor operacional',
    title: portfolioNarrative.problem.title,
    body: portfolioNarrative.problem.body,
  },
  {
    id: 'architecture',
    eyebrow: 'Estrutura',
    title: portfolioNarrative.architecture.title,
    body: portfolioNarrative.architecture.body,
  },
  {
    id: 'quality',
    eyebrow: 'Execução',
    title: portfolioNarrative.quality.title,
    body: portfolioNarrative.quality.body,
  },
] as const

export function PortfolioArchitectureSection() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {sectionCards.map((card) => (
        <article
          key={card.id}
          id={card.id}
          className="rounded-[1.75rem] border border-border/70 bg-white/80 p-6 shadow-[0_20px_60px_-48px_rgba(20,48,31,0.24)]"
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
