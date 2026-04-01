# Recurrence Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o motor de recorrência do MyFinance para gerar lançamentos previstos automaticamente e permitir edição controlada de ocorrência atual ou série futura.

**Architecture:** O subplano começa pelo vocabulário e pelas regras do domínio de recorrência, depois avança para geração de ocorrências, APIs e UI. A geração automática deve nascer primeiro como domínio testado, antes de qualquer tela. Recorrência deve continuar separada de pagamento efetivo.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, MySQL, Vitest, Zod, React Hook Form

---

## File Structure

### Domínio de recorrência
- `app/modules/recurrence/contracts.ts`
- `app/modules/recurrence/validators.ts`
- `app/modules/recurrence/service.ts`
- `app/modules/recurrence/index.ts`

### Integração com transações
- `app/modules/transactions/*` quando necessário para geração
- `prisma/schema.prisma`
- `app/types/db.ts`

### Rotas e UI
- `app/api/recurrence/route.ts`
- `app/api/recurrence/[ruleId]/route.ts`
- `app/dashboard/recurrence/page.tsx`
- `app/components/layout/SideBar.tsx` se a navegação precisar ser expandida
- `app/components/recurrence/*` quando necessário

### Testes
- `tests/unit/recurrence/*`
- `tests/unit/api/recurrence/*`
- `tests/unit/prisma/*`

## Tasks

### Task 1: Align Recurrence Domain Vocabulary
Objetivo:
- alinhar contratos, validadores, schema e tipos de recorrência ao PRD

### Task 2: Implement Recurrence Service Layer
Objetivo:
- implementar CRUD base de regras e geração de ocorrências previstas

### Task 3: Implement Recurrence API Flows
Objetivo:
- entregar rotas autenticadas de recorrência com listagem, criação e atualização

### Task 4: Implement Recurrence UI Flows
Objetivo:
- criar a visão de regras recorrentes e seu acesso pelo dashboard

## Execution Notes
- recorrência gera lançamentos previstos; não marca pagamento automaticamente
- edição deve distinguir ocorrência atual de atual + próximas, mesmo que inicialmente via contrato explícito
- regras inativas não geram novos lançamentos
- recorrência pode apontar para conta ou cartão, conforme o PRD
- todo comportamento novo deve nascer com teste
