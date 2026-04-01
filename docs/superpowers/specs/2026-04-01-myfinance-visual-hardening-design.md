# MyFinance Visual Hardening Design

Data: 2026-04-01
Status: Aprovado em brainstorming
Produto: MyFinance
Escopo: Repaginação visual completa com hardening de UX operacional e reforço de testes de UI

## Finalidade Deste Documento

Este documento define a direção visual, a linguagem de interface, as regras de UX operacional e a estratégia de testes de UI para a próxima fase do `MyFinance`.

Ele existe para evitar uma repaginação cosmética. O objetivo é elevar o produto em três dimensões ao mesmo tempo:
- identidade visual autoral e coerente
- experiência operacional madura para uso diário real
- proteção contra regressões visuais e comportamentais

Este documento deve orientar decisões de:
- design system
- tokens globais
- dashboard e navegação
- formulários e listas operacionais
- testes de interface e validação de comportamento visual

## Contexto Atual

O projeto avançou bastante em cobertura funcional, modelagem de domínio e estrutura modular, mas a interface ainda está em um estado híbrido.

Problemas observados durante a análise:
- identidade visual ainda genérica, com aparência próxima de template técnico
- tokens globais incompletos para superfícies, foco, popovers e estados interativos
- componentes de base com fundo transparente em contextos onde o campo precisa ter massa visual própria
- formulários principais ainda expõem campos baseados em IDs internos
- fluxos operacionais modelados mais pela estrutura de banco do que pela intenção do usuário
- testes de UI ainda cobrem fortemente presença de texto, mas pouco da interação real e do comportamento visual crítico

Exemplo concreto de problema atual:
- na criação de transação, o usuário ainda interage com `Categoria ID`, `Conta ID opcional`, `Cartão ID opcional` e `Fatura ID opcional`
- isso é incompatível com um produto financeiro pessoal maduro

## Objetivo Principal

Transformar o `MyFinance` em um produto com linguagem visual própria, clara e premium, sem sacrificar a densidade operacional necessária para controle financeiro em desktop.

A interface deve transmitir:
- confiança
- autoria
- clareza financeira
- precisão operacional

A experiência deve deixar de parecer um CRUD de entidades e passar a parecer uma mesa de controle financeira pessoal.

## Resultado Desejado

Ao final desta fase, o produto deve ser percebido como:
- visualmente autoral, e não genérico
- denso, mas organizado
- elegante, mas não ornamental demais
- operacionalmente humano, e não orientado a chaves técnicas
- confiável em tema claro e tema escuro

## Decisões De Direção

### Personalidade Da Marca

A personalidade aprovada é:
- `clareza financeira premium`

Interpretação operacional:
- linguagem séria, confiante e pessoal
- sem tom lúdico
- sem estética de fintech genérica baseada em exagero cromático ou excesso de glow
- sem estética de sistema corporativo frio demais

### Estrutura De Interface

A estrutura aprovada é:
- `híbrida`

Isso significa:
- arquitetura moderna de app com sidebar e módulos claros
- linguagem visual de painel financeiro sério
- combinação de assinatura visual e rigor operacional

### Densidade

A densidade aprovada é:
- `compacta`

Isso significa:
- alto aproveitamento de tela no desktop
- tabelas e filtros confortáveis para uso diário
- espaçamento econômico, mas não apertado
- legibilidade sustentada por grid, ritmo e hierarquia, não por excesso de espaço vazio

### Contexto De Uso Prioritário

O contexto principal aprovado é:
- `mesa de trabalho`

Consequências:
- o design deve priorizar desktop real
- listas, dashboards, filtros e comparação de informação devem funcionar muito bem em resoluções largas
- mobile continua suportado, mas não dita a hierarquia do produto nesta fase

### Temperatura Tipográfica

A direção aprovada é:
- `mais editorial`

Mas com calibração:
- títulos e números-chave ganham presença editorial
- navegação, formulários, filtros e tabelas permanecem em linguagem mais técnica e neutra
- o produto não deve virar uma peça editorial em telas operacionais densas

### Peso Da Expressão Visual

O nível aprovado é:
- `controlado`

Interpretação:
- identidade forte o suficiente para ser memorável
- uso de contraste, superfícies e ritmo visual como assinatura
- sem ornamentação excessiva
- sem interferir na eficiência de operação

### Escolha Final Entre As Direções Comparadas

A direção final aprovada é:
- `B calibrada`

Significado prático:
- a alma visual vem da opção editorial premium
- a ergonomia de fluxos densos, formulários e estrutura de operação se aproxima da opção híbrida refinada

Resumo:
- leitura autoral
- operação disciplinada

## Sistema Visual

### Princípio Geral

O sistema visual deve ser construído como uma linguagem coerente, não como um conjunto de componentes bonitos isolados.

A base do sistema deve sustentar:
- tema claro e tema escuro com peso equivalente
- leitura analítica em desktop
- clareza de estado em formulários, filtros e listas
- diferenciação forte entre áreas de leitura e áreas de operação

