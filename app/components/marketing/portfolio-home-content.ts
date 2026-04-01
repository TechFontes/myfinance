export const portfolioCtas = {
  primary: [
    { label: 'GitHub', href: 'https://github.com/techfontes' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-fontes-tech/' },
    { label: 'Demo ao vivo', href: '#screenshots' },
    { label: 'WhatsApp', href: 'https://wa.me/5521989799816' },
  ],
  login: {
    label: 'Login',
    href: '/login',
  },
} as const

export const portfolioHighlights = [
  'Next.js 16',
  'React 19',
  'Prisma + MySQL',
  'TDD',
  'Auth hardening',
  'Standalone deploy',
  'Dashboard patrimonial',
  'Importação CSV',
] as const

export const portfolioSections = [
  { id: 'problem', title: 'Problema resolvido' },
  { id: 'architecture', title: 'Arquitetura e produto' },
  { id: 'quality', title: 'Qualidade de execução' },
  { id: 'screenshots', title: 'Provas visuais' },
] as const

export const portfolioEvidenceCards = [
  {
    eyebrow: 'Stack',
    title: 'Next.js 16, React 19 e Prisma com fronteira server/client clara.',
    body: 'O produto foi montado como aplicação real de App Router, com SSR onde faz sentido e cliente apenas no ponto certo.',
  },
  {
    eyebrow: 'Hardening',
    title: 'Autenticação, dashboard e tema revisados com TDD antes de virar interface.',
    body: 'Os fluxos principais foram endurecidos com regressões automatizadas, correção de hydration e bloqueio real de páginas protegidas.',
  },
  {
    eyebrow: 'Operação',
    title: 'Deploy standalone, PM2 e baseline do Prisma prontos para ambiente real.',
    body: 'A base suporta build standalone, seed idempotente, baseline de migrations e execução orientada a produção.',
  },
  {
    eyebrow: 'Produto',
    title: 'Visão patrimonial, cartão, recorrência, metas e importação em uma narrativa coesa.',
    body: 'O valor do projeto não está só nos CRUDs, mas em tratar finanças pessoais como operação contínua com clareza de caixa.',
  },
] as const

export const portfolioNarrative = {
  hero: {
    eyebrow: 'Daniel Fontes · Engenharia e produto',
    title:
      'MyFinance é um sistema de finanças pessoais construído como produto real, com foco em clareza patrimonial, arquitetura modular e execução técnica rigorosa.',
    body:
      'Um case técnico que organiza previsto e realizado, posição de caixa, cartões, recorrência, metas e importação CSV em uma base coesa, visualmente consistente e pronta para evoluir.',
  },
  problem: {
    title: 'Problema resolvido',
    body:
      'A maioria dos controles pessoais separa gastos, cartões, metas e recorrência em fluxos desconectados. O resultado é perda de clareza entre o que já aconteceu, o que ainda vence e o que de fato afeta o patrimônio.',
  },
  architecture: {
    title: 'Arquitetura e produto',
    body:
      'A aplicação foi organizada para sustentar crescimento sem virar acoplamento acidental: App Router, módulos por domínio, boundaries explícitas entre servidor e cliente e serviços focados em contrato.',
  },
  quality: {
    title: 'Qualidade de execução',
    body:
      'O trabalho foi conduzido com TDD, hardening progressivo de autenticação e UI, revisões de performance e deploy standalone pronto para PM2, reduzindo o espaço para regressão silenciosa.',
  },
} as const

export const portfolioMetrics = [
  { value: '235+', label: 'testes automatizados cobrindo auth, dashboard e fluxos principais' },
  { value: 'standalone', label: 'build preparado para PM2 com arquivo de startup explícito' },
  { value: 'real product', label: 'camadas de domínio, dashboard patrimonial e importação CSV' },
] as const

export const portfolioScreenshotCards = [
  {
    src: '/portfolio/dashboard-overview.png',
    alt: 'Dashboard MyFinance',
    title: 'Dashboard patrimonial',
    body: 'Leitura de posição financeira com cards fortes, pendências e visão mensal.',
    width: 1280,
    height: 1372,
  },
  {
    src: '/portfolio/transactions-flow.png',
    alt: 'Fluxo de transações MyFinance',
    title: 'Operação de transações',
    body: 'Listagem densa, organizada e orientada a operação diária em vez de IDs internos.',
    width: 1280,
    height: 544,
  },
  {
    src: '/portfolio/imports-review.png',
    alt: 'Revisão de importação CSV MyFinance',
    title: 'Importação CSV guiada',
    body: 'Revisão do preview antes da confirmação, protegendo a qualidade do dado importado.',
    width: 1280,
    height: 1273,
  },
] as const
