# MyFinance - Plataforma de Controle Financeiro Pessoal

Plataforma multi-usuário de gestão financeira pessoal. Controla contas, transações, cartões de crédito, faturas, metas de poupança, recorrências, transferências e importação CSV, com dashboard consolidado e painel administrativo.

**Autor:** Daniel Fontes (GitHub: techfontes, LinkedIn: daniel-fontes-tech)

---

## Stack & Infraestrutura

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, standalone output) |
| UI | React 19, TailwindCSS 4, Radix UI |
| Linguagem | TypeScript 5 (strict) |
| ORM | Prisma 6.19 (MySQL) |
| Validação | Zod 4 + React Hook Form |
| Auth | JWT (httpOnly cookie, 7 dias) + bcryptjs |
| Testes | Vitest 3 + React Testing Library |
| Deploy | PM2 (fork, porta 3000, standalone) |
| Fontes | Inter (sans) + Sora (serif) |

---

## Comandos Essenciais

```bash
yarn dev            # servidor de desenvolvimento
yarn test           # suite completa (~350 testes, 134 arquivos)
yarn lint           # ESLint
yarn build          # build standalone + prepare
yarn start:standalone  # produção standalone
npx prisma migrate status  # verificar migrations
npx prisma migrate dev     # aplicar migrations
```

---

## Arquitetura

### Estrutura de Diretórios

```
app/
├── modules/          # domínio (contracts, validators, service, index)
│   ├── financial-core/  # comandos financeiros canônicos
│   ├── transactions/    # CRUD + filtros transações
│   ├── accounts/        # gestão de contas
│   ├── cards/           # cartões de crédito
│   ├── invoices/        # faturas
│   ├── transfers/       # transferências entre contas
│   ├── goals/           # metas de poupança
│   ├── categories/      # categorias hierárquicas
│   ├── recurrence/      # regras de recorrência
│   ├── dashboard/       # contratos + period domain
│   ├── imports/         # importação CSV
│   ├── auth/            # autenticação
│   └── admin/           # administração
├── services/         # orquestração (dashboardService, accountService, etc.)
├── components/       # React components por domínio + ui/ (primitivos Radix)
├── contexts/         # AuthContext, ThemeContext
├── lib/              # utilitários (auth, dates, money, prisma, utils)
├── types/            # domain.ts (const arrays + types), db.ts (DTOs)
├── api/              # API routes (Next.js Route Handlers)
├── dashboard/        # páginas protegidas do dashboard
├── (auth)/           # páginas de login/registro
└── admin/            # painel administrativo
```

### Padrões Arquiteturais Obrigatórios

1. **Módulos como fronteira de domínio** - Cada módulo em `app/modules/` exporta via `index.ts`. Estrutura interna: `contracts.ts`, `validators.ts`, `service.ts`
2. **Prisma NUNCA em páginas** - Acesso ao banco somente dentro de módulos ou services
3. **Cálculos financeiros em domain services** - Nunca em componentes ou páginas
4. **User-scoped data isolation** - Toda query filtra por `userId`
5. **Vocabulário PRD preservado** - Terminologia do domínio financeiro mantida no código e UI

### Financial Core (Command Pattern)

O módulo `financial-core` centraliza operações financeiras complexas com side-effects rastreados:

- `settleTransaction` - liquidar transação (marcar paga + efeito conta)
- `createCardPurchase` - despesa cartão + atualizar fatura
- `payInvoice` - pagar fatura + debitar conta
- `createTransfer` - movimentar entre contas
- `recordGoalContribution` - contribuição/retirada de meta

Cada comando retorna: `{ command, writes: [...], rule: {...} }`

### Dashboard como Read Model

O dashboard é somente leitura. Agrega dados de transações, transferências, faturas e contas. Não orquestra mutações. Toda mutação financeira deve chamar `revalidatePath('/dashboard')`.

### Period Domain

Período é um objeto de domínio (`DashboardPeriod`), não string solta:
- Pattern: `YYYY-MM` (regex validated)
- Parsing, navegação (prev/next), labels pt-BR via Intl
- Funções em `app/modules/dashboard/period.ts`

---

## Modelos de Dados (Prisma/MySQL)

