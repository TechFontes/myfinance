# MyFinance Full Evolution Program — Design Spec

**Data:** 2026-04-02
**Escopo:** Financial Core Consistency + Operational Flows + Goals + Dashboard Polish + Visual Hardening
**Sequência:** Sequential por dependência (Fase 1 → 2 → 3 → 4)

---

## Contexto

O MyFinance tem todos os módulos de domínio base funcionais, mas opera com CRUD direto em vez de comandos financeiros canônicos. O dashboard recalcula saldos, mas não há settlement/cancellation formal. Fluxos operacionais expõem internos do modelo (IDs, campos técnicos) em vez de guiar por intent. Visual é funcional mas genérico.

Este programa evolui o produto em 4 fases sequenciais por dependência.

---

## Decisões Aprovadas

| Decisão | Escolha | Razão |
|---------|---------|-------|
| Saldo de conta | Computado no service (`computeAccountBalance`) | Sem schema change, saldo derivado como fonte de verdade |
| Pagamento de fatura | Conta obrigatória | Toda saída de dinheiro tem origem, intent-driven |
| Cancelamento de PAID | Reversão automática, `paidAt` mantido | Audit trail + saldo se ajusta via recompute (ignora CANCELED) |
| Sequência de execução | Sequential por dependência | Core → Flows+Goals → Dashboard → Visual |

---

## Fase 1 — Financial Core Consistency

### Objetivo
Estabelecer comandos financeiros canônicos que centralizam toda mutação de estado financeiro com efeitos rastreáveis.

### Comandos a Implementar

Todos em `app/modules/financial-core/service.ts` via `createFinancialCommandService(ports)`.

#### 1.1 settleTransaction
- **Input:** `{ transactionId: string, accountId: number, paidAt: Date }`
- **Validações:** ownership do transaction e account, transaction deve estar PLANNED ou PENDING
- **Efeitos:**
  - Transaction: status → PAID, accountId setado, paidAt setado
  - Dashboard: revalidatePath('/dashboard')
- **Result:** `{ command: 'settleTransaction', writes: ['transaction', 'dashboard-read-model'], rule: { kind: 'cash-settlement', transactionId, paidAt } }`

#### 1.2 cancelTransaction
- **Input:** `{ transactionId: string }`
- **Validações:** ownership, transaction não pode já estar CANCELED
- **Efeitos:**
  - Transaction: status → CANCELED (paidAt MANTIDO para histórico)
  - Dashboard: revalidatePath('/dashboard')
- **Result:** `{ command: 'cancelTransaction', writes: ['transaction', 'dashboard-read-model'], rule: { kind: 'cancellation', transactionId, previousStatus } }`

#### 1.3 settleTransfer
- **Input:** `{ transferId: string, paidAt: Date }`
- **Validações:** ownership, transfer deve estar PLANNED ou PENDING
- **Efeitos:**
  - Transfer: status → PAID, paidAt setado
  - Dashboard: revalidatePath('/dashboard')
- **Result:** `{ command: 'settleTransfer', writes: ['transfer', 'dashboard-read-model'], rule: { kind: 'transfer-settlement', transferId, paidAt } }`

#### 1.4 cancelTransfer
- **Input:** `{ transferId: string }`
- **Validações:** ownership, transfer não pode já estar CANCELED
- **Efeitos:**
  - Transfer: status → CANCELED (paidAt MANTIDO para histórico)
  - Dashboard: revalidatePath('/dashboard')
- **Result:** `{ command: 'cancelTransfer', writes: ['transfer', 'dashboard-read-model'], rule: { kind: 'transfer-cancellation', transferId, previousStatus } }`

#### 1.5 payInvoice
- **Input:** `{ invoiceId: number, accountId: number, paidAt: Date }`
- **Validações:** ownership do invoice e account, invoice deve estar OPEN
- **Efeitos:**
  - Invoice: status → PAID, paidAt setado
  - Cria Transaction: type=EXPENSE, status=PAID, value=invoice.total, accountId, competenceDate=invoice dueDate, dueDate=invoice dueDate, paidAt, description="Pagamento fatura [cartão] [mês/ano]", invoiceId vinculado
  - Dashboard: revalidatePath('/dashboard')
- **Result:** `{ command: 'payInvoice', writes: ['invoice', 'transaction', 'dashboard-read-model'], rule: { kind: 'invoice-payment', invoiceId, accountId, transactionId, paidAt } }`

