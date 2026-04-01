# MyFinance Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir o custo real e o tempo percebido de carregamento e navegação do MyFinance, com foco em shell autenticado, dashboard e rotas operacionais principais, e fechar a fase com hardening e reanálise comparativa.

**Architecture:** A implementação é dividida em quatro frentes. A primeira cria a linha de base e define o que será medido. A segunda corta custo estrutural de auth/bootstrap e do shell autenticado. A terceira ataca o dashboard mensal, que hoje concentra o trabalho mais caro da home autenticada. A quarta endurece loading/navigation e fecha a fase com reanálise baseada na mesma linha de base inicial.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma, Vitest, Testing Library, Tailwind CSS v4

---

## File Structure

### Baseline e medição
- Create: `docs/superpowers/reports/2026-04-01-myfinance-performance-baseline.md`
- Create: `scripts/performance-baseline.mjs`
- Create: `tests/unit/deploy/performance-scripts.test.ts`
- Modify: `package.json`

### Auth e shell autenticado
- Modify: `app/layout.tsx`
- Modify: `app/providers.tsx`
- Modify: `app/dashboard/layout.tsx`
- Modify: `app/contexts/AuthContext.tsx`
- Modify: `app/components/layout/Shell.tsx`
- Modify: `app/components/layout/Header.tsx`
- Modify: `app/components/layout/SideBar.tsx`
- Modify: `tests/unit/auth/auth-context.test.tsx`
- Modify: `tests/unit/layout/sidebar.test.tsx`
- Modify: `tests/unit/layout/shell.test.tsx`

### Dashboard e navegação mensal
- Modify: `app/dashboard/page.tsx`
- Modify: `app/services/dashboardService.ts`
- Modify: `app/components/dashboard/DashboardReportView.tsx`
- Modify: `tests/unit/dashboard/dashboard-service.test.ts`
- Modify: `tests/unit/dashboard/dashboard-report.test.ts`
- Modify: `tests/unit/dashboard/dashboard-page.test.tsx`
- Modify: `tests/unit/dashboard/dashboard-report-view.test.tsx`

### Hardening e reanálise
- Create: `docs/superpowers/reports/2026-04-01-myfinance-performance-reanalysis.md`
- Modify: `tests/unit/auth/auth-context.test.tsx`
- Modify: `tests/unit/dashboard/dashboard-page.test.tsx`
- Modify: `tests/unit/layout/sidebar.test.tsx`
- Modify: `tests/unit/layout/shell.test.tsx`

## Parallelization Strategy

### Stage 0: Baseline primeiro
- Task 1 deve rodar antes das outras. Sem baseline, a fase perde critério.

### Stage 1: Otimização paralela
- **Agent A:** Task 2
  - Ownership: `app/layout.tsx`, `app/providers.tsx`, `app/dashboard/layout.tsx`, `app/contexts/AuthContext.tsx`, `app/components/layout/*`, testes de auth/layout
- **Agent B:** Task 3
  - Ownership: `app/dashboard/page.tsx`, `app/services/dashboardService.ts`, `app/components/dashboard/DashboardReportView.tsx`, testes de dashboard

### Stage 2: Consolidação
- Task 4 deve rodar depois que Tasks 2 e 3 estiverem estáveis e integradas.

## Tasks

### Task 1: Establish a Performance Baseline Before Optimization

**Files:**
- Create: `docs/superpowers/reports/2026-04-01-myfinance-performance-baseline.md`
- Modify: `package.json`

- [ ] **Step 1: Write the failing baseline test for performance scripts**

