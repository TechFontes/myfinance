# MyFinance Visual Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a repaginação visual do MyFinance com identidade editorial calibrada, UX operacional endurecida e testes que protejam comportamento visual crítico.

**Architecture:** O trabalho começa pela fundação visual global, para alinhar tokens, tipografia, tema claro/escuro e acessibilidade básica. Depois a execução se divide em frentes com ownership claro: primitivos de UI, shell/dashboard e fluxo de nova transação; por fim, a malha de testes fecha a fase protegendo regressões visuais e comportamentais.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Radix UI, React Hook Form, Zod, Vitest, Testing Library

---

## File Structure

### Fundação visual global
- Modify: `package.json`
- Modify: `yarn.lock`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `app/contexts/ThemeContext.tsx`
- Modify: `app/components/ui/ThemeToggle.tsx`

### Primitivos de UI
- Modify: `app/components/ui/input.tsx`
- Modify: `app/components/ui/select.tsx`
- Modify: `app/components/ui/button.tsx`
- Modify: `app/components/ui/card.tsx`
- Modify: `app/components/ui/badge.tsx`
- Modify: `app/components/ui/table.tsx`
- Modify: `app/components/ui/dialog.tsx`
- Test: `tests/unit/ui/theme-toggle.test.tsx`
- Test: `tests/unit/ui/input.test.tsx`
- Test: `tests/unit/ui/select.test.tsx`

### Shell, navegação e dashboard
- Modify: `app/components/layout/SideBar.tsx`
- Modify: `app/components/layout/Header.tsx`
- Modify: `app/components/layout/Shell.tsx`
- Modify: `app/dashboard/layout.tsx`
- Modify: `app/components/dashboard/DashboardReportView.tsx`
- Test: `tests/unit/layout/sidebar.test.tsx`
- Modify: `tests/unit/dashboard/dashboard-report-view.test.tsx`

### Fluxo de nova transação
- Create: `app/services/transactionFormOptions.ts`
- Modify: `app/dashboard/transactions/new/page.tsx`
- Modify: `app/components/transactions/TransactionForm.tsx`
- Modify: `tests/unit/transactions/transaction-form.test.tsx`

### Verificação final
- Run: `yarn test`
- Run: `yarn lint`

## Parallelization Strategy

### Stage 0: Foundation First
- Task 1 must land first. It defines fonts, tokens, theme behavior and test dependency support used by every other stream.

### Stage 1: Parallel Streams After Task 1
- **Agent A:** Task 2 only
  - Ownership: `app/components/ui/*`, `tests/unit/ui/*`
- **Agent B:** Task 3 only
  - Ownership: `app/components/layout/*`, `app/dashboard/layout.tsx`, `app/components/dashboard/DashboardReportView.tsx`, `tests/unit/layout/sidebar.test.tsx`, `tests/unit/dashboard/dashboard-report-view.test.tsx`
- **Agent C:** Task 4 only
  - Ownership: `app/services/transactionFormOptions.ts`, `app/dashboard/transactions/new/page.tsx`, `app/components/transactions/TransactionForm.tsx`, `tests/unit/transactions/transaction-form.test.tsx`

### Stage 2: Final Verification
- After Tasks 2, 3 and 4 merge cleanly, run Task 5 in the controller session or a final verification subagent.

## Tasks

### Task 1: Establish Visual Foundation

**Files:**
- Modify: `package.json`
- Modify: `yarn.lock`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `app/contexts/ThemeContext.tsx`
- Modify: `app/components/ui/ThemeToggle.tsx`
- Create: `tests/unit/ui/theme-toggle.test.tsx`

- [ ] **Step 1: Write the failing theme/accessibility tests**

```tsx
// tests/unit/ui/theme-toggle.test.tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

describe('theme toggle', () => {
  it('restores the persisted dark theme and exposes an accessible toggle label', async () => {
    window.localStorage.setItem('myfinance-theme', 'dark')

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('button', { name: /alternar tema/i })).toHaveTextContent(
      /tema escuro/i,
    )
  })

  it('toggles between light and dark labels without emoji-only affordance', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    const button = screen.getByRole('button', { name: /alternar tema/i })
    await user.click(button)

    expect(document.documentElement).toHaveClass('dark')
    expect(button).toHaveTextContent(/tema escuro/i)
  })
})
```

- [ ] **Step 2: Run the new tests and verify they fail**

Run: `yarn test tests/unit/ui/theme-toggle.test.tsx`

Expected: FAIL because `@testing-library/user-event` is not installed and `ThemeToggle` does not expose the approved accessible copy or premium visual contract.

