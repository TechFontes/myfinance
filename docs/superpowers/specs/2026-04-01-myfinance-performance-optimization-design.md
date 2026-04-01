# MyFinance Performance Optimization Design

Data: 2026-04-01
Status: Rascunho para revisão
Produto: MyFinance
Escopo: próxima fase de performance em três etapas

## Finalidade Deste Documento

Este documento define a próxima fase de performance do `MyFinance`.

A fase é dividida em três etapas:
- otimização de carregamento e navegação
- hardening de performance e comportamento sob carga
- reanálise final com comparação contra a linha de base

O objetivo não é “fazer o app parecer rápido” apenas pela sensação de interface. O objetivo é reduzir custo real de carregamento, tornar a navegação previsível e proteger o produto contra regressões enquanto a base continua evoluindo.

## Objetivo Principal

Diminuir o tempo percebido e o custo real das rotas e telas mais usadas do produto, com foco especial em:
- shell de navegação
- dashboard
- páginas de lista e formulários com maior densidade de dados
- transições entre áreas principais do app

O resultado esperado é:
- entrada mais rápida nas telas principais
- navegação mais contínua entre rotas
- menos bloqueio por renderização inicial
- menos trabalho client-side desnecessário
- mais confiança para medir e manter performance ao longo do tempo

## Escopo

### Dentro Do Escopo

Esta fase cobre:
- otimização do carregamento inicial do shell e das rotas principais
- redução de peso de componentes client-side onde isso não for necessário
- divisão mais clara entre dados críticos de primeira pintura e dados secundários
- uso explícito de loading states, streaming, fallback e pré-carregamento quando aplicável
- endurecimento de navegação e estados de transição
- proteção por testes para os fluxos mais sensíveis a regressão de performance
- re-medição final com comparação contra a linha de base desta fase

### Fora Do Escopo

Esta fase não cobre:
- redesign visual amplo
- mudança de regra de negócio
- reformulação de schema ou migração de dados por motivo de performance, salvo se for estritamente necessário para uma etapa desta fase
- reescrita completa de rotas, módulos ou do stack
- otimizações cosméticas sem impacto mensurável

## Diagnóstico Atual

Diagnóstico preliminar, inferido da estrutura atual do projeto:

- o app já tem boa modularização funcional, mas ainda há superfícies de navegação e páginas densas que podem concentrar trabalho demais na primeira renderização
- `Shell`, `Header` e `SideBar` são centrais e precisam continuar leves porque influenciam quase todas as páginas autenticadas
- o dashboard e as listas operacionais tendem a reunir muitos blocos em uma única visão, o que aumenta custo de renderização e de hidratação se tudo for carregado cedo demais
- há dependência relevante de componentes client-side em áreas de navegação e interação, o que exige disciplina para não transformar rotas inteiras em árvores client-side
- a base de testes está mais orientada a contrato e comportamento do que a medições de performance, então esta fase precisa criar proteção adicional
- não há, nesta fase, uma linha de base formal de medição documentada para comparar antes e depois em nível de fluxo

O ponto central do diagnóstico é este: o produto já funciona, mas ainda não tem uma disciplina explícita de performance por fase. Esta etapa existe para criar essa disciplina.

## Princípios

### 1. Medir Antes De Otimizar

Nenhuma decisão de performance deve depender apenas de impressão subjetiva. Sempre que possível, a fase deve registrar uma linha de base, aplicar a mudança e medir novamente.

### 2. Primeiro Render Deve Ser Pequeno

O que é crítico para o usuário ver e decidir precisa chegar primeiro. O que é secundário deve ser adiado, dividido ou carregado sob demanda.

### 3. Client Side Só Onde Agrega

Componentes client-side devem existir por necessidade real de interação. Navegação, shell e páginas que podem ser server-first não devem carregar peso de cliente sem justificativa clara.

### 4. Navegação Não Pode Parecer Um Reset

Trocas entre rotas principais precisam preservar continuidade. O usuário deve sentir transição e não recomeço.

### 5. Proteção Vale Tanto Quanto Otimização

Uma melhoria sem proteção vira regressão na próxima alteração. Cada frente precisa de teste ou verificação de comportamento que sustente o ganho.

### 6. Otimizar O Que O Usuário Sente Primeiro

O foco inicial deve estar nas páginas e interações com maior frequência e maior custo percebido. Micro-otimizações fora desse caminho não são prioridade.

## Frentes Técnicas

### Etapa 1: Otimização De Carregamento E Navegação

Essa etapa concentra o ganho mais visível.