#### 1.6 recordGoalWithdrawal
- **Input:** `{ goalId: string, amount: number, transferId?: string }`
- **Validações:** ownership, goal deve estar ACTIVE, amount > 0
- **Efeitos:**
  - Cria GoalContribution: kind=WITHDRAWAL, amount (negativo), transferId se fornecido
  - Dashboard: revalidatePath('/dashboard')
- **Result:** `{ command: 'recordGoalWithdrawal', writes: ['goal-contribution', 'dashboard-read-model'], rule: { kind: 'goal-withdrawal', goalId, amount, hasTransfer: !!transferId } }`

### computeAccountBalance

Nova função em `app/modules/accounts/service.ts`:

```
computeAccountBalance(accountId: number): Promise<string>
```

- Cálculo: `initialBalance + sum(PAID INCOME where accountId) - sum(PAID EXPENSE where accountId) + sum(PAID transfers where destinationAccountId) - sum(PAID transfers where sourceAccountId)`
- Transações e transferências CANCELED são ignoradas
- Retorna string (consistente com padrão Decimal→string)
- Usado por: dashboard, listagem de contas, detail de conta

### API Routes

| Método | Rota | Handler |
|--------|------|---------|
| PATCH | `/api/transactions/[id]/settle` | settleTransaction command |
| PATCH | `/api/transactions/[id]/cancel` | cancelTransaction command |
| PATCH | `/api/transfers/[id]/settle` | settleTransfer command |
| PATCH | `/api/transfers/[id]/cancel` | cancelTransfer command |
| POST | `/api/invoices/[id]/pay` | payInvoice command |
| POST | `/api/goals/[id]/withdraw` | recordGoalWithdrawal command |

### Testes

- Unit tests para cada comando (happy path + validações + edge cases)
- Unit test para `computeAccountBalance` (cenários: vazio, mixed, canceled ignored)
- Integration tests para API routes (auth, ownership, status transitions)
- Financial consistency regression: saldo antes/depois de settlement, saldo após cancel de PAID

---

## Fase 2 — Operational Flows + Goals

### Objetivo
Transformar interfaces de CRUD técnico em fluxos guiados por intent do usuário.

### 2.1 Transaction Form por Intent

Refatorar `TransactionForm` em 3 modos:

| Modo | Campos visíveis | Campos ocultos |
|------|----------------|----------------|
| Receita | valor, descrição, categoria (INCOME), conta, competência, vencimento | cartão, fatura |
| Despesa | valor, descrição, categoria (EXPENSE), conta, competência, vencimento | cartão, fatura |
| Cartão | valor, descrição, categoria (EXPENSE), cartão, fatura (auto-resolved), competência | conta |

- Selects por nome (nunca IDs expostos)
- Categorias filtradas por tipo do modo selecionado
- Fatura auto-resolvida pelo mês de competência + cartão selecionado
- Options carregadas server-side, passadas como props

### 2.2 Quick Actions

**Transações (lista e detail):**
- "Liquidar" → dialog com seleção de conta + data → chama settle API
- "Cancelar" → confirmação → chama cancel API
- Visíveis conforme status (PLANNED/PENDING mostram Liquidar, todos exceto CANCELED mostram Cancelar)

**Transferências:**
- "Liquidar" → dialog com data → chama settle API
- "Cancelar" → confirmação → chama cancel API

**Faturas:**
- "Pagar Fatura" → dialog com seleção de conta + data → chama pay API
- Visível apenas para faturas OPEN

### 2.3 Edit Flows Completos

Garantir que todas entidades tenham edit page funcional:
- Accounts: edit existente, verificar async params
- Categories: edit corrigido (async params já fixado)
- Cards: edit existente, verificar
- Transactions: edit existente, adaptar ao novo form por intent
- Transfers: edit existente, verificar
- Goals: edit existente, verificar

### 2.4 Goals — Fluxos Completos

- **Contribution:** existente, revisar para usar intent-driven UX
- **Withdrawal:** novo flow → amount + optional transfer (se reserve account configurada)
- **Adjustment:** existente, revisar
- Status transitions: ACTIVE → COMPLETED (manual ou ao atingir target), ACTIVE → CANCELED

### Testes

