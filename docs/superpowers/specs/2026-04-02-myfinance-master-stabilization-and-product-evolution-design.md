# MyFinance Master Stabilization And Product Evolution Design

## Context

O projeto já possui uma base funcional relevante:

- autenticação e navegação autenticada
- dashboard mensal
- contas, categorias, cartões, transferências, metas, recorrência e importação
- APIs e services separados por módulos
- cobertura razoável de testes unitários

Mas o estado atual ainda apresenta gaps importantes:

- regras financeiras centrais estão fragmentadas
- há diferença entre o que o backend suporta e o que a UI permite operar
- há drift entre schema, contratos, services e formulários em alguns domínios
- parte da UX ainda está orientada à modelagem interna em vez de intenção do usuário
- o dashboard já comunica valor, mas ainda não organiza bem navegação temporal e leitura operacional

Este documento define o desenho mestre para evoluir o sistema de um conjunto de módulos funcionais para um produto financeiro pessoal confiável, previsível e operacionalmente sólido.

## Product Goals

O programa de evolução deve perseguir simultaneamente cinco objetivos:

1. tornar o núcleo financeiro confiável
2. tornar as operações essenciais completas e previsíveis
3. melhorar a legibilidade executiva e operacional da dashboard
4. definir metas como entidade funcional consistente
5. fechar o produto com hardening, observabilidade e reanálise final

## Design Principles

### 1. Single Source Of Truth

Saldo, pagamento, cartão, fatura, meta e consolidados não podem continuar dependendo de regras espalhadas em telas e services independentes. O sistema precisa de um núcleo central de comandos financeiros.

### 2. Intent-Driven UX

O produto deve guiar o usuário por intenção:

- registrar receita
- registrar despesa em conta
- registrar compra no cartão
- marcar como paga
- pagar fatura
- transferir entre contas
- aportar na meta
- resgatar da meta

Isso substitui a lógica atual mais técnica, onde status, conta, cartão, fatura, competência e pagamento aparecem no mesmo nível sem orquestração suficiente.

### 3. Derived Reporting

Dashboard, saldo consolidado, totais por categoria, totais por fatura e progresso de meta devem ser read models derivados de um núcleo financeiro confiável, não estados paralelos e manualmente coerentes.

### 4. Temporal Navigation As A First-Class Domain

Período não deve permanecer como string solta `YYYY-MM`. O sistema deve ter um objeto explícito de período com parse, validação, label, navegação e semântica coerente.

### 5. Progressive Product Hardening

O programa não deve tentar resolver UX profunda e engine financeira ao mesmo tempo na mesma onda. A ordem precisa preservar previsibilidade e reduzir retrabalho:

1. corrigir regra
2. fechar operação
3. reorganizar leitura
4. enriquecer planejamento
5. endurecer e reavaliar

## Current-State Critical Findings

### Financial Core

- criação e edição de transações ainda são CRUD direto
- faturas possuem campos persistidos que podem divergir da composição real
- dashboard recalcula posições localmente
- metas usam contribuições manuais sem fluxo financeiro completo
- reflexos de pagamento e liquidação não estão centralizados

### Operational UX

- backend já suporta parte dos fluxos de edição, mas a UI ainda não expõe tudo
- informar pagamento ainda não é uma operação de primeira classe
- o formulário de transação exige entendimento demais do modelo interno
- várias listas “prometem gestão”, mas ainda operam como listagem e criação

### Dashboard And Time Navigation

- a seleção de período atual é `select + submit`
- o default ainda privilegia o mês corrente, mesmo sem dados
- a navegação temporal é pouco fluida
- o topo do dashboard ainda ocupa mais espaço do que deveria
- `projetado x realizado` ainda não oferece leitura comparativa gráfica

### Goals

- meta hoje funciona como acumulador manual
- aporte financeiro ainda não fecha ciclo real com reserva/transferência
- não há semântica explícita de resgate
- o conceito funcional da meta ainda está incompleto

## Target Architecture

## 1. Financial Command Layer

O sistema deve introduzir uma camada central de comandos financeiros. Ela será responsável por executar operações que mudam o estado econômico do usuário e orquestrar todos os reflexos necessários.

Exemplos de comandos:

- createCashTransaction
- updateCashTransaction
- settleTransaction
- reopenTransaction
- cancelTransaction
- createCardPurchase
- updateCardPurchase
- payInvoice
- createTransfer
- updateTransfer
- settleTransfer
- recordGoalContribution
- recordGoalWithdrawal
- generateRecurringPosting

Cada comando deve:

1. validar ownership e invariantes
2. abrir transação de banco
3. persistir a entidade principal
4. aplicar reflexos financeiros
5. devolver estado final coerente

## 2. Derived Read Models

Os seguintes elementos devem virar derivados explícitos do núcleo:

- saldo por conta
- posição de faturas
- consolidados do dashboard
- pendências
- progresso de meta
- totais por categoria

Esses read models podem continuar calculados on demand inicialmente, desde que sejam reconstruíveis a partir da fonte canônica.

## 3. Period Domain

O sistema deve introduzir um domínio explícito de período para o dashboard.

Responsabilidades:

- parse e validação de período
- label amigável
- ordem cronológica
- navegação anterior/próximo
- resolução de default
- listas de anos e meses disponíveis

