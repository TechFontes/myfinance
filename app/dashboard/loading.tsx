function LoadingPanel() {
  return (
    <div
      data-testid="dashboard-loading-panel"
      className="rounded-[1.5rem] border border-border/70 bg-background/95 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)]"
    >
      <div className="h-3 w-24 rounded-full bg-muted" />
      <div className="mt-4 h-8 w-40 rounded-full bg-muted/80" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full rounded-full bg-muted/70" />
        <div className="h-4 w-5/6 rounded-full bg-muted/60" />
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <header className="overflow-hidden rounded-[2rem] border border-border/80 bg-background/95 px-6 py-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] ring-1 ring-border/40 lg:px-8 lg:py-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.38em] text-muted-foreground">
              Dashboard mensal
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Carregando visão geral
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Sincronizando saldos, pendências e posições do período.
            </p>
          </div>

          <div className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background">
            Nova transação
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <LoadingPanel />
        <LoadingPanel />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LoadingPanel />
        <LoadingPanel />
      </section>
    </div>
  )
}