```ts
// tests/unit/deploy/performance-scripts.test.ts
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)

describe('performance baseline scripts', () => {
  it('exposes explicit commands for baseline and reanalysis collection', () => {
    const packageJson = require('../../../package.json')

    expect(packageJson.scripts['perf:baseline']).toBeDefined()
    expect(packageJson.scripts['perf:reanalysis']).toBeDefined()
  })
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `yarn test tests/unit/deploy/performance-scripts.test.ts`

Expected: FAIL because `perf:baseline` and `perf:reanalysis` do not exist yet.

- [ ] **Step 3: Add the measurement scripts and write the initial baseline report**

```json
// package.json
{
  "scripts": {
    "perf:baseline": "node scripts/performance-baseline.mjs baseline",
    "perf:reanalysis": "node scripts/performance-baseline.mjs reanalysis"
  }
}
```

```md
<!-- docs/superpowers/reports/2026-04-01-myfinance-performance-baseline.md -->
# MyFinance Performance Baseline

## Fluxos
- shell autenticado
- dashboard
- dashboard -> transactions
- dashboard -> cards

## Medidas mínimas
- tempo percebido até a superfície principal responder
- número de fetches redundantes observados
- sinais de retrabalho client-side no bootstrap

## Evidências
- registrar comandos executados
- registrar observações consistentes antes da otimização
```

- [ ] **Step 4: Add the baseline collection script**

```js
// scripts/performance-baseline.mjs
import fs from 'node:fs/promises'
import path from 'node:path'

const mode = process.argv[2]
const root = process.cwd()
const target =
  mode === 'reanalysis'
    ? path.join(root, 'docs/superpowers/reports/2026-04-01-myfinance-performance-reanalysis.md')
    : path.join(root, 'docs/superpowers/reports/2026-04-01-myfinance-performance-baseline.md')

await fs.mkdir(path.dirname(target), { recursive: true })
await fs.appendFile(
  target,
  `\n## Execução automática\n- mode: ${mode}\n- timestamp: ${new Date().toISOString()}\n`,
)
```

- [ ] **Step 5: Run the baseline verification**

Run:
- `yarn test tests/unit/deploy/performance-scripts.test.ts`
- `yarn perf:baseline`

Expected:
- test PASS
- baseline report updated without errors

- [ ] **Step 6: Commit the baseline setup**

```bash
git add package.json scripts/performance-baseline.mjs docs/superpowers/reports/2026-04-01-myfinance-performance-baseline.md tests/unit/deploy/performance-scripts.test.ts
git commit -m "chore: establish performance baseline tooling"
```

### Task 2: Remove Redundant Auth Bootstrap Work From the Authenticated Shell

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/providers.tsx`
- Modify: `app/dashboard/layout.tsx`
- Modify: `app/contexts/AuthContext.tsx`
- Modify: `app/components/layout/Shell.tsx`
- Modify: `app/components/layout/Header.tsx`
- Modify: `app/components/layout/SideBar.tsx`
- Modify: `tests/unit/auth/auth-context.test.tsx`
- Modify: `tests/unit/layout/sidebar.test.tsx`
- Modify: `tests/unit/layout/shell.test.tsx`

- [ ] **Step 1: Write the failing auth bootstrap tests**

```tsx
// tests/unit/auth/auth-context.test.tsx
it('hydrates with an initial user without triggering a bootstrap fetch', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)

  render(
    <AuthProvider initialUser={{ id: 1, name: 'Daniel', email: 'daniel@example.com', role: 'USER' }}>
      <AuthProbe />
    </AuthProvider>,
  )

  expect(screen.getByTestId('user-name')).toHaveTextContent('Daniel')
  expect(fetchMock).not.toHaveBeenCalled()
})
```