### Paleta Principal

Base aprovada:
- grafite
- marfim
- verde financeiro

#### Tema Claro

Funções visuais esperadas:
- fundo estrutural em marfim quente ou off-white mineral, nunca branco frio puro como padrão dominante
- superfícies principais em marfim claro, areia clara ou branco quente controlado
- textos em grafite profundo
- verde financeiro usado para saldo positivo, progresso, estados de confiança e acentos de valor
- vermelho destrutivo contido, com boa legibilidade e sem vibrar mais do que a hierarquia principal

#### Tema Escuro

Funções visuais esperadas:
- fundo estrutural em carvão/grafite profundo
- superfícies em camadas escuras distinguíveis, sem colapsar tudo em um único preto
- textos em off-white quente
- verde financeiro mais contido e sofisticado, evitando neon
- estados e superfícies devem manter separação material clara

### Tipografia

#### Papel Editorial

Usar tipografia com presença editorial em:
- títulos de páginas
- hero section do dashboard
- números de alto impacto, como saldo, resumo e totais-chave
- blocos de marca e cabeçalhos de seções nobres

Características desejadas:
- alta legibilidade
- contraste elegante
- sensação autoral e premium
- sem parecer jornal antigo nem interface rebuscada demais

#### Papel Operacional

Usar tipografia sans neutra em:
- sidebar
- labels
- filtros
- tabelas
- badges
- formulários
- mensagens de validação

Características desejadas:
- leitura rápida
- peso controlado
- consistência entre estados e densidade alta

### Superfícies

Regras:
- superfícies precisam ter presença material clara
- componentes interativos não podem depender de transparência frouxa para existir visualmente
- cards, painéis, filtros e inputs devem ter camadas reconhecíveis
- o sistema deve diferenciar fundo estrutural, superfície de leitura, superfície de operação e superfície elevada

### Bordas E Divisores

Regras:
- bordas discretas, mas constantes
- divisores usados para organizar informação e criar disciplina visual
- borda não deve parecer placeholder técnico nem desaparecer no claro/escuro

### Raios E Geometria

Direção recomendada:
- cantos arredondados moderados
- aparência sofisticada e contemporânea, sem parecer brinquedo
- cards, menus, dialogs e fields compartilham a mesma família geométrica

## Arquitetura Visual Das Áreas

### Sidebar

A sidebar deve se tornar a âncora visual do produto.

Funções:
- afirmar marca e identidade
- sustentar a navegação principal
- dar sensação de workspace financeiro pessoal

Regras:
- maior peso visual do que hoje
- estados ativos claros e nobres
- agrupamento por módulos quando necessário
- textos curtos, legíveis e consistentes
- no desktop, deve passar sensação de estação de controle, não de menu lateral improvisado

### Dashboard

O dashboard deve ser a superfície mais autoral do produto.

Hierarquia esperada:
1. cabeçalho editorial com período e leitura principal
2. números-chave com tratamento premium
3. blocos operacionais consolidados logo abaixo
4. listas resumidas com leitura rápida

O dashboard deve parecer:
- uma visão consolidada de decisão
- não uma coleção de cards intercambiáveis

### Listas E Tabelas

Regras:
- compactas e legíveis
- cabeçalhos claros
- alinhamento rigoroso
- boa escaneabilidade horizontal
- filtros acima da tabela com agrupamento lógico
- densidade alta sem colapsar em ruído visual

### Formulários

Os formulários devem deixar de refletir a estrutura do banco diretamente.

Princípios:
- foco em intenção do usuário
- linguagem humana
- progressão contextual
- campos agrupados por lógica de uso

Consequências:
- formulários não expõem IDs internos
- labels devem falar do conceito de negócio, não do modelo relacional
- campos opcionais devem parecer opcionais sem poluir a tela
- estados de foco, erro, sucesso e disable devem ser visualmente inequívocos

## Hardening De UX Operacional

### Regra-Mãe

O usuário nunca deve precisar conhecer uma chave interna para operar o sistema.

### Regras Obrigatórias

- `IDs saem da superfície`: categoria, conta, cartão, fatura, meta e regra recorrente deixam de aparecer como campos manuais em fluxos primários
- `seleção humana primeiro`: selects, comboboxes e buscas por nome tornam-se padrão
- `campos progressivos`: só aparece o que faz sentido no contexto atual
- `intenção antes da estrutura`: o formulário é desenhado pelo tipo de operação, não pela tabela subjacente
- `massa visual real`: input, select e textarea precisam ter fundo, borda e estados sólidos
- `semântica clara`: verde, vermelho, neutros e acentos servem à decisão, não à ornamentação
- `erro útil`: validações ajudam a resolver, não só apontam falha

### Casos Críticos A Serem Corrigidos

#### Nova Transação

Problemas atuais:
- pede `Categoria ID`
- pede `Conta ID opcional`
- pede `Cartão ID opcional`
- pede `Fatura ID opcional`

