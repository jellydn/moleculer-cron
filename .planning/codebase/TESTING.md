# Testing Patterns

**Analysis Date:** 2026-09-16

## Test Framework

**Runner:**
- Jest `29.7.0` (`package.json`).
- Config: inline `jest` configuration in `package.json`; it uses the Node environment and ignores `/node_modules/` and `/test/services/` when collecting coverage.

**Assertion Library:**
- Jest's built-in `expect` assertions (`test/unit/index.spec.js`).

**Run Commands:**
```bash
npm test              # Run Jest with coverage
npm run ci            # Run Jest in watch mode
npm run lint          # Lint JavaScript in src and test
```

## Test File Organization

**Location:**
- Tests are separate from implementation under `test/unit/`; the current suite tests `src/index.js` through `require("../../src")` in `test/unit/index.spec.js`.

**Naming:**
- Unit tests use `*.spec.js`, for example `test/unit/index.spec.js`.

**Structure:**
```
test/
└── unit/
    └── index.spec.js
```

## Test Structure

**Suite Organization:**
```javascript
describe("Test Cron job creation and management", () => {
  const testJob = {
    name: "testJob",
    cronTime: "*/1 * * * * *",
    onTick: jest.fn(),
    timeZone: "America/New_York"
  };

  beforeEach(async () => {
    service = broker.createService({
      name: "cron",
      mixins: [CronMixin],
      settings: { cronJobs: [testJob] }
    });
    await broker.start();
  });

  it("should start and stop a job", async () => {
    const job = service.jobs.get("testJob");
    expect(job.running()).toBe(true);
    service.stopJob("testJob");
    expect(job.running()).toBe(false);
  });
});
```

**Patterns:**
- The outer suite creates a new `ServiceBroker` in `beforeEach` and awaits `broker.stop()` in `afterEach` (`test/unit/index.spec.js`).
- Nested suites create a Moleculer service with `CronMixin`, configure jobs through `settings.cronJobs`, and start the broker before assertions (`test/unit/index.spec.js`).
- Assertions use `toBeDefined`, `toBe`, `toBeTruthy`, `toHaveBeenCalled`, and `toHaveBeenCalledWith` (`test/unit/index.spec.js`).

## Mocking

**Framework:** Jest mocks and spies.

**Patterns:**
```javascript
const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Exercise the invalid configuration path.
await broker.start();
expect(logSpy).toHaveBeenCalled();

logSpy.mockRestore();
```

- Job callback test doubles use `jest.fn()`, and warning calls are inspected with `jest.spyOn(service.logger, "warn")` (`test/unit/index.spec.js`).

**What to Mock:**
- Mock observable callbacks and logging when an assertion needs to confirm they were invoked; restore modified global spies after the test (`test/unit/index.spec.js`).

**What NOT to Mock:**
- Do not mock the Moleculer broker or the `cron` dependency for current unit coverage. Tests create real `ServiceBroker` instances and start real cron jobs (`test/unit/index.spec.js`).

## Fixtures and Factories

**Test Data:**
```javascript
const testJob = {
  name: "testJob",
  cronTime: "*/1 * * * * *",
  onTick: jest.fn(),
  timeZone: "America/New_York"
};
```

**Location:**
- No shared fixtures or factories exist. Each `describe` block defines its own inline `cronJobs` configuration in `test/unit/index.spec.js`.

## Coverage

**Requirements:** No coverage threshold is enforced. `npm test` runs `jest --coverage`, and the inline Jest config only specifies coverage ignore paths (`package.json`).

**View Coverage:**
```bash
npm test
```

## Test Types

**Unit Tests:**
- `test/unit/index.spec.js` covers mixin construction, job creation, lifecycle start/stop behaviour, manual starting, missing-job warnings, error handling, job wrapper methods, and service creation after a Moleculer 0.15 broker has started.

**Integration Tests:**
- The unit suite has integration-style boundaries: it starts actual Moleculer brokers, registers real services, and waits for a real scheduled `onTick` callback (`test/unit/index.spec.js`). There is no separate integration-test directory or command.

**E2E Tests:**
- Not used. The repository has no E2E framework, configuration, or test directory.

## Common Patterns

**Async Testing:**
```javascript
await broker.start();
await new Promise((resolve) => setTimeout(resolve, 1500));

expect(onTick).toHaveBeenCalled();
```

- Await broker lifecycle methods and use a timed wait only when verifying a scheduled cron callback (`test/unit/index.spec.js`).

**Error Testing:**
```javascript
const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});

service = broker.createService({
  name: "cron",
  mixins: [CronMixin],
  settings: { cronJobs: [{ name: "invalidJob" }] }
});

await broker.start();
expect(logSpy).toHaveBeenCalled();
expect(service.jobs.size).toBe(0);
logSpy.mockRestore();
```

- Exercise invalid configuration through the public service configuration and assert both its logged error and resulting empty job registry (`test/unit/index.spec.js`).

---

*Testing analysis: 2026-09-16*
