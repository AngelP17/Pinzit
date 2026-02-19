# Pinzit — Trace-Native Reliability Intelligence

> **SRE / Platform / Observability / Security**
>
> Pinzit converts OpenTelemetry traces into **incident timelines, compliance
> verdicts, and deterministic recommended actions** — producing CI-ready
> artifacts and auditor-grade reports **without executing, orchestrating, or
> mutating runtime systems**.

---

## Why Pinzit Exists

Modern systems already emit massive amounts of telemetry (OpenTelemetry,
Datadog, Grafana). Incident-management platforms coordinate humans
(PagerDuty, Rootly).

**What’s missing is judgment.**

Pinzit lives in the gap between **telemetry** and **truth**.

It answers questions that dashboards and runbooks don’t:

1. What actually failed first?
2. How did the failure propagate?
3. Did the system recover *within required bounds*?
4. Which invariants were violated?
5. What concrete changes would have prevented or mitigated the outcome?

Pinzit does not act on systems.
It **evaluates** them.

---

## What Pinzit Is

| ✓ | Capability |
|---|------------|
| ✓ | **Read-only analysis engine** for distributed-systems telemetry |
| ✓ | **Causal graph reconstruction** from OpenTelemetry traces |
| ✓ | **Constraint-based verdicts** (`PASS` / `FAIL`) |
| ✓ | **Incident timeline reconstruction** |
| ✓ | **Static, deterministic recommendations** (auditor-safe) |
| ✓ | **Multi-format reporting**: HTML · JSON · CSV |
| ✓ | **CI-ready** (exit codes + machine-readable output) |

---

## What Pinzit Is Not

- Not an incident commander
- Not on-call paging
- Not a runbook executor
- Not an auto-healer
- Not a control plane
- Not a monitoring dashboard replacement

Pinzit has **no side effects**.
It reads telemetry, produces evidence, and exits.

---

## 30-Second Positioning

> Telemetry tells you *what happened*.
> Runbooks tell you *what to do*.
> **Pinzit tells you whether the system behaved correctly — and why it didn’t.**

---

## Project Definition

| Field | Value |
|------|------|
| **Name** | `pinzit` |
| **Binary** | `pinzit` |
| **Tagline** | Trace-Native Reliability Intelligence |
| **Type** | Rust CLI |
| **Inputs** | OpenTelemetry JSON trace + `pinzit.toml` |
| **Outputs (default)** | HTML · JSON · CSV |
| **Exit codes** | `0` = PASS · `1` = FAIL · `2` = config/parse error |

---

## Installation

```bash
cargo install --path .
```

## Quick Start

```bash
cargo run -- \
  --trace ./examples/trace.json \
  --config ./examples/pinzit.toml \
  --outdir ./pinzit_out \
  --format html,json,csv
```

---

## CLI Usage

```bash
pinzit \
  --trace ./trace.json \
  --config ./pinzit.toml \
  --outdir ./pinzit_out \
  --format html,json,csv \
  --fail-fast
```

### Flags

| Flag | Description |
|---|---|
| `--trace` | Path to OpenTelemetry JSON trace |
| `--config` | Config file (default: `pinzit.toml`) |
| `--outdir` | Output directory |
| `--format` | Output formats (`html,json,csv`) |
| `--fail-fast` | Exit on first violation |
| `--no-recommend` | Disable recommendations |

---

## Configuration (`pinzit.toml`)

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

---

## Built-In Constraints (v1)

### SLFS-001 — Fail-Safe Fallback

Ensures unsafe operations do not occur after telemetry loss unless a safe state is confirmed within the allowed window.

### RTCB-002 — Recovery Time Bound

Verifies the system reaches a stable state within a declared recovery ceiling.

### BRC-003 — Blast Radius Containment

Detects failures propagating beyond isolation boundaries or hop limits.

Each constraint yields:

- Binary verdict
- Quantitative metrics
- Evidence spans
- Deterministic recommendations

---

## Outputs

### `pinzit_verdict.json`

Machine-readable verdict for CI and automation.

Includes:

- Overall verdict
- Per-constraint results
- Metrics (latency, blast radius, recovery time)
- Evidence spans
- Recommended actions

### `pinzit_stats.csv`

Flat metrics export for spreadsheets and BI tools.

### `pinzit_report.html`

Human-readable audit report containing:

- Executive summary
- Constraint results
- Evidence tables
- Recommendations
- Reconstructed causal timeline

Single-file, self-contained, auditor-friendly.

---

## Recommendations Engine

Pinzit generates static, deterministic recommendations based on violation type. No LLMs, no network calls, no non-reproducible output.

Examples:

- Fail-Safe violation
  - Block unsafe operations when telemetry age exceeds threshold
- Recovery violation
  - Cap retry backoff, bound readiness checks, use progressive degradation
- Blast radius violation
  - Introduce bulkheads, isolate pools, limit fan-out

Recommendations are advisory only.
Pinzit never executes changes.

---

## CI Integration (GitHub Actions)

```yaml
name: Pinzit Verdict

on: [pull_request]

jobs:
  pinzit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cargo install --path .
      - run: pinzit --trace ./trace.json --outdir ./pinzit_out
      - uses: actions/upload-artifact@v4
        with:
          name: pinzit-report
          path: ./pinzit_out/
```

Fail the build automatically if the verdict is FAIL.

---

## Architecture Boundary

| Concern | Pinzit | Control Planes |
|---|---|---|
| Mode | Read-only | Runtime |
| Input | Trace exports | Live streams |
| Output | Verdicts & reports | Actions |
| Side effects | None | Yes |
| CI suitability | High | Low |

Pinzit evaluates systems.
Other tools act on them.

---

## Target Roles

Pinzit is designed to signal strength for:

- Site Reliability Engineering (SRE)
- Platform Engineering
- Observability Engineering
- Security Engineering (detection / invariants)
- Reliability / Systems Architecture

It is intentionally Staff-shaped, but credible for strong Senior roles.

---

## License

MIT

---

## Summary

Pinzit is not another dashboard.
It is not another control plane.

It is a judge — converting telemetry into evidence, verdicts, and actionable insight.

Systems that can’t be evaluated can’t be trusted.

---

### What you now have

- A **finalized product identity**
- A **clean separation from CellGuard**
- A **credible SRE/Platform/Obs/Sec tool**
- A **Codex-ready spec + README**
- A **Staff-level portfolio artifact**

If you want, next logical steps are:

- `ARCHITECTURE.md` (1 page, no diagrams)
- A single example trace + report checked into `/examples`
- Tightening the HTML report visuals

But as-is: **this is ship-ready**.
