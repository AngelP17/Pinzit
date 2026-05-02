# Pinzit — Agent Development Guide

> This document is intended for AI coding agents. It describes everything needed
> to navigate, build, test, and extend the Pinzit project. Assume zero prior
> knowledge.

---

## 0. Quick Orientation (Start Here)

If you are an AI agent dropped into this project for the first time, read this
section before anything else.

**What Pinzit does**: Reads an OpenTelemetry JSON trace file and a TOML
configuration file, evaluates the trace against three reliability constraints,
and writes structured reports (HTML, JSON, CSV) to an output directory. It then
exits with a code indicating pass, fail, or error.

**Current state of the codebase**:

> **Functional evaluation phase.** The CLI, config parser, output writers, and
> std-only trace parsing are functional. All three built-in constraints now
> compute verdicts from trace content and config thresholds. The web UI now
> includes Timeline and CI Gate tabs, artifact states, auto-loaded sample data,
> and Phosphor icons. See Section 14 for current limitations.

**Single file**: All logic — argument parsing, config loading, trace parsing,
constraint evaluation, and output rendering — lives in `src/main.rs`. There are
no modules, no workspace members, and no external crates.

**Web UI surface**: A separate client-only frontend lives in `web/` (Vite +
React + Tailwind). It provides a cinematic landing page and an interactive
control room for `pinzit_verdict.json` + `pinzit_stats.csv` analysis.

**Where to start for common tasks**:

| Task                           | Where to look                           |
|--------------------------------|-----------------------------------------|
| Add / change a CLI flag        | `parse_args()`                           |
| Add / change a config key      | `Config` struct, `parse_config()`        |
| Change constraint logic        | `evaluate_slfs()`, `evaluate_rtcb()`, `evaluate_brc()` |
| Add a new constraint           | Section 12 of this file                  |
| Add a test                     | `mod tests` block at bottom of `main.rs` |
| Understand output format       | Section 8 of this file                  |
| Modify landing/dashboard UI    | `web/src/components/landing/*`, `web/src/components/*` |
| Demo/mock run generation       | `web/src/lib/demo-mock.ts`              |
| Frontend store + persistence   | `web/src/store/run-store.ts`            |
| QA gate / icon policy          | `docs/product/QA_GPT_TASTE_GATE.md`     |

---

## 1. Project Overview