- [ ] **Step 3: Implement font, token and theme foundation**

```tsx
// app/layout.tsx
import { Manrope, Newsreader } from 'next/font/google'

const fontSans = Manrope({ subsets: ['latin'], variable: '--font-sans' })
const fontSerif = Newsreader({ subsets: ['latin'], variable: '--font-serif' })

<body
  className={cn(
    'min-h-screen bg-background font-sans antialiased text-foreground',
    fontSans.variable,
    fontSerif.variable,
  )}
>
```

```css
/* app/globals.css */
@theme {
  --radius: 0.75rem;
  --font-serif: var(--font-serif);
  --color-background: oklch(0.97 0.01 95);
  --color-foreground: oklch(0.22 0.01 95);
  --color-card: oklch(0.99 0.01 95);
  --color-card-foreground: oklch(0.22 0.01 95);
  --color-popover: oklch(0.995 0.01 95);
  --color-popover-foreground: oklch(0.22 0.01 95);
  --color-primary: oklch(0.48 0.09 155);
  --color-primary-foreground: oklch(0.98 0.01 95);
  --color-muted: oklch(0.94 0.01 95);
  --color-muted-foreground: oklch(0.48 0.01 95);
  --color-accent: oklch(0.92 0.02 155);
  --color-accent-foreground: oklch(0.24 0.01 95);
  --color-border: oklch(0.87 0.01 95);
  --color-input: oklch(0.99 0.01 95);
  --color-ring: oklch(0.48 0.09 155);
}

.dark {
  --color-background: oklch(0.18 0.01 95);
  --color-foreground: oklch(0.94 0.01 95);
  --color-card: oklch(0.22 0.01 95);
  --color-card-foreground: oklch(0.94 0.01 95);
  --color-popover: oklch(0.24 0.01 95);
  --color-popover-foreground: oklch(0.94 0.01 95);
  --color-muted: oklch(0.26 0.01 95);
  --color-muted-foreground: oklch(0.72 0.01 95);
  --color-accent: oklch(0.30 0.02 155);
  --color-accent-foreground: oklch(0.96 0.01 95);
  --color-border: oklch(0.33 0.01 95);
  --color-input: oklch(0.24 0.01 95);
}

body {
  background:
    radial-gradient(circle at top, color-mix(in oklab, var(--color-primary) 10%, transparent), transparent 28%),
    var(--color-background);
}
```

```tsx
// app/contexts/ThemeContext.tsx
type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}
```

```tsx
// app/components/ui/ThemeToggle.tsx
<button
  type="button"
  aria-label="Alternar tema"
  className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
>
  <span className="sr-only">Alternar tema</span>
  {theme === 'light' ? 'Tema claro' : 'Tema escuro'}
</button>
```

```json
// package.json
{
  "devDependencies": {
    "@testing-library/user-event": "^14.6.1"
  }
}
```

- [ ] **Step 4: Run focused verification**

Run: `yarn test tests/unit/ui/theme-toggle.test.tsx`

Expected: PASS with `2 passed`

Run: `yarn test tests/unit/dashboard/dashboard-report-view.test.tsx`

Expected: PASS, proving the token changes did not break current dashboard rendering.

- [ ] **Step 5: Commit the foundation slice**

```bash
git add package.json yarn.lock app/layout.tsx app/globals.css app/contexts/ThemeContext.tsx app/components/ui/ThemeToggle.tsx tests/unit/ui/theme-toggle.test.tsx
git commit -m "feat: establish premium visual foundation"
```

### Task 2: Harden Core UI Primitives

**Files:**
- Modify: `app/components/ui/input.tsx`
- Modify: `app/components/ui/select.tsx`
- Modify: `app/components/ui/button.tsx`
- Modify: `app/components/ui/card.tsx`
- Modify: `app/components/ui/badge.tsx`
- Modify: `app/components/ui/table.tsx`
- Modify: `app/components/ui/dialog.tsx`
- Create: `tests/unit/ui/input.test.tsx`
- Create: `tests/unit/ui/select.test.tsx`

- [ ] **Step 1: Write failing tests for opaque fields and disciplined popovers**

```tsx
// tests/unit/ui/input.test.tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/ui/input'

describe('input primitive', () => {
  it('uses a solid field surface instead of transparent backgrounds', () => {
    render(<Input aria-label="Valor" />)

    const input = screen.getByRole('textbox', { name: 'Valor' })
    expect(input).toHaveClass('bg-input')
    expect(input).not.toHaveClass('bg-transparent')
  })
})
```

