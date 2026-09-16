# Technology Stack

**Analysis Date:** 2026-09-16

## Languages

**Primary:**
- JavaScript (CommonJS) - The published entry point re-exports `src/`, and the mixin, example, and tests use `require`/`module.exports`. [`index.js`](../../index.js), [`src/index.js`](../../src/index.js), [`examples/index.js`](../../examples/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)

**Secondary:**
- TypeScript declaration syntax - `index.d.ts` provides the package API and augments Moleculer's `Service` and `ServiceSettingSchema` types; it is declaration-only rather than compiled application source. [`index.d.ts`](../../index.d.ts), [`package.json`](../../package.json)
- YAML - GitHub Actions workflow configuration is written in YAML. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

## Runtime

**Environment:**
- Node.js >= 18.x.x is the declared package engine. [`package.json`](../../package.json)
- CI tests on Node.js 22.x and 24.x; the README additionally documents Node >= 22 for Moleculer 0.15.x. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`README.md`](../../README.md)

**Package Manager:**
- npm - repository scripts use npm and CI installs with `npm ci`. [`package.json`](../../package.json), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Lockfile: present (`package-lock.json`), lockfile version 2. [`package-lock.json`](../../package-lock.json)

## Frameworks

**Core:**
- Moleculer ^0.14.32 || ^0.15.0 - peer microservices framework into which this package supplies a cron mixin; the lockfile resolves its development/test copy to 0.15.2. [`package.json`](../../package.json), [`package-lock.json`](../../package-lock.json), [`examples/index.js`](../../examples/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- cron ^3.1.6 - production scheduler used to construct `CronJob` instances and `CronTime` values; lockfile resolves 3.1.6. [`package.json`](../../package.json), [`package-lock.json`](../../package-lock.json), [`src/index.js`](../../src/index.js)

**Testing:**
- Jest ^29.7.0 - Node-environment test runner with coverage enabled by the `test` script; the lockfile resolves Jest and Jest CLI to 29.7.0. [`package.json`](../../package.json), [`package-lock.json`](../../package-lock.json), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)

**Build/Dev:**
- No compilation or bundling tool is configured; the package exposes JavaScript directly through `main: index.js` and declarations through `types: index.d.ts`. [`package.json`](../../package.json), [`index.js`](../../index.js), [`index.d.ts`](../../index.d.ts)
- nodemon ^3.1.0 runs the example in development; npm-check ^3.2.10 checks dependencies; bumpp 10.4.1 performs version releases without pushing. [`package.json`](../../package.json), [`package-lock.json`](../../package-lock.json)
- ESLint 8.57.0 is invoked for `src` and `test` with the repository configuration in [`.eslintrc.cjs`](../../.eslintrc.cjs). [`package.json`](../../package.json), [`.eslintrc.cjs`](../../.eslintrc.cjs)

## Key Dependencies

**Critical:**
- cron ^3.1.6 - implements schedule parsing and job lifecycle primitives wrapped by the mixin. [`package.json`](../../package.json), [`package-lock.json`](../../package-lock.json), [`src/index.js`](../../src/index.js)
- moleculer ^0.14.32 || ^0.15.0 (peer dependency) - provides the service lifecycle, broker events, logging, and service surface the mixin expects. [`package.json`](../../package.json), [`src/index.js`](../../src/index.js), [`index.d.ts`](../../index.d.ts)

**Infrastructure:**
- Jest/Jest CLI ^29.7.0 - unit testing and coverage. [`package.json`](../../package.json), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- ESLint 8.57.0 - linting. [`package.json`](../../package.json)
- Coveralls 3.1.1 - optional coverage uploader, invoked by the `coverall` script after Jest writes `coverage/lcov.info`. [`package.json`](../../package.json)
- benchmarkify ^4.0.0 and moleculer-docgen ^0.2.1 are declared development dependencies, but no tracked source, example, test, script, or workflow imports or invokes them. [`package.json`](../../package.json), [`src/index.js`](../../src/index.js), [`examples/index.js`](../../examples/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

## Configuration

**Environment:**
- No runtime environment variables are read by the package source; scheduling is configured in a host Moleculer service through `settings.cronJobs`. [`src/index.js`](../../src/index.js), [`examples/index.js`](../../examples/index.js)
- Each configured job must provide `name`, `cronTime`, and `onTick`; optional fields include lifecycle callbacks, `manualStart`, and `timeZone`. [`src/index.js`](../../src/index.js), [`index.d.ts`](../../index.d.ts)

**Build:**
- Package metadata, scripts, Node engine, Jest configuration, dependencies, and publish access are defined in `package.json`; dependency resolution is pinned in `package-lock.json`. [`package.json`](../../package.json), [`package-lock.json`](../../package-lock.json)
- CI configuration is contained in `.github/workflows/ci.yml`; VS Code provides launch configurations for the example and Jest. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`.vscode/launch.json`](../../.vscode/launch.json)

## Platform Requirements

**Development:**
- Install dependencies with npm against Node >= 18, then use `npm test`, `npm run lint`, or `npm run dev` as appropriate. [`package.json`](../../package.json)
- The development example and unit tests construct a Moleculer `ServiceBroker`; consumers must supply the declared Moleculer peer dependency. [`examples/index.js`](../../examples/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js), [`package.json`](../../package.json)

**Production:**
- This is an npm library published with public access, not a deployable service; consumers install it and add the exported mixin to their own Moleculer service. [`package.json`](../../package.json), [`README.md`](../../README.md), [`index.js`](../../index.js)

---

*Stack analysis: 2026-09-16*