Direção correta:
- categoria selecionada por nome
- conta selecionada por nome
- cartão selecionado por nome
- fatura vinculada por contexto quando aplicável
- campos aparecem ou se reorganizam conforme tipo e contexto da transação

#### Selects E Inputs

Problemas atuais:
- `SelectTrigger` e `Input` usam `bg-transparent`
- tokens como `popover`, `accent` e `ring` não estão plenamente definidos na base visual atual

Direção correta:
- campos com fundo sólido e previsível
- estados de foco com leitura nítida
- dropdowns com superfície própria e contraste consistente
- claro e escuro com equivalência de legibilidade

## Componentes Críticos Do Redesign

Esta fase deve tratar o sistema de componentes como infraestrutura do produto.

Prioridade alta:
- `button`
- `input`
- `select`
- `form`
- `card`
- `table`
- `badge`
- `dialog`
- `sheet`
- elementos da `sidebar`

Superfícies críticas:
- dashboard principal
- formulário de nova transação
- listagem de transações
- transferências
- cartões
- metas
- recorrência
- importações

## Estratégia De Testes De UI E Visual

### Objetivo

Proteger o redesign não só em conteúdo, mas em experiência real.

### Camadas De Teste

#### Testes De Sistema Visual

Cobertura desejada:
- classes e variantes críticas de componentes-base
- tema claro e escuro
- estados `default`, `focus`, `error`, `disabled`, `open` e `selected`

#### Testes Comportamentais De Formulário

Obrigatório usar interação real com `userEvent`.

Cobertura desejada:
- abrir select
- selecionar opção
- verificar mudança visual e de valor
- validar exibição ou ocultação de campos contextuais
- verificar payload final submetido

#### Testes De Hardening Operacional

Cobertura desejada:
- garantir que fluxos primários não exponham IDs
- garantir que entidades apareçam por nome humano
- garantir que listas e filtros funcionem por seleção real
- proteger contra regressões como campo sem contraste, trigger ilegível ou placeholder invisível

#### Testes De Regressão Visual Pragmática

Abordagem inicial:
- não depender primeiro de screenshot diff pesado para tudo
- começar protegendo estrutura, classes-chave e estados críticos dos componentes-base
- depois ampliar para snapshots visuais ou estratégias equivalentes nas superfícies mais sensíveis

### Prioridade Inicial De Cobertura

1. `TransactionForm`
2. `Select` e `Input`
3. `DashboardReportView`
4. `Sidebar`
5. `TransactionsList` e filtros
6. superfícies principais de `Cards`, `Goals`, `Recurrence` e `Transfers`

## Escopo Da Refatoração

### Dentro Do Escopo

- redefinição de tokens globais
- consolidação de claro e escuro com identidade equivalente
- repaginação da sidebar, dashboard, listas e formulários principais
- substituição de campos por ID por seleção humana nos fluxos críticos
- endurecimento visual dos componentes-base
- reforço dos testes de UI, comportamento e regressão estrutural

### Fora Do Escopo Desta Fase

- reescrever todo o produto em busca de perfeição estética absoluta
- adicionar animação decorativa sem função
- reestruturar módulos funcionais sem relação com experiência visual e UX operacional
- substituir o domínio existente por novos conceitos de negócio

## Riscos E Cuidados

- exagerar a camada editorial e prejudicar tabelas e formulários densos
- criar um claro muito quente e um escuro pouco legível
- misturar linguagem premium com componentes tecnicamente frágeis
- melhorar aparência do dashboard sem endurecer os fluxos operacionais
- deixar o redesign sem proteção de testes, permitindo regressão rápida

## Critérios De Sucesso

O redesign será considerado bem-sucedido quando:
- o produto tiver identidade visual própria e coerente
- tema claro e tema escuro parecerem igualmente intencionais
- dashboard, sidebar e páginas operacionais partilharem a mesma linguagem
- formulários primários deixarem de expor IDs e passarem a operar por seleção humana
- campos críticos tiverem contraste, foco e estados confiáveis
- a suíte de testes proteger tanto interação real quanto regressões visuais estruturais

## Arquivos E Áreas Que Devem Guiar A Execução

Arquivos-base relevantes já identificados:
- `app/globals.css`
- `app/components/ui/input.tsx`
- `app/components/ui/select.tsx`
- `app/components/layout/SideBar.tsx`
- `app/components/dashboard/DashboardReportView.tsx`
- `app/components/transactions/TransactionForm.tsx`
- `app/components/transactions/TransactionsList.tsx`
- `tests/unit/transactions/transaction-form.test.tsx`
- testes de dashboard, sidebar e componentes operacionais relacionados

## Decisão Final

A direção aprovada para execução é:
- `editorial calibrada`

Interpretação final:
- identidade e presença vindas da linha editorial premium
- ergonomia e estrutura vindas de uma disciplina operacional forte
- produto autoral, sério e usável