## 4. Goal Movement Model

Meta deve ser remodelada como objetivo de acúmulo com histórico de movimentações.

Movimentos:

- CONTRIBUTION
- WITHDRAWAL
- ADJUSTMENT

Cada movimento pode ser:

- informacional
- financeiro

Quando financeiro, deve se reconciliar com conta-reserva e transferência correspondente.

## Multi-Phase Execution Strategy

## Phase 1: Financial Core And Consistency Of Effects

### Goal

Estabilizar a base do sistema, criando a fonte canônica dos reflexos financeiros.

### Scope

- centralização dos comandos financeiros
- invariantes de ownership e consistência
- coerência entre transação, cartão, fatura, conta, meta e dashboard
- uso de transações de banco
- correção da lógica de saldos e liquidação

### Acceptance Criteria

- marcar transação como paga altera corretamente o patrimônio derivado
- pagar fatura reflete caixa e status de fatura corretamente
- compra no cartão não afeta caixa antes do pagamento da fatura
- transferência afeta origem e destino atomica e simetricamente
- dashboard passa a refletir o novo estado derivado sem recomposição ad hoc conflitante

## Phase 2: Operational Flows And UX Completion

### Goal

Fechar as operações essenciais do produto e reduzir atrito de uso.

### Scope

- informar pagamento
- editar transação
- editar cartão
- editar conta
- editar categoria
- editar transferência
- editar meta
- ações rápidas e feedback contextual
- redesign do formulário de transação por intenção

### Acceptance Criteria

- toda entidade principal possui fluxo funcional de edição ou ação operacional compatível com o produto
- o formulário de transação deixa de expor combinações técnicas arbitrárias
- o usuário consegue operar receitas, despesas, compras no cartão, pagamento e parcelamento com clareza

## Phase 3: Dashboard And Time Navigation

### Goal

Transformar a dashboard em painel executivo + operacional, com navegação temporal melhor e leitura comparativa eficaz.

### Scope

- novo navegador temporal
- tabs de ano e mês
- default inteligente
- hero superior mais compacto
- gráfico de projetado x realizado
- abas/visões: geral, a receber, a pagar, consolidados

### Recommended UX

- anos em tabs superiores
- meses em tabs inferiores
- ordem cronológica correta
- apenas períodos com dados
- ação para voltar ao período atual
- deep-link persistido por querystring

### Acceptance Criteria

- seleção de período é navegável sem atrito
- o usuário entende rapidamente em que mês e visão está
- a leitura do comparativo entre projetado e realizado é imediata

## Phase 4: Goals And Financial Planning

### Goal

Transformar metas em componente funcional coerente de planejamento financeiro.

### Scope

- redefinição funcional de meta como objetivo de acúmulo
- conta-reserva opcional
- aporte, resgate e ajuste
- reflexo financeiro opcional e explícito
- integração com dashboard

### Acceptance Criteria

- meta pode ser criada, editada, aportada e resgatada
- o progresso da meta é compreensível e confiável
- quando houver reflexo financeiro, a conta-reserva permanece coerente

## Phase 5: Hardening, Observability And Final Reanalysis

### Goal

Fechar o sistema com qualidade de produto confiável.

### Scope

- testes de consistência financeira
- smoke tests dos fluxos principais
- revisão de filtros e listagens
- mensagens de erro e empty states
- logs funcionais mínimos
- reanálise final de UX, performance e coerência do produto

### Acceptance Criteria

- fluxos críticos têm proteção automatizada e comportamento previsível
- o sistema fica apto para uso real sem ambiguidade operacional relevante

## Comparative Product References

Este programa deve absorver padrões de produtos financeiros maduros sem copiar interface.

Referências mentais:

- YNAB para intenção financeira e clareza de categorias
- Monarch / Copilot / Lunch Money para leitura consolidada e organização da informação
- apps bancários e internet banking para previsibilidade em pagar, transferir e consultar saldo/fatura

Padrões a absorver:

- ações orientadas à intenção
- previsibilidade de efeito no dinheiro
- separação clara entre gasto, obrigação, pagamento e patrimônio
- leitura temporal fluida
- baixa ambiguidade entre previsto, pendente, pago, reserva e fatura

## Multi-Agent Execution Model

O programa deve ser executado com responsabilidades separadas:

- Agent A: Financial Core
- Agent B: Transaction And Operational UX
- Agent C: CRUD Completion
- Agent D: Dashboard And Temporal Navigation
- Agent E: Goals And Financial Planning
- Agent F: QA / Verification

Cada agente deve trabalhar em write sets o mais disjuntos possível, com integração feita em checkpoints por fase.

## Risks

- atacar dashboard antes do núcleo financeiro gera retrabalho
- evoluir metas antes da semântica financeira gera inconsistência patrimonial
- expor edição ampla sem invariantes fortes aumenta drift
- misturar “saldo do mês” com “saldo patrimonial real” continua confundindo produto e usuário

## Success Criteria

O programa será considerado bem-sucedido quando:

- o núcleo financeiro estiver consistente e previsível
- as operações principais estiverem completas
- a dashboard oferecer leitura rápida e análise útil
- metas tiverem semântica funcional clara
- o produto comunicar confiança, não improviso
