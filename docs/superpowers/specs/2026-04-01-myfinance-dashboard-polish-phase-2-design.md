# MyFinance Dashboard Polish Phase 2 Design

Data: 2026-04-01
Status: Aprovado em brainstorming
Produto: MyFinance
Escopo: Acabamento fino focado em dashboard e navegação

## Finalidade Deste Documento

Este documento define a segunda fase de refinamento visual do `MyFinance`, com foco exclusivo em `dashboard` e `navegação`.

Ele existe para evitar dispersão. A fase anterior já entregou:
- fundação visual
- shell redesenhado
- primitivas mais sólidas
- fluxo de nova transação endurecido

Agora o objetivo não é reabrir o sistema inteiro, e sim elevar a percepção do miolo do produto, principalmente no dashboard.

## Objetivo Principal

Transformar o corpo do dashboard em uma superfície com sensação de `painel de patrimônio editorial`, preservando legibilidade operacional e leitura rápida.

O resultado desejado é:
- mais presença visual no corpo do dashboard
- cards menos genéricos e mais patrimoniais
- hierarquia de informação mais forte
- leitura cromática mais decidida
- navegação coerente com esse novo peso visual

## Recorte Aprovado

Esta fase cobre:
- `app/components/dashboard/DashboardReportView.tsx`
- `app/components/layout/SideBar.tsx`
- `app/components/layout/Header.tsx`
- testes de dashboard e navegação diretamente ligados a esse polish

Esta fase não cobre como foco principal:
- tabelas de transações
- filtros operacionais
- metas, recorrência, imports, cards ou outras áreas como superfície principal
- uma nova leva ampla de tokens globais

## Direção Visual Aprovada

### Direção-mãe

A direção aprovada para esta fase é:
- `patrimônio editorial`

Interpretação prática:
- menos aparência de “cards neutros de app”
- mais aparência de relatório financeiro premium
- mais presença visual nas seções internas
- mais moldura, peso e valor percebido

### Temperatura Visual

O corpo do dashboard deve ficar:
- mais luxuoso
- mais denso
- mais autoral
- mais cromático

Mas sem:
- virar vitrine decorativa
- enfraquecer a leitura analítica
- parecer dashboard genérico cheio de indicadores coloridos sem disciplina

## Hierarquia De Informação

O dashboard deve assumir a seguinte hierarquia:

### Nível 1
- saldos e visão patrimonial

Esses blocos devem parecer a principal leitura da tela.

### Nível 2
- pendências e contas

Esses blocos devem parecer os painéis de maior atenção operacional após o saldo.

### Nível 3
- categorias, cartões e transferências

Esses blocos devem permanecer importantes, mas com menor peso que os dois níveis acima.

### Nível 4
- textos de suporte, detalhes secundários e estados vazios

Esses elementos não devem competir com números, saldos e alertas.

## Regras Visuais Do Dashboard

### Cards Principais

Os cards do dashboard devem:
- ter mais espessura visual
- ter bordas e superfícies mais nobres
- reforçar sensação de patrimônio e relatório
- comunicar prioridade pela estrutura, não apenas pelo texto

### Blocos Internos

Os itens dentro dos cards devem:
- ter ritmo vertical mais disciplinado
- parecer painéis internos de leitura
- usar separação e contraste com mais intenção
- evitar aparência de lista solta jogada dentro de um card genérico

### Tipografia

O dashboard deve intensificar:
- títulos internos mais nobres
- valores principais com mais peso
- labels auxiliares mais controladas

Sem exagerar:
- o corpo da tela não deve virar peça editorial ornamental
- texto operacional continua funcional e denso

### Cor

O uso cromático deve ser mais decidido nesta fase.

Diretrizes:
- verde com mais presença em leitura de saldo e positivo
- vermelho ou tons quentes mais claros em despesa, urgência e pendência
- neutros fortes sustentando a maior parte da interface
- cor usada para acelerar leitura, não para decorar

## Navegação

Sidebar e header devem acompanhar o novo peso visual do dashboard.

Objetivo:
- parecer que fazem parte do mesmo produto
- sustentar a leitura premium do corpo da tela
- sem roubar protagonismo do dashboard

Mudanças esperadas:
- pequenos refinamentos de acabamento
- alinhamento mais forte de hierarquia visual
- continuidade entre shell e painéis internos

## Estados Vazios

Os estados vazios do dashboard devem ficar:
- mais dignos
- mais coerentes com o tom premium
- menos próximos de placeholders secos

Eles devem parecer parte do produto, não ausência de conteúdo.

## Testes

Esta fase deve ampliar a proteção em:
- hierarquia visual do dashboard
- presença dos blocos patrimoniais
- leitura das seções internas
- estados vazios do dashboard
- coerência de navegação relacionada ao dashboard

Os testes não precisam provar estética subjetiva, mas devem proteger:
- estrutura
- presença de blocos-chave
- semântica visual relevante
- estados vazios e conteúdo principal

## Estratégia De Execução

A implementação desta fase deve ser pequena e concentrada.

Ordem preferida:
1. refinar `DashboardReportView`
2. ajustar `Header` e `SideBar` para acompanhar
3. atualizar testes focados do dashboard e navegação

## Resultado Esperado

Ao final desta fase, o usuário deve perceber:
- um dashboard com mais assinatura autoral
- maior sensação de patrimônio e controle financeiro sério
- leitura mais rápida do que importa
- navegação mais coerente com esse peso visual

Em resumo:
- menos “dashboard funcional bem resolvido”
- mais “centro de controle financeiro premium”
