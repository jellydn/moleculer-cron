# Codebase Concerns

**Analysis Date:** 2026-09-16

## Tech Debt

**Duplicated callback paths and mutation of service settings:**
- Status: Recommendation; the behaviour is implemented, but no externally reported defect was found.
- Issue: `createJob` replaces missing callbacks on the caller-owned `jobConfig`, binds every callback into a wrapper, but schedules separate `wrapOnTick` and `wrapOnComplete` functions. The wrapper's `onTick` and `onComplete` methods are not the functions supplied to `CronJob`.
- Files: `src/index.js:51-101`
- Impact: Callback semantics and error handling are split across two paths, increasing the chance that wrapper APIs and scheduled execution drift. Mutating `settings.cronJobs` also makes the effective service configuration differ from its input.
- Fix approach: Validate callbacks without mutation, centralise invocation/error handling in one wrapper, and pass those same wrapper functions to `CronJob`.

**Library code writes directly to stderr:**
- Status: Recommendation; verified by static inspection.
- Issue: Configuration and construction failures are written through both the Moleculer logger and `console.error`.
- Files: `src/index.js:41-47`, `src/index.js:133-136`
- Impact: Consumers cannot consistently route, redact, or suppress library errors through their broker logger; duplicate error records complicate alerting.
- Fix approach: Remove direct console output, retain structured broker logging, and make failed-job reporting an explicit, documented policy.

**Documentation and example callback contract drift:**
- Status: Verified documentation defect.
- Issue: The README says `onInitialize` runs before the cron job is created, while the implementation stores the job in `this.jobs` and then invokes it. The example also declares `onComplete` twice in each job object, so JavaScript silently keeps only the latter function.
- Files: `README.md:84-85`, `examples/index.js:43-49`, `examples/index.js:74-80`, `src/index.js:129-133`
- Impact: Users can rely on an incorrect lifecycle ordering or copy an example that discards a callback without warning.
- Fix approach: Correct the lifecycle description and deduplicate the example properties; add lifecycle-order tests before changing the implementation.

## Known Bugs

**Declared Cron options are ignored at runtime:**
- Status: Verified defect.
- Symptoms: Supplying `utcOffset` or `unrefTimeout` satisfies the exported `CronJobConfig` type but has no effect on the constructed cron job.
- Files: `index.d.ts:25-26`, `src/index.js:70-78`
- Trigger: Configure either property in `settings.cronJobs`; the constructor receives only cron time, callbacks, start flag, timezone, and context.
- Workaround: Do not depend on these options through this mixin; use supported timezone behaviour or manage the underlying scheduler separately until the options are forwarded and tested.

**Duplicate job names silently replace an earlier configuration:**
- Status: Verified defect.
- Symptoms: Only the final configuration is retrievable and eligible for automatic start, while every configuration's initialisation callback may already have run.
- Files: `src/index.js:41-46`, `src/index.js:128-133`
- Trigger: Put two `cronJobs` entries with the same `name`; `Map#set` overwrites the earlier wrapper without duplicate-name validation.
- Workaround: Enforce unique names in consumer configuration.

## Security Considerations

**Configuration data can be emitted to application logs:**
- Status: Verified exposure path; whether it exposes a secret depends on consumer configuration.
- Risk: On job-creation failure, the full `jobConfig` is passed to the logger and the error is also printed to stderr. Extra configuration fields can therefore be persisted by application log sinks.
- Files: `src/index.js:44-46`, `src/index.js:133-136`
- Current mitigation: Required fields are checked before scheduling, and consumers control the job configuration.
- Recommendations: Never place secrets in cron-job configuration objects; log a job name and sanitised validation details instead of the full object; use the broker logger only so existing redaction controls apply.

**Cron configuration is a trusted-code boundary:**
- Status: Design consideration, not a verified unauthorised-execution vulnerability.
- Risk: `onTick`, lifecycle callbacks, and callbacks added through the returned job wrapper execute with the service as `this`. Any actor able to change service definitions can execute service-level code on the schedule.
- Files: `src/index.js:79-124`, `src/index.js:140-162`
- Current mitigation: The API requires functions in local service configuration; it does not parse or execute strings received over the network.
- Recommendations: Keep service definitions deployment-controlled, do not expose an action that accepts arbitrary cron callbacks, and apply authorisation and frequency limits to any future runtime job-management API.

## Performance Bottlenecks

**Unbounded overlapping asynchronous ticks:**
- Status: Verified absence of mixin-level serialisation; impact depends on job duration and schedule frequency.
- Problem: The scheduled callback awaits `onTick`, but no in-flight guard, queue, timeout, or concurrency policy is maintained by the mixin.
- Files: `src/index.js:70-78`, `src/index.js:140-148`
- Cause: Each scheduler invocation delegates directly to the asynchronous callback; the mixin retains no execution state per job.
- Improvement path: Add an opt-in overlap policy (skip, queue, or allow), instrument duration and skipped runs, and test a slow callback with a more frequent schedule.

## Fragile Areas

**Broker lifecycle start path:**
- Files: `src/index.js:10-32`, `src/index.js:164-186`, `test/unit/index.spec.js:112-152`
- Why fragile: Jobs are started from either the `$broker.started` event or the service `started` hook depending on creation timing. Correctness relies on `CronJob.running` to prevent duplicate starts, and only the late-created-service case is exercised explicitly.
- Safe modification: Preserve the idempotent `startJob` guard; test services created before, during, and after broker startup before altering lifecycle hooks.
- Test coverage: No test asserts that the event and hook cannot double-start callbacks, or that manual jobs remain stopped on every lifecycle timing path.

