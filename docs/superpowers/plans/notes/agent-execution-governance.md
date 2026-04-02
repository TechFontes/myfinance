# Agent Execution Governance

## Roles

### Owner Agent
- Owns scope breakdown and dependency order
- Approves gate transitions
- Makes integration decisions
- Coordinates multi-agent parallel work

### Integration Reviewer
- Reviews cross-module changes for consistency
- Validates that module boundaries are respected
- Checks for unintended coupling between features

### Verification Reviewer
- Validates test evidence before gate approval
- Confirms broader regression suite passes
- Reviews deployment readiness

## Capability Gates

Every capability (user-facing feature or fix) must pass four gates:

### Gate 1: Design
- Requirements are clear and documented
- Affected files and modules identified
- Test strategy defined

### Gate 2: Red (TDD)
- Failing tests written before production code
- Tests model realistic runtime contracts
- Test evidence captured

### Gate 3: Integration
- Production code satisfies all tests
- No regressions in broader suite
- Module boundaries respected
- Lint and type-check pass

### Gate 4: Publish
- Full test suite passes (`yarn test`)
- Lint passes (`yarn lint`)
- Build succeeds (`yarn build`)
- Migration state verified (`npx prisma migrate status`)
- Residual risks documented explicitly
- No silent warnings or unresolved TODOs

## Coordination Rules

- Parallel agents must work on independent file sets
- Shared state modifications require sequential execution
- Each agent commits its own checkpoint
- Integration review happens after merging parallel work
