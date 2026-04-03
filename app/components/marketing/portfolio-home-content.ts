export const portfolioCtas = {
  primary: [
    { label: 'GitHub', href: 'https://github.com/techfontes' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-fontes-tech/' },
    { label: 'Demo', href: '#screenshots' },
  ],
  login: {
    label: 'Login',
    href: '/login',
  },
} as const

export const portfolioDomainModules = {
  auth: {
    title: 'Auth & Segurança',
    capabilities: 'JWT httpOnly · bcrypt · token versioning · middleware JWT · RBAC admin/user · sameSite cookie · bloqueio de conta',
  },
  modules: [
    { name: 'Transações', summary: 'Liquidar · cancelar · competência', tier: 'primary' },
    { name: 'Cartões', summary: 'Faturas · pagamento e2e · parcelas', tier: 'primary' },
    { name: 'Metas', summary: 'Aportes · resgates · reserva', tier: 'primary' },
    { name: 'Dashboard', summary: 'Visão patrimonial · accent cards', tier: 'primary' },
    { name: 'Contas', summary: 'Banco · carteira · saldo derivado', tier: 'secondary' },
    { name: 'Transferências', summary: 'Liquidar · cancelar · entre contas', tier: 'secondary' },
    { name: 'Recorrência', summary: 'Regras · projeção futura', tier: 'secondary' },
    { name: 'Importação', summary: 'CSV · preview · validação', tier: 'secondary' },
  ],
} as const

export const portfolioProcessSteps = [
  {
    title: 'PRD antes de qualquer código',
    tag: 'Requisitos',
    tagColor: 'green' as const,
    description: 'Cada feature nasce como documento de produto com escopo fechado, não como ideia solta.',
    badges: ['Escopo definido', 'Requisitos funcionais', 'Requisitos não-funcionais', 'Critérios de aceitação'],
    accent: 'green' as const,
  },
  {
    title: 'Design spec → Plano de implementação',
    tag: 'Arquitetura',
    tagColor: 'neutral' as const,
    description: 'PRD vira spec técnica com decisões de arquitetura. Spec vira plano com tasks numeradas, arquivos mapeados e checkpoints de commit.',
    accent: 'green' as const,
  },
  {
    title: 'Teste primeiro, código depois',
    tag: 'Lei do projeto',
    tagColor: 'red' as const,
    description: 'Nenhuma linha de produção existe antes de um teste que falha. O teste prova o bug ou a feature ausente antes do fix.',
    flow: ['RED — teste falha', 'GREEN — código passa', 'REFACTOR — limpa'],
    accent: 'red' as const,
  },
  {
    title: 'Execução paralela em worktrees isolados',
    tag: 'Coordenação',
    tagColor: 'purple' as const,
    description: 'Tasks independentes rodam em paralelo com git worktrees. Integração apenas após verificação cruzada de cada agente.',
    accent: 'green' as const,
  },
  {
    title: 'Schema discipline como gate obrigatório',
    tag: 'Governança',
    tagColor: 'pink' as const,
    description: 'Toda mudança no Prisma schema exige migration. Testes automatizados verificam que a migration existe. Deploy sem migration é bloqueante.',
    accent: 'green' as const,
  },
  {
    title: 'Build containerizado e deploy em Kubernetes',
    tag: 'Deploy',
    tagColor: 'blue' as const,
    description: 'Imagem Docker multi-stage (deps → build → runner). Deploy via K3s com rolling update, health probes, auto-heal e rollback nativo.',
    deploySteps: ['docker build', 'ctr import', 'kubectl apply', 'rollout restart'],
    accent: 'green' as const,
  },
] as const

export const portfolioMetrics = [
  { value: '540+', label: 'testes automatizados' },
  { value: '13', label: 'módulos de domínio' },
  { value: '18', label: 'API routes RESTful' },
  { value: 'TDD', label: 'test-first workflow' },
  { value: 'K3s', label: 'Kubernetes deploy' },
] as const

export const portfolioScreenshotCards = [
  {
    src: '/portfolio/dashboard-overview.png',
    alt: 'Dashboard MyFinance',
    title: 'Dashboard patrimonial',
    caption: 'Posição financeira com cards de saldo, pendências e visão mensal',
    width: 1280,
    height: 1372,
  },
  {
    src: '/portfolio/transactions-flow.png',
    alt: 'Fluxo de transações MyFinance',
    title: 'Operação de transações',
    caption: 'Listagem densa orientada a operação diária',
    width: 1280,
    height: 544,
  },
  {
    src: '/portfolio/imports-review.png',
    alt: 'Revisão de importação CSV MyFinance',
    title: 'Importação CSV guiada',
    caption: 'Preview e validação antes da confirmação',
    width: 1280,
    height: 1273,
  },
] as const

export const portfolioContact = {
  name: 'Daniel Fontes',
  role: 'Engenheiro de software · Brasília',
  email: 'daniel@techfontes.com',
  whatsapp: {
    display: '(21) 98979-9816',
    href: 'https://wa.me/5521989799816',
  },
  links: [
    { label: 'GitHub', href: 'https://github.com/techfontes' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-fontes-tech/' },
  ],
} as const
