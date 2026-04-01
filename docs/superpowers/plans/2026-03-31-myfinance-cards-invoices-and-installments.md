# Cards, Invoices And Installments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar cartões, cálculo de competência de fatura e parcelamento integrado ao núcleo financeiro, sem misturar pagamento de fatura com nova despesa.

**Architecture:** Este subplano depende do núcleo financeiro já estável e precisa introduzir três camadas em ordem: vocabulário e schema de cartão/fatura/parcelamento, depois services e regras de cálculo, e só então APIs e UI. O cálculo de fatura e a semântica de parcelamento ficam no domínio, não nas páginas.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, MySQL, Vitest, Zod, React Hook Form

---

## File Structure

### Domínio de cartões
- `app/modules/cards/contracts.ts`
- `app/modules/cards/validators.ts`
- `app/modules/cards/service.ts`
- `app/modules/cards/index.ts`

### Domínio de faturas
- `app/modules/invoices/contracts.ts`
- `app/modules/invoices/validators.ts`
- `app/modules/invoices/service.ts`
- `app/modules/invoices/index.ts`

### Parcelamento e integração financeira
- `app/modules/transactions/*` quando necessário para group/installment linkage
- `app/modules/transfers/*` para pagamento de fatura
- `prisma/schema.prisma`
- `app/types/db.ts`

### Rotas e UI
- `app/api/cards/route.ts`
- `app/api/cards/[cardId]/route.ts`
- `app/api/invoices/route.ts`
- `app/api/invoices/[invoiceId]/route.ts`
- `app/dashboard/cards/page.tsx`
- `app/dashboard/cards/[cardId]/page.tsx`
- `app/dashboard/invoices/[invoiceId]/page.tsx`
- `app/components/*` quando necessário
- `app/components/layout/SideBar.tsx` se a navegação precisar ser expandida

### Testes
- `tests/unit/cards/*`
- `tests/unit/invoices/*`
- `tests/unit/api/cards/*`
- `tests/unit/api/invoices/*`
- `tests/unit/prisma/*`

## Tasks

### Task 1: Align Cards, Invoices And Installments Vocabulary
Objetivo:
- alinhar schema, contratos, validadores e shapes de parcelamento ao PRD

### Task 2: Implement Cards Service Layer
Objetivo:
- consolidar CRUD base de cartões e suas regras operacionais

### Task 3: Implement Invoices And Installments Service Layer
Objetivo:
- implementar geração e leitura de faturas, cálculo por fechamento e integração com parcelamento

### Task 4: Implement Cards API Flows
Objetivo:
- entregar rotas autenticadas de cartões com listagem, criação e atualização

### Task 5: Implement Invoices API Flows
Objetivo:
- entregar rotas autenticadas de faturas com listagem, detalhe e pagamento com conta de origem

### Task 6: Implement Cards UI Flows
Objetivo:
- criar tela de cartões e visão base por cartão

### Task 7: Implement Invoice UI Flows
Objetivo:
- criar visão de fatura e histórico com compras/parcelas vinculadas

## Execution Notes
- `closeDay` e `dueDay` precisam evoluir para semântica explícita de fechamento e vencimento
- pagamento de fatura não pode gerar nova despesa principal
- parcelamento precisa manter grupo lógico comum entre parcelas
- despesas de cartão devem compor fatura automaticamente pela regra de fechamento
- não misturar ainda metas, recorrência ou dashboard avançado neste subplano
- todo comportamento novo deve nascer com teste