| Model | Papel | Campos-chave |
|-------|-------|-------------|
| User | Auth + identidade | email, password, role (USER/ADMIN), blockedAt |
| Account | Containers de dinheiro | type (BANK/WALLET/OTHER), initialBalance, active |
| Category | Classificação hierárquica | type (INCOME/EXPENSE), parentId, active |
| Transaction | Movimentações | type, status (PLANNED→PENDING→PAID→CANCELED), competenceDate, dueDate, paidAt |
| CreditCard | Cartões | limit, closeDay, dueDay, active |
| Invoice | Faturas mensais | month, year, status (OPEN/PAID/CANCELED), total |
| Transfer | Entre contas | sourceAccountId, destinationAccountId, amount, status |
| Goal | Metas poupança | targetAmount, reserveAccountId, status (ACTIVE/COMPLETED/CANCELED) |
| GoalContribution | Movimentos de meta | kind (CONTRIBUTION/WITHDRAWAL/ADJUSTMENT), amount |
| RecurringRule | Regras recorrência | frequency, dayOfMonth, startDate, endDate, active |

### Campos Financeiros Temporais (Transaction)

- `competenceDate` - quando a transação é relevante (competência)
- `dueDate` - quando o pagamento vence
- `paidAt` - quando foi efetivamente pago (nullable)

### Conversão Decimal

Prisma Decimal → string em toda camada de serviço. Funções `mapXRecord()` fazem a conversão.

---

## Autenticação & Autorização

- JWT em cookie httpOnly (`auth_token`), expiração 7 dias
- Middleware protege `/dashboard/*`, `/admin/*`, `/api/*` (exceto rotas públicas de auth)
- `getUserFromRequest()` extrai user do cookie, verifica JWT e status de bloqueio
- Admin: role `ADMIN` verificado no middleware, redireciona non-admin para dashboard
- Rotas públicas: `/`, `/login`, `/register`, `/api/auth/login`, `/api/auth/register`

---

## Convenções de Código

### Referência: AGENTS.md

O arquivo `AGENTS.md` na raiz contém todas as convenções obrigatórias para agentes. Leia-o integralmente antes de qualquer trabalho. Resumo crítico:

### TDD Obrigatório

1. Identificar menor conjunto de testes relevante
2. Rodar testes ANTES de tocar código de produção
3. Se cobertura falta, escrever teste primeiro e verificar que falha
4. Implementar menor mudança que satisfaz o teste
5. Re-rodar testes focados após mudança
6. Rodar verificação mais ampla antes de fechar trabalho

### Gates de Publicação (Non-Negotiable)

| Gate | Comando | Critério |
|------|---------|----------|
| Testes | `yarn test` | 0 falhas |
| Lint | `yarn lint` | 0 erros |
| Build | `yarn build` | Sucesso |
| Schema | `npx prisma migrate status` | Migrations aplicadas |

### Regras de Verificação

- **Schema discipline:** Toda mudança Prisma precisa de migration correspondente. Schema drift sem migration é blocking
- **Async route params:** Testes de páginas dinâmicas usam `params: Promise.resolve({ ... })` (Next.js 16 App Router)
- **Financial mutation freshness:** Todo handler de mutação financeira chama `revalidatePath('/dashboard')`
- **Publish evidence:** Nenhum feature/fix é completo sem `yarn test` + `yarn lint` + `yarn build` passando

### Validação com Zod

- `z.enum(constArray)` para enums type-safe
- `z.coerce.date()` para parsing flexível de datas
- `z.string().trim().min(1)` para strings não-vazias
- Schemas refletem contracts do módulo

### Tratamento de Erros

- `DomainError` com campo `code` para erros de domínio
- Assertion pattern: `assertUserOwnsAccount()`, `assertUserOwnsX()` - fail fast
- Erros de validação via Zod parse

### Naming Conventions

| Padrão | Exemplo |
|--------|---------|
| DB types | `DBUser`, `DBAccount` |
| Service types | `UserRecord`, `AccountRecord` |
| DTOs | `CreateTransactionDTO`, `UpdateTransactionDTO` |
| Queries | `findXById()`, `listXByY()` |
| Mutations | `createX()`, `updateXById()` |
| Assertions | `assertUserOwnsX()` |
| Mapping | `mapXRecord()` |
| Módulos | kebab-case dirs (`financial-core`) |

---

## Governança de Execução

### Quatro Gates por Capability

1. **Design** - Requisitos claros, arquivos afetados identificados, estratégia de teste definida
2. **Red (TDD)** - Testes falhando escritos antes do código de produção
3. **Integration** - Código satisfaz testes, sem regressões, lint e types passam
4. **Publish** - Suite completa, build, migrations, riscos residuais documentados

### Papéis

- **Owner Agent** - Escopo, dependências, decisões de integração
- **Integration Reviewer** - Consistência cross-module, fronteiras de módulo
- **Verification Reviewer** - Evidência de teste, regressão, deploy readiness

