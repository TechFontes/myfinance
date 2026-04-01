# MyFinance Performance Baseline

## Fluxos priorizados
- shell autenticado
- dashboard mensal
- dashboard -> transações
- dashboard -> cartões

## Linha de base observada
- `AuthProvider` executava `fetch('/api/auth/me')` no bootstrap do cliente mesmo em rotas autenticadas
- `DashboardPage` dependia de agregação mensal ampla em `dashboardService`
- `getDashboardReport()` usava `include` amplo para transações, transferências e faturas
- `getAvailableMonths()` fazia scans com ordenação histórica para montar o seletor de meses
- o segmento `/dashboard` não tinha `loading.tsx`

## Evidência coletada na fase
- testes focados de auth/layout/dashboard antes das otimizações
- build de produção verde antes das mudanças
- análise estática dos hotspots em shell autenticado e dashboard

## Execução automática
- updated_at: 2026-04-01T22:16:31.150Z
