# MyFinance Performance Reanalysis

## Ganhos já aplicados
- shell autenticado recebe usuário do servidor e evita bootstrap fetch redundante
- `AuthProvider` aceita `initialUser` e não consulta `/api/auth/me` quando a sessão já foi resolvida
- `getDashboardReport()` passou a buscar `select` mínimo em vez de `include` amplo
- `getAvailableMonths()` removeu ordenação desnecessária nas queries de datas
- o segmento `/dashboard` agora possui `loading.tsx` com fallback utilizável

## Evidência consolidada
- testes focados de auth/layout/dashboard verdes
- build de produção verde após as otimizações
- starter file standalone continua válido após a fase de performance

## Próximos pontos de atenção
- revisar `getAvailableMonths()` para evitar scans históricos completos
- medir navegação percebida entre dashboard, transações e cartões com o fallback novo
- endurecer budgets e smoke flows se a próxima rodada exigir mais corte de custo

## Execução automática
- updated_at: 2026-04-01T22:16:31.407Z
