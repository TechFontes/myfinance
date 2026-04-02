import Link from 'next/link'

import { portfolioContact } from './portfolio-home-content'

export function PortfolioFooter() {
  return (
    <footer className="rounded-2xl border border-border/70 bg-white/80 px-5 py-4 shadow-[0_18px_56px_-46px_rgba(20,48,31,0.24)] backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">{portfolioContact.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{portfolioContact.role}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
            <a
              href={`mailto:${portfolioContact.email}`}
              className="text-sm font-medium text-foreground hover:text-emerald-700"
            >
              {portfolioContact.email}
            </a>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">WhatsApp</p>
            <a
              href={portfolioContact.whatsapp.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-foreground hover:text-emerald-700"
            >
              {portfolioContact.whatsapp.display}
            </a>
          </div>

          <div className="flex gap-2">
            {portfolioContact.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border/70 bg-white/95 px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-emerald-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
