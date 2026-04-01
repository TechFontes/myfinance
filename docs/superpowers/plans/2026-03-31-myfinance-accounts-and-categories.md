# Accounts And Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar os cadastros base de contas e categorias do MyFinance conforme o PRD, consolidando os contratos do dominio, as regras operacionais e os fluxos essenciais de API e UI.

**Architecture:** O subplano parte do alinhamento do schema e dos contratos compartilhados antes das rotas e telas. Primeiro entram tipos, validadores e vocabulario do dominio; depois os fluxos de conta; em seguida categorias e suas restricoes. A UI entra por ultimo, apoiada por contratos e testes de API ja estaveis.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, MySQL, Vitest, Zod, React Hook Form

---

## File Structure

### Dominio de contas
- `app/modules/accounts/contracts.ts`
- `app/modules/accounts/validators.ts`
- `app/modules/accounts/service.ts`
- `app/modules/accounts/index.ts`

### Dominio de categorias
- `app/modules/categories/contracts.ts`
- `app/modules/categories/validators.ts`
- `app/modules/categories/service.ts`
- `app/modules/categories/index.ts`

### Infraestrutura compartilhada
- `app/services/accountService.ts`
- `app/lib/db/*` quando necessario
- `prisma/schema.prisma`

### Rotas e UI
- `app/api/accounts/route.ts`
- `app/api/accounts/[accountId]/route.ts`
- `app/api/categories/route.ts`
- `app/api/categories/[categoryId]/route.ts`
- `app/(protected)/accounts/page.tsx` ou rota equivalente consolidada
- `app/(protected)/categories/page.tsx` ou rota equivalente consolidada

### Testes
- `tests/unit/accounts/*`
- `tests/unit/categories/*`
- `tests/unit/api/accounts/*`
- `tests/unit/api/categories/*`
- `tests/unit/prisma/*`

## Tasks

### Task 1: Align Accounts And Categories Domain Vocabulary
Objetivo:
- alinhar schema, tipos e validadores de contas/categorias ao PRD antes de implementar CRUD

### Task 2: Implement Account Contracts And Service Layer
Objetivo:
- consolidar regras de conta, mapeamento de payload e operacoes de listagem/criacao/edicao/inativacao

### Task 3: Implement Accounts API Flows
Objetivo:
- entregar rotas autenticadas de contas com listagem, criacao e atualizacao seguindo o novo contrato

### Task 4: Implement Category Contracts And Service Layer
Objetivo:
- consolidar regras de categoria, hierarquia pai/subcategoria e restricoes de exclusao

### Task 5: Implement Categories API Flows
Objetivo:
- entregar rotas autenticadas de categorias com listagem, criacao, atualizacao, inativacao e exclusao restrita

### Task 6: Implement Accounts And Categories UI Flows
Objetivo:
- alinhar telas base de contas e categorias ao novo contrato com formularios e estados operacionais

## Execution Notes
- manter `ativo/inativo` como unico mecanismo de disponibilidade operacional para contas e categorias
- contas devem preservar distincao entre saldo inicial informado e saldo calculado, sem automatizar calculo completo neste subplano
- categorias devem suportar apenas um nivel de hierarquia: pai e subcategoria
- exclusao de categoria com historico vinculado deve falhar com erro explicito
- todo comportamento novo deve nascer com teste
