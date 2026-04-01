# Implementation Conventions

- TDD is mandatory.
- Write the failing test before production code.
- For any code change, run the relevant automated tests before and after the change.
- If the relevant test does not exist yet, add it first and verify it fails before editing production code.
- Do not consider browser validation a substitute for automated test evidence.
- Keep Prisma access inside modules or shared data layer.
- pages do not talk to Prisma directly.
- Financial calculations live in domain services.
- Preserve PRD terminology in code and UI.
- app/modules is the default home for domain responsibilities.
