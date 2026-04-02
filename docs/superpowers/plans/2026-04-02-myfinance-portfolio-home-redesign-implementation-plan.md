# MyFinance Portfolio Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text-heavy portfolio home with a compact, evidence-driven page showing domain map, engineering process timeline, metrics, and screenshot carousel.

**Architecture:** Rewrite all marketing components while keeping the same page route (`app/page.tsx → PortfolioHome`). Content data stays centralized in `portfolio-home-content.ts`. New client component only for the screenshot carousel (needs useState). Everything else is server components.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TailwindCSS 4, Vitest, React Testing Library.

---

## File Structure Map

### Content data
- Modify: `app/components/marketing/portfolio-home-content.ts`

### Components (rewrite)
- Modify: `app/components/marketing/PortfolioHome.tsx`
- Modify: `app/components/marketing/PortfolioHero.tsx`
- Delete: `app/components/marketing/PortfolioEvidenceGrid.tsx`
- Delete: `app/components/marketing/PortfolioArchitectureSection.tsx`
- Delete: `app/components/marketing/PortfolioScreenshots.tsx`
- Create: `app/components/marketing/PortfolioDomainMap.tsx`
- Create: `app/components/marketing/PortfolioProcessMap.tsx`
- Create: `app/components/marketing/PortfolioMetrics.tsx`
- Create: `app/components/marketing/PortfolioScreenshotCarousel.tsx`
- Create: `app/components/marketing/PortfolioFooter.tsx`

### Tests
- Modify: `tests/unit/home/portfolio-home-content.test.ts`
- Create: `tests/unit/home/portfolio-home-components.test.tsx`

---

### Task 1: Update Content Data and Content Test

**Files:**
- Modify: `app/components/marketing/portfolio-home-content.ts`
- Modify: `tests/unit/home/portfolio-home-content.test.ts`

- [ ] **Step 1: Write the failing test for new content structure**

Replace `tests/unit/home/portfolio-home-content.test.ts` with:

```ts
import { describe, expect, it } from 'vitest'

import {
  portfolioContact,
  portfolioCtas,
  portfolioDomainModules,
  portfolioMetrics,
  portfolioProcessSteps,
  portfolioScreenshotCards,
} from '@/components/marketing/portfolio-home-content'

describe('portfolio home content contract', () => {
  it('defines the public CTAs and the login action', () => {
    expect(portfolioCtas.primary.map((item) => item.label)).toEqual([
      'GitHub',
      'LinkedIn',
      'Demo',
    ])
    expect(portfolioCtas.login).toEqual({
      href: '/login',
      label: 'Login',
    })
  })

  it('defines the auth layer and 8 domain modules', () => {
    expect(portfolioDomainModules.auth).toMatchObject({
      title: 'Auth & Segurança',
    })
    expect(portfolioDomainModules.modules).toHaveLength(8)
    expect(portfolioDomainModules.modules.map((m) => m.name)).toEqual([
      'Transações',
      'Cartões',
      'Metas',
      'Dashboard',
      'Contas',
      'Transferências',
      'Recorrência',
      'Importação',
    ])
  })

  it('defines the 6-step engineering process', () => {
    expect(portfolioProcessSteps).toHaveLength(6)
    expect(portfolioProcessSteps[0].title).toContain('PRD')
    expect(portfolioProcessSteps[2].title).toContain('Teste primeiro')
    expect(portfolioProcessSteps[2].tag).toBe('Lei do projeto')
    expect(portfolioProcessSteps[5].title).toContain('4 gates')
  })

  it('defines 5 project metrics', () => {
    expect(portfolioMetrics).toHaveLength(5)
    expect(portfolioMetrics[0]).toMatchObject({ value: '350+', label: 'testes automatizados' })
  })

  it('defines 3 screenshot cards', () => {
    expect(portfolioScreenshotCards).toHaveLength(3)
    expect(portfolioScreenshotCards.every((s) => s.src && s.alt && s.title)).toBe(true)
  })

  it('defines contact information', () => {
    expect(portfolioContact.name).toBe('Daniel Fontes')
    expect(portfolioContact.links).toBeDefined()
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-content.test.ts
```

Expected: FAIL — missing exports `portfolioDomainModules`, `portfolioProcessSteps`, `portfolioContact`, etc.