```tsx
// tests/unit/ui/select.test.tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

describe('select primitive', () => {
  it('renders a solid trigger and elevated popover content', async () => {
    const user = userEvent.setup()

    render(
      <Select>
        <SelectTrigger aria-label="Categoria">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="housing">Moradia</SelectItem>
        </SelectContent>
      </Select>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Categoria' })
    expect(trigger).toHaveClass('bg-input')
    expect(trigger).not.toHaveClass('bg-transparent')

    await user.click(trigger)
    expect(screen.getByRole('option', { name: 'Moradia' })).toBeVisible()
  })
})
```

- [ ] **Step 2: Run primitive tests and verify they fail**

Run: `yarn test tests/unit/ui/input.test.tsx tests/unit/ui/select.test.tsx`

Expected: FAIL because `Input` and `SelectTrigger` still use `bg-transparent`.

- [ ] **Step 3: Implement the compact premium primitive styles**

```tsx
// app/components/ui/input.tsx
className={cn(
  'flex h-10 w-full rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
  className,
)}
```

```tsx
// app/components/ui/select.tsx
className={cn(
  'flex h-10 w-full items-center justify-between rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm transition-[border-color,box-shadow,background-color] data-placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50',
  className,
)}
```

```tsx
// app/components/ui/select.tsx
className={cn(
  'relative z-50 max-h-(--radix-select-content-available-height) min-w-40 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-xl',
  className,
)}
```

```tsx
// app/components/ui/card.tsx
className={cn(
  'rounded-2xl border border-border/80 bg-card text-card-foreground shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)]',
  className,
)}
```

```tsx
// app/components/ui/button.tsx
default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/92'
outline: 'border border-border bg-card text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground'
ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
```

- [ ] **Step 4: Run focused verification and a wider UI pass**

Run: `yarn test tests/unit/ui/input.test.tsx tests/unit/ui/select.test.tsx tests/unit/ui/theme-toggle.test.tsx`

Expected: PASS

Run: `yarn test tests/unit/dashboard/dashboard-report-view.test.tsx`

Expected: PASS, proving the hardened primitives do not regress the existing dashboard surface.

- [ ] **Step 5: Commit the primitive slice**

```bash
git add app/components/ui/input.tsx app/components/ui/select.tsx app/components/ui/button.tsx app/components/ui/card.tsx app/components/ui/badge.tsx app/components/ui/table.tsx app/components/ui/dialog.tsx tests/unit/ui/input.test.tsx tests/unit/ui/select.test.tsx
git commit -m "feat: harden financial ui primitives"
```

### Task 3: Refactor Shell, Navigation and Dashboard Surfaces

**Files:**
- Modify: `app/components/layout/SideBar.tsx`
- Modify: `app/components/layout/Header.tsx`
- Modify: `app/components/layout/Shell.tsx`
- Modify: `app/dashboard/layout.tsx`
- Modify: `app/components/dashboard/DashboardReportView.tsx`
- Create: `tests/unit/layout/sidebar.test.tsx`
- Modify: `tests/unit/dashboard/dashboard-report-view.test.tsx`

- [ ] **Step 1: Write failing layout/dashboard tests**

```tsx
// tests/unit/layout/sidebar.test.tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from '@/components/layout/SideBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/transactions',
}))

describe('sidebar', () => {
  it('renders the premium brand block and marks the active module', () => {
    render(<Sidebar />)

    expect(screen.getByText('MyFinance')).toBeInTheDocument()
    expect(screen.getByText(/mesa financeira pessoal/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Transações' })).toHaveAttribute('aria-current', 'page')
  })
})
```

```tsx
// tests/unit/dashboard/dashboard-report-view.test.tsx
expect(screen.getByText(/dashboard mensal/i)).toBeInTheDocument()
expect(screen.getByText(/situação financeira consolidada/i)).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Ver período' })).toHaveClass('bg-primary')
```

- [ ] **Step 2: Run the new layout/dashboard tests and verify they fail**

Run: `yarn test tests/unit/layout/sidebar.test.tsx tests/unit/dashboard/dashboard-report-view.test.tsx`

Expected: FAIL because the sidebar has no editorial subtitle, no `aria-current`, and the dashboard shell still uses generic spacing and hierarchy.

- [ ] **Step 3: Implement the editorial-calibrated shell**

```tsx
// app/components/layout/SideBar.tsx
const navItems = [
  { href: '/dashboard', label: 'Visão geral', eyebrow: 'Resumo' },
  { href: '/dashboard/transactions', label: 'Transações', eyebrow: 'Fluxo' },
  // ...
]

<aside className="hidden w-72 flex-col border-r border-border bg-card/90 px-5 py-6 md:flex">
  <div className="space-y-3 border-b border-border pb-5">
    <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Mesa financeira pessoal</p>
    <div>
      <h1 className="font-serif text-3xl leading-none text-foreground">MyFinance</h1>
      <p className="mt-2 text-sm text-muted-foreground">Clareza premium para rotina financeira real.</p>
    </div>
  </div>
</aside>
```

