# MyFinance Portfolio Home Design

Data: 2026-04-01
Status: Aprovado em brainstorming
Produto: MyFinance
Escopo: Nova home pública tratada como case técnico de engenharia e produto

## Finalidade Deste Documento

Este documento define a nova home pública do `MyFinance` como uma peça de portfólio.

O objetivo não é criar uma landing genérica de marketing. A página precisa apresentar o projeto como um case técnico de alto nível, capaz de impressionar:
- recrutadores e gestores técnicos
- tech leads e engenheiros seniores
- clientes potenciais

A primeira impressão buscada é:
- `uau, isso está bem feito`

Por isso, a home deve equilibrar:
- impacto visual
- clareza de produto
- credibilidade técnica
- prova de execução

## Objetivo Principal

Transformar a rota `/` em uma home pública que comunique o `MyFinance` como um projeto real, autoral e tecnicamente sólido.

A página deve deixar claro que o projeto:
- resolve problemas reais de gestão financeira pessoal
- foi pensado como produto, e não apenas como CRUD
- possui arquitetura, hardening e preocupação operacional
- é uma peça de portfólio com autoria explícita

## Contexto Atual

Hoje a home pública em [page.tsx](/workspace/pessoal/myfinance/app/page.tsx) é apenas um placeholder.

Isso cria um problema direto de percepção:
- o restante do produto já possui identidade visual, fluxo autenticado, dashboard, imports, hardening visual, deploy standalone e camada de testes
- mas a entrada pública do projeto não comunica nada disso

Resultado:
- o projeto parece menor do que realmente é
- o valor técnico não aparece logo na primeira visita
- não existe uma narrativa pública que conecte produto, arquitetura e autoria

## Direção Estratégica

### Tipo de página

A home deve ser tratada como:
- `case técnico premium`

Isso significa:
- mais credibilidade técnica do que discurso comercial
- mais prova visual e estrutural do que promessas abstratas
- mais narrativa de engenharia e produto do que texto de conversão genérico

### Eixo principal

O eixo prioritário aprovado é:
- `arquitetura e qualidade técnica`

A dor do usuário continua presente, mas como evidência de maturidade do produto, não como linguagem principal de venda.

### Tom

O tom aprovado é:
- `técnico confiante`

Consequências:
- linguagem clara e segura
- sem hype exagerado
- sem jargão ornamental desnecessário
- sem parecer release corporativo frio demais

## Público

### Recrutador / Gestor Técnico

Precisa entender rapidamente:
- o que o projeto é
- qual problema ele resolve
- que há qualidade visual e maturidade técnica
- quem é o autor

### Tech Lead / Senior Engineer

Precisa reconhecer:
- decisões de arquitetura
- consistência visual e de produto
- evidência de TDD, hardening, deploy e boundary server/client
- profundidade além da superfície visual

### Cliente Potencial

Precisa perceber:
- o produto é sério
- o projeto resolve dores reais
- a execução é profissional
- existe um autor confiável por trás

## Resultado Desejado

Ao abrir a home, a pessoa deve perceber:
- isso não é um protótipo improvisado
- existe cuidado real de produto e engenharia
- o autor domina execução, interface e operação
- vale a pena explorar o código, a demo ou entrar em contato

## Estrutura Da Página

### 1. Header

O topo deve conter:
- marca `MyFinance`
- assinatura de autoria discreta, mas explícita
- CTAs externos principais
- botão menor de `Login` apontando para `/login`

CTAs aprovados:
- GitHub
- LinkedIn
- Demo ao vivo
- WhatsApp

Regras:
- o botão `Login` deve existir, mas não disputar protagonismo com os CTAs do case
- o header deve permanecer elegante, funcional e estável em desktop e mobile

### 2. Hero

O hero deve ser a peça principal de impacto.

Elementos obrigatórios:
- nome do projeto
- headline forte
- subheadline curta e clara
- autoria explícita: Daniel Fontes
- CTAs principais
- composição visual com screenshots reais do sistema

Mensagem principal esperada:
- `MyFinance é um sistema de finanças pessoais construído como produto real, com foco em clareza patrimonial, arquitetura modular e execução técnica rigorosa.`

O hero deve comunicar:
- produto sério
- acabamento alto
- engenharia forte

### 3. Credenciais Técnicas

Bloco curto de leitura rápida, com sinais de maturidade do projeto.

Exemplos de credenciais válidas:
- Next.js 16
- React 19
- Prisma + MySQL
- TDD
- Auth hardening
- Standalone deploy / PM2
- Dashboard patrimonial
- Importação CSV
- Arquitetura modular

Esse bloco deve parecer:
- prova
- contexto técnico
- densidade bem organizada

Não deve parecer:
- lista aleatória de buzzwords

### 4. Problema Que O Projeto Resolve

Este bloco deve deixar claro que o projeto não resolve apenas “anotar gastos”.

A dor central é:
- falta de clareza entre previsto e realizado
- dificuldade de leitura patrimonial real
- desorganização entre caixa, cartão, recorrência, metas e movimentações internas

A redação deve mostrar:
- fragmentação comum dos controles financeiros pessoais
- o custo de manter fluxos desconectados
- o valor de uma base coesa para operação diária

### 5. Arquitetura E Qualidade

Este é um dos blocos mais importantes.

Precisa destacar:
- separação clara entre produto e implementação
- módulos de domínio
- boundaries server/client
- autenticação robusta
- testes automatizados
- deploy operacional
- refino visual e hardening progressivo