- [ ] **Step 3: Implement the new content data**

Replace `app/components/marketing/portfolio-home-content.ts` with:

```ts
export const portfolioCtas = {
  primary: [
    { label: 'GitHub', href: 'https://github.com/techfontes' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-fontes-tech/' },
    { label: 'Demo', href: '#screenshots' },
  ],
  login: {
    label: 'Login',
    href: '/login',
  },
} as const

export const portfolioDomainModules = {
  auth: {
    title: 'Auth & Segurança',
    capabilities: 'JWT httpOnly · bcrypt · middleware de sessão · RBAC admin/user · bloqueio de conta',
  },
  modules: [
    { name: 'Transações', summary: 'CRUD · status · competência', tier: 'primary' },
    { name: 'Cartões', summary: 'Faturas · parcelas · close/due', tier: 'primary' },
    { name: 'Metas', summary: 'Aportes · resgates · reserva', tier: 'primary' },
    { name: 'Dashboard', summary: 'Visão patrimonial mensal', tier: 'primary' },
    { name: 'Contas', summary: 'Banco · carteira · saldo', tier: 'secondary' },
    { name: 'Transferências', summary: 'Entre contas próprias', tier: 'secondary' },
    { name: 'Recorrência', summary: 'Regras · projeção futura', tier: 'secondary' },
    { name: 'Importação', summary: 'CSV · preview · validação', tier: 'secondary' },
  ],
} as const

export const portfolioProcessSteps = [
  {
    title: 'PRD antes de qualquer código',
    tag: 'Requisitos',
    tagColor: 'green' as const,
    description: 'Cada feature nasce como documento de produto com escopo fechado, não como ideia solta.',
    badges: ['Escopo definido', 'Requisitos funcionais', 'Requisitos não-funcionais', 'Critérios de aceitação'],
    accent: 'green' as const,
  },
  {
    title: 'Design spec → Plano de implementação',
    tag: 'Arquitetura',
    tagColor: 'neutral' as const,
    description: 'PRD vira spec técnica com decisões de arquitetura. Spec vira plano com tasks numeradas, arquivos mapeados e checkpoints de commit.',
    accent: 'green' as const,
  },
  {
    title: 'Teste primeiro, código depois',
    tag: 'Lei do projeto',
    tagColor: 'red' as const,
    description: 'Nenhuma linha de produção existe antes de um teste que falha. O teste prova o bug ou a feature ausente antes do fix.',
    flow: ['RED — teste falha', 'GREEN — código passa', 'REFACTOR — limpa'],
    accent: 'red' as const,
  },
  {
    title: 'Execução paralela em worktrees isolados',
    tag: 'Coordenação',
    tagColor: 'purple' as const,
    description: 'Tasks independentes rodam em paralelo com git worktrees. Integração apenas após verificação cruzada de cada agente.',
    accent: 'green' as const,
  },
  {
    title: 'Schema discipline como gate obrigatório',
    tag: 'Governança',
    tagColor: 'pink' as const,
    description: 'Toda mudança no Prisma schema exige migration. Testes automatizados verificam que a migration existe. Deploy sem migration é bloqueante.',
    accent: 'green' as const,
  },
  {
    title: '4 gates antes de publicar',
    tag: 'Publish',
    tagColor: 'blue' as const,
    gates: [
      { label: 'Design', color: 'green' },
      { label: 'Red test', color: 'red' },
      { label: 'Integration', color: 'purple' },
      { label: 'Publish', color: 'blue' },
    ],
    accent: 'green' as const,
  },
] as const

export const portfolioMetrics = [
  { value: '350+', label: 'testes automatizados' },
  { value: '13', label: 'módulos de domínio' },
  { value: '12', label: 'API routes RESTful' },
  { value: 'TDD', label: 'test-first workflow' },
  { value: 'PM2', label: 'standalone deploy' },
] as const

export const portfolioScreenshotCards = [
  {
    src: '/portfolio/dashboard-overview.png',
    alt: 'Dashboard MyFinance',
    title: 'Dashboard patrimonial',
    caption: 'Posição financeira com cards de saldo, pendências e visão mensal',
    width: 1280,
    height: 1372,
  },
  {
    src: '/portfolio/transactions-flow.png',
    alt: 'Fluxo de transações MyFinance',
    title: 'Operação de transações',
    caption: 'Listagem densa orientada a operação diária',
    width: 1280,
    height: 544,
  },
  {
    src: '/portfolio/imports-review.png',
    alt: 'Revisão de importação CSV MyFinance',
    title: 'Importação CSV guiada',
    caption: 'Preview e validação antes da confirmação',
    width: 1280,
    height: 1273,
  },
] as const

export const portfolioContact = {
  name: 'Daniel Fontes',
  role: 'Engenheiro de software · Rio de Janeiro',
  email: 'daniel@techfontes.com',
  whatsapp: {
    display: '(21) 98979-9816',
    href: 'https://wa.me/5521989799816',
  },
  links: [
    { label: 'GitHub', href: 'https://github.com/techfontes' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-fontes-tech/' },
  ],
} as const
```