```tsx
// app/components/layout/Header.tsx
<header className="flex h-16 items-center justify-between border-b border-border bg-background/85 px-6 backdrop-blur-xl">
  <div className="space-y-1">
    <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Workspace financeiro</p>
    <span className="font-serif text-2xl text-foreground">Visão operacional</span>
  </div>
</header>
```

```tsx
// app/components/dashboard/DashboardReportView.tsx
<header className="space-y-5 rounded-[28px] border border-border bg-card px-7 py-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.35)]">
  <p className="text-[11px] uppercase tracking-[0.36em] text-muted-foreground">Dashboard mensal</p>
  <h1 className="font-serif text-4xl tracking-tight text-foreground">Visão geral</h1>
  <p className="max-w-2xl text-sm text-muted-foreground">
    Sua situação financeira consolidada do período selecionado.
  </p>
</header>
```

- [ ] **Step 4: Run targeted verification**

Run: `yarn test tests/unit/layout/sidebar.test.tsx tests/unit/dashboard/dashboard-report-view.test.tsx tests/unit/transfers/sidebar-navigation.test.tsx tests/unit/cards/sidebar-navigation.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit the shell/dashboard slice**

```bash
git add app/components/layout/SideBar.tsx app/components/layout/Header.tsx app/components/layout/Shell.tsx app/dashboard/layout.tsx app/components/dashboard/DashboardReportView.tsx tests/unit/layout/sidebar.test.tsx tests/unit/dashboard/dashboard-report-view.test.tsx
git commit -m "feat: redesign dashboard shell and navigation"
```

### Task 4: Harden the New Transaction Flow

**Files:**
- Create: `app/services/transactionFormOptions.ts`
- Modify: `app/dashboard/transactions/new/page.tsx`
- Modify: `app/components/transactions/TransactionForm.tsx`
- Modify: `tests/unit/transactions/transaction-form.test.tsx`

- [ ] **Step 1: Write failing behavior tests for human-friendly selection**

```tsx
// tests/unit/transactions/transaction-form.test.tsx
// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TransactionForm } from '@/components/transactions/TransactionForm'

it('lets the user select category, account and card by name instead of raw ids', async () => {
  const user = userEvent.setup()
  const push = vi.fn()
  const fetchMock = vi.fn()

  vi.stubGlobal('fetch', fetchMock)
  fetchMock
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 9, month: 4, year: 2026, status: 'OPEN', total: '450.00', dueDate: '2026-04-15T00:00:00.000Z' }],
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 99 }) })

  render(
    <TransactionForm
      options={{
        categories: [{ id: 3, name: 'Moradia', type: 'EXPENSE', active: true }],
        accounts: [{ id: 5, name: 'Nubank', type: 'BANK', active: true }],
        cards: [{ id: 7, name: 'Visa Infinite', active: true }],
      }}
      router={{ push, back: vi.fn() }}
    />,
  )

  expect(screen.queryByLabelText('Categoria ID')).not.toBeInTheDocument()

  await user.click(screen.getByRole('combobox', { name: 'Categoria' }))
  await user.click(screen.getByRole('option', { name: 'Moradia' }))

  await user.click(screen.getByRole('combobox', { name: 'Conta' }))
  await user.click(screen.getByRole('option', { name: 'Nubank' }))

  await user.click(screen.getByRole('combobox', { name: 'Cartão' }))
  await user.click(screen.getByRole('option', { name: 'Visa Infinite' }))

  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith('/api/invoices?creditCardId=7'),
  )
})
```

```tsx
it('submits normalized numeric ids after human selection', async () => {
  // assert POST payload carries categoryId: 3, accountId: 5, creditCardId: 7, invoiceId: 9
})
```

- [ ] **Step 2: Run the transaction form test and verify it fails**

Run: `yarn test tests/unit/transactions/transaction-form.test.tsx`

Expected: FAIL because the current form still renders `Categoria ID`, `Conta ID opcional`, `Cartão ID opcional` and `Fatura ID opcional` as raw numeric inputs.

- [ ] **Step 3: Implement server-side options loading and adaptive form behavior**

```ts
// app/services/transactionFormOptions.ts
import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/modules/accounts/service'
import { listCategoriesByUser } from '@/modules/categories/service'
import { listCardsByUser } from '@/modules/cards/service'

