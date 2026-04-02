# Publish Gates Checklist

Before claiming any feature or fix as production-ready, verify each gate:

## Pre-Publish Verification

- [ ] `yarn test` — full suite passes (0 failures)
- [ ] `yarn lint` — no errors
- [ ] `yarn build` — standalone build succeeds
- [ ] `npx prisma migrate status` — migrations applied and consistent

## Schema Changes

- [ ] Migration exists for every schema change
- [ ] Migration is compatible with production database
- [ ] Schema drift test passes (`tests/unit/prisma/migration-discipline.test.ts`)

## Financial Mutations

- [ ] Dashboard revalidation tested after mutation
- [ ] Cross-domain side effects verified
- [ ] Balance derivation invariants confirmed

## Edit/Action Flows

- [ ] Route params tested with async Promise semantics
- [ ] Not-found and invalid-id paths covered
- [ ] Ownership validation tested

## Evidence Standard

- [ ] Test output included in commit or report
- [ ] Residual risks documented
- [ ] No silent `// TODO` or `// FIXME` in changed code
