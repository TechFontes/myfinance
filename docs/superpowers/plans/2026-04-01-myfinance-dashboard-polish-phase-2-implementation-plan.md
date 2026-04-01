# MyFinance Dashboard Polish Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar dashboard e navegação do MyFinance para uma leitura de patrimônio editorial, com mais presença visual no corpo da tela e mais coerência entre shell e painéis internos.

**Architecture:** A implementação se divide em duas frentes independentes. A primeira concentra o miolo do dashboard em `DashboardReportView`, reforçando hierarquia, cromia e densidade patrimonial. A segunda ajusta `Header` e `SideBar` para sustentar esse novo peso visual sem reabrir o sistema inteiro. No final, a verificação consolida testes, lint e regressões de contrato.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Vitest, Testing Library

---

## File Structure

### Dashboard patrimonial
- Modify: `app/components/dashboard/DashboardReportView.tsx`
- Modify: `tests/unit/dashboard/dashboard-report-view.test.tsx`

### Navegação e shell
- Modify: `app/components/layout/SideBar.tsx`
- Modify: `app/components/layout/Header.tsx`
- Modify: `tests/unit/layout/sidebar.test.tsx`

### Verificação final
- Run: `yarn test tests/unit/dashboard/dashboard-report-view.test.tsx tests/unit/layout/sidebar.test.tsx tests/unit/dashboard/dashboard-page.test.tsx`
- Run: `yarn test`
- Run: `yarn lint`

## Parallelization Strategy

### Stage 0: Parallel Implementation
- **Agent A:** Task 1 only
  - Ownership: `app/components/dashboard/DashboardReportView.tsx`, `tests/unit/dashboard/dashboard-report-view.test.tsx`
- **Agent B:** Task 2 only
  - Ownership: `app/components/layout/SideBar.tsx`, `app/components/layout/Header.tsx`, `tests/unit/layout/sidebar.test.tsx`

### Stage 1: Final Verification
- After Tasks 1 and 2 are merged cleanly, run Task 3 in the controller session or a dedicated verification subagent.

## Tasks

### Task 1: Refine DashboardReportView Into a Patrimonial Surface

**Files:**
- Modify: `app/components/dashboard/DashboardReportView.tsx`
- Modify: `tests/unit/dashboard/dashboard-report-view.test.tsx`

- [ ] **Step 1: Write the failing dashboard polish tests**

```tsx
// tests/unit/dashboard/dashboard-report-view.test.tsx
it('renders patrimonial summary cards with stronger financial semantics', () => {
  render(
    <DashboardReportView
      availableMonths={['2026-03']}
      report={{
        period: { mode: 'MONTHLY', month: '2026-03', label: 'março de 2026' },
        summary: {
          forecastIncome: '1000.00',
          forecastExpense: '250.00',
          realizedIncome: '850.00',
          realizedExpense: '200.00',
          forecastBalance: '750.00',
          realizedBalance: '650.00',
        },
        pending: [],
        accounts: [],
        categories: [],
        cardInvoices: [],
        transfers: [],
      }}
    />,
  )

  expect(screen.getByText('Saldo previsto')).toBeInTheDocument()
  expect(screen.getByText('Saldo realizado')).toBeInTheDocument()
  expect(screen.getByText('Receitas')).toBeInTheDocument()
  expect(screen.getByText('Despesas')).toBeInTheDocument()
  expect(screen.getByText('Posição patrimonial do período')).toBeInTheDocument()
})
```

