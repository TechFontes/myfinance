import { portfolioDomainModules } from './portfolio-home-content'

export function PortfolioDomainMap() {
  return (
    <section className="rounded-2xl border border-border/70 bg-white/80 p-5 shadow-[0_18px_56px_-46px_rgba(20,48,31,0.24)] backdrop-blur md:p-6">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-700">
        Mapa de domínio
      </p>

      <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm">
          🔒
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {portfolioDomainModules.auth.title}
          </p>
          <p className="text-xs text-amber-900/70">
            {portfolioDomainModules.auth.capabilities}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {portfolioDomainModules.modules.map((mod) => (
          <div
            key={mod.name}
            className={`rounded-xl border px-3 py-2.5 text-center ${
              mod.tier === 'primary'
                ? 'border-emerald-200/80 bg-emerald-50/60'
                : 'border-border/70 bg-muted/40'
            }`}
          >
            <p className="text-sm font-semibold text-foreground">{mod.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{mod.summary}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