### Coordenação Multi-Agent

- Agentes paralelos trabalham em file sets independentes
- Modificações de estado compartilhado requerem execução sequencial
- Cada agente faz commit de seu checkpoint
- Review de integração após merge de trabalho paralelo

---

## Documentação do Projeto

```
docs/superpowers/
├── specs/           # Design specs (brainstorming → decisões aprovadas)
├── plans/           # Planos de implementação (tasks, agents, gates)
│   └── notes/       # Convenções, governance, schema notes
└── reports/         # Auditorias, baselines, reanalysis
```

### Specs & Plans Existentes

**Foundation (2026-03-31):** 8 planos de módulo (accounts, auth, cards, categories, dashboard, financial-core, recurrence, admin)

**Phase 1 (2026-04-01):** Visual hardening, dashboard polish phase 2, performance optimization, portfolio home

**Stabilization (2026-04-02):** Master stabilization & product evolution (5 fases), stabilization recovery program, portfolio home redesign

### Reports de Auditoria

- `financial-core-audit.md` - Gaps: settlement/cancellation commands, invoice payment, goal withdrawal
- `master-program-reanalysis.md` - Riscos residuais: invoice payment e2e, dashboard como read-model, build noise
- `stabilization-recovery-audit.md` - Root causes fixados: schema drift, async params, dashboard freshness
- `performance-baseline.md` / `performance-reanalysis.md` - Auth bootstrap, dashboard queries, loading states

---

## Gaps Conhecidos & Riscos Residuais

### Comandos Financeiros Incompletos
- `settleTransaction` - parcialmente implementado
- `cancelTransaction` - ausente
- `settleTransfer` - ausente
- `payInvoice` - API marca pago, mas source-account e efeito patrimonial não end-to-end
- `recordGoalWithdrawal` - ausente

### Riscos de Infraestrutura
- Dashboard é read-model on-demand (sem snapshot persistido)
- Arquitetura de módulos (sem ledger/event-store) - corrections históricas são caras
- `baseline-browser-mapping` desatualizado (lint/build warnings, não blocking)
- Timeout pré-existente em `tests/unit/recurrence/recurrence-page.test.tsx`
- Auth registration test timeout ocasional (bcrypt overhead)

---

## Portfolio Home (Página Pública)

Página raiz `/` serve como portfolio case técnico (não landing page de marketing).

**Estrutura:** Hero bar compacto → Domain map (auth + 8 módulos) → Process map (6 steps) → Metrics (5 cards) → Screenshot carousel → Footer contact

**Componentes:** `app/components/marketing/` (PortfolioHome, PortfolioHero, PortfolioDomainMap, PortfolioProcessMap, PortfolioMetrics, PortfolioScreenshotCarousel, PortfolioFooter)

**Contato:** Daniel Fontes, email, WhatsApp: 21989799816, GitHub: techfontes, LinkedIn: daniel-fontes-tech

---

## Memória Persistente

Este projeto utiliza o sistema de memória persistente do Claude Code em `~/.claude/projects/-workspace-pessoal-myfinance/memory/`.

### Regra de Atualização Contínua

**O agente DEVE atualizar a memória persistente automaticamente e periodicamente, especialmente:**

1. **Novas features implementadas** - Atualizar `project_state.md` movendo item de "próximos passos" para "concluído", registrando escopo, arquivos-chave e data. Se a feature introduziu novos módulos, patterns ou componentes, atualizar também `architecture_decisions.md`
2. **Erros comuns encontrados** - Salvar como memória `feedback` com root cause e solução. Exemplos: async params, schema drift, missing revalidation
3. **Decisões arquiteturais tomadas** - Salvar como memória `project` com contexto e razão
4. **Patterns estabelecidos** - Salvar como memória `feedback` quando um padrão é validado pelo usuário
5. **Marcos alcançados** - Atualizar memórias `project` ao completar phases ou milestones
6. **Preferências do usuário** - Salvar como memória `user` quando o usuário demonstra preferências de workflow

### Quando Atualizar

- **Ao implementar uma nova feature:** atualizar estado do projeto, registrar o que foi feito, quais módulos/componentes foram criados ou modificados
- Ao resolver um bug não-trivial: salvar root cause + fix
- Ao completar uma phase/milestone: atualizar estado do projeto
- Ao receber feedback do usuário: salvar como guidance
- Ao descobrir um padrão recorrente: documentar para futuras sessões
- Ao encontrar um erro que já foi resolvido antes: verificar se memória existe, criar se não

### Formato

Consultar instruções do sistema de memória para formato de arquivos e index (MEMORY.md).
