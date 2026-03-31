# Schema Alignment Notes

Alinhamentos iniciais feitos na fundacao para aproximar o schema do PRD:

- adicionado enum `UserRole` com `USER` e `ADMIN`
- adicionado `role`, `blockedAt` e `blockedReason` em `User`
- `TransactionStatus` passou a incluir `PLANNED`
- `Transaction.date` foi substituido por:
  - `competenceDate`
  - `dueDate`
  - `paidAt`
- `Transaction.status` passa a iniciar em `PLANNED`

Estas mudancas alinham vocabulario e campos-base ao PRD, mas nao concluem toda a remodelagem do dominio financeiro.
