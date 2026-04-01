# Financial Core Transactions And Transfers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidar o núcleo financeiro do MyFinance com o novo modelo de transações e transferências internas antes de cartões, faturas e recorrência.

**Architecture:** Este subplano precisa estabilizar primeiro o vocabulário do domínio e a camada de service, porque transações e transferências compartilham datas financeiras, status e regras de consolidação. A execução será feita em ondas pequenas: domínio e schema, depois services, depois APIs, depois listagem e operações de UI.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, MySQL, Vitest, Zod, React Hook Form

---

## File Structure

### Domínio de transações
- `app/modules/transactions/contracts.ts`
- `app/modules/transactions/validators.ts`
- `app/modules/transactions/service.ts`
- `app/modules/transactions/index.ts`

### Domínio de transferências
- `app/modules/transfers/contracts.ts`
- `app/modules/transfers/validators.ts`
- `app/modules/transfers/service.ts`
- `app/modules/transfers/index.ts`

### Infraestrutura compartilhada
- `app/services/transactionServer.ts`
- `app/types/db.ts`
- `app/types/domain.ts`
- `app/lib/dates/*`
- `app/lib/money/*`
- `prisma/schema.prisma`

### Rotas e UI
- `app/api/transactions/route.ts`
- `app/api/transactions/[transactionId]/route.ts`
- `app/api/transfers/route.ts`
- `app/api/transfers/[transferId]/route.ts`
- `app/dashboard/transactions/page.tsx`
- `app/dashboard/transactions/new/page.tsx`
- `app/dashboard/transfers/page.tsx`
- `app/components/*` quando necessário para tabelas/listas específicas

### Testes
- `tests/unit/transactions/*`
- `tests/unit/transfers/*`
- `tests/unit/api/transactions/*`
- `tests/unit/api/transfers/*`
- `tests/unit/prisma/*`

## Tasks

### Task 1: Align Transaction And Transfer Domain Vocabulary
Objetivo:
- alinhar schema, tipos, contratos e validadores de transações e transferências ao PRD

### Task 2: Implement Transactions Service Layer
Objetivo:
- consolidar regras de transação, filtros, paginação básica, status e datas financeiras

### Task 3: Implement Transfers Service Layer
Objetivo:
- implementar transferências internas como operação nativa sem contaminar receitas e despesas

### Task 4: Implement Transactions API Flows
Objetivo:
- entregar rotas autenticadas de transações com listagem, criação e atualização pelo novo contrato

### Task 5: Implement Transfers API Flows
Objetivo:
- entregar rotas autenticadas de transferências com listagem, criação e atualização pelo novo contrato

### Task 6: Implement Transactions UI Flows
Objetivo:
- alinhar listagem e tela de nova transação ao novo contrato com filtros e estados

### Task 7: Implement Transfers UI Flows
Objetivo:
- criar a visão de movimentações internas e integrá-la à navegação do dashboard

## Execution Notes
- manter status manuais: `PLANNED`, `PENDING`, `PAID`, `CANCELED`
- separar claramente receitas/despesas de movimentações internas
- usar `competenceDate`, `dueDate` e `paidAt` como datas oficiais de transação
- transferências não exigem categoria e não entram nos totais principais
- não misturar ainda lógica de cartão, fatura ou recorrência neste subplano
- todo comportamento novo deve nascer com teste
