# MyFinance Portfolio Home Redesign

Date: 2026-04-02

## Context

The current portfolio home is text-heavy with long narratives that repeat across sections. A tech lead evaluating the project has to scroll through marketing copy before reaching any technical substance. The redesign replaces narrative with structured evidence.

## Target Audience

Tech lead or CTO evaluating technical depth for a senior engineering role.

## Design Principles

1. Less text, more information
2. Show architecture, not describe it
3. Numbers over adjectives
4. Everything visible without excessive scroll

## Page Structure

Six sections, top to bottom:

### 1. Hero Compacto

Single horizontal bar replacing the current full-screen hero.

Content:
- Left: "MyFinance" + dot separator + "por Daniel Fontes"
- Subtitle: "Sistema de finanças pessoais · Next.js 16 · App Router · Prisma/MySQL · TDD"
- Right: CTA buttons (GitHub, LinkedIn, Demo, Login)

No paragraphs. No aside panel. No highlight tags. The stack is in the subtitle line.

### 2. Mapa de Domínio

Card with label "Mapa de domínio" containing:

**Auth cross-cutting banner** at the top:
- Lock icon + "Auth & Segurança"
- Tags: JWT httpOnly · bcrypt · middleware de sessão · RBAC admin/user · bloqueio de conta
- Yellow/amber background to visually separate from domain modules
- Communicates that auth is a transversal layer protecting all modules below

**8 domain modules** in a 4x2 grid:
- Row 1 (green tint): Transações, Cartões, Metas, Dashboard
- Row 2 (neutral tint): Contas, Transferências, Recorrência, Importação
- Each cell: module name + one-line capability summary (3-5 words)

### 3. Mapa de Processo

Timeline section with label "Processo de engenharia". Vertical line with 6 steps:

**Step 1 — PRD antes de qualquer código** (tag: Requisitos)
- Description: each feature starts as a product document with closed scope
- Visual tags: Escopo definido, Requisitos funcionais, Requisitos não-funcionais, Critérios de aceitação

**Step 2 — Design spec → Plano de implementação** (tag: Arquitetura)
- PRD becomes technical spec with architecture decisions
- Spec becomes plan with numbered tasks, mapped files, commit checkpoints

**Step 3 — Teste primeiro, código depois** (tag: Lei do projeto)
- Red dot on timeline (not green) to visually break the pattern
- Red-tinted border on the card
- No production code exists before a failing test
- Visual flow: RED (teste falha) → GREEN (código passa) → REFACTOR (limpa)

**Step 4 — Execução paralela em worktrees isolados** (tag: Coordenação)
- Independent tasks run in parallel via git worktrees
- Integration only after cross-verification

**Step 5 — Schema discipline como gate obrigatório** (tag: Governança)
- Every Prisma schema change requires a migration
- Automated tests verify migration existence
- Deploy without migration is blocking

**Step 6 — 4 gates antes de publicar** (tag: Publish)
- Visual flow: Design → Red test → Integration → Publish
- Each gate as a colored pill

### 4. Métricas

Row of 5 stat cards, equal width:

| Value | Label |
|-------|-------|
| 350+ | testes automatizados |
| 13 | módulos de domínio |
| 12 | API routes RESTful |
| TDD | test-first workflow |
| PM2 | standalone deploy |

### 5. Screenshot Destaque

Carousel showing one screenshot at a time with navigation dots.

Content:
- Label: "Produto em execução"
- Navigation: 3 dots (active = green, inactive = gray)
- One large image at a time
- Caption below: short one-line description

Screenshots to cycle through:
1. Dashboard patrimonial — posição financeira com cards de saldo e visão mensal
2. Transações — listagem densa orientada a operação diária
3. Importação CSV — preview e validação antes da confirmação

Client-side carousel with manual dot navigation. No autoplay.

### 6. Footer Cartão de Visita

Horizontal bar with:
- Left: "Daniel Fontes" + "Engenheiro de software · Rio de Janeiro"
- Right: Email, WhatsApp (formatted), GitHub button, LinkedIn button

## Visual Language

- Keep the current green-tinted gradient background
- Cards: white/translucent with subtle border and shadow
- Border radius: 16px for main cards, 10-12px for inner elements
- Typography: system-ui stack, same as current
- Auth banner: amber/yellow tint to differentiate from green domain modules
- TDD step: red accent (dot, border) to visually emphasize the "law"

## Components to Remove

- `PortfolioHero.tsx` — replaced by compact hero
- `PortfolioEvidenceGrid.tsx` — replaced by metrics row
- `PortfolioArchitectureSection.tsx` — replaced by domain map + process map
- `PortfolioScreenshots.tsx` — replaced by carousel

## Components to Create or Rewrite

- `PortfolioHero.tsx` — rewrite as compact bar
- `PortfolioDomainMap.tsx` — new: auth banner + 8-module grid
- `PortfolioProcessMap.tsx` — new: 6-step timeline
- `PortfolioMetrics.tsx` — new: 5-stat row
- `PortfolioScreenshotCarousel.tsx` — new: client component with dot navigation
- `PortfolioFooter.tsx` — new: contact card bar

## Content Data

Update `portfolio-home-content.ts` to reflect:
- Remove: `portfolioNarrative`, `portfolioEvidenceCards`, `portfolioSections`
- Keep: `portfolioCtas` (update if needed), `portfolioScreenshotCards`
- Add: `portfolioDomainModules`, `portfolioProcessSteps`, `portfolioMetrics` (update values), `portfolioContact`

## Non-Goals

- No animations or transitions beyond carousel
- No mobile-specific layout changes in this phase (responsive via existing Tailwind breakpoints)
- No new pages or routes
- No backend changes

## Success Criteria

- A tech lead sees architecture, process, and numbers without scrolling past marketing text
- Hero takes one horizontal bar, not a full screen
- Domain map shows all 8 modules + auth at a glance
- Process map tells the engineering story in structured steps, not paragraphs
- TDD-first is visually emphasized as a non-negotiable
- Total page height is significantly shorter than current