```tsx
// tests/unit/layout/shell.test.tsx
it('renders the authenticated shell with server-provided user data', () => {
  render(
    <Shell user={{ id: 1, name: 'Daniel', email: 'daniel@example.com', role: 'USER' }}>
      <div>Conteúdo</div>
    </Shell>,
  )

  expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  expect(screen.getByText('Daniel')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused auth/layout tests and verify they fail**

Run:
- `yarn test tests/unit/auth/auth-context.test.tsx`
- `yarn test tests/unit/layout/shell.test.tsx tests/unit/layout/sidebar.test.tsx`

Expected: FAIL because `AuthProvider` still owns the bootstrap fetch and shell components still depend on client bootstrap state.

- [ ] **Step 3: Move the initial authenticated user to the server boundary**

```tsx
// app/dashboard/layout.tsx
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserFromRequest()

  if (!user) {
    redirect('/login?callbackUrl=%2Fdashboard')
  }

  return <Shell user={user}>{children}</Shell>
}
```

```tsx
// app/contexts/AuthContext.tsx
export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode
  initialUser?: AuthUser | null
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [loading, setLoading] = useState(false)

  // Only revalidate session client-side when no initial user was provided.
}
```

```tsx
// app/components/layout/Shell.tsx
export function Shell({
  children,
  user,
}: {
  children: React.ReactNode
  user: AuthUser
}) {
  return (
    <div className="shell-frame" data-testid="shell-frame">
      <SideBar user={user} />
      <div className="shell-frame__inner">
        <Header user={user} />
        <main className="shell-content" data-testid="shell-content">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Re-run the focused auth/layout tests**

Run:
- `yarn test tests/unit/auth/auth-context.test.tsx`
- `yarn test tests/unit/layout/shell.test.tsx tests/unit/layout/sidebar.test.tsx`

Expected: PASS with bootstrap fetch removed from the normal authenticated path.

- [ ] **Step 5: Commit the auth/shell optimization**

```bash
git add app/dashboard/layout.tsx app/contexts/AuthContext.tsx app/components/layout/Shell.tsx app/components/layout/Header.tsx app/components/layout/SideBar.tsx tests/unit/auth/auth-context.test.tsx tests/unit/layout/shell.test.tsx tests/unit/layout/sidebar.test.tsx
git commit -m "perf: remove redundant auth bootstrap from shell"
```

### Task 3: Reduce Dashboard Query Weight and Split the Monthly Work

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `app/services/dashboardService.ts`
- Modify: `app/components/dashboard/DashboardReportView.tsx`
- Modify: `tests/unit/dashboard/dashboard-service.test.ts`
- Modify: `tests/unit/dashboard/dashboard-report.test.ts`
- Modify: `tests/unit/dashboard/dashboard-page.test.tsx`
- Modify: `tests/unit/dashboard/dashboard-report-view.test.tsx`

- [ ] **Step 1: Write the failing dashboard performance tests**

```ts
// tests/unit/dashboard/dashboard-service.test.ts
it('queries only the fields required for the dashboard summary', async () => {
  await getDashboardData({ userId: 1, month: '2026-03' })

  expect(prisma.transaction.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      select: expect.any(Object),
    }),
  )
  expect(prisma.transaction.findMany).not.toHaveBeenCalledWith(
    expect.objectContaining({
      include: expect.anything(),
    }),
  )
})
```

```tsx
// tests/unit/dashboard/dashboard-page.test.tsx
it('renders the main dashboard shell without waiting on secondary sections', async () => {
  render(await DashboardPage({ searchParams: Promise.resolve({ month: '2026-03' }) }))

  expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeInTheDocument()
  expect(screen.getByText('Saldo previsto')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused dashboard tests and verify they fail**

Run:
- `yarn test tests/unit/dashboard/dashboard-service.test.ts`
- `yarn test tests/unit/dashboard/dashboard-page.test.tsx tests/unit/dashboard/dashboard-report.test.ts`

Expected: FAIL because dashboard queries still fetch broader payloads and the page still treats the whole report as one blocking unit.

- [ ] **Step 3: Minimize the query payload and isolate the expensive sections**

```ts
// app/services/dashboardService.ts
const transactions = await prisma.transaction.findMany({
  where: {
    userId,
    competenceDate: {
      gte: start,
      lte: end,
    },
  },
  select: {
    id: true,
    type: true,
    amount: true,
    status: true,
    description: true,
    competenceDate: true,
    dueDate: true,
    category: {
      select: {
        id: true,
        name: true,
        type: true,
      },
    },
  },
})
```

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const month = resolvedSearchParams.month

  return (
    <>
      <DashboardReportView report={await getDashboardData({ month })} availableMonths={await getAvailableMonths()} />
    </>
  )
}
```

- [ ] **Step 4: Re-run the focused dashboard tests**

Run:
- `yarn test tests/unit/dashboard/dashboard-service.test.ts`
- `yarn test tests/unit/dashboard/dashboard-page.test.tsx tests/unit/dashboard/dashboard-report.test.ts tests/unit/dashboard/dashboard-report-view.test.tsx`

Expected: PASS with leaner query contracts and dashboard rendering still correct.

- [ ] **Step 5: Commit the dashboard optimization**

```bash
git add app/dashboard/page.tsx app/services/dashboardService.ts app/components/dashboard/DashboardReportView.tsx tests/unit/dashboard/dashboard-service.test.ts tests/unit/dashboard/dashboard-page.test.tsx tests/unit/dashboard/dashboard-report.test.ts tests/unit/dashboard/dashboard-report-view.test.tsx
git commit -m "perf: reduce dashboard loading cost"
```

### Task 4: Harden Loading States and Close With Reanalysis

**Files:**
- Create: `docs/superpowers/reports/2026-04-01-myfinance-performance-reanalysis.md`
- Modify: `tests/unit/auth/auth-context.test.tsx`
- Modify: `tests/unit/dashboard/dashboard-page.test.tsx`
- Modify: `tests/unit/layout/sidebar.test.tsx`
- Modify: `tests/unit/layout/shell.test.tsx`

- [ ] **Step 1: Write the failing hardening tests**

```tsx
// tests/unit/dashboard/dashboard-page.test.tsx
it('keeps the dashboard shell usable while section data is still resolving', async () => {
  render(await DashboardPage({ searchParams: Promise.resolve({ month: '2026-03' }) }))

  expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Nova transação' })).toBeInTheDocument()
})
```

```tsx
// tests/unit/layout/sidebar.test.tsx
it('keeps primary navigation visible during authenticated transitions', () => {
  render(<SideBar user={{ id: 1, name: 'Daniel', email: 'daniel@example.com', role: 'USER' }} />)

  expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused hardening tests and verify they fail**

Run:
- `yarn test tests/unit/dashboard/dashboard-page.test.tsx`
- `yarn test tests/unit/layout/sidebar.test.tsx tests/unit/layout/shell.test.tsx`

Expected: FAIL if shell/navigation contracts are still too coupled to blocking data or missing explicit guarantees.

- [ ] **Step 3: Implement the hardening and document the reanalysis**

```md
<!-- docs/superpowers/reports/2026-04-01-myfinance-performance-reanalysis.md -->
# MyFinance Performance Reanalysis

## Comparação
- shell autenticado
- dashboard
- dashboard -> transactions
- dashboard -> cards

## Ganhos observados
- menos trabalho no bootstrap autenticado
- dashboard inicial menos pesado
- navegação principal preservada

## Riscos remanescentes
- pontos ainda caros
- próximos alvos
```

- [ ] **Step 4: Run the final verification**

Run:
- `yarn test tests/unit/deploy/performance-scripts.test.ts tests/unit/auth/auth-context.test.tsx tests/unit/layout/shell.test.tsx tests/unit/layout/sidebar.test.tsx tests/unit/dashboard/dashboard-service.test.ts tests/unit/dashboard/dashboard-page.test.tsx tests/unit/dashboard/dashboard-report.test.ts tests/unit/dashboard/dashboard-report-view.test.tsx`
- `yarn perf:reanalysis`
- `yarn build`

Expected:
- all focused tests PASS
- reanalysis report updated
- build PASS

- [ ] **Step 5: Commit the hardening and reanalysis**

```bash
git add docs/superpowers/reports/2026-04-01-myfinance-performance-reanalysis.md tests/unit/auth/auth-context.test.tsx tests/unit/layout/shell.test.tsx tests/unit/layout/sidebar.test.tsx tests/unit/dashboard/dashboard-page.test.tsx
git commit -m "test: harden performance-critical flows"
```