A leitura deve sustentar a ideia de:
- produto bem projetado
- engenharia bem executada

### 6. Screenshots E Provas Visuais

A home deve mostrar screenshots reais do sistema.

Prioridade de telas:
- dashboard
- transações
- imports CSV
- uma ou duas superfícies adicionais, se a composição pedir

Objetivo dos screenshots:
- provar que o sistema existe e está consistente
- reforçar a qualidade da execução
- criar desejo de explorar a demo

Regras:
- não usar mockups genéricos de browser fake exagerados
- não expor dados sensíveis
- não expor credenciais, usuários ou senhas de exemplo
- preferir composição premium com recorte, profundidade e ritmo visual

### 7. Fechamento

O rodapé ou bloco final deve reforçar:
- autoria
- links principais
- convite para explorar demo, código ou contato

Assinatura esperada:
- projeto concebido e desenvolvido por Daniel Fontes

## Direção Visual

### Relação com o restante do produto

A home deve conversar com a identidade atual do `MyFinance`, mas não copiar literalmente a linguagem do dashboard.

Ela deve parecer:
- uma apresentação premium do produto

E não:
- uma tela interna simplesmente aberta ao público

### Base visual

Direção aprovada:
- `Inter + Sora`
- grafite
- marfim
- verde financeiro

O claro continua dominante na home pública.

### Sensação visual

A página deve transmitir:
- precisão
- sofisticação
- organização
- autoria

Sem cair em:
- estética de fintech genérica
- landing de SaaS exagerada
- hero inflado com marketing vazio

### Hero visual

O hero deve usar:
- screenshots em composição forte
- camadas e profundidade
- espaço para headline e CTAs sem competir com as imagens

A composição pode usar:
- sobreposição controlada
- painel lateral
- mosaico técnico refinado

Mas sempre preservando:
- legibilidade
- foco
- credibilidade

### Blocos internos

Os blocos da home devem alternar:
- seções narrativas
- seções de evidência técnica
- seções visuais

O ritmo visual precisa evitar:
- repetição de cards sem hierarquia
- paredes de texto
- blocos iguais empilhados

## Conteúdo

### Headline

A headline deve ser curta, forte e técnica.

Ela deve dizer:
- o que o projeto é
- que foi construído com critério

### Subheadline

Deve explicar em poucas linhas:
- qual tipo de clareza financeira o produto entrega
- que o projeto foi pensado como sistema coeso

### Autoria

A autoria deve ser explícita, mas elegante.

Informações obrigatórias:
- Daniel Fontes
- GitHub: `techfontes`
- LinkedIn: `daniel-fontes-tech`

### CTAs

Os CTAs aprovados devem ter papéis diferentes:

- `GitHub`
  - explorar código e arquitetura
- `LinkedIn`
  - contato profissional e contexto de carreira
- `Demo ao vivo`
  - experimentar o produto
- `WhatsApp`
  - contato direto
- `Login`
  - acesso ao sistema, com peso visual menor

### WhatsApp

Número aprovado:
- `21989799816`

Deve ser usado como CTA funcional, não como texto solto perdido na página.

## Responsividade

### Desktop

É o contexto prioritário.

A home deve explorar:
- composições amplas
- screenshots com mais presença
- grid mais sofisticado
- hierarquia visual mais forte

### Mobile

Precisa continuar excelente.

Regras:
- screenshots reorganizados, não esmagados
- headline e CTAs bem legíveis
- sem excesso de informação no primeiro viewport
- botão `Login` continua disponível e claro

## Acessibilidade

A home deve manter:
- contraste consistente
- ordem semântica clara de heading
- CTAs com labels compreensíveis
- foco visível
- navegação funcional por teclado

## Testes

A implementação da home deve nascer protegida.

Cobertura mínima esperada:
- presença da headline principal
- presença dos CTAs aprovados
- presença do botão `Login` com destino `/login`
- presença da autoria
- presença das seções principais do case
- renderização dos screenshots ou placeholders técnicos usados na home

Não é necessário tentar testar estética subjetiva, mas é obrigatório proteger:
- estrutura
- conteúdo crítico
- links principais
- navegação primária

## Critérios De Aceitação

A home só deve ser considerada concluída quando:
- substituir completamente o placeholder atual
- comunicar o projeto como case técnico de engenharia e produto
- exibir autoria explícita com os links definidos
- conter CTAs para GitHub, LinkedIn, demo e WhatsApp
- conter botão de `Login` no topo apontando para `/login`
- usar screenshots reais sem expor credenciais
- manter coerência com a identidade atual do produto
- funcionar bem em desktop e mobile
- possuir testes cobrindo conteúdo e navegação principais

## Fora Do Escopo

Esta fase não cobre:
- reescrita das páginas internas do sistema
- alteração de regras de negócio
- novo redesign global do dashboard
- produção de área pública com múltiplas páginas
- blog, artigos técnicos ou seção de documentação pública completa
- coleta de analytics ou integrações externas de marketing

## Resultado Esperado

Ao final desta fase, a rota `/` deve funcionar como:
- vitrine principal do projeto
- prova visual e técnica de qualidade
- peça de portfólio séria
- porta de entrada para demo, código e contato

Em resumo:
- menos placeholder
- menos landing genérica
- mais case técnico premium de produto e engenharia