Pinzit is a **Trace-Native Reliability Intelligence CLI** written in Rust. It
ingests [OpenTelemetry](https://opentelemetry.io/) JSON traces and evaluates
them against configurable safety constraints, producing **CI-ready verdicts and
auditor-grade reports** in HTML, JSON, and CSV formats.

**Core Philosophy**: Read-only analysis. **No side effects.** Pinzit evaluates
systems but never acts on them — it has no network access, no LLM integration,
and never mutates runtime systems or input files.

**Target audience for reports**: SRE, Platform Engineering, Observability,
Security Engineering, and Reliability/Systems Architecture teams.

**Design rationale for zero dependencies**: The `[dependencies]` section in
`Cargo.toml` is intentionally empty. All parsers (CLI args, TOML config, JSON
output rendering) are hand-rolled using only `std`. This eliminates supply-chain
risk, keeps the binary fully self-contained, and ensures the tool works in
air-gapped CI environments. Before adding any external crate, get explicit
approval — this is a core constraint of the project.

---

## 2. Technology Stack

| Component             | Technology                              | Notes                          |
|-----------------------|-----------------------------------------|--------------------------------|
| Language              | Rust (Edition 2021)                     | Minimum version: 1.65+         |
| Build Tool            | Cargo                                   | Tested with Cargo 1.93.0       |
| Rust Compiler         | rustc                                   | Tested with rustc 1.93.0       |
| External Dependencies | **None** — `std` library only           | Intentional; see Section 1     |
| Input Format          | OpenTelemetry JSON traces               | Shape-validated, not full-parsed |
| Config Format         | Custom TOML subset (hand-rolled parser) | 14 required keys               |
| Output Formats        | HTML, JSON, CSV                         | Manually rendered via `format!()` |
| `std` modules used    | `collections`, `env`, `fs`, `path`      | No other `std` modules needed  |

### Frontend Stack (`web/`)

| Component              | Technology                               | Notes |
|------------------------|------------------------------------------|-------|
| Build tool             | Vite                                     | Main chunk guard enforced (`<=220KB`) |
| UI framework           | React 18 + TypeScript                    | Client-only, no backend |
| Styling                | Tailwind CSS + custom CSS tokens         | Shared panel language across landing/dashboard |
| Motion                 | Framer Motion + CSS keyframes            | Reduced-motion safe |
| 3D atmosphere          | Three.js via React Three Fiber           | Split chunk (`three-r3f`), graceful context-loss fallback, WebGL detection |
| State                  | Zustand                                  | Persisted key: `pinzit-ui-v1` |
| Icons                  | `@phosphor-icons/react`                  | `weight="duotone"` or `weight="bold"` standard |
| Fonts                  | Geist (preferred), IBM Plex Sans, system-ui | No Inter, no serif in dashboard |

---

## 3. Project Structure

```text
.
├── Cargo.toml              # Package manifest (name: pinzit, v0.1.0)
├── Cargo.lock              # Dependency lockfile (no external crates)
├── src/
│   └── main.rs             # Entire application — single file
├── web/
│   ├── src/
│   │   ├── Root.tsx        # Landing/dashboard view switcher
│   │   ├── App.tsx         # Control room dashboard shell
│   │   ├── components/     # Landing + dashboard UI components
│   │   │   ├── ci-gate/    # CI Gate tab
│   │   │   ├── timeline/   # Timeline tab + trace-native views
│   │   │   └── shared/     # ArtifactStates, EmptyState, etc.
│   │   └── lib/demo-mock.ts# Shared realistic mock-run generator
│   └── vite.config.ts      # Chunk splitting + bundle guard plugin
├── examples/
│   ├── trace.json          # Minimal OpenTelemetry trace (1 resourceSpan)
│   └── pinzit.toml         # Complete config with all constraint sections
├── docs/
│   └── product/
│       └── QA_GPT_TASTE_GATE.md
├── .gitignore              # Ignores /target and /pinzit_out
├── README.md               # User-facing documentation and positioning
└── AGENTS.md               # This file
```

### Architecture Notes

- **Single-file design** — All logic lives in `src/main.rs`. This is
  intentional; the project is designed to be minimal and focused.
- **Zero external dependencies** — Only `std` is used (`std::collections`,
  `std::env`, `std::fs`, `std::path`).
- **Hand-rolled parsers** — CLI args, TOML config, and JSON output rendering
  are all manually implemented without crates.
- **Two data structs** — `Cli` holds parsed CLI arguments;
  `Config` holds all config values.

### Data Flow

```mermaid
flowchart LR
    A["trace.json"] --> C["run()"]
    B["pinzit.toml"] --> C
    C --> D["Evaluate Constraints"]
    D --> E["pinzit_verdict.json"]
    D --> F["pinzit_stats.csv"]
    D --> G["pinzit_constraints.csv"]
    D --> H["pinzit_report.html"]
```

### Key Functions (by line range in `main.rs`)

| Function                          | Purpose                                                           |
|-----------------------------------|-------------------------------------------------------------------|
| `main()`                          | Entry point, delegates to `parse_args` and `run`                  |
| `parse_args()`                    | Manual CLI argument parsing                                       |
| `run()`                           | Core logic: load config, validate trace, evaluate constraints, write outputs |
| `validate_json_shape()`           | Checks trace starts/ends with `{` / `}`                           |
| `parse_config()`                  | Hand-rolled TOML key-value parser                                 |
| `get_raw/string/u64/bool/array()` | Config value accessor helpers                                     |
| `quote_json()`                    | JSON string escaping utility                                      |
| `render_constraint_json()`        | Builds per-constraint JSON fragment                               |
| `write_json()`                    | Writes `pinzit_verdict.json` with metadata, summary, timeline, graph |
| `write_csv()`                     | Writes `pinzit_stats.csv`                                         |
| `write_constraints_csv()`         | Writes `pinzit_constraints.csv`                                   |
| `write_html()`                    | Writes `pinzit_report.html` with executive summary and timeline   |
| `tests` module                    | Unit tests (14 tests)                                             |

> Use `grep` or your editor's search to locate functions by name.

---

## 4. Build and Test Commands

```bash
# Build (debug)
cargo build

# Build (release, optimized)
cargo build --release

# Run all tests
cargo test

# Run tests with stdout output
cargo test -- --nocapture

# Run a specific test by name
cargo test parses_arrays

# Check formatting (does not modify files)
cargo fmt --check

# Apply formatting
cargo fmt

# Run linter
cargo clippy

# Run with example data
cargo run -- \
  --trace ./examples/trace.json \
  --config ./examples/pinzit.toml \
  --outdir ./pinzit_out \
  --format html,json,csv

# Install the binary locally
cargo install --path .

# Frontend: run local UI
cd web
npm install
npm run dev

# Frontend: enforce type + bundle guard
npm run typecheck
npm run build:guard
```

> **Expected test output**: 14+ passed, 0 failed, 0 ignored.
>
> `cargo clippy` should report no warnings. `cargo fmt --check` should exit
> cleanly. If either fails, fix the issue before submitting changes.

---

## 5. CLI Interface

### Usage

```bash
pinzit --trace <path> [--config pinzit.toml] [--outdir ./pinzit_out] [--format html,json,csv] [--fail-fast] [--no-recommend]
```

### Flags

| Flag             | Required | Default          | Description                                              |
|------------------|----------|------------------|----------------------------------------------------------|
| `--trace`        | **Yes**  | —                | Path to OpenTelemetry JSON trace                         |
| `--config`       | No       | `pinzit.toml`    | Path to configuration file                               |
| `--outdir`       | No       | `./pinzit_out`   | Output directory for reports                             |
| `--format`       | No       | `html,json,csv`  | Comma-separated output formats                           |
| `--fail-fast`    | No       | `false`          | Stop evaluating additional constraints after first FAIL   |
| `--no-recommend` | No       | `false`          | Suppress recommendations in output                       |
| `--help`, `-h`   | No       | —                | Show one-line usage and exit                             |

### Exit Codes

| Code | Meaning                                      |
|------|----------------------------------------------|
| `0`  | PASS — All constraints satisfied             |
| `1`  | FAIL — One or more constraints violated      |
| `2`  | Config/parse error — Invalid input or config |

> **Note**: `--fail-fast` short-circuits later constraint evaluation after the
> first failing constraint. In JSON output, skipped constraints are marked as
> `SKIPPED`.

---

## 6. Configuration Format (`pinzit.toml`)

### Full Example (from `examples/pinzit.toml`)

```toml
[meta]
audit_name = "Production Trace"
auditor = "Pinzit v0.1.0"
standard = "IEC-61508"

[constraints.slfs_001]
signal_loss_timeout_ms = 500
safe_state_deadline_ms = 250
unsafe_action_patterns = ["motion", "punch", "actuate", "write", "commit"]
safe_state_patterns = ["halt", "brake", "safe", "readonly", "degraded"]

[constraints.rtcb_002]
max_recovery_ms = 30000
recovery_span_name = "system.recovery"
recovery_attribute = "recovery.complete"
stability_check = true

[constraints.brc_003]
max_propagation_hops = 2
containment_timeout_ms = 2000
isolation_boundary_attribute = "fault.isolation"
```

### Parser Behavior

The parser (`parse_config`) is a simplified TOML reader:

- **Ignores**: blank lines, lines starting with `#` (comments), lines starting
  with `[` (section headers).
- **Reads**: `key = value` pairs. Section headers are ignored — all keys must
  be globally unique.
- **Supported types**: quoted strings, integers, booleans (`true`/`false`),
  arrays (`["item1", "item2"]`).
- **All 14 config keys are required** — a missing key produces an error
  (`missing config key: {key}`).

### Required Config Keys (mapped to `Config` struct fields)

| TOML Key                        | Rust Field                           | Type          |
|---------------------------------|--------------------------------------|---------------|
| `audit_name`                    | `audit_name`                         | `String`      |
| `auditor`                       | `auditor`                            | `String`      |
| `standard`                      | `standard`                           | `String`      |
| `signal_loss_timeout_ms`        | `slfs_signal_loss_timeout_ms`        | `u64`         |
| `safe_state_deadline_ms`        | `slfs_safe_state_deadline_ms`        | `u64`         |
| `unsafe_action_patterns`        | `slfs_unsafe_action_patterns`        | `Vec<String>` |
| `safe_state_patterns`           | `slfs_safe_state_patterns`           | `Vec<String>` |
| `max_recovery_ms`               | `rtcb_max_recovery_ms`               | `u64`         |
| `recovery_span_name`            | `rtcb_recovery_span_name`            | `String`      |
| `recovery_attribute`            | `rtcb_recovery_attribute`            | `String`      |
| `stability_check`               | `rtcb_stability_check`               | `bool`        |
| `max_propagation_hops`          | `brc_max_propagation_hops`           | `u64`         |
| `containment_timeout_ms`        | `brc_containment_timeout_ms`         | `u64`         |
| `isolation_boundary_attribute`  | `brc_isolation_boundary_attribute`   | `String`      |

---

## 7. Built-in Constraints

Three constraint categories are implemented. Each produces a JSON object with
`verdict`, `metrics`, `evidence_spans`, and `recommendations`.

### SLFS-001 — Fail-Safe Fallback

Ensures unsafe operations do not occur after telemetry loss unless a safe state
is confirmed within the allowed window.

- **Config keys**: `signal_loss_timeout_ms`, `safe_state_deadline_ms`,
  `unsafe_action_patterns`, `safe_state_patterns`
- **Evidence span**: `trace.span.signal_loss`
- **Recommendation**: "Block unsafe operations when telemetry age exceeds
  threshold."

### RTCB-002 — Recovery Time Bound

Verifies the system reaches a stable state within a declared recovery ceiling.

- **Config keys**: `max_recovery_ms`, `recovery_span_name`,
  `recovery_attribute`, `stability_check`
- **Evidence span**: `trace.span.system.recovery`
- **Recommendation**: "Cap retry backoff and bound readiness checks."

### BRC-003 — Blast Radius Containment

Detects failures propagating beyond isolation boundaries or hop limits.

- **Config keys**: `max_propagation_hops`, `containment_timeout_ms`,
  `isolation_boundary_attribute`
- **Evidence span**: `trace.span.fault.isolation`
- **Recommendation**: "Introduce bulkheads and fan-out limits."

Constraint verdicts are evaluated from parsed span data and config thresholds.

---

## 8. Output Files

| File                   | Format | Description                                          |
|------------------------|--------|------------------------------------------------------|
| `pinzit_verdict.json`  | JSON   | Machine-readable verdict with metadata, summary, timeline, graph |
| `pinzit_stats.csv`     | CSV    | Flat metrics (`resource_span_markers`, `parsed_span_count`, `overall_verdict`) |
| `pinzit_constraints.csv` | CSV  | One row per constraint with threshold, observed, evidence count |
| `pinzit_report.html`   | HTML   | Self-contained audit report with executive summary and timeline |

### JSON Verdict Structure

```json
{
  "metadata": {
    "run_id": "pinzit_1714651200_123456789",
    "generated_at": "1714651200",
    "trace_file": "./examples/trace.json",
    "config_file": "./examples/pinzit.toml",
    "pinzit_version": "0.1.0"
  },
  "summary": {
    "overall_verdict": "PASS",
    "parsed_span_count": 182,
    "failed_constraint_count": 0,
    "critical_path_ms": 4312,
    "max_propagation_hops_seen": 2
  },
  "constraints": {
    "brc_003": { "verdict": "PASS", "metrics": {...}, "evidence_spans": [...], "recommendations": [...] },
    "rtcb_002": { "verdict": "PASS", "metrics": {...}, "evidence_spans": [...], "recommendations": [...] },
    "slfs_001": { "verdict": "PASS", "metrics": {...}, "evidence_spans": [...], "recommendations": [...] }
  },
  "timeline": [...],
  "graph": { "nodes": [...], "edges": [...] }
}
```

> Constraint keys in the JSON output are sorted alphabetically because
> `BTreeMap` is used internally. This ordering is deterministic and
> intentional.

### CSV Format

The current CSV output (`pinzit_stats.csv`) writes metric/value rows:

```csv
metric,value
resource_span_markers,<count>
parsed_span_count,<count>
overall_verdict,<PASS|FAIL>
```

`resource_span_markers` is the number of times the string `"resourceSpans"`
appears in the raw trace file (string matching, not parsed JSON).

`pinzit_constraints.csv` writes one row per constraint:

```csv
constraint_id,verdict,metric,threshold,observed,evidence_count,recommendation_count
```

### HTML Format

The HTML report is self-contained — no external CSS or JavaScript dependencies.
It lists audit metadata, executive summary, parsed span metrics, per-constraint
detail table, incident timeline, graph summary, and CI gate block.

---

## 9. Testing Strategy

### Existing Tests

Tests are in the `#[cfg(test)] mod tests` block at the bottom of `main.rs`.
Current tests:

| Test Name               | What It Validates                                           |
|-------------------------|-------------------------------------------------------------|
| `parses_arrays`         | `get_array()` correctly parses `["a", "b"]`                 |
| `validates_json_shape`  | `validate_json_shape()` accepts `{...}`, rejects non-object |
| `parses_full_config`    | `parse_config()` loads all required keys                    |
| `run_returns_fail_exit_code_on_constraint_failure` | `run()` returns `1` on a violating trace |
| `parse_args_requires_trace` | `parse_args()` errors when `--trace` is missing          |
| `parse_args_parses_all_flags` | `parse_args()` parses all CLI flags correctly            |
| `invalid_config_missing_key` | `parse_config()` errors on missing required keys          |
| `invalid_json_shape_rejects_array` | `validate_json_shape()` rejects arrays and plain text  |
| `slfs_boundary_no_unsafe_actions_passes` | SLFS passes when no unsafe actions follow signal loss |
| `rtcb_boundary_within_limit_passes` | RTCB passes when recovery is within threshold             |
| `rtcb_boundary_over_limit_fails` | RTCB fails when recovery exceeds threshold                 |
| `brc_propagation_within_hops_passes` | BRC passes when hops are within limit                     |
| `brc_propagation_exceeds_hops_fails` | BRC fails when hops exceed limit                          |
| `writers_produce_files` | `write_json`, `write_csv`, `write_constraints_csv`, `write_html` all produce files |

### Running Tests

```bash
cargo test                   # All tests
cargo test -- --nocapture    # With stdout
cargo test parses_arrays     # Specific test
```

### Adding New Tests

Append to the `mod tests` block at the bottom of `main.rs`:

```rust
#[test]
fn my_new_test() {
    // ...
}
```

### Areas Without Tests (Priority Order)

| Priority | Area                            | Why it matters                                    |
|----------|---------------------------------|---------------------------------------------------|
| P1       | End-to-end pipeline             | Trace in → output files out                       |
| P2       | Frontend rendering              | Component states, tab switching, artifact states  |

---

## 10. Code Style Guidelines

### Diagrams in Markdown

- **Use Mermaid.js** for all diagrams in `.md` files. Do not use ASCII art.
- Mermaid renders natively on GitHub and most modern Markdown viewers.
- Wrap diagrams in ` ```mermaid ` fenced code blocks.

### General Principles

- **Single file**: All logic stays in `src/main.rs`. Do not split without good reason.
- **No external crates**: Implement it yourself or use `std`. The `[dependencies]`
  section in `Cargo.toml` is intentionally empty.
- **Explicit over clever**: The custom parsers are verbose but readable.
- **No `unsafe` code**: All code must compile with safe Rust only.

### Naming Conventions

| Item                  | Convention                   | Example                        |
|-----------------------|------------------------------|--------------------------------|
| Functions             | `snake_case`                 | `parse_config`, `get_array`    |
| Variables             | `snake_case`                 | `span_count`                   |
| Structs               | `PascalCase`                 | `Cli`, `Config`                |
| Constants             | `SCREAMING_SNAKE_CASE`       | (none currently)               |
| Constraint IDs        | `{category}_{number}`        | `slfs_001`, `rtcb_002`         |
| Config struct fields  | Prefixed by constraint ID    | `slfs_signal_loss_timeout_ms`  |

### Error Handling

- Use `Result<T, String>` for fallible functions.
- Error messages should be actionable: `"failed to read {path}: {error}"`.
- Fatal errors call `std::process::exit(2)` from `main()`.
- Helper `get_*` functions return descriptive errors:
  `"missing config key: {key}"`, `"invalid integer for {key}: {raw}"`.

### String / JSON Handling

- The codebase uses owned `String` types extensively (not `&str`).
- JSON output is built via manual `format!()` string concatenation — no
  serialization crate.
- JSON strings are escaped via `quote_json()`.
- Constraint ordering in JSON output uses `BTreeMap` for deterministic key order.

### Formatting and Lint

- Run `cargo fmt` before committing. The project follows default `rustfmt`
  settings with no custom `rustfmt.toml`.
- Run `cargo clippy` and resolve all warnings before submitting. The project
  targets zero clippy warnings.

---

## 11. Security Considerations

- **Read-only by design**: Pinzit never writes to the trace file or mutates
  runtime systems.
- **No network access**: The binary makes zero network requests.
- **No LLM integration**: Recommendations are deterministic, rule-based, and
  statically defined in source code. Output is fully reproducible given the
  same inputs.
- **Minimal input validation**: JSON is validated only for outer `{` / `}`
  shape — there is no full JSON parser. Malformed trace content beyond that
  boundary will not cause a panic but will produce inaccurate metrics.
- **No `unsafe` code**: The entire codebase uses safe Rust.
- **Path handling**: Uses `std::path::PathBuf` for cross-platform path safety.
- **No environment variable secrets**: The application reads no environment
  variables beyond CLI args.
- **Supply-chain security**: Zero external dependencies is a deliberate
  security posture. Adding a dependency opens the supply chain to that
  crate's transitive dependency graph. This risk is unacceptable for a tool
  intended to run in CI pipelines auditing safety-critical systems.
- **Output directory**: The tool creates the output directory if it does not
  exist (`std::fs::create_dir_all`). Verify the `--outdir` path before running
  in production environments.

---

## 12. Adding New Constraints

To add a new constraint (e.g., `xyz_004`):

1. **Add config fields** to the `Config` struct:

   ```rust
   // XYZ-004 fields
   xyz_some_threshold_ms: u64,
   xyz_some_pattern: String,
   ```

2. **Parse the new fields** in `parse_config()` using the `get_*` helpers:

   ```rust
   xyz_some_threshold_ms: get_u64(&raw, "some_threshold_ms")?,
   xyz_some_pattern: get_string(&raw, "some_pattern")?,
   ```

3. **Add the constraint evaluation function** (e.g., `evaluate_xyz`) and call
   it from `run()` with `constraints.insert(...)`:

   ```rust
   let xyz = evaluate_xyz(&config, &spans, recommendations_enabled);
   constraints.insert(
       "xyz_004".to_string(),
       xyz,
   );
   ```

4. **Add the new TOML keys** to `examples/pinzit.toml` under a new constraint
   section.

5. **Add tests** in the `mod tests` block at the bottom of `main.rs`.

6. **Document** the new constraint in `AGENTS.md` Section 7 and `README.md`.

---

## 13. CI Integration

Pinzit is designed for CI/CD pipelines. Example GitHub Actions workflow:

```yaml
name: Pinzit Verdict
on: [pull_request]

jobs:
  pinzit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
      - name: Build
        run: cargo build --release
      - name: Run analysis
        run: |
          cargo run --release -- \
            --trace ./trace.json \
            --config ./pinzit.toml \
            --outdir ./pinzit_out
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: pinzit-report
          path: ./pinzit_out/
```

The process exits with code `0` (PASS) or `1` (FAIL), making it suitable as a
CI gate. Exit code `2` indicates a configuration or parsing error.

> **Note for CI integrations**: Verdicts now reflect evaluated constraints.
> Keep in mind parsing remains heuristic (see Section 14), so malformed or
> highly non-standard trace JSON may produce inaccurate analysis.

---

## 14. Known Limitations and TODOs

These are factual observations from the current source code, in priority order:

| Priority | Limitation                         | Detail                                                                                                   |
|----------|------------------------------------|----------------------------------------------------------------------------------------------------------|
| P0       | **Heuristic JSON parsing**         | Trace is not fully schema-validated; parser uses targeted key/array/object extraction from raw JSON.    |
| P1       | **Constraint heuristics**          | SLFS/RTCB/BRC rely on naming/attribute conventions and may need tightening for varied trace producers.  |
| P2       | **Rust modularization**            | `src/main.rs` is intentionally single-file today; future modularization should preserve zero dependencies. |
| P2       | **Frontend state coverage**        | All key states are implemented, but visual regression tests are not yet automated.                       |

---

## 15. Development Checklist

Before submitting changes:

- [ ] `cargo test` passes (all 14+ tests)
- [ ] `cargo build` succeeds with **no warnings**
- [ ] `cargo clippy` reports no warnings
- [ ] `cargo fmt --check` exits cleanly (no formatting diffs)
- [ ] `cargo run -- --help` displays usage correctly
- [ ] Example command runs without errors:

  ```bash
  cargo run -- --trace ./examples/trace.json --config ./examples/pinzit.toml --outdir ./test_out --format html,json,csv
  ```

- [ ] Expected output files are generated in `./test_out/` (including `pinzit_constraints.csv`)
- [ ] Exit codes behave correctly (`0` = PASS, `1` = FAIL, `2` = error)
- [ ] No external crates added to `Cargo.toml` without explicit approval
- [ ] New constraints are documented in Section 7 of this file and in `README.md`
- [ ] `npm run typecheck` passes in `web/`
- [ ] `npm run build:guard` passes in `web/` (main chunk <= 220KB)
- [ ] No `lucide-react` imports remain in `web/src`
- [ ] No emojis or bullet characters (`•`) in UI code/markup

---

## 16. Glossary

| Term                  | Definition                                                                         |
|-----------------------|------------------------------------------------------------------------------------|
| **OTel / OpenTelemetry** | Open-source observability framework; defines trace, metric, and log formats.    |
| **Trace**             | A JSON document representing a distributed request journey as a tree of spans.     |
| **Span**              | A single timed operation within a trace, with a name, duration, and attributes.    |
| **resourceSpans**     | The top-level key in an OTel JSON trace grouping spans by resource.                |
| **SLFS-001**          | Fail-Safe Fallback: checks that unsafe actions are blocked after signal loss.      |
| **RTCB-002**          | Recovery Time Bound: checks that system recovery completes within a time ceiling.  |
| **BRC-003**           | Blast Radius Containment: checks that fault propagation stays within boundaries.   |
| **Verdict**           | Binary outcome of a constraint evaluation: `PASS` or `FAIL`.                      |
| **Evidence span**     | A named span in the trace used as proof for a constraint decision.                 |
| **Scaffolded**        | Code that compiles and runs but contains placeholder logic (hardcoded results).    |
| **IEC-61508**         | International safety standard for electrical/electronic/programmable systems.     |

---

## 17. License

MIT
