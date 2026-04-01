# Dashboard And Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a principal proposta de valor do produto com visão consolidada real, separando previsto, realizado e movimentações internas no dashboard mensal.

**Architecture:** O subplano começa pelo contrato do dashboard e pelas regras de agregação do domínio, depois expõe APIs e por fim ajusta a tela principal. O cálculo precisa ficar em services/módulo de dashboard, não na página.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, MySQL, Vitest

---

## File Structure

### Domínio de dashboard
- `app/modules/dashboard/contracts.ts`
- `app/modules/dashboard/service.ts`
- `app/modules/dashboard/index.ts`

### Integração e API
- `app/services/dashboardService.ts`
- `app/api/dashboard/route.ts`

### UI
- `app/dashboard/page.tsx`
- `app/components/dashboard/*` quando necessário

### Testes
- `tests/unit/dashboard/*`
- `tests/unit/api/dashboard/*`

## Tasks

### Task 1: Align Dashboard Domain Contract
Objetivo:
- definir o contrato consolidado do dashboard alinhado ao PRD

### Task 2: Implement Dashboard Aggregation Service
Objetivo:
- implementar agregações de previsto, realizado, pendências, contas, categorias, cartões/faturas e movimentações internas

### Task 3: Implement Dashboard API Flow
Objetivo:
- entregar rota autenticada de dashboard com período selecionável

### Task 4: Implement Dashboard UI Flow
Objetivo:
- reconstruir a tela `dashboard/page.tsx` com os novos blocos principais

## Execution Notes
- separar claramente `previsto`, `realizado` e `movimentações internas`
- não duplicar despesas por pagamento de fatura
- contas devem aparecer como posição de caixa, não como receita/despesa
- o dashboard pode usar placeholders para gráficos comparativos que ficaram fora deste subplano
- todo comportamento novo deve nascer com teste
