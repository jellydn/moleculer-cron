# Codebase Concerns

**Analysis Date:** 2026-09-16

## Remediated in `fix/codemap-concerns`

- Cron options now match the public type contract: `utcOffset` and `unrefTimeout` are forwarded to `CronJob`, and `setTime` normalises strings and dates to `CronTime`. [`src/index.js`](../../src/index.js), [`index.d.ts`](../../index.d.ts), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Duplicate job names are rejected before they can replace a registered job. [`src/index.js`](../../src/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Job-creation failures use a sanitised Moleculer logger message and do not write configuration objects or errors directly to stderr. [`src/index.js`](../../src/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- The README reflects cron v3 month numbering and job registration order, and the example no longer contains duplicate `onComplete` properties. [`README.md`](../../README.md), [`examples/index.js`](../../examples/index.js)
- The lint command now has a repository ESLint configuration, and the unused deprecated `lolex` development dependency was removed. [`.eslintrc.cjs`](../../.eslintrc.cjs), [`package.json`](../../package.json)

## Tech Debt

**Duplicated callback paths:**
- Status: Recommendation; no externally reported defect was found.
- Issue: `CronJob` receives `wrapOnTick` and `wrapOnComplete`, while the wrapper exposes separate `onTick` and `onComplete` methods that are not the scheduled functions.
- Files: [`src/index.js`](../../src/index.js)
- Impact: Callback semantics and error handling can drift between direct wrapper calls and scheduled execution.
- Fix approach: Centralise callback invocation in one wrapper and pass the same functions to `CronJob`.

## Known Bugs

No independently verified runtime bug remains after the fixes in this stack layer.

## Security Considerations

**Cron configuration is a trusted-code boundary:**
- Status: Design consideration, not a verified unauthorised-execution vulnerability.
- Risk: `onTick`, lifecycle callbacks, and callbacks added through a returned job wrapper execute with the service as `this`.
- Files: [`src/index.js`](../../src/index.js)
- Current mitigation: The API accepts local functions in service configuration; it does not parse or execute network-supplied strings.
- Recommendations: Keep service definitions deployment-controlled. Do not expose actions that accept arbitrary cron callbacks. Apply authorisation and frequency limits to any future runtime job-management API.

## Performance Bottlenecks

**Unbounded overlapping asynchronous ticks:**
- Status: Verified absence of mixin-level serialisation; impact depends on job duration and schedule frequency.
- Problem: Scheduled callbacks can overlap because the mixin maintains no in-flight guard, queue, timeout, or concurrency policy.
- Files: [`src/index.js`](../../src/index.js)
- Improvement path: Add an opt-in overlap policy (skip, queue, or allow), execution-duration instrumentation, and tests for slow callbacks.

## Fragile Areas

**Broker lifecycle start path:**
- Files: [`src/index.js`](../../src/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Why fragile: Jobs start from `$broker.started` or `started` depending on service-creation timing. Correctness depends on the idempotent `running()` guard.
- Safe modification: Preserve the guard and test services created before, during, and after broker startup before changing lifecycle hooks.
- Test coverage: The late-created-service path is covered, but the event and hook are not explicitly tested together.

**Public wrapper delegates to a version-sensitive dependency:**
- Files: [`src/index.js`](../../src/index.js), [`index.d.ts`](../../index.d.ts), [`package.json`](../../package.json)
- Why fragile: The package exposes a wrapper contract over `cron` methods and properties that can change between cron versions.
- Safe modification: Define the supported wrapper surface independently and add contract tests before upgrading `cron`.
- Test coverage: `nextDates`, `addCallback`, and `getCronTime` are not exercised in [`test/unit/index.spec.js`](../../test/unit/index.spec.js).

## Scaling Limits

**Per-process in-memory scheduler:**
- Status: Architectural limitation; no capacity measurement is present.
- Current capacity: One `Map` of jobs per service instance with no configured execution or concurrency limit.
- Files: [`src/index.js`](../../src/index.js)
- Limit: Each service replica starts its own non-manual jobs. Slow jobs can overlap locally.
- Scaling path: Use leader election or a distributed lock/queue for singleton work. Make fan-out handlers idempotent and add execution ownership plus monitoring.

## Dependencies at Risk

**Peer compatibility is broader than the exercised matrix:**
- Status: Verified test/metadata gap, not a verified runtime incompatibility.
- Risk: The peer range admits Moleculer 0.14.32+ and 0.15.x, while development and CI resolve only Moleculer 0.15.2 and run Node 22 and 24.
- Files: [`package.json`](../../package.json), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`package-lock.json`](../../package-lock.json)
- Migration plan: Add install/test jobs for the minimum supported 0.14 and 0.15 versions and document the Node-version policy.

## Missing Critical Features

**No distributed execution coordination:**
- Status: Feature gap, not a defect in single-instance use.
- Problem: The mixin has no leader election, distributed lock, persistence, or run history.
- Files: [`src/index.js`](../../src/index.js)
- Blocks: Consumers cannot treat a replicated cron job as exactly-once or singleton work.

**No runtime visibility or failure policy:**
- Status: Feature gap.
- Problem: Failed `onTick` executions are logged and then swallowed; the API exposes no retry, timeout, success/failure counters, or last-error state.
- Files: [`src/index.js`](../../src/index.js), [`index.d.ts`](../../index.d.ts)
- Blocks: Operations teams cannot use the mixin alone to detect failed work or apply a consistent recovery policy.

## Test Coverage Gaps

**Callback validation and lifecycle semantics:**
- What's not tested: Non-array `cronJobs`, invalid cron/timezone values, callback exceptions, and lifecycle ordering beyond registration before initialisation.
- Files: [`src/index.js`](../../src/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Risk: Invalid configuration and lifecycle changes can break consumer callbacks unnoticed.
- Priority: High

**Public wrapper contract:**
- What's not tested: `nextDates`, `addCallback`, `getCronTime`, and importing the published root entry point and declarations.
- Files: [`index.js`](../../index.js), [`index.d.ts`](../../index.d.ts), [`src/index.js`](../../src/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Risk: Published APIs can diverge from the implementation despite green internal-source tests.
- Priority: High

**Deterministic and compatibility testing:**
- What's not tested: Moleculer 0.14 compatibility, Node 18 compatibility for the declared engine range, and scheduler behaviour using controlled time.
- Files: [`package.json`](../../package.json), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Risk: CI may miss compatibility regressions and remains timing-sensitive under load.
- Priority: Medium

**Quality gates beyond lint and Jest execution:**
- What's not tested: CI does not set a coverage threshold, upload coverage, or run dependency/security auditing.
- Files: [`package.json`](../../package.json), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Risk: Declining coverage and vulnerable dependency updates can reach releases without an automated gate.
- Priority: Medium

---

*Concerns audit: 2026-09-16*