export async function getTransactionFormOptions() {
  const user = await getUserFromRequest()
  if (!user) return null

  const [categories, accounts, cards] = await Promise.all([
    listCategoriesByUser(user.id),
    listAccountsByUser(user.id),
    listCardsByUser(user.id),
  ])

  return { categories, accounts, cards }
}
```

```tsx
// app/dashboard/transactions/new/page.tsx
import { redirect } from 'next/navigation'
import { getTransactionFormOptions } from '@/services/transactionFormOptions'

export default async function NewTransactionPage() {
  const options = await getTransactionFormOptions()
  if (!options) redirect('/login')

  return <TransactionForm options={options} />
}
```

```tsx
// app/components/transactions/TransactionForm.tsx
type TransactionFormOption = { id: number; name: string; active: boolean }

type TransactionFormProps = {
  options: {
    categories: Array<{ id: number; name: string; type: 'INCOME' | 'EXPENSE'; active: boolean }>
    accounts: Array<{ id: number; name: string; type: string; active: boolean }>
    cards: Array<{ id: number; name: string; active: boolean }>
  }
  router?: Pick<ReturnType<typeof useRouter>, 'push' | 'back'>
}
```

```tsx
// app/components/transactions/TransactionForm.tsx
<FormField
  control={form.control}
  name="categoryId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Categoria</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <FormControl>
          <SelectTrigger aria-label="Categoria">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {filteredCategories.map((category) => (
            <SelectItem key={category.id} value={String(category.id)}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

```tsx
// app/components/transactions/TransactionForm.tsx
useEffect(() => {
  if (!selectedCardId) {
    setInvoices([])
    form.setValue('invoiceId', '')
    return
  }

  fetch(`/api/invoices?creditCardId=${selectedCardId}`)
    .then((response) => response.json())
    .then((data) => setInvoices(data))
}, [selectedCardId, form])
```

- [ ] **Step 4: Run focused verification**

Run: `yarn test tests/unit/transactions/transaction-form.test.tsx`

Expected: PASS

Run: `yarn test tests/unit/ui/select.test.tsx tests/unit/ui/input.test.tsx`

Expected: PASS, proving the form uses the hardened primitives correctly.

- [ ] **Step 5: Commit the transaction flow slice**

```bash
git add app/services/transactionFormOptions.ts app/dashboard/transactions/new/page.tsx app/components/transactions/TransactionForm.tsx tests/unit/transactions/transaction-form.test.tsx
git commit -m "feat: harden transaction creation flow"
```

### Task 5: Run Final Verification and Close the Hardening Phase

**Files:**
- Modify: none
- Verify: `tests/unit/ui/*`
- Verify: `tests/unit/layout/sidebar.test.tsx`
- Verify: `tests/unit/dashboard/dashboard-report-view.test.tsx`
- Verify: `tests/unit/transactions/transaction-form.test.tsx`

- [ ] **Step 1: Run the targeted visual-behavior suite**

Run: `yarn test tests/unit/ui/theme-toggle.test.tsx tests/unit/ui/input.test.tsx tests/unit/ui/select.test.tsx tests/unit/layout/sidebar.test.tsx tests/unit/dashboard/dashboard-report-view.test.tsx tests/unit/transactions/transaction-form.test.tsx`

Expected: PASS with all targeted suites green.

- [ ] **Step 2: Run the full test suite**

Run: `yarn test`

Expected: PASS with the full Vitest suite green.

- [ ] **Step 3: Run lint**

Run: `yarn lint`

Expected: PASS with no new ESLint violations.

- [ ] **Step 4: Manually verify the main visual flows in local dev**

Run: `yarn dev`

Expected:
- dashboard opens with editorial header, denser shell and solid surfaces
- light and dark themes both read as first-class
- transaction form never exposes raw IDs in the main flow
- select/input surfaces are opaque and legible

- [ ] **Step 5: Close the phase cleanly**

```bash
git status
```

Expected:
- working tree clean if no follow-up fixes were needed
- if verification fixes were needed, create one final commit with only the touched files before handoff

## Execution Notes

- Do not parallelize agents on overlapping files.
- Task 3 and Task 4 may run in parallel only after Task 1 lands and Task 2 has either landed or its primitive class contracts are frozen.
- Preserve `app/components/layout/Shell.tsx` in sync with `app/dashboard/layout.tsx` while it still exists; do not leave two competing shell visual languages in the repo.
- Favor semantic labels and human-readable option names in every UI assertion.
- Treat dark mode as a full acceptance surface, not as a post-processing inversion.
