# UX Fixes & Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix dark mode bug, add color/icon selects, CSV template download, category tree view, enum translations, and accumulated patrimony view.

**Architecture:** Targeted fixes to existing components + new AccumulatedView with line chart.

**Tech Stack:** React 19, TailwindCSS 4, Radix UI, Recharts (if available, otherwise pure CSS/SVG chart)

---

## Execution Order

```
Bug-fix first (dark mode, translations) → UX improvements (selects, tree, template) → New feature (accumulated view)
```

Each task follows: **Levantamento → Correção → Validação → Commit** loop.

---

### Task 1: Fix Dark Mode Bleed on Home Page (BUG — CRITICAL)

**Problem:** Home page marketing components use hardcoded light colors (`bg-white/80`, `#fbfdfb`, `rgba(56,168,107,0.16)`, `text-emerald-700`) that don't respect dark theme. When system is dark, text becomes unreadable.

**Files to modify:**
- `app/components/marketing/PortfolioHome.tsx` — hardcoded gradient bg
- `app/components/marketing/PortfolioHero.tsx` — `bg-white/85`, `bg-white/95`
- `app/components/marketing/PortfolioDomainMap.tsx` — `bg-white/80`
- `app/components/marketing/PortfolioProcessMap.tsx` — `bg-white/80`, `bg-white`
- `app/components/marketing/PortfolioMetrics.tsx` — `bg-white/80`
- `app/components/marketing/PortfolioScreenshotCarousel.tsx` — `bg-white/80`
- `app/components/marketing/PortfolioFooter.tsx` — check for hardcoded colors

**Fix approach:** The home page should be forced to light theme regardless of system preference. Add `data-theme="light"` or a wrapping `<div className="light">` that forces light mode tokens. This is simpler and more correct than making all marketing components dual-theme.

Alternative: Force `class="light"` on the home page wrapper to override dark system preference, ensuring CSS variables resolve to light values.

**Validation:** Open home page with system dark mode → all text readable, no color bleed.

---

### Task 2: Fix Raw Enum Translations (BUG)

**Problem:** "INCOME"/"EXPENSE" shown instead of "Receita"/"Despesa" in dashboard category cards. "BANK"/"WALLET"/"OTHER" shown raw in dashboard accounts and AccountsList.

**Files to fix:**
- `app/components/dashboard/DashboardReportView.tsx` line 318: `{category.type}` → translate
- `app/components/dashboard/DashboardReportView.tsx` line 285: `{account.type}` → translate
- `app/components/accounts/AccountsList.tsx` line 82: `{account.type}` → use existing `getTypeLabel()`

**Fix:** Add translation helpers:
```typescript
function getCategoryTypeLabel(type: string) { return type === 'INCOME' ? 'Receita' : 'Despesa' }
function getAccountTypeLabel(type: string) {
  switch (type) { case 'BANK': return 'Banco'; case 'WALLET': return 'Carteira'; default: return 'Outro' }
}
```

**Validation:** Dashboard shows "Receita"/"Despesa" in category cards, "Banco"/"Carteira"/"Outro" in account cards.

---

### Task 3: Card Color Picker + Icon Select

**Problem:** CardCreateForm has plain text inputs for color and icon. Card service hardcodes both to null.

**Files to modify:**
- `app/components/cards/CardCreateForm.tsx` — replace inputs with color picker + icon select
- `app/modules/cards/service.ts` — actually save color and icon (currently hardcoded to null)

**Color picker:** Use native `<input type="color">` wrapped in a styled component, with a preset palette of 8-10 financial-appropriate colors.

**Icon select:** Select dropdown with lucide icon options relevant to credit cards:
`credit-card`, `wallet`, `landmark`, `banknote`, `receipt`, `shopping-cart`, `car`, `home`, `utensils`, `plane`

Display selected icon preview next to select.

**Validation:** Create card with color and icon → both saved and displayed in CardsList.

---

### Task 4: Account Color Picker + Icon Select

**Problem:** Same as Task 3 but for AccountCreateForm.

**Files to modify:**
- `app/components/accounts/AccountCreateForm.tsx` — replace inputs

