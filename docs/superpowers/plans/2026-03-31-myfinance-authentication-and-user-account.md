# Authentication And User Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar autenticacao, perfil, papeis e recuperacao de senha do MyFinance conforme o PRD, sobre a fundacao ja concluida.

**Architecture:** A autenticacao sera reorganizada para sair do acoplamento atual entre context, service e rotas ad hoc e entrar em um modulo de auth com validacao, sessao e contratos claros. O subplano prioriza primeiro o nucleo de sessao e protecao, depois cadastro/perfil e por fim recuperacao de senha, sempre com TDD e commits pequenos.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, MySQL, Vitest, Zod, bcryptjs, jsonwebtoken

---

## File Structure

### Criar ou consolidar no dominio de auth
- `app/modules/auth/contracts.ts`
- `app/modules/auth/service.ts`
- `app/modules/auth/session.ts`
- `app/modules/auth/validators.ts`

### Ajustar infraestrutura compartilhada
- `app/lib/auth.ts`
- `app/middleware.ts`
- `app/services/userService.ts`
- `app/types/db.ts`
- `prisma/schema.prisma` quando necessario apenas para auth

### Rotas e UI
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/password/request-reset/route.ts`
- `app/api/auth/password/reset/route.ts`
- `app/api/auth/profile/route.ts`
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/contexts/AuthContext.tsx`

### Testes
- `tests/unit/auth/*`
- `tests/unit/api/auth/*`
- `tests/unit/middleware/auth-middleware.test.ts`

## Tasks

### Task 1: Define Auth Contracts, Session Helpers And Validators
Objetivo:
- criar tipos, payloads, contratos de sessao e validacoes compartilhadas de auth

### Task 2: Implement Register, Login, Logout And Me
Objetivo:
- entregar o nucleo operacional da autenticacao baseada em cookie httpOnly com sessao do usuario

### Task 3: Protect Routes, Roles And Blocked Users
Objetivo:
- endurecer middleware, leitura da sessao e regras de bloqueio/role do usuario

### Task 4: Implement Profile, Email Change And Password Change
Objetivo:
- permitir ao usuario autenticado editar perfil e alterar email/senha com verificacoes do PRD

### Task 5: Implement Password Reset Flow
Objetivo:
- criar solicitacao de reset, persistencia de token e redefinicao por token com expiracao

### Task 6: Implement Auth UI Flows
Objetivo:
- alinhar contexto, formularios e telas de login/cadastro ao novo contrato de auth

## Execution Notes
- manter cookie `auth_token` enquanto nao houver decisao diferente do PRD
- nao adicionar bibliotecas novas se o bloco puder ser concluido com a stack atual
- qualquer envio real de email pode ser encapsulado em adaptador simples e mockado por enquanto; o fluxo e os contratos devem existir
- o baseline da fundacao ja esta pronto, entao todo comportamento novo precisa nascer com teste
