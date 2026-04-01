import Image from 'next/image'

import { portfolioScreenshotCards } from './portfolio-home-content'

export function PortfolioScreenshots() {
  return (
    <section id="screenshots" className="space-y-6">
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
          Provas visuais
        </p>
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Provas visuais
        </h2>
        <h3 className="max-w-3xl text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          O produto existe, funciona e sustenta a narrativa técnica com telas reais.
        </h3>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          As imagens abaixo foram capturadas do próprio MyFinance em execução,
          com dashboard, fluxo de transações e revisão de importação CSV.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {portfolioScreenshotCards.map((shot) => (
          <figure
            key={shot.src}
            className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/95 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] ring-1 ring-border/40"
          >
            <Image
              alt={shot.alt}
              className="h-auto w-full object-cover"
              height={shot.height}
              src={shot.src}
              sizes="(max-width: 1023px) 100vw, 33vw"
              width={shot.width}
            />
            <figcaption className="space-y-1 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">{shot.title}</p>
              <p className="text-sm leading-6 text-muted-foreground">{shot.body}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
