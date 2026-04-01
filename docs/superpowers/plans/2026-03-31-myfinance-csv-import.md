# CSV Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir importação simples de transações via CSV com pré-validação, revisão de duplicidades e mapeamento de categorias antes de persistir dados.

**Architecture:** O subplano começa pelo contrato da importação e parsing do CSV, depois constrói a pré-validação, a API e por fim a UI de revisão/confirmação. Nenhuma gravação deve acontecer antes da etapa de revisão.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Zod

---

## File Structure

### Domínio de importação
- `app/modules/imports/contracts.ts`
- `app/modules/imports/validators.ts`
- `app/modules/imports/service.ts`
- `app/modules/imports/index.ts`

### Integração
- `app/modules/transactions/*`
- `app/modules/categories/*`

### Rotas e UI
- `app/api/imports/transactions/preview/route.ts`
- `app/api/imports/transactions/commit/route.ts`
- `app/dashboard/imports/page.tsx`
- `app/components/imports/*`
- `app/components/layout/SideBar.tsx` se a navegação precisar ser expandida

### Testes
- `tests/unit/imports/*`
- `tests/unit/api/imports/*`

## Tasks

### Task 1: Align CSV Import Domain Contract
Objetivo:
- definir contratos, validadores e parsing base do CSV

### Task 2: Implement Preview And Validation Service
Objetivo:
- implementar leitura, pré-validação, detecção de possíveis duplicidades e mapeamento de categorias

### Task 3: Implement Import API Flows
Objetivo:
- entregar rotas de preview e commit da importação

### Task 4: Implement Import UI Flows
Objetivo:
- criar a visão de importação com revisão e confirmação

## Execution Notes
- importação do MVP é só para transações
- categorias inexistentes devem ser mapeadas, não criadas silenciosamente
- possíveis duplicidades devem ser apresentadas antes da confirmação
- linhas inválidas não podem ser persistidas sem revisão
- todo comportamento novo deve nascer com teste
