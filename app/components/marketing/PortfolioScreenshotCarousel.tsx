'use client'

import Image from 'next/image'
import { useState } from 'react'

import { portfolioScreenshotCards } from './portfolio-home-content'

export function PortfolioScreenshotCarousel() {
  const [active, setActive] = useState(0)
  const current = portfolioScreenshotCards[active]

  return (
    <section
      id="screenshots"
      className="rounded-2xl border border-border/70 bg-white/80 p-5 shadow-[0_18px_56px_-46px_rgba(20,48,31,0.24)] backdrop-blur md:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Produto em execução
        </p>
        <div className="flex gap-1.5">
          {portfolioScreenshotCards.map((shot, index) => (
            <button
              key={shot.src}
              type="button"
              aria-label={`Slide ${index + 1}: ${shot.title}`}
              onClick={() => setActive(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === active ? 'bg-emerald-500' : 'bg-muted-foreground/25'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70">
        <Image
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          className="h-auto w-full object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-foreground">{current.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{current.caption}</p>
      </div>
    </section>
  )
}
