# Coding Conventions

**Analysis Date:** 2026-09-16

## Naming Patterns

**Files:**
- JavaScript implementation and entry files use lowercase names: `index.js` and `src/index.js`.
- Unit tests live under `test/unit/` and use the `.spec.js` suffix, for example `test/unit/index.spec.js`.
- The TypeScript declaration entry point is `index.d.ts`.

**Functions:**
- Methods and callbacks use camelCase names, such as `validateAndCreateJobs`, `wrapOnTick`, `startJob`, and `getCronTime` in `src/index.js`.
- Lifecycle hooks retain Moleculer names: `created`, `started`, `stopped`, and the `"$broker.started"` event in `src/index.js`.
- Job callbacks use `on`-prefixed names: `onTick`, `onComplete`, `onInitialize`, `onStart`, and `onStop` in `src/index.js` and `index.d.ts`.

**Variables:**
- Local variables use camelCase (`jobConfig`, `jobWrapper`, `binderOnTick`) in `src/index.js`.
- Boolean configuration uses descriptive camelCase names such as `manualStart` in `src/index.js`.
- Maps are named for their contents (`jobs`), with keys named `name` in iteration (`src/index.js`).

**Types:**
- Public TypeScript types use PascalCase interfaces, including `CronJobConfig`, `CronJobWrapper`, and `CronMixinSchema` in `index.d.ts`.
- Third-party types are imported with `import type` and renamed when clarity requires it (`CronJob as NodeCronJob`) in `index.d.ts`.
- Moleculer module augmentation extends `ServiceSettingSchema` and `Service` in `index.d.ts`.

## Code Style

**Formatting:**
- No Prettier configuration is present (`.prettierrc*` and `prettier.config.*` are absent).
- Source is CommonJS JavaScript with semicolons and four-space indentation in `src/index.js`; the root entry file also uses a short block comment and `"use strict"` (`index.js`).
- Formatting is not entirely uniform: `src/index.js` mixes single and double quotes and has some trailing whitespace. Match the surrounding file when changing it.

**Linting:**
- ESLint `8.57.0` is available and `npm run lint` runs `eslint --ext=.js src test` (`package.json`).
- No ESLint configuration file is present (`.eslintrc*` and `eslint.config.*` are absent), so no repository-specific lint rules are defined.

## Import Organization

**Order:**
1. External runtime dependencies, for example `const { CronJob, CronTime } = require("cron");` in `src/index.js`.
2. Local module imports, for example `const CronMixin = require("../../src");` in `test/unit/index.spec.js`.
3. External test/framework imports, for example `const { ServiceBroker } = require("moleculer");` in `test/unit/index.spec.js`.

**Path Aliases:**
- None. Local dependencies use relative paths such as `./src`, `../../src`, and `../src/index` (`index.js`, `test/unit/index.spec.js`, `examples/index.js`).

## Error Handling

**Patterns:**
- Validate required job configuration early and throw `Error` with an explanatory message in `createJob` (`src/index.js`).
- Catch failures when creating each configured job so one invalid entry does not prevent processing later entries; log the configuration error through `this.logger.error` and `console.error` (`validateAndCreateJobs` in `src/index.js`).
- Wrap asynchronous tick handlers and completion callbacks in `try`/`catch`, logging failures with the Moleculer service logger (`wrapOnTick` and `wrapOnComplete` in `src/index.js`).
- For unavailable jobs, `startJob` and `stopJob` warn rather than throw (`src/index.js`).

## Logging

**Framework:** Moleculer service logger, with `console.error` for caught job-creation errors.

**Patterns:**
- Use `this.logger.info` for job creation and state changes, `debug` for tick/completion activity, `warn` for invalid configuration or missing jobs, and `error` for failures (`src/index.js`).
- Example usage logs service activity through `this.logger` in `examples/index.js`; it catches application-level errors and logs them with `this.logger.info`.

## Comments

**When to Comment:**
- Comments explain lifecycle compatibility and scheduling intent, such as the Moleculer 0.15 late-service note in `started` (`src/index.js`) and cron interval/manual-start notes in `examples/index.js`.
- Tests use comments to clarify assertions after broker shutdown (`test/unit/index.spec.js`).

**JSDoc/TSDoc:**
- No JSDoc or TSDoc blocks are used. Public API shape is documented through TypeScript declarations in `index.d.ts` and README API sections.

## Function Design

**Size:**
- Most service methods are narrow wrappers around one job action; `createJob` centralises construction, callback binding, wrapper creation, registration, and initialisation (`src/index.js`).

**Parameters:**
- Methods accept explicit domain values, such as a `jobConfig`, job `name`, or cron `time` (`src/index.js`).
- Callback functions bind their `this` context to the Moleculer service before invocation (`createJob` in `src/index.js`).

**Return Values:**
- Command methods such as `startJob` and `stopJob` return no value.
- Query/delegation methods return the underlying result, for example `getJob`, `lastDate`, `running`, `setTime`, `nextDates`, and `addCallback` (`src/index.js`).
- Type declarations define the public return contracts in `index.d.ts`.

## Module Design

**Exports:**
- The package root forwards the sole mixin export from `src/` using `module.exports = require("./src")` (`index.js`).
- `src/index.js` exports one Moleculer mixin object via `module.exports`.
- `index.d.ts` provides a default declaration for the same mixin and named public interfaces.

**Barrel Files:**
- No general barrel files are used. `index.js` is the package entry-point forwarder.

---

*Convention analysis: 2026-09-16*