```tsx
// tests/unit/dashboard/dashboard-report-view.test.tsx
it('renders richer empty states and highlighted section chrome', () => {
  render(
    <DashboardReportView
      availableMonths={['2026-03']}
      report={{
        period: { mode: 'MONTHLY', month: '2026-03', label: 'março de 2026' },
        summary: {
          forecastIncome: '0.00',
          forecastExpense: '0.00',
          realizedIncome: '0.00',
          realizedExpense: '0.00',
          forecastBalance: '0.00',
          realizedBalance: '0.00',
        },
        pending: [],
        accounts: [],
        categories: [],
        cardInvoices: [],
        transfers: [],
      }}
    />,
  )

  expect(screen.getByText('Nenhuma conta patrimonial registrada neste período.')).toBeInTheDocument()
  expect(screen.getByText('Nenhuma categoria com impacto relevante neste período.')).toBeInTheDocument()
  expect(screen.getByText('Nenhuma fatura patrimonial aberta neste período.')).toBeInTheDocument()
  expect(screen.getByText('Nenhuma movimentação interna registrada neste período.')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused dashboard test and verify it fails**

Run: `yarn test tests/unit/dashboard/dashboard-report-view.test.tsx`

Expected: FAIL because the current copy and section chrome still reflect the previous phase and do not expose the new patrimonial wording.

- [ ] **Step 3: Implement the patrimonial dashboard polish**

```tsx
// app/components/dashboard/DashboardReportView.tsx
function SummaryCard({
  title,
  eyebrow,
  accentClassName,
  income,
  expense,
  balance,
}: {
  title: string
  eyebrow: string
  accentClassName: string
  income: string
  expense: string
  balance: string
}) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card p-0 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
      <div className={cn('h-1.5 w-full', accentClassName)} />
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">{eyebrow}</p>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="font-serif text-4xl tracking-tight text-foreground">{formatCurrency(balance)}</h3>
          <p className="text-sm text-muted-foreground">Posição patrimonial do período</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Receitas</p>
            <p className="mt-2 text-xl font-semibold text-emerald-700 dark:text-emerald-200">{formatCurrency(income)}</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-rose-700 dark:text-rose-300">Despesas</p>
            <p className="mt-2 text-xl font-semibold text-rose-700 dark:text-rose-200">{formatCurrency(expense)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
```

```tsx
// app/components/dashboard/DashboardReportView.tsx
function SectionPanel({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border/80 bg-card p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)]">
      <div className="space-y-5">
        <div className="space-y-2 border-b border-border/70 pb-4">
          <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">{eyebrow}</p>
          <h2 className="font-serif text-2xl tracking-tight text-foreground">{title}</h2>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
    </Card>
  )
}
```

```tsx
// app/components/dashboard/DashboardReportView.tsx
<SummaryCard
  title="Saldo previsto"
  eyebrow="Projeção"
  accentClassName="bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300"
  income={report.summary.forecastIncome}
  expense={report.summary.forecastExpense}
  balance={report.summary.forecastBalance}
/>
<SummaryCard
  title="Saldo realizado"
  eyebrow="Realizado"
  accentClassName="bg-gradient-to-r from-foreground via-foreground/85 to-foreground/65"
  income={report.summary.realizedIncome}
  expense={report.summary.realizedExpense}
  balance={report.summary.realizedBalance}
