# MyFinance Portfolio Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a rota `/` do MyFinance em uma home pública de portfólio que apresente o projeto como um case técnico premium de engenharia e produto, com autoria explícita, CTAs claros e screenshots reais do sistema.

**Architecture:** A implementação será dividida em quatro frentes. A primeira define o contrato de conteúdo e navegação da home por testes. A segunda constrói a estrutura pública em componentes de marketing pequenos e reutilizáveis. A terceira adiciona screenshots reais e composição visual responsiva. A quarta fecha com polimento, acessibilidade e verificação completa de build, links e conteúdo.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, Testing Library

---

## File Structure

### Conteúdo e contrato
- Create: `app/components/marketing/portfolio-home-content.ts`
- Create: `tests/unit/home/portfolio-home-content.test.ts`

### Estrutura da página pública
- Create: `app/components/marketing/PortfolioHome.tsx`
- Create: `app/components/marketing/PortfolioHero.tsx`
- Create: `app/components/marketing/PortfolioEvidenceGrid.tsx`
- Create: `app/components/marketing/PortfolioArchitectureSection.tsx`
- Modify: `app/page.tsx`
- Create: `tests/unit/home/page.test.tsx`

### Screenshots reais
- Create: `app/components/marketing/PortfolioScreenshots.tsx`
- Create: `public/portfolio/dashboard-overview.png`
- Create: `public/portfolio/transactions-flow.png`
- Create: `public/portfolio/imports-review.png`
- Modify: `tests/unit/home/page.test.tsx`

### Polimento final
- Modify: `app/components/marketing/PortfolioHome.tsx`
- Modify: `app/components/marketing/PortfolioHero.tsx`
- Modify: `app/components/marketing/PortfolioScreenshots.tsx`
- Modify: `tests/unit/home/page.test.tsx`

## Parallelization Strategy

### Stage 0: Content contract first
- Task 1 must run before visual implementation. Sem o contrato de narrativa e CTAs, a home vira peça visual sem direção.

### Stage 1: Parallel-safe execution
- **Agent A:** Task 2
  - Ownership: `app/page.tsx`, `app/components/marketing/PortfolioHome.tsx`, `app/components/marketing/PortfolioHero.tsx`, `app/components/marketing/PortfolioEvidenceGrid.tsx`, `app/components/marketing/PortfolioArchitectureSection.tsx`, `tests/unit/home/page.test.tsx`
- **Agent B:** Task 3
  - Ownership: `public/portfolio/*.png`, `app/components/marketing/PortfolioScreenshots.tsx`

### Stage 2: Final polish
- Task 4 runs after Tasks 2 and 3 are integrated.

## Tasks

### Task 1: Define The Portfolio Home Content Contract

**Files:**
- Create: `app/components/marketing/portfolio-home-content.ts`
- Create: `tests/unit/home/portfolio-home-content.test.ts`

- [ ] **Step 1: Write the failing content contract test**

```ts
// tests/unit/home/portfolio-home-content.test.ts
import { describe, expect, it } from 'vitest'
import {
  portfolioCtas,
  portfolioHighlights,
  portfolioSections,
} from '@/components/marketing/portfolio-home-content'

describe('portfolio home content contract', () => {
  it('defines the public CTAs and the login action separately', () => {
    expect(portfolioCtas.primary.map((item) => item.label)).toEqual([
      'GitHub',
      'LinkedIn',
      'Demo ao vivo',
      'WhatsApp',
    ])
    expect(portfolioCtas.login).toEqual({
      href: '/login',
      label: 'Login',
    })
  })

  it('exposes the core highlights and sections of the case narrative', () => {
    expect(portfolioHighlights).toContain('Next.js 16')
    expect(portfolioHighlights).toContain('TDD')
    expect(portfolioHighlights).toContain('Standalone deploy')
    expect(portfolioSections.map((section) => section.id)).toEqual([
      'problem',
      'architecture',
      'quality',
      'screenshots',
    ])
  })
})
```

- [ ] **Step 2: Run the focused content test and verify it fails**

Run: `yarn test tests/unit/home/portfolio-home-content.test.ts`

Expected: FAIL because the marketing content module does not exist yet.

- [ ] **Step 3: Create the typed content source**

```ts
// app/components/marketing/portfolio-home-content.ts
export const portfolioCtas = {
  primary: [
    { label: 'GitHub', href: 'https://github.com/techfontes' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-fontes-tech/' },
    { label: 'Demo ao vivo', href: '#' },
    { label: 'WhatsApp', href: 'https://wa.me/5521989799816' },
  ],
  login: {
    label: 'Login',
    href: '/login',
  },
} as const

export const portfolioHighlights = [
  'Next.js 16',
  'React 19',
  'Prisma + MySQL',
  'TDD',
  'Auth hardening',
  'Standalone deploy',
  'Dashboard patrimonial',
  'Importação CSV',
] as const

export const portfolioSections = [
  { id: 'problem', title: 'Problema resolvido' },
  { id: 'architecture', title: 'Arquitetura e produto' },
  { id: 'quality', title: 'Qualidade de execução' },
  { id: 'screenshots', title: 'Provas visuais' },
] as const
```

