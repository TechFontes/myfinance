# Admin Technical Area Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar uma área administrativa técnica separada para listar usuários, editar dados cadastrais administrativos, bloquear/desbloquear usuários e consultar dados financeiros em modo somente leitura.

**Architecture:** O subplano reaproveita a autenticação e os papéis já existentes, adicionando um módulo `admin` para contratos e serviços, rotas protegidas por papel `ADMIN` e uma UI administrativa separada da área do usuário final. O acesso financeiro seguirá leitura somente, sem criar caminhos alternativos de escrita no domínio financeiro.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Prisma, Zod

---

## File Structure

### Domínio administrativo
- `app/modules/admin/contracts.ts`
- `app/modules/admin/validators.ts`
- `app/modules/admin/service.ts`
- `app/modules/admin/index.ts`

### Rotas e proteção
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[userId]/route.ts`
- `app/api/admin/users/[userId]/block/route.ts`
- `app/api/admin/users/[userId]/financial-overview/route.ts`

### UI administrativa
- `app/admin/page.tsx`
- `app/components/admin/*`
- `app/components/layout/SideBar.tsx` apenas se for necessário expor navegação para admins

### Testes
- `tests/unit/admin/*`
- `tests/unit/api/admin/*`

## Tasks

### Task 1: Align Admin Domain Contract
Objetivo:
- definir contratos, validadores e o serviço mínimo para listagem de usuários, atualização cadastral administrativa, bloqueio/desbloqueio e visão financeira somente leitura

### Task 2: Implement Admin API Flows
Objetivo:
- entregar rotas protegidas por papel `ADMIN` para listar usuários, atualizar cadastro administrativo, bloquear/desbloquear e consultar visão financeira

### Task 3: Implement Admin UI Flows
Objetivo:
- criar a área administrativa técnica separada com listagem de usuários, ações administrativas e painel de leitura financeira

## Execution Notes
- admins não podem editar dados financeiros do usuário
- bloqueio deve impedir novo login e uso ativo, preservando os dados
- motivo de bloqueio deve ser obrigatório na ação de bloquear
- como o PRD explicitamente deixa auditoria administrativa fora do MVP, não criar trilha de auditoria agora
- todo comportamento novo deve nascer com teste
