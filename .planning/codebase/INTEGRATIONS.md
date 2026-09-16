# External Integrations

**Analysis Date:** 2026-09-16

## APIs & External Services

**Scheduling and service framework:**
- cron - In-process scheduling library used by the mixin to create `CronJob` and `CronTime` objects; the sole production dependency is `cron` ^3.1.6, resolved to 3.1.6 in the lockfile. [`src/index.js`](../../src/index.js), [`package.json`](../../package.json), [`package-lock.json`](../../package-lock.json)
- SDK/Client: the `cron` package, imported directly with CommonJS. [`src/index.js`](../../src/index.js)
- Auth: none; the package does not read credentials or environment variables. [`src/index.js`](../../src/index.js), [`package.json`](../../package.json)
- Moleculer - Peer microservices framework providing the host service/broker interface; the mixin reacts to the `$broker.started` event and calls host-service logging and lifecycle methods. [`package.json`](../../package.json), [`src/index.js`](../../src/index.js), [`examples/index.js`](../../examples/index.js)
- SDK/Client: the consumer supplies `moleculer` ^0.14.32 or ^0.15.0; the repository's example and tests import `ServiceBroker`, while the lockfile resolves the development copy to 0.15.2. [`package.json`](../../package.json), [`examples/index.js`](../../examples/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js), [`package-lock.json`](../../package-lock.json)
- Auth: none is configured by this library; broker transport, registry, and authentication choices remain the consumer application's responsibility. [`src/index.js`](../../src/index.js), [`README.md`](../../README.md)

## Data Storage

**Databases:**
- None. The mixin maintains configured jobs only in an in-memory `Map`; no database client or connection configuration appears in the package source or manifest. [`src/index.js`](../../src/index.js), [`package.json`](../../package.json)
- Connection: none. [`src/index.js`](../../src/index.js), [`package.json`](../../package.json)
- Client: none. [`src/index.js`](../../src/index.js), [`package.json`](../../package.json)

**File Storage:**
- None. The package source imports only `cron` and keeps job state in memory; no file-storage client is declared as a production dependency. [`src/index.js`](../../src/index.js), [`package.json`](../../package.json)

**Caching:**
- None. The only retained runtime state is the service-local jobs `Map`, not an external cache. [`src/index.js`](../../src/index.js)

## Authentication & Identity

**Auth Provider:**
- None. No authentication or identity provider is declared or invoked. [`package.json`](../../package.json), [`src/index.js`](../../src/index.js)
- Implementation: none; the exported artifact is a Moleculer mixin and exposes no HTTP/authentication endpoints. [`index.js`](../../index.js), [`src/index.js`](../../src/index.js)

## Monitoring & Observability

**Error Tracking:**
- None. No error-tracking SDK is declared or imported. [`package.json`](../../package.json), [`src/index.js`](../../src/index.js)

**Logs:**
- Moleculer service logging records job creation, start/stop operations, ticks, completions, and caught callback errors; invalid construction errors are additionally written to `console.error`. [`src/index.js`](../../src/index.js)
- Tests create their broker with logging disabled and assert warnings for missing jobs. [`test/unit/index.spec.js`](../../test/unit/index.spec.js)

## CI/CD & Deployment

**Hosting:**
- No hosting or deployment target is configured. The repository packages a public npm library rather than an application service. [`package.json`](../../package.json), [`README.md`](../../README.md)

**CI Pipeline:**
- GitHub Actions runs on pushes and pull requests, checks out the repository, sets up Node 22.x and 24.x with npm caching, runs `npm ci`, then runs `npm test`. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- A Coveralls uploader is available as a manual npm script, consuming Jest's `coverage/lcov.info`; the checked-in workflow does not invoke that script. [`package.json`](../../package.json), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

## Environment Configuration

**Required env vars:**
- None for this package. Runtime job configuration is supplied directly as `settings.cronJobs`, and neither the library source nor example reads `process.env`. [`src/index.js`](../../src/index.js), [`examples/index.js`](../../examples/index.js)

**Secrets location:**
- None configured in the repository. The CI workflow contains no secrets or environment-variable configuration. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

## Webhooks & Callbacks

**Incoming:**
- None. The library defines no HTTP routes, request handlers, or webhook receiver; it listens only to Moleculer's internal `$broker.started` event. [`src/index.js`](../../src/index.js)

**Outgoing:**
- None. Scheduled `onTick` and `onComplete` callbacks are consumer-provided functions executed in the host service context; the library itself makes no outbound HTTP/API requests. [`src/index.js`](../../src/index.js), [`index.d.ts`](../../index.d.ts)

---

*Integration audit: 2026-09-16*