/>
```

```tsx
// app/components/dashboard/DashboardReportView.tsx
<EmptySectionState>Nenhuma conta patrimonial registrada neste período.</EmptySectionState>
<EmptySectionState>Nenhuma categoria com impacto relevante neste período.</EmptySectionState>
<EmptySectionState>Nenhuma fatura patrimonial aberta neste período.</EmptySectionState>
<EmptySectionState>Nenhuma movimentação interna registrada neste período.</EmptySectionState>
```

- [ ] **Step 4: Run the dashboard verification**

Run: `yarn test tests/unit/dashboard/dashboard-report-view.test.tsx`

Expected: PASS with all dashboard report view tests green.

- [ ] **Step 5: Commit the dashboard polish**

```bash
git add app/components/dashboard/DashboardReportView.tsx tests/unit/dashboard/dashboard-report-view.test.tsx
git commit -m "feat: polish patrimonial dashboard surface"
```

### Task 2: Refine Sidebar and Header for Editorial Continuity

**Files:**
- Modify: `app/components/layout/SideBar.tsx`
- Modify: `app/components/layout/Header.tsx`
- Modify: `tests/unit/layout/sidebar.test.tsx`

- [ ] **Step 1: Write the failing shell polish tests**

```tsx
// tests/unit/layout/sidebar.test.tsx
it('renders the sidebar as an editorial navigation rail', () => {
  render(<Sidebar />)

  expect(screen.getByText('MyFinance')).toBeInTheDocument()
  expect(screen.getByText('Workspace financeiro')).toBeInTheDocument()
  expect(screen.getByText('Controle patrimonial')).toBeInTheDocument()
})
```

```tsx
// tests/unit/layout/sidebar.test.tsx
it('renders a stronger mobile navigation label in the header', () => {
  render(<Header />)

  expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
  expect(screen.getByText('Controle patrimonial')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused shell tests and verify they fail**

Run: `yarn test tests/unit/layout/sidebar.test.tsx`

Expected: FAIL because the current sidebar/header copy does not yet expose the stronger patrimonial phrasing and shell polish.

- [ ] **Step 3: Implement the shell refinements**

```tsx
// app/components/layout/SideBar.tsx
<aside className="hidden w-72 shrink-0 flex-col border-r border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,transparent),color-mix(in_oklab,var(--color-background)_88%,transparent))] px-5 py-6 backdrop-blur md:flex">
  <div className="rounded-[2rem] border border-border/70 bg-card/92 p-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.45)]">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-foreground text-sm font-semibold text-background">
        MF
      </div>
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">Workspace financeiro</p>
        <h2 className="font-serif text-2xl tracking-tight text-foreground">MyFinance</h2>
      </div>
    </div>
    <p className="mt-4 text-sm leading-6 text-muted-foreground">
      Controle patrimonial, leitura editorial e visão consolidada em uma única mesa.
    </p>
  </div>
</aside>
```

```tsx
// app/components/layout/SideBar.tsx
className={twMerge(
  'block rounded-2xl border border-transparent px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border/70 hover:bg-card hover:text-foreground',
  isActive && 'border-border/80 bg-foreground text-background shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)] hover:bg-foreground hover:text-background',
)}
```

```tsx
// app/components/layout/Header.tsx
<div className="min-w-0">
  <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Workspace financeiro</p>
  <div className="flex items-center gap-2">
    <span className="font-serif text-2xl tracking-tight text-foreground">MyFinance</span>
    <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-flex" />
    <span className="hidden text-sm text-muted-foreground sm:inline">controle patrimonial</span>
  </div>
</div>
```

```tsx
// app/components/layout/Header.tsx
<nav
  aria-label="Navegação principal"
  className="mt-3 flex gap-2 overflow-x-auto border-t border-border/70 pt-3 md:hidden"
>
  {mobileNavItems.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className="inline-flex shrink-0 items-center rounded-full border border-border/70 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {item.label}
    </Link>
  ))}
</nav>
```

- [ ] **Step 4: Run the shell verification**

Run: `yarn test tests/unit/layout/sidebar.test.tsx`

Expected: PASS with all sidebar/header tests green.

- [ ] **Step 5: Commit the shell polish**

```bash
git add app/components/layout/SideBar.tsx app/components/layout/Header.tsx tests/unit/layout/sidebar.test.tsx
git commit -m "feat: polish dashboard navigation shell"
```

### Task 3: Final Verification for Dashboard Polish Phase 2

**Files:**
- Modify: none
- Verify: `tests/unit/dashboard/dashboard-report-view.test.tsx`
- Verify: `tests/unit/layout/sidebar.test.tsx`
- Verify: `tests/unit/dashboard/dashboard-page.test.tsx`

- [ ] **Step 1: Run the focused dashboard polish suite**

Run: `yarn test tests/unit/dashboard/dashboard-report-view.test.tsx tests/unit/layout/sidebar.test.tsx tests/unit/dashboard/dashboard-page.test.tsx`

Expected: PASS with all focused dashboard/navigation tests green.

- [ ] **Step 2: Run the full test suite**

Run: `yarn test`

Expected: PASS with the full Vitest suite green.

- [ ] **Step 3: Run lint**

Run: `yarn lint`

Expected: PASS with no errors. Existing warnings outside this scope may remain, but the command must exit successfully.

- [ ] **Step 4: Manually validate the polished dashboard**

Run: `yarn dev`

Expected:
- `/dashboard` reads as a patrimonial surface, not a neutral card grid
- summary cards feel denser and more noble than phase 1
- section bodies have stronger internal rhythm and richer empty states
- sidebar and header feel visually continuous with the dashboard body

- [ ] **Step 5: Close the phase cleanly**

```bash
git status
```

Expected:
- working tree clean if no follow-up fixes were needed
- if final verification required code changes, create one last focused commit before handoff

## Execution Notes

- Do not reopen global primitives unless a dashboard polish detail is impossible to express with the current surface layer.
- Keep the new shell refinements secondary to the dashboard body; the dashboard remains the main visual payload.
- Avoid inventing new product copy outside the approved patrimonial vocabulary.
- If the dashboard page test becomes slow under full-suite load again, preserve the current contract-first test shape rather than reintroducing the full report render in that file.
