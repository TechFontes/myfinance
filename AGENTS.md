# MyFinance Agent Conventions

These conventions apply to any agent or contributor working in this repository.

## Mandatory Testing Workflow

- TDD is mandatory for any code change.
- Any implementation, bugfix, refactor, or behavior change must run relevant tests before and after the code change.
- If the relevant test does not exist yet, write it first and run it in a failing state before changing production code.
- Do not claim a fix is complete without test evidence from the updated code.
- Manual browser validation is supplementary. It never replaces automated tests.

## Minimum Required Sequence For Code Changes

1. Identify the smallest relevant automated test set for the affected behavior.
2. Run that test set before touching production code.
3. If coverage is missing, add or update a test first and verify it fails for the current bug or missing behavior.
4. Implement the smallest production change that satisfies the test.
5. Re-run the focused test set after the change.
6. Run the broader impacted verification layer before closing work.

## Broader Verification Expectations

- Run `yarn lint` when the change touches application code, shared UI, or framework boundaries.
- Run a broader `yarn test` scope when the change affects auth, financial calculations, database access, routing, or shared components.
- Never skip the pre-change and post-change test runs for speed.

## Implementation Conventions

- Keep Prisma access inside modules or the shared data layer.
- Pages do not talk to Prisma directly.
- Financial calculations live in domain services.
- Preserve PRD terminology in code and UI.
- `app/modules` is the default home for domain responsibilities.

## Non-Negotiable Verification Gates

These gates apply to all agent and contributor work in addition to the TDD workflow above:

### Schema Discipline
- Every Prisma schema change must have a corresponding migration.
- Schema drift without migration is a blocking condition.
- Run `npx prisma migrate status` before claiming schema work is done.

### Runtime-Realistic Route Tests
- Dynamic page tests must use `params: Promise.resolve({ ... })` to match Next.js app router semantics.
- Tests with synchronous params are insufficient for pages that receive async params at runtime.

### Financial Mutation Freshness
- Every financial mutation route handler must call `revalidatePath('/dashboard')` after successful writes.
- Cross-domain regression tests must verify post-mutation dashboard state.

### Publish Evidence
- No feature or fix is considered complete without passing: `yarn test`, `yarn lint`, `yarn build`.
- Migration verification required for schema-backed changes.
- Residual risks must be documented, not silently ignored.