- [ ] **Step 4: Re-run the content test**

Run: `yarn test tests/unit/home/portfolio-home-content.test.ts`

Expected: PASS

- [ ] **Step 5: Commit the content contract**

```bash
git add app/components/marketing/portfolio-home-content.ts tests/unit/home/portfolio-home-content.test.ts
git commit -m "test: define portfolio home content contract"
```

### Task 2: Build The Public Case Structure

**Files:**
- Create: `app/components/marketing/PortfolioHome.tsx`
- Create: `app/components/marketing/PortfolioHero.tsx`
- Create: `app/components/marketing/PortfolioEvidenceGrid.tsx`
- Create: `app/components/marketing/PortfolioArchitectureSection.tsx`
- Modify: `app/page.tsx`
- Create: `tests/unit/home/page.test.tsx`

- [ ] **Step 1: Write the failing page contract test**

```tsx
// tests/unit/home/page.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('portfolio home page', () => {
  it('renders the project as a technical product case with explicit authorship', async () => {
    const { default: HomePage } = await import('@/page')

    render(await HomePage())

    expect(
      screen.getByRole('heading', {
        name: /MyFinance é um sistema de finanças pessoais construído como produto real/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Daniel Fontes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Demo ao vivo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
  })
})
```

- [ ] **Step 2: Run the page test and verify it fails**

Run: `yarn test tests/unit/home/page.test.tsx`

Expected: FAIL because the home is still only `<div>Home</div>`.

- [ ] **Step 3: Create the hero and main marketing shell**

```tsx
// app/components/marketing/PortfolioHero.tsx
import Link from 'next/link'
import { portfolioCtas, portfolioHighlights } from './portfolio-home-content'

export function PortfolioHero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Daniel Fontes · Engenharia e produto
        </div>
        <div className="space-y-4">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            MyFinance é um sistema de finanças pessoais construído como produto real,
            com foco em clareza patrimonial, arquitetura modular e execução técnica rigorosa.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Um case técnico pensado para separar previsto e realizado, organizar caixa, cartões,
            recorrência, metas e importação em uma base coesa.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {portfolioCtas.primary.map((cta) => (
            <Link
              key={cta.label}
              href={cta.href}
              className="inline-flex items-center justify-center rounded-full border border-border/70 bg-card/90 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {cta.label}
            </Link>
          ))}
          <Link
            href={portfolioCtas.login.href}
            className="inline-flex items-center justify-center rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            {portfolioCtas.login.label}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {portfolioHighlights.map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {highlight}
            </span>
          ))}
        </div>
      </div>
      <div data-testid="portfolio-hero-visual" />
    </section>
  )
}
```

```tsx
// app/components/marketing/PortfolioHome.tsx
import { PortfolioHero } from './PortfolioHero'
import { PortfolioEvidenceGrid } from './PortfolioEvidenceGrid'
import { PortfolioArchitectureSection } from './PortfolioArchitectureSection'

export function PortfolioHome() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-20">
        <PortfolioHero />
        <PortfolioEvidenceGrid />
        <PortfolioArchitectureSection />
      </div>
    </main>
  )
}
```

```tsx
// app/page.tsx
import { PortfolioHome } from '@/components/marketing/PortfolioHome'

export default function HomePage() {
  return <PortfolioHome />
}
```

- [ ] **Step 4: Re-run the home page test**