- [ ] **Step 4: Run the test and verify it passes**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-content.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/portfolio-home-content.ts tests/unit/home/portfolio-home-content.test.ts
git commit -m "refactor: replace portfolio content data with compact evidence-driven structure"
```

### Task 2: Rewrite PortfolioHero as Compact Bar

**Files:**
- Modify: `app/components/marketing/PortfolioHero.tsx`
- Create: `tests/unit/home/portfolio-home-components.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/home/portfolio-home-components.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('PortfolioHero', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the compact hero bar with name, stack subtitle and CTA links', async () => {
    const { PortfolioHero } = await import('@/components/marketing/PortfolioHero')
    render(<PortfolioHero />)

    expect(screen.getByText('MyFinance')).toBeInTheDocument()
    expect(screen.getByText(/por Daniel Fontes/)).toBeInTheDocument()
    expect(screen.getByText(/Next\.js 16/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Login →' })).toHaveAttribute('href', '/login')
  }, 10000)
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: FAIL — current PortfolioHero renders the old narrative structure, not the compact bar.

- [ ] **Step 3: Rewrite PortfolioHero**

Replace `app/components/marketing/PortfolioHero.tsx` with:

```tsx
import Link from 'next/link'

import { portfolioCtas } from './portfolio-home-content'

export function PortfolioHero() {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-white/85 px-5 py-4 shadow-[0_18px_56px_-46px_rgba(20,48,31,0.24)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-foreground">MyFinance</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-emerald-600/60" />
          <span className="text-sm text-muted-foreground">por Daniel Fontes</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Sistema de finanças pessoais · Next.js 16 · App Router · Prisma/MySQL · TDD
        </p>
      </div>

      <nav className="flex flex-wrap items-center gap-2">
        {portfolioCtas.primary.map((cta) => (
          <Link
            key={cta.label}
            href={cta.href}
            target={cta.href.startsWith('http') ? '_blank' : undefined}
            rel={cta.href.startsWith('http') ? 'noreferrer' : undefined}
            className="rounded-full border border-border/70 bg-white/95 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-emerald-50"
          >
            {cta.label}
          </Link>
        ))}
        <Link
          href={portfolioCtas.login.href}
          className="rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-white"
        >
          Login →
        </Link>
      </nav>
    </section>
  )
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/PortfolioHero.tsx tests/unit/home/portfolio-home-components.test.tsx
git commit -m "refactor: rewrite portfolio hero as compact bar"
```

### Task 3: Create PortfolioDomainMap

**Files:**
- Create: `app/components/marketing/PortfolioDomainMap.tsx`
- Modify: `tests/unit/home/portfolio-home-components.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/home/portfolio-home-components.test.tsx`:

```tsx
describe('PortfolioDomainMap', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the auth cross-cutting banner and all 8 domain modules', async () => {
    const { PortfolioDomainMap } = await import('@/components/marketing/PortfolioDomainMap')
    render(<PortfolioDomainMap />)

    expect(screen.getByText('Auth & Segurança')).toBeInTheDocument()
    expect(screen.getByText(/JWT httpOnly/)).toBeInTheDocument()
    expect(screen.getByText('Transações')).toBeInTheDocument()
    expect(screen.getByText('Cartões')).toBeInTheDocument()
    expect(screen.getByText('Metas')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Contas')).toBeInTheDocument()
    expect(screen.getByText('Transferências')).toBeInTheDocument()
    expect(screen.getByText('Recorrência')).toBeInTheDocument()
    expect(screen.getByText('Importação')).toBeInTheDocument()
  }, 10000)
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: FAIL — `PortfolioDomainMap` does not exist yet.

- [ ] **Step 3: Implement PortfolioDomainMap**

Create `app/components/marketing/PortfolioDomainMap.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the test and verify it passes**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/PortfolioDomainMap.tsx tests/unit/home/portfolio-home-components.test.tsx
git commit -m "feat: add portfolio domain map with auth cross-cutting banner"
```

### Task 4: Create PortfolioProcessMap

**Files:**
- Create: `app/components/marketing/PortfolioProcessMap.tsx`
- Modify: `tests/unit/home/portfolio-home-components.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/home/portfolio-home-components.test.tsx`:

```tsx
describe('PortfolioProcessMap', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders all 6 process steps with PRD first and TDD emphasized', async () => {
    const { PortfolioProcessMap } = await import('@/components/marketing/PortfolioProcessMap')
    render(<PortfolioProcessMap />)

    expect(screen.getByText('Processo de engenharia')).toBeInTheDocument()
    expect(screen.getByText(/PRD antes de qualquer código/)).toBeInTheDocument()
    expect(screen.getByText('Escopo definido')).toBeInTheDocument()
    expect(screen.getByText('Critérios de aceitação')).toBeInTheDocument()
    expect(screen.getByText(/Teste primeiro, código depois/)).toBeInTheDocument()
    expect(screen.getByText('Lei do projeto')).toBeInTheDocument()
    expect(screen.getByText('RED — teste falha')).toBeInTheDocument()
    expect(screen.getByText('GREEN — código passa')).toBeInTheDocument()
    expect(screen.getByText(/4 gates antes de publicar/)).toBeInTheDocument()
  }, 10000)
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: FAIL — `PortfolioProcessMap` does not exist yet.

