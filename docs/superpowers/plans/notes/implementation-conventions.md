# Implementation Conventions

- TDD is mandatory.
- Write the failing test before production code.
- Keep Prisma access inside modules or shared data layer.
- pages do not talk to Prisma directly.
- Financial calculations live in domain services.
- Preserve PRD terminology in code and UI.
- app/modules is the default home for domain responsibilities.