**Icon options for accounts:**
`wallet`, `landmark`, `piggy-bank`, `building-2`, `coins`, `banknote`, `credit-card`, `safe`, `briefcase`, `trending-up`

**Validation:** Create account with color and icon → both saved and displayed.

---

### Task 5: CSV Import Template Download

**Problem:** User has no reference for expected CSV format.

**Files to modify:**
- `app/components/imports/CsvImportReviewPanel.tsx` — add download button above CSV input

**Implementation:** Add a "Baixar modelo CSV" button that triggers download of a static CSV template with:
- Header row with expected column names
- 2-3 example rows with realistic data
- UTF-8 BOM for Excel compatibility

Template content (generate as blob URL):
```csv
tipo,descricao,valor,data_competencia,data_vencimento,categoria,parcela,total_parcelas
EXPENSE,Supermercado,250.00,2026-04-01,2026-04-10,Alimentação,,
INCOME,Salário,5000.00,2026-04-01,2026-04-05,Salário,,
EXPENSE,Netflix,39.90,2026-04-01,2026-04-15,Streaming,,
```

Check the actual expected headers by reading the CSV parser in `app/modules/imports/service.ts`.

**Validation:** Click button → file downloads → can be opened in Excel → re-imported successfully.

---

### Task 6: Category Tree View

**Problem:** Categories displayed as flat grid. Should show parent-child hierarchy as tree.

**Files to modify:**
- `app/components/categories/CategoriesList.tsx` — rewrite to tree view

**Implementation:**
- Group categories by type (Receita / Despesa)
- Under each type, show parent categories
- Under each parent, indent and show child categories
- Use collapsible sections or always-open tree
- Show category count per group
- Keep edit/action buttons per category

**Visual structure:**
```
📊 Receita (4)
  ├─ Salário
  ├─ Investimentos
  │   ├─ Dividendos
  │   └─ Rendimento
  └─ Freelance

📊 Despesa (8)
  ├─ Alimentação
  │   ├─ Supermercado
  │   └─ Restaurante
  ...
```

Use indentation + connecting lines (border-l) or simple padding.

**Validation:** Categories page shows hierarchical tree grouped by type.

---

### Task 7: Accumulated Patrimony View (New Feature)

**Problem:** No way to see overall net worth / accumulated patrimony over time.

**Files to create:**
- `app/components/dashboard/AccumulatedView.tsx` — new view component
- `app/components/dashboard/PatrimonyChart.tsx` — line chart (real vs forecast)

**Files to modify:**
- `app/components/dashboard/DashboardReportView.tsx` — add "Acumulado" tab to view selector
- `app/services/dashboardService.ts` — add function to compute accumulated data across months

**Implementation:**

Add 5th view tab: `accumulated` alongside general/receivable/payable/consolidated.

**AccumulatedView shows:**
1. **Total patrimony card:** Sum of all account balances (using computeAccountBalance)
2. **Patrimony line chart:** Monthly balance over available months
   - Line 1: Realized (green, solid) — sum of PAID transactions
   - Line 2: Forecast (green, dashed) — sum of all transactions including PLANNED/PENDING
   - X-axis: months
   - Y-axis: BRL values
3. **Account breakdown:** Table showing each account's current balance contribution

**Chart implementation:** Use SVG-based line chart (no external dependency needed) or check if recharts is available in package.json. If not, create a simple SVG chart component.

**Data function:** `getAccumulatedReport(userId)` that:
- Gets all available months
- For each month, computes realized and forecast totals
- Returns array of `{ month, realized, forecast }` for chart
- Returns current account balances for breakdown

**Validation:** Click "Acumulado" tab → see patrimony chart with real vs forecast lines, account breakdown table.

---

### Task 8: Full Verification

- [ ] Run `yarn test` — all pass
- [ ] Run `yarn lint` — 0 errors
- [ ] Run `yarn build` — success
- [ ] Visual check: dark mode home page
- [ ] Visual check: dashboard enum translations
- [ ] Visual check: card/account color and icon
- [ ] Visual check: category tree
- [ ] Visual check: accumulated view
