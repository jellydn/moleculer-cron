# Codebase Structure

**Analysis Date:** 2026-09-16

## Directory Layout

```
[project-root]/
├── .github/workflows/ # GitHub Actions continuous-integration workflow
├── .planning/codebase/ # Generated codebase-map documentation
├── .vscode/ # Editor debug configuration
├── examples/ # Runnable Moleculer broker example
├── src/ # Published cron mixin implementation
├── test/unit/ # Jest unit tests for the mixin
├── index.js # Package CommonJS entry point
├── index.d.ts # TypeScript declarations for the published module
├── package.json # Package metadata, dependencies, scripts, and Jest configuration
├── package-lock.json # Locked npm dependency graph
├── README.md # Package usage and API guide
├── CHANGELOG.md # Release history
└── LICENSE # Project licence text
```

The layout above is derived from the repository files and directories at [`package.json`](../../package.json), [`index.js`](../../index.js), [`index.d.ts`](../../index.d.ts), [`src/index.js`](../../src/index.js), [`examples/index.js`](../../examples/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`.vscode/launch.json`](../../.vscode/launch.json), [`.planning/codebase/`](.), [`README.md`](../../README.md), [`CHANGELOG.md`](../../CHANGELOG.md), and [`LICENSE`](../../LICENSE).

## Directory Purposes

**`src/`:**
- Purpose: Hold the runtime implementation exported by the package root. [`index.js`](../../index.js), [`src/index.js`](../../src/index.js)
- Contains: The CommonJS Moleculer cron-mixin schema. [`src/index.js`](../../src/index.js)
- Key files: [`src/index.js`](../../src/index.js)

**`examples/`:**
- Purpose: Provide a runnable broker and service configuration demonstrating mixin usage. [`examples/index.js`](../../examples/index.js), [`package.json`](../../package.json)
- Contains: A Node.js example that creates a broker, configures two cron jobs, and starts the broker. [`examples/index.js`](../../examples/index.js)
- Key files: [`examples/index.js`](../../examples/index.js)

**`test/unit/`:**
- Purpose: Verify mixin construction, lifecycle behaviour, job controls, callbacks, Moleculer 0.15 late-service startup, and invalid configuration handling. [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Contains: Jest specifications. [`test/unit/index.spec.js`](../../test/unit/index.spec.js), [`package.json`](../../package.json)
- Key files: [`test/unit/index.spec.js`](../../test/unit/index.spec.js)

**`.github/workflows/`:**
- Purpose: Run continuous integration on pushes and pull requests. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Contains: The CI workflow that installs dependencies with `npm ci` and runs `npm test` on Node 22 and 24. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Key files: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

**`.vscode/`:**
- Purpose: Store repository editor debug configuration. [`.vscode/launch.json`](../../.vscode/launch.json)
- Contains: VS Code launch settings. [`.vscode/launch.json`](../../.vscode/launch.json)
- Key files: [`.vscode/launch.json`](../../.vscode/launch.json)

**`.planning/codebase/`:**
- Purpose: Store this generated architecture and structure map. [`.planning/codebase/ARCHITECTURE.md`](ARCHITECTURE.md), [`.planning/codebase/STRUCTURE.md`](STRUCTURE.md)
- Contains: Markdown documentation generated for the codebase map. [`.planning/codebase/ARCHITECTURE.md`](ARCHITECTURE.md), [`.planning/codebase/STRUCTURE.md`](STRUCTURE.md)
- Key files: [`.planning/codebase/ARCHITECTURE.md`](ARCHITECTURE.md), [`.planning/codebase/STRUCTURE.md`](STRUCTURE.md)

## Key File Locations

**Entry Points:**
- [`index.js`](../../index.js): Published CommonJS entry point; package metadata identifies it as `main`. [`package.json`](../../package.json)
- [`examples/index.js`](../../examples/index.js): Development example launched by `npm run dev`. [`package.json`](../../package.json)

**Configuration:**
- [`package.json`](../../package.json): Defines package metadata, the runtime dependency on `cron`, Moleculer peer compatibility, npm scripts, engine requirement, and Jest settings. [`package.json`](../../package.json)
- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml): Defines Node-version CI matrix and test commands. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- [`.vscode/launch.json`](../../.vscode/launch.json): Defines VS Code debug configuration. [`.vscode/launch.json`](../../.vscode/launch.json)