- Unit tests para cada modo do TransactionForm (campos visíveis/ocultos por modo)
- Behavioral tests: user seleciona modo → campos corretos aparecem
- Quick action tests: dialog render, API call, status update
- Edit flow tests: async params, not-found, ownership
- Goal withdrawal tests: happy path, validation, with/without transfer

---

## Fase 3 — Dashboard Polish Phase 2

### Objetivo
Transformar dashboard em painel patrimonial editorial.

### Mudanças Visuais

- **Summary cards:** Top accent bars coloridos (verde=receita, vermelho=despesa, azul=saldo)
- **Hierarquia visual:** Saldos (maior peso) > Pendências > Categorias/Cartões
- **Empty states:** Copy patrimonial rico em vez de "nenhum dado"
- **Seções internas:** Vertical rhythm disciplinado, separadores sutis

### Componentes Afetados

- `DashboardReportView` — cards patrimoniais, layout de seções
- `SideBar` — peso visual elevado, editorial
- `Header` — continuidade com sidebar

### Integração com computeAccountBalance

- Listagem de contas no dashboard usa `computeAccountBalance` para saldo real
- Summary cards derivam totais dos saldos computados

### Testes

- Estrutura hierárquica (presença de blocos patrimoniais)
- Semântica de seções internas
- Empty state coverage
- Accent bars por tipo de card

---

## Fase 4 — Visual Hardening

### Objetivo
Dar identidade visual premium ao produto, remover estética genérica.

### Token System

- Color space: oklch
- Radius: 0.75rem (cards), 0.5rem (inputs)
- Inputs: backgrounds sólidos (`bg-input`), nunca transparentes
- Focus: ring visível, contraste adequado
- Dark mode: paridade completa com light

### Componentes a Redesenhar

| Componente | Mudança Principal |
|------------|------------------|
| Input | Background sólido, border discreta, focus ring |
| Select | Background sólido, sem IDs, human-friendly options |
| Button | Hierarquia clara (primary/secondary/ghost) |
| Card | Border sutil, shadow controlado, radius 0.75rem |
| Table | Linhas com hover, density controlada |
| Badge | Status semantics (cores por estado financeiro) |
| Dialog | Overlay consistente, padding generoso |
| Sidebar | Brand anchor, workspace feel |

### Regras de Hardening (Non-Negotiable)

1. IDs nunca aparecem em superfícies do usuário
2. Seleção human-first (selects, comboboxes, search por nome)
3. Campos progressivos (só relevantes aparecem por contexto)
4. Intenção antes de estrutura (form driven by operation type)
5. Massa visual real (inputs/selects com backgrounds sólidos)
6. Semântica clara (cores servem decisão, não decoração)
7. Mensagens de erro úteis (ajudam resolver, não só apontar falha)

### Testes

- Visual contracts: componentes têm classes/atributos esperados por variante
- Behavioral: form interactions com userEvent
- Hardening: IDs não expostos, entities por nome, listas reais
- Light/dark parity: componentes renderizam em ambos os temas

---

## Estratégia de Execução

### Sequência

```
Fase 1 (Financial Core) → Fase 2 (Flows + Goals) → Fase 3 (Dashboard Polish) → Fase 4 (Visual Hardening)
```

Cada fase só inicia após a anterior passar nos publish gates (`yarn test` + `yarn lint` + `yarn build`).

### Multi-Agent por Fase

**Fase 1 (3 agents paralelos):**
- Agent A: Commands (settle/cancel transaction + transfer)
- Agent B: payInvoice + computeAccountBalance
- Agent C: recordGoalWithdrawal + API routes

**Fase 2 (3 agents paralelos):**
- Agent A: Transaction form por intent
- Agent B: Quick actions (settle, cancel, pay)
- Agent C: Goals withdrawal + edit flows verification

**Fase 3 (2 agents paralelos):**
- Agent A: DashboardReportView patrimonial
- Agent B: Sidebar + Header editorial

**Fase 4 (3 agents paralelos):**
- Agent A: Token system + Input/Select/Button
- Agent B: Card/Table/Badge/Dialog
- Agent C: Sidebar + Forms hardening

### Publish Gates (Cada Fase)

- `yarn test` — 0 falhas
- `yarn lint` — 0 erros
- `yarn build` — sucesso
- Financial consistency tests green (fases 1-2)
