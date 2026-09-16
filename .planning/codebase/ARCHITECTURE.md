# Architecture

**Analysis Date:** 2026-09-16

## Pattern Overview

**Overall:** A Node.js library exporting a Moleculer service mixin that adapts the `cron` package into service lifecycle hooks and methods. [`index.js`](../../index.js), [`src/index.js`](../../src/index.js), [`package.json`](../../package.json)

**Key Characteristics:**
- The package root is a thin CommonJS re-export of the mixin implementation. [`index.js`](../../index.js)
- The mixin creates named `CronJob` instances from `settings.cronJobs` and keeps their wrappers in a service-local `Map`. [`src/index.js`](../../src/index.js)
- Job activation follows Moleculer lifecycle state: creation builds jobs, broker startup starts non-manual jobs, and shutdown stops every job. [`src/index.js`](../../src/index.js)

## Layers

**Package entry layer:**
- Purpose: Expose the published CommonJS module declared by package metadata. [`index.js`](../../index.js), [`package.json`](../../package.json)
- Location: [`index.js`](../../index.js)
- Contains: A single re-export of the `src` module. [`index.js`](../../index.js)
- Depends on: The implementation directory. [`index.js`](../../index.js)
- Used by: Consumers loading the package root, as shown by the development example. [`package.json`](../../package.json), [`examples/index.js`](../../examples/index.js)

**Moleculer mixin layer:**
- Purpose: Define the `cron` mixin's settings, lifecycle hooks, broker event handler, and public service methods. [`src/index.js`](../../src/index.js)
- Location: [`src/index.js`](../../src/index.js)
- Contains: Job validation, `CronJob` construction, callback wrappers, and named job controls. [`src/index.js`](../../src/index.js)
- Depends on: `CronJob` and `CronTime` from the `cron` dependency plus the host Moleculer service's `broker` and `logger`. [`src/index.js`](../../src/index.js), [`package.json`](../../package.json)
- Used by: Moleculer service definitions that include it in `mixins`. [`examples/index.js`](../../examples/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)

**Type-contract layer:**
- Purpose: Describe job configuration, job wrappers, the mixin schema, and Moleculer service/settings augmentation for TypeScript consumers. [`index.d.ts`](../../index.d.ts)
- Location: [`index.d.ts`](../../index.d.ts)
- Contains: `CronJobConfig`, `CronJobWrapper`, `CronMixinSchema`, and `moleculer` module declarations. [`index.d.ts`](../../index.d.ts)
- Depends on: Type declarations from `moleculer` and `cron`. [`index.d.ts`](../../index.d.ts)
- Used by: TypeScript tooling through the package `types` field. [`package.json`](../../package.json)

## Data Flow

**Cron-job lifecycle:**
1. A host service supplies `settings.cronJobs` while mixing in the exported cron schema. [`examples/index.js`](../../examples/index.js), [`src/index.js`](../../src/index.js)
2. The mixin's `created` hook initialises `this.jobs` and calls `validateAndCreateJobs`, which iterates an array of configurations. [`src/index.js`](../../src/index.js)
3. `createJob` validates `name`, `cronTime`, and `onTick`; supplies optional callback defaults; builds a stopped `CronJob`; then stores a wrapper under the configuration name. [`src/index.js`](../../src/index.js)
4. On `$broker.started`, or directly from `started` when the broker is already running, `startJobs` starts wrappers whose `manualStart` is false. [`src/index.js`](../../src/index.js)
5. A scheduled tick runs the wrapped `onTick` with the Moleculer service as `this`; callers can stop or start named jobs through mixin methods. [`src/index.js`](../../src/index.js), [`examples/index.js`](../../examples/index.js)
6. The `stopped` hook iterates the map and stops every wrapper. [`src/index.js`](../../src/index.js)

**State Management:**
- Runtime job state is service-local: `this.jobs` is a `Map` keyed by configuration name, while each wrapper delegates run state and scheduling data to its underlying `CronJob`. [`src/index.js`](../../src/index.js)
- Configuration state comes from Moleculer `settings.cronJobs`, with the mixin defaulting it to an empty array. [`src/index.js`](../../src/index.js)

## Key Abstractions

**Cron mixin:**
- Purpose: Add cron configuration and job-control methods to a Moleculer service. [`src/index.js`](../../src/index.js), [`index.d.ts`](../../index.d.ts)
- Examples: [`src/index.js`](../../src/index.js), [`examples/index.js`](../../examples/index.js)
- Pattern: A Moleculer mixin object with lifecycle hooks, events, settings, and methods. [`src/index.js`](../../src/index.js)

**Job configuration:**
- Purpose: Describe one named scheduled callback and its optional lifecycle behaviour. [`index.d.ts`](../../index.d.ts), [`src/index.js`](../../src/index.js)
- Examples: [`examples/index.js`](../../examples/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Pattern: A configuration object consumed by `createJob`; `name`, `cronTime`, and `onTick` are runtime-required. [`src/index.js`](../../src/index.js)

**Job wrapper:**
- Purpose: Couple a `CronJob` with the configured lifecycle callbacks and an imperative control surface. [`src/index.js`](../../src/index.js), [`index.d.ts`](../../index.d.ts)
- Examples: [`src/index.js`](../../src/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Pattern: A closure-backed adapter stored in the jobs map and returned by `getJob`. [`src/index.js`](../../src/index.js)

## Entry Points

**Published module:**
- Location: [`index.js`](../../index.js)
- Triggers: Node resolves the package `main` field when a consumer requires the package root. [`package.json`](../../package.json), [`index.js`](../../index.js)
- Responsibilities: Re-export the implementation from `src`. [`index.js`](../../index.js)

**Development example:**
- Location: [`examples/index.js`](../../examples/index.js)
- Triggers: `npm run dev` starts Nodemon with this file. [`package.json`](../../package.json)
- Responsibilities: Construct a `ServiceBroker`, define a service that mixes in the cron module, and start the broker. [`examples/index.js`](../../examples/index.js)

## Error Handling

**Strategy:** Validate each configuration independently, log failures, and allow remaining configurations and broker lifecycle work to continue. [`src/index.js`](../../src/index.js)

**Patterns:**
- Non-array `cronJobs` settings produce a warning and no job creation. [`src/index.js`](../../src/index.js)
- Invalid required fields and `CronJob` construction failures are caught per configuration, logged through the service logger and console, and leave no wrapper for that job. [`src/index.js`](../../src/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Tick and completion callbacks catch and log their own failures so callback exceptions do not escape the wrappers. [`src/index.js`](../../src/index.js)
- Attempts to start or stop unknown names log warnings rather than throw. [`src/index.js`](../../src/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)

## Cross-Cutting Concerns

**Logging:** The mixin uses the host service logger for creation, start, stop, warning, debug, and callback-error messages; creation failures also write to `console.error`. [`src/index.js`](../../src/index.js)

**Validation:** `createJob` requires a name, cron time, and tick function, and normalises missing or non-function optional lifecycle callbacks to no-ops. [`src/index.js`](../../src/index.js)

**Authentication:** No authentication mechanism is implemented by this library; it exports only a Moleculer cron mixin and does not define request-facing actions. [`src/index.js`](../../src/index.js), [`index.js`](../../index.js)

---

*Architecture analysis: 2026-09-16*