- [ ] **Step 3: Implement PortfolioProcessMap**

Create `app/components/marketing/PortfolioProcessMap.tsx`:

```tsx
import { portfolioProcessSteps } from './portfolio-home-content'

const tagColors = {
  green: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-800',
  neutral: 'border-border/70 bg-muted/50 text-muted-foreground',
  red: 'border-red-200 bg-red-50 text-red-800',
  purple: 'border-violet-200 bg-violet-50 text-violet-800',
  pink: 'border-pink-200 bg-pink-50 text-pink-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-800',
} as const

const gateColors = {
  green: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  purple: 'border-violet-200 bg-violet-50 text-violet-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
} as const

const flowColors = [
  'border-red-200 bg-red-50 text-red-700',
  'border-emerald-200 bg-emerald-50 text-emerald-700',
  'border-border/70 bg-muted/50 text-muted-foreground',
] as const

export function PortfolioProcessMap() {
  return (
    <section className="rounded-2xl border border-border/70 bg-white/80 p-5 shadow-[0_18px_56px_-46px_rgba(20,48,31,0.24)] backdrop-blur md:p-6">
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-700">
        Processo de engenharia
      </p>

      <div className="relative pl-7">
        <div className="absolute bottom-1 left-[7px] top-1 w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-200" />

        {portfolioProcessSteps.map((step, index) => (
          <div key={step.title} className={`relative ${index < portfolioProcessSteps.length - 1 ? 'mb-4' : ''}`}>
            <div
              className={`absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                step.accent === 'red' ? 'bg-red-500' : 'bg-emerald-500'
              }`}
            />

            <div
              className={`rounded-xl border p-3 ${
                step.accent === 'red'
                  ? 'border-red-200/80'
                  : 'border-border/70'
              } bg-white`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">{step.title}</p>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tagColors[step.tagColor]}`}>
                  {step.tag}
                </span>
              </div>

              {'description' in step && (
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              )}

              {'badges' in step && step.badges && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {step.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {'flow' in step && step.flow && (
                <div className="mt-2 flex items-center gap-1.5">
                  {step.flow.map((item, i) => (
                    <div key={item} className="flex items-center gap-1.5">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${flowColors[i]}`}>
                        {item}
                      </span>
                      {i < step.flow!.length - 1 && (
                        <span className="text-xs text-muted-foreground/50">→</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {'gates' in step && step.gates && (
                <div className="mt-2 flex items-center gap-1.5">
                  {step.gates.map((gate, i) => (
                    <div key={gate.label} className="flex items-center gap-1.5">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${gateColors[gate.color]}`}>
                        {gate.label}
                      </span>
                      {i < step.gates!.length - 1 && (
                        <span className="text-xs text-muted-foreground/50">→</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/PortfolioProcessMap.tsx tests/unit/home/portfolio-home-components.test.tsx
git commit -m "feat: add portfolio engineering process map timeline"
```

### Task 5: Create PortfolioMetrics

**Files:**
- Create: `app/components/marketing/PortfolioMetrics.tsx`
- Modify: `tests/unit/home/portfolio-home-components.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/home/portfolio-home-components.test.tsx`:

```tsx
describe('PortfolioMetrics', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders all 5 project metrics', async () => {
    const { PortfolioMetrics } = await import('@/components/marketing/PortfolioMetrics')
    render(<PortfolioMetrics />)

    expect(screen.getByText('350+')).toBeInTheDocument()
    expect(screen.getByText('testes automatizados')).toBeInTheDocument()
    expect(screen.getByText('13')).toBeInTheDocument()
    expect(screen.getByText('módulos de domínio')).toBeInTheDocument()
    expect(screen.getByText('TDD')).toBeInTheDocument()
    expect(screen.getByText('PM2')).toBeInTheDocument()
  }, 10000)
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: FAIL — `PortfolioMetrics` does not exist yet.

- [ ] **Step 3: Implement PortfolioMetrics**

Create `app/components/marketing/PortfolioMetrics.tsx`:

```tsx
import { portfolioMetrics } from './portfolio-home-content'

export function PortfolioMetrics() {
  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {portfolioMetrics.map((metric) => (
        <div
          key={metric.value}
          className="rounded-xl border border-border/70 bg-white/80 px-3 py-3 text-center shadow-[0_10px_30px_-20px_rgba(20,48,31,0.16)] backdrop-blur"
        >
          <p className="text-xl font-bold tracking-tight text-foreground">{metric.value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{metric.label}</p>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/PortfolioMetrics.tsx tests/unit/home/portfolio-home-components.test.tsx
git commit -m "feat: add portfolio metrics row"
```

### Task 6: Create PortfolioScreenshotCarousel

**Files:**
- Create: `app/components/marketing/PortfolioScreenshotCarousel.tsx`
- Modify: `tests/unit/home/portfolio-home-components.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/home/portfolio-home-components.test.tsx`:

```tsx
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}))

describe('PortfolioScreenshotCarousel', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the first screenshot with navigation dots', async () => {
    const { PortfolioScreenshotCarousel } = await import(
      '@/components/marketing/PortfolioScreenshotCarousel'
    )
    render(<PortfolioScreenshotCarousel />)

    expect(screen.getByText('Produto em execução')).toBeInTheDocument()
    expect(screen.getByAltText('Dashboard MyFinance')).toBeInTheDocument()
    expect(screen.getByText('Dashboard patrimonial')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /slide/i })).toHaveLength(3)
  }, 10000)
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: FAIL — `PortfolioScreenshotCarousel` does not exist yet.

- [ ] **Step 3: Implement PortfolioScreenshotCarousel**

Create `app/components/marketing/PortfolioScreenshotCarousel.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the test and verify it passes**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/PortfolioScreenshotCarousel.tsx tests/unit/home/portfolio-home-components.test.tsx
git commit -m "feat: add portfolio screenshot carousel with dot navigation"
```

### Task 7: Create PortfolioFooter

**Files:**
- Create: `app/components/marketing/PortfolioFooter.tsx`
- Modify: `tests/unit/home/portfolio-home-components.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/home/portfolio-home-components.test.tsx`:

```tsx
describe('PortfolioFooter', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the contact card with name, email, whatsapp and social links', async () => {
    const { PortfolioFooter } = await import('@/components/marketing/PortfolioFooter')
    render(<PortfolioFooter />)

    expect(screen.getByText('Daniel Fontes')).toBeInTheDocument()
    expect(screen.getByText(/Engenheiro de software/)).toBeInTheDocument()
    expect(screen.getByText('(21) 98979-9816')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
  }, 10000)
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: FAIL — `PortfolioFooter` does not exist yet.

- [ ] **Step 3: Implement PortfolioFooter**

Create `app/components/marketing/PortfolioFooter.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the test and verify it passes**

Run:
```bash
npx vitest run tests/unit/home/portfolio-home-components.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/PortfolioFooter.tsx tests/unit/home/portfolio-home-components.test.tsx
git commit -m "feat: add portfolio footer contact card"
```

### Task 8: Wire Up PortfolioHome and Delete Old Components

**Files:**
- Modify: `app/components/marketing/PortfolioHome.tsx`
- Delete: `app/components/marketing/PortfolioEvidenceGrid.tsx`
- Delete: `app/components/marketing/PortfolioArchitectureSection.tsx`
- Delete: `app/components/marketing/PortfolioScreenshots.tsx`

- [ ] **Step 1: Rewrite PortfolioHome to assemble the new sections**

Replace `app/components/marketing/PortfolioHome.tsx` with:

```tsx
import { PortfolioDomainMap } from './PortfolioDomainMap'
import { PortfolioFooter } from './PortfolioFooter'
import { PortfolioHero } from './PortfolioHero'
import { PortfolioMetrics } from './PortfolioMetrics'
import { PortfolioProcessMap } from './PortfolioProcessMap'
import { PortfolioScreenshotCarousel } from './PortfolioScreenshotCarousel'

export function PortfolioHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,168,107,0.16),_transparent_28%),radial-gradient(circle_at_85%_0%,_rgba(112,166,132,0.12),_transparent_22%),linear-gradient(180deg,_#fbfdfb_0%,_#f5f9f4_44%,_#edf5ee_100%)] text-foreground">
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
```

- [ ] **Step 2: Delete old components**

```bash
rm app/components/marketing/PortfolioEvidenceGrid.tsx
rm app/components/marketing/PortfolioArchitectureSection.tsx
rm app/components/marketing/PortfolioScreenshots.tsx
```

- [ ] **Step 3: Run the full test suite for home**

Run:
```bash
npx vitest run tests/unit/home/
```

Expected: ALL PASS

- [ ] **Step 4: Run lint**

Run:
```bash
npx eslint app/components/marketing/
```

Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/ tests/unit/home/
git commit -m "refactor: wire up new portfolio home and remove old components"
```

### Task 9: Final Verification

**Files:**
- All marketing components and tests

- [ ] **Step 1: Run the full test suite**

Run:
```bash
npx vitest run
```

Expected: all tests pass (previous test count + new component tests)

- [ ] **Step 2: Run lint**

Run:
```bash
npx eslint .
```

Expected: 0 errors

- [ ] **Step 3: Run build**

Run:
```bash
yarn build
```

Expected: build succeeds with no errors

- [ ] **Step 4: Commit if any lint/build fixes were needed**

Only if Step 2 or 3 required changes:
```bash
git add -A
git commit -m "fix: address lint and build issues from portfolio redesign"
```

## Self-Review

### Spec coverage
- Hero compacto → Task 2
- Mapa de domínio com auth → Task 3
- Mapa de processo com PRD + TDD → Task 4
- Métricas → Task 5
- Screenshot carousel → Task 6
- Footer cartão de visita → Task 7
- Content data update → Task 1
- Wire up + delete old → Task 8
- Final verification → Task 9

No spec requirement is missing from the plan.

### Placeholder scan
No TBD, TODO, or vague steps. All code is complete in every step.

### Type consistency
- `portfolioDomainModules.modules[].tier` is `'primary' | 'secondary'` — used consistently in Task 1 (data) and Task 3 (component).
- `portfolioProcessSteps[].accent` is `'green' | 'red'` — used consistently in Task 1 (data) and Task 4 (component).
- `portfolioProcessSteps[].tagColor` maps to `tagColors` keys — all 6 values match.
- `portfolioScreenshotCards[].caption` — defined in Task 1, used in Task 6.
- `portfolioContact` — defined in Task 1, used in Task 7.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-02-myfinance-portfolio-home-redesign-implementation-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