**Public wrapper is a thin passthrough over a version-sensitive dependency:**
- Files: `src/index.js:85-126`, `index.d.ts:35-50`, `package.json:39-41`
- Why fragile: Methods and the `running` property are read directly from `cron`, while the package exposes its own TypeScript wrapper contract. Runtime option forwarding already differs from that contract.
- Safe modification: Define the supported wrapper surface independently, normalise inputs before delegation, and add contract tests against the locked `cron` version before upgrading it.
- Test coverage: `setTime`, `nextDates`, `addCallback`, and `getCronTime` are not exercised in `test/unit/index.spec.js`.

## Scaling Limits

**Per-process in-memory scheduler:**
- Status: Architectural limitation; no capacity measurement is present in the repository.
- Current capacity: One `Map` of cron jobs per service instance; no configured job-count, execution-duration, or concurrency limit.
- Files: `src/index.js:10-13`, `src/index.js:128`, `src/index.js:164-170`
- Limit: Every service replica creates and starts its own non-manual jobs. Horizontal scaling can therefore run the same task once per replica, and slow tasks can overlap without a local cap.
- Scaling path: For singleton work, elect a leader or use a distributed lock/queue; for fan-out work, make handlers idempotent and add execution ownership plus monitoring.

## Dependencies at Risk

**Deprecated `lolex` development dependency:**
- Status: Verified by the lockfile.
- Risk: The lockfile marks `lolex@6.0.0` deprecated and directs users to `@sinonjs/fake-timers`; no repository source or tests import it.
- Files: `package.json:20`, `package-lock.json:6787-6795`, `test/unit/index.spec.js`
- Impact: It adds an obsolete, unused dependency to installs and leaves future timer-test work pointed at a deprecated package.
- Migration plan: Remove it if unused, or replace it with `@sinonjs/fake-timers` and use it to make scheduling tests deterministic.

**Peer compatibility is broader than the exercised matrix:**
- Status: Verified test/metadata gap, not a verified runtime incompatibility.
- Risk: The peer range admits Moleculer 0.14.32+ and 0.15.x, but development and CI resolve only Moleculer 0.15.2 and run only Node 22 and 24.
- Files: `package.json:29-30`, `package.json:21`, `.github/workflows/ci.yml:10-27`, `package-lock.json:6985-6993`
- Impact: A release can regress the advertised 0.14 compatibility without CI detecting it.
- Migration plan: Add separate install/test jobs for the minimum supported 0.14 and 0.15 versions and publish the resulting Node-version compatibility policy.

## Missing Critical Features

**No distributed execution coordination:**
- Status: Feature gap, not a defect in single-instance use.
- Problem: The mixin has no leader election, distributed lock, persistence, or run history.
- Files: `src/index.js:10-186`, `package.json:39-41`
- Blocks: Consumers cannot safely treat a cron job as exactly-once or singleton work when a service is replicated or restarted.

**No runtime visibility or failure policy:**
- Status: Feature gap.
- Problem: Failed `onTick` executions are logged and then swallowed; the API exposes no retry, timeout, success/failure counters, or last-error state.
- Files: `src/index.js:140-162`, `index.d.ts:35-50`
- Blocks: Operations teams cannot use the mixin alone to detect missed/failed work or apply a consistent recovery policy.

## Test Coverage Gaps

**Callback validation and lifecycle semantics:**
- What's not tested: Non-function `onTick` values; non-array `cronJobs`; invalid cron/timezone values; duplicate names; callback `this` binding; callback exceptions; and the ordering of initialise, start, stop, and complete hooks.
- Files: `src/index.js:35-162`, `test/unit/index.spec.js:1-171`
- Risk: Invalid configuration can degrade into recurring runtime errors, and lifecycle changes can break consumer callbacks unnoticed.
- Priority: High

**Public API and type-to-runtime contract:**
- What's not tested: `utcOffset` and `unrefTimeout` forwarding, `setTime`, `nextDates`, `addCallback`, `getCronTime`, and importing the published root entry point and declarations.
- Files: `index.js:1-7`, `index.d.ts:1-70`, `src/index.js:114-124`, `test/unit/index.spec.js:1-171`
- Risk: Published APIs can be incompatible with the implementation despite green internal-source tests.
- Priority: High

**Deterministic and compatibility testing:**
- What's not tested: Moleculer 0.14 compatibility, Node 18 compatibility for the advertised engine range, and scheduler behaviour using controlled time. The tick test uses a real 1.5-second delay.
- Files: `package.json:21`, `package.json:27-30`, `.github/workflows/ci.yml:10-27`, `test/unit/index.spec.js:130-150`
- Risk: CI may miss compatibility regressions and may be timing-sensitive under load.
- Priority: Medium

**Quality gates beyond Jest execution:**
- What's not tested: CI does not run the configured ESLint command, set a coverage threshold, upload coverage, or run dependency/security auditing.
- Files: `package.json:8-14`, `.github/workflows/ci.yml:24-27`
- Risk: Style regressions, declining coverage, and vulnerable dependency updates can reach releases without an automated gate.
- Priority: Medium

---

*Concerns audit: 2026-09-16*