Run: `yarn test tests/unit/home/page.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit the public home shell**

```bash
git add app/page.tsx app/components/marketing/PortfolioHome.tsx app/components/marketing/PortfolioHero.tsx app/components/marketing/PortfolioEvidenceGrid.tsx app/components/marketing/PortfolioArchitectureSection.tsx tests/unit/home/page.test.tsx
git commit -m "feat: build portfolio home shell"
```

### Task 3: Add Real Screenshots And Proof Sections

**Files:**
- Create: `app/components/marketing/PortfolioScreenshots.tsx`
- Create: `public/portfolio/dashboard-overview.png`
- Create: `public/portfolio/transactions-flow.png`
- Create: `public/portfolio/imports-review.png`
- Modify: `app/components/marketing/PortfolioHome.tsx`
- Modify: `tests/unit/home/page.test.tsx`

- [ ] **Step 1: Write the failing screenshot test**

```tsx
// tests/unit/home/page.test.tsx
it('renders a screenshot section that proves the product exists', async () => {
  const { default: HomePage } = await import('@/page')

  render(await HomePage())

  expect(screen.getByRole('img', { name: 'Dashboard MyFinance' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Fluxo de transações MyFinance' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Revisão de importação CSV MyFinance' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the screenshot test and verify it fails**

Run: `yarn test tests/unit/home/page.test.tsx`

Expected: FAIL because the home does not render screenshots yet.

- [ ] **Step 3: Capture and add the screenshots to public assets**

Create these exact files:
- `public/portfolio/dashboard-overview.png`
- `public/portfolio/transactions-flow.png`
- `public/portfolio/imports-review.png`

Capture source routes:
- `/dashboard`
- `/dashboard/transactions`
- `/dashboard/imports`

Rules for capture:
- use real current UI
- no example credentials visible
- no user email, password or sensitive identifiers visible
- crop for clean framing and consistent proportions

- [ ] **Step 4: Render the screenshot section**

```tsx
// app/components/marketing/PortfolioScreenshots.tsx
import Image from 'next/image'

const screenshots = [
  {
    src: '/portfolio/dashboard-overview.png',
    alt: 'Dashboard MyFinance',
    title: 'Dashboard patrimonial',
  },
  {
    src: '/portfolio/transactions-flow.png',
    alt: 'Fluxo de transações MyFinance',
    title: 'Fluxo operacional de transações',
  },
  {
    src: '/portfolio/imports-review.png',
    alt: 'Revisão de importação CSV MyFinance',
    title: 'Importação CSV com revisão',
  },
]

export function PortfolioScreenshots() {
  return (
    <section id="screenshots" className="space-y-6">
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">Provas visuais</p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">O produto existe, funciona e sustenta o discurso técnico.</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {screenshots.map((shot) => (
          <figure key={shot.src} className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/90 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
            <Image src={shot.src} alt={shot.alt} width={1280} height={900} className="h-auto w-full object-cover" />
            <figcaption className="px-4 py-4 text-sm font-medium text-foreground">{shot.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Re-run the home page test**

Run: `yarn test tests/unit/home/page.test.tsx`

Expected: PASS with the screenshot section rendered.

- [ ] **Step 6: Commit the screenshots and proof section**

```bash
git add public/portfolio/dashboard-overview.png public/portfolio/transactions-flow.png public/portfolio/imports-review.png app/components/marketing/PortfolioScreenshots.tsx app/components/marketing/PortfolioHome.tsx tests/unit/home/page.test.tsx
git commit -m "feat: add portfolio proof screenshots"
```

### Task 4: Polish, Accessibility, And Final Verification

**Files:**
- Modify: `app/components/marketing/PortfolioHome.tsx`
- Modify: `app/components/marketing/PortfolioHero.tsx`
- Modify: `app/components/marketing/PortfolioScreenshots.tsx`
- Modify: `tests/unit/home/page.test.tsx`

- [ ] **Step 1: Write the failing polish test**

```tsx
// tests/unit/home/page.test.tsx
it('keeps the login action visible in the top navigation and exposes section anchors', async () => {
  const { default: HomePage } = await import('@/page')

  render(await HomePage())

  expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
  expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', expect.stringContaining('github.com'))
  expect(screen.getByText('Problema resolvido')).toBeInTheDocument()
  expect(screen.getByText('Arquitetura e produto')).toBeInTheDocument()
  expect(screen.getByText('Qualidade de execução')).toBeInTheDocument()
  expect(screen.getByText('Provas visuais')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the home test and verify it fails**

Run: `yarn test tests/unit/home/page.test.tsx`

Expected: FAIL until all narrative sections and navigation details are present.

- [ ] **Step 3: Finish the page structure and section hierarchy**

```tsx
// app/components/marketing/PortfolioEvidenceGrid.tsx
export function PortfolioEvidenceGrid() {
  return (
    <section id="problem" className="grid gap-4 lg:grid-cols-3">
      <article className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
        <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">Problema resolvido</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Clareza entre previsto, realizado, caixa e cartão.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O projeto resolve a fragmentação comum do controle financeiro pessoal quando receitas,
          despesas, cartões, recorrência, metas e importação vivem em fluxos desconectados.
        </p>
      </article>
      <article className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
        <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">Qualidade de execução</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">TDD, hardening e runtime operacional.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O case expõe testes, hardening de auth/session, refino visual e deploy standalone para PM2.
        </p>
      </article>
      <article className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
        <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">Arquitetura e produto</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Produto pensado além da interface.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O sistema combina módulos financeiros, boundaries server/client, Prisma, dashboard patrimonial e imports.
        </p>
      </article>
    </section>
  )
}
```

- [ ] **Step 4: Run the final verification**

Run:
- `yarn test tests/unit/home/portfolio-home-content.test.ts tests/unit/home/page.test.tsx`
- `yarn eslint app/page.tsx app/components/marketing/*.tsx app/components/marketing/portfolio-home-content.ts tests/unit/home/*.test.tsx`
- `yarn build`

Expected:
- tests PASS
- eslint PASS
- build PASS

- [ ] **Step 5: Commit the portfolio home**

```bash
git add app/page.tsx app/components/marketing public/portfolio tests/unit/home
git commit -m "feat: turn public home into portfolio case"
```