Direções técnicas esperadas:
- reduzir o peso do shell sem quebrar sua responsabilidade central
- revisar quais partes do layout realmente precisam ser client-side
- adiar seções secundárias até depois do conteúdo principal
- usar streaming, fallback e loading states coerentes nas rotas mais pesadas
- manter a navegação entre páginas principais com prefetch e transição previsível
- evitar duplicação de fetches entre shell, página e componentes filhos
- separar dados de resumo dos dados detalhados quando isso cortar custo de primeira pintura

Prioridade funcional:
- dashboard
- shell autenticado
- páginas de listas e formulários com maior volume de dados

### Etapa 2: Hardening

Depois de reduzir custo, a fase deve endurecer o comportamento para impedir regressões.

Direções técnicas esperadas:
- proteger os principais estados de loading e transição
- garantir que rotas críticas continuem utilizáveis durante carregamento parcial
- cobrir com testes a presença dos estados de fallback mais importantes
- verificar que a navegação principal não quebra quando dados ainda não chegaram
- consolidar contratos de comportamento para os pontos mais sensíveis a regressão
- documentar o que passou a ser considerado budget ou requisito mínimo de performance nesta fase

Essa etapa existe para responder a uma pergunta prática: o app continua estável quando não está no melhor cenário?

### Etapa 3: Reanálise Final

A última etapa não é uma nova rodada de otimização solta. Ela existe para fechar a fase com uma leitura comparativa.

Direções técnicas esperadas:
- repetir a mesma medição usada como baseline
- comparar fluxo inicial, navegação e estados mais pesados
- identificar o que realmente melhorou e o que ainda ficou caro
- decidir se o próximo passo é correção pontual ou uma nova fase
- registrar claramente ganhos, limites e pendências

## Critérios De Aceitação

Esta fase só deve ser considerada concluída quando:
- existe uma linha de base documentada para os fluxos priorizados
- as rotas principais carregam com menos trabalho inicial que o estado anterior, sem regressão funcional
- a navegação entre áreas principais permanece consistente e sem sensação de bloqueio desnecessário
- os estados de loading e fallback dos caminhos críticos estão cobertos por testes ou verificações equivalentes
- não há regressão nos testes relevantes de dashboard, shell e listas afetadas
- a reanálise final compara antes e depois com o mesmo recorte de fluxo
- as decisões tomadas podem ser explicadas por medição, não só por percepção

## Estratégia De Medição

A estratégia de medição desta fase deve combinar três camadas:

### 1. Linha De Base Inicial

Antes de mudanças relevantes, registrar os fluxos que serão comparados. O recorte mínimo deve incluir:
- carregamento do shell autenticado
- acesso ao dashboard
- transição entre pelo menos uma rota de visão geral e uma rota operacional densa

### 2. Medição Durante A Fase

Ao longo da execução, cada frente deve preservar uma forma simples de verificação:
- teste focado do comportamento alterado
- observação do estado de carregamento ou navegação
- checagem de que o ganho não veio acompanhado de quebra estrutural

### 3. Reanálise Final

Ao fim da fase, repetir os mesmos fluxos e comparar:
- tempo de preparação percebido
- quantidade de trabalho inicial necessário para renderizar a superfície principal
- qualidade da transição de rota
- estabilidade dos estados de fallback

Se houver ferramentas locais de inspeção de performance, elas podem ser usadas para complementar. O documento não assume ferramenta específica como obrigação, mas exige comparação antes/depois no mesmo cenário.

## Riscos

- ganho local pode mascarar regressão global se a medição ficar restrita demais
- reduzir trabalho client-side em excesso pode quebrar interatividade ou aumentar complexidade de manutenção
- uso apressado de lazy loading pode piorar a percepção se o fallback não estiver bem desenhado
- otimização de navegação pode introduzir inconsistência entre rotas se o shell passar a assumir responsabilidades demais
- hardening insuficiente pode deixar regressões silenciosas aparecerem depois da fase
- sem baseline consistente, a reanálise final vira opinião em vez de diagnóstico

## Fora De Escopo Detalhado

Para evitar dispersão, esta fase não deve tentar:
- inventar novos padrões visuais
- remodelar conteúdo de dashboard por motivo estético
- reestruturar todo o app em torno de uma nova arquitetura antes de confirmar o gargalo
- otimizar todas as páginas do produto de uma vez
- trocar stack, runtime ou fornecedor de infraestrutura
- introduzir um sistema de telemetria completo se uma medição local e objetiva for suficiente para a fase

## Resultado Esperado

Ao final desta fase, o `MyFinance` deve estar melhor em três coisas:
- carregar o necessário mais cedo
- navegar sem parecer pesado
- comprovar com medida que a performance melhorou

Em resumo:
- primeira etapa: cortar custo de entrada e navegação
- segunda etapa: blindar os estados críticos
- terceira etapa: provar o ganho e apontar o próximo gargalo