**Core Logic:**
- [`src/index.js`](../../src/index.js): Implements the Moleculer cron mixin, job wrappers, lifecycle hooks, callback wrapping, and job-control methods. [`src/index.js`](../../src/index.js)
- [`index.d.ts`](../../index.d.ts): Defines the published TypeScript contract and Moleculer declaration merging. [`index.d.ts`](../../index.d.ts), [`package.json`](../../package.json)

**Testing:**
- [`test/unit/index.spec.js`](../../test/unit/index.spec.js): Exercises the runtime mixin with Moleculer's `ServiceBroker`. [`test/unit/index.spec.js`](../../test/unit/index.spec.js)

## Naming Conventions

**Files:**
- JavaScript source, examples, and tests use the `.js` extension; the implementation and example are both named `index.js`. [`src/index.js`](../../src/index.js), [`examples/index.js`](../../examples/index.js)
- The package declaration file is named `index.d.ts`, matching the package `types` field. [`index.d.ts`](../../index.d.ts), [`package.json`](../../package.json)
- Unit tests use the `*.spec.js` suffix. [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Continuous-integration configuration uses a lowercase YAML filename. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

**Directories:**
- Runtime code is placed under `src/`, while tests are grouped by test kind under `test/unit/`. [`src/index.js`](../../src/index.js), [`test/unit/index.spec.js`](../../test/unit/index.spec.js)
- Tool-specific configuration uses dot-prefixed directories such as `.github/` and `.vscode/`. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`.vscode/launch.json`](../../.vscode/launch.json)

## Where to Add New Code

**New Feature:**
- Primary code: [`src/index.js`](../../src/index.js), because it is the only runtime implementation re-exported by the package entry point. [`index.js`](../../index.js), [`src/index.js`](../../src/index.js)
- Tests: [`test/unit/index.spec.js`](../../test/unit/index.spec.js), alongside the existing Jest coverage for mixin behaviour. [`test/unit/index.spec.js`](../../test/unit/index.spec.js)

**New Component/Module:**
- Implementation: Add a module beneath [`src/`](../../src/index.js) and connect it from the exported implementation at [`src/index.js`](../../src/index.js); the package root currently re-exports that directory. [`index.js`](../../index.js), [`src/index.js`](../../src/index.js)

**Utilities:**
- Shared helpers: The current implementation keeps helpers as mixin methods in [`src/index.js`](../../src/index.js); add a shared helper there when it belongs to the mixin's service API, or introduce a `src/` module when it should remain internal. [`src/index.js`](../../src/index.js), [`index.d.ts`](../../index.d.ts)

## Special Directories

**`.github/workflows/`:**
- Purpose: GitHub Actions automation for test execution. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Generated: No; the workflow is declarative repository configuration. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Committed: Yes; the workflow is present in the repository tree. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

**`.vscode/`:**
- Purpose: VS Code debug configuration. [`.vscode/launch.json`](../../.vscode/launch.json)
- Generated: No; it contains editor launch configuration. [`.vscode/launch.json`](../../.vscode/launch.json)
- Committed: Yes; the configuration file is present in the repository tree. [`.vscode/launch.json`](../../.vscode/launch.json)

**`.planning/codebase/`:**
- Purpose: Generated codebase-map documentation. [`.planning/codebase/ARCHITECTURE.md`](ARCHITECTURE.md), [`.planning/codebase/STRUCTURE.md`](STRUCTURE.md)
- Generated: Yes; these files are the requested architecture-map output. [`.planning/codebase/ARCHITECTURE.md`](ARCHITECTURE.md), [`.planning/codebase/STRUCTURE.md`](STRUCTURE.md)
- Committed: Undetermined from repository source files; no ignore rule for `.planning/` appears in [`.gitignore`](../../.gitignore).

---

*Structure analysis: 2026-09-16*
