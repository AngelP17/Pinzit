use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
struct Cli {
    trace: PathBuf,
    config: PathBuf,
    outdir: PathBuf,
    format: String,
    fail_fast: bool,
    no_recommend: bool,
}

#[derive(Debug, Clone)]
struct Config {
    audit_name: String,
    auditor: String,
    standard: String,
    slfs_signal_loss_timeout_ms: u64,
    slfs_safe_state_deadline_ms: u64,
    slfs_unsafe_action_patterns: Vec<String>,
    slfs_safe_state_patterns: Vec<String>,
    rtcb_max_recovery_ms: u64,
    rtcb_recovery_span_name: String,
    rtcb_recovery_attribute: String,
    rtcb_stability_check: bool,
    brc_max_propagation_hops: u64,
    brc_containment_timeout_ms: u64,
    brc_isolation_boundary_attribute: String,
}

#[derive(Debug, Clone)]
struct SpanRecord {
    name: String,
    span_id: Option<String>,
    parent_span_id: Option<String>,
    start_ns: Option<u64>,
    end_ns: Option<u64>,
    attributes: BTreeMap<String, String>,
}

#[derive(Debug, Clone)]
struct ConstraintResult {
    verdict: String,
    metrics: Vec<(String, String)>,
    evidence_spans: Vec<String>,
    recommendations: Vec<String>,
}

#[derive(Debug, Clone)]
struct Metadata {
    run_id: String,
    generated_at: String,
    trace_file: String,
    config_file: String,
    pinzit_version: String,
}

#[derive(Debug, Clone)]
struct Summary {
    overall_verdict: String,
    parsed_span_count: usize,
    failed_constraint_count: u64,
    critical_path_ms: u64,
    max_propagation_hops_seen: u64,
}

#[derive(Debug, Clone)]
struct TimelineEvent {
    timestamp_ns: u64,
    span_id: String,
    parent_span_id: Option<String>,
    name: String,
    event_type: String,
    severity: String,
    constraint_refs: Vec<String>,
}

#[derive(Debug, Clone)]
struct TraceNode {
    id: String,
    label: String,
    kind: String,
    verdict: String,
    duration_ms: u64,
}

#[derive(Debug, Clone)]
struct TraceEdge {
    source: String,
    target: String,
    kind: String,
    latency_ms: u64,
}

#[derive(Debug, Clone)]
struct TraceGraph {
    nodes: Vec<TraceNode>,
    edges: Vec<TraceEdge>,
}

fn main() {
    let cli = match parse_args(env::args().collect()) {
        Ok(cli) => cli,
        Err(err) => {
            eprintln!("{err}");
            std::process::exit(2);
        }
    };

    match run(&cli) {
        Ok(exit_code) => std::process::exit(exit_code),
        Err(err) => {
            eprintln!("{err}");
            std::process::exit(2);
        }
    }
}

fn parse_args(args: Vec<String>) -> Result<Cli, String> {
    if args.len() == 2 && (args[1] == "--help" || args[1] == "-h") {
        println!(
            "pinzit --trace <path> [--config pinzit.toml] [--outdir ./pinzit_out] [--format html,json,csv] [--fail-fast] [--no-recommend]"
        );
        std::process::exit(0);
    }

    let mut trace: Option<PathBuf> = None;
    let mut config = PathBuf::from("pinzit.toml");
    let mut outdir = PathBuf::from("./pinzit_out");
    let mut format = String::from("html,json,csv");
    let mut fail_fast = false;
    let mut no_recommend = false;

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--trace" => {
                i += 1;
                let Some(value) = args.get(i) else {
                    return Err("missing value for --trace".to_string());
                };
                trace = Some(PathBuf::from(value));
            }
            "--config" => {
                i += 1;
                let Some(value) = args.get(i) else {
                    return Err("missing value for --config".to_string());
                };
                config = PathBuf::from(value);
            }
            "--outdir" => {
                i += 1;
                let Some(value) = args.get(i) else {
                    return Err("missing value for --outdir".to_string());
                };
                outdir = PathBuf::from(value);
            }
            "--format" => {
                i += 1;
                let Some(value) = args.get(i) else {
                    return Err("missing value for --format".to_string());
                };
                format = value.clone();
            }
            "--fail-fast" => fail_fast = true,
            "--no-recommend" => no_recommend = true,
            unknown => return Err(format!("unknown argument: {unknown}")),
        }
        i += 1;
    }

    let trace = trace.ok_or_else(|| "--trace is required".to_string())?;

    Ok(Cli {
        trace,
        config,
        outdir,
        format,
        fail_fast,
        no_recommend,
    })
}

fn run(cli: &Cli) -> Result<i32, String> {
    let config_raw = fs::read_to_string(&cli.config)
        .map_err(|e| format!("failed to read {}: {e}", cli.config.display()))?;
    let config = parse_config(&config_raw)?;

    let trace_raw = fs::read_to_string(&cli.trace)
        .map_err(|e| format!("failed to read {}: {e}", cli.trace.display()))?;
    validate_json_shape(&trace_raw)?;

    fs::create_dir_all(&cli.outdir)
        .map_err(|e| format!("failed to create {}: {e}", cli.outdir.display()))?;

    let span_count = trace_raw.matches("resourceSpans").count();
    let spans = parse_spans(&trace_raw);
    let recommendations_enabled = !cli.no_recommend;

    let mut constraints = BTreeMap::new();
    let mut overall_verdict = "PASS".to_string();

    let slfs = evaluate_slfs(&config, &spans, recommendations_enabled);
    if slfs.verdict == "FAIL" {
        overall_verdict = "FAIL".to_string();
    }
    constraints.insert("slfs_001".to_string(), slfs);

    if !(cli.fail_fast && overall_verdict == "FAIL") {
        let rtcb = evaluate_rtcb(&config, &spans, recommendations_enabled);
        if rtcb.verdict == "FAIL" {
            overall_verdict = "FAIL".to_string();
        }
        constraints.insert("rtcb_002".to_string(), rtcb);
    } else {
        constraints.insert(
            "rtcb_002".to_string(),
            skipped_constraint("Skipped due to --fail-fast after slfs_001 failure"),
        );
    }

    if !(cli.fail_fast && overall_verdict == "FAIL") {
        let brc = evaluate_brc(&config, &spans, recommendations_enabled);
        if brc.verdict == "FAIL" {
            overall_verdict = "FAIL".to_string();
        }
        constraints.insert("brc_003".to_string(), brc);
    } else {
        constraints.insert(
            "brc_003".to_string(),
            skipped_constraint("Skipped due to --fail-fast after earlier failure"),
        );
    }

    let failed_constraint_count =
        constraints.values().filter(|c| c.verdict == "FAIL").count() as u64;
    let critical_path_ms = spans.iter().filter_map(span_duration_ms).max().unwrap_or(0);
    let max_propagation_hops_seen = constraints
        .get("brc_003")
        .and_then(|c| c.metrics.iter().find(|(k, _)| k == "max_hops_seen"))
        .and_then(|(_, v)| v.parse().ok())
        .unwrap_or(0);

    let metadata = build_metadata(cli);
    let summary = Summary {
        overall_verdict: overall_verdict.clone(),
        parsed_span_count: spans.len(),
        failed_constraint_count,
        critical_path_ms,
        max_propagation_hops_seen,
    };
    let timeline = build_timeline(&spans, &constraints);
    let graph = build_graph(&spans);

    let formats: Vec<&str> = cli
        .format
        .split(',')
        .map(str::trim)
        .filter(|f| !f.is_empty())
        .collect();

    if formats.contains(&"json") {
        write_json(
            &cli.outdir,
            &overall_verdict,
            &constraints,
            &metadata,
            &summary,
            &timeline,
            &graph,
        )?;
    }
    if formats.contains(&"csv") {
        write_csv(&cli.outdir, span_count, spans.len(), &overall_verdict)?;
        write_constraints_csv(&cli.outdir, &constraints)?;
    }
    if formats.contains(&"html") {
        write_html(
            &cli.outdir,
            &config,
            span_count,
            spans.len(),
            &overall_verdict,
            &constraints,
            recommendations_enabled,
            &metadata,
            &summary,
            &timeline,
            &graph,
        )?;
    }

    if overall_verdict == "FAIL" {
        Ok(1)
    } else {
        Ok(0)
    }
}

fn build_metadata(cli: &Cli) -> Metadata {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    let run_id = format!("pinzit_{}_{}", now.as_secs(), now.subsec_nanos());
    Metadata {
        run_id,
        generated_at: format!("{}", now.as_secs()),
        trace_file: cli.trace.display().to_string(),
        config_file: cli.config.display().to_string(),
        pinzit_version: "0.1.0".to_string(),
    }
}

fn build_timeline(
    spans: &[SpanRecord],
    constraints: &BTreeMap<String, ConstraintResult>,
) -> Vec<TimelineEvent> {
    let mut events = Vec::new();
    for (i, span) in spans.iter().enumerate() {
        let name_lower = span.name.to_ascii_lowercase();
        let severity = if name_lower.contains("fault")
            || name_lower.contains("error")
            || name_lower.contains("loss")
        {
            "critical"
        } else {
            "info"
        };
        let mut refs = Vec::new();
        for (cid, result) in constraints {
            if result.evidence_spans.contains(&span.name) {
                refs.push(cid.clone());
            }
        }
        events.push(TimelineEvent {
            timestamp_ns: span.start_ns.unwrap_or(0),
            span_id: span.span_id.clone().unwrap_or_else(|| format!("span_{i}")),
            parent_span_id: span.parent_span_id.clone(),
            name: span.name.clone(),
            event_type: if span.parent_span_id.is_none() {
                "root".to_string()
            } else {
                "child".to_string()
            },
            severity: severity.to_string(),
            constraint_refs: refs,
        });
    }
    events.sort_by(|a, b| a.timestamp_ns.cmp(&b.timestamp_ns));
    events
}

fn build_graph(spans: &[SpanRecord]) -> TraceGraph {
    let mut nodes = Vec::new();
    let mut edges = Vec::new();
    let mut seen = BTreeMap::new();
    for span in spans {
        let id = span.span_id.clone().unwrap_or_else(|| span.name.clone());
        if !seen.contains_key(&id) {
            seen.insert(id.clone(), true);
            nodes.push(TraceNode {
                id: id.clone(),
                label: span.name.clone(),
                kind: "service".to_string(),
                verdict: "PASS".to_string(),
                duration_ms: span_duration_ms(span).unwrap_or(0),
            });
        }
        if let Some(parent) = &span.parent_span_id {
            edges.push(TraceEdge {
                source: parent.clone(),
                target: id.clone(),
                kind: "parent_child".to_string(),
                latency_ms: span_duration_ms(span).unwrap_or(0),
            });
        }
    }
    TraceGraph { nodes, edges }
}

fn evaluate_slfs(
    config: &Config,
    spans: &[SpanRecord],
    recommendations_enabled: bool,
) -> ConstraintResult {
    let unsafe_patterns = lowercase_vec(&config.slfs_unsafe_action_patterns);
    let safe_patterns = lowercase_vec(&config.slfs_safe_state_patterns);

    let signal_loss_spans: Vec<&SpanRecord> = spans
        .iter()
        .filter(|span| {
            let name = span.name.to_ascii_lowercase();
            name.contains("signal") && name.contains("loss")
        })
        .collect();

    let mut unsafe_after_loss = 0_u64;
    let mut safe_hits = 0_u64;
    let mut evidence = Vec::new();

    for signal in &signal_loss_spans {
        let signal_end = signal.end_ns.or(signal.start_ns).unwrap_or(0);
        let deadline_ns =
            signal_end.saturating_add(config.slfs_safe_state_deadline_ms.saturating_mul(1_000_000));

        let safe_state_time = spans
            .iter()
            .filter(|span| {
                span.start_ns
                    .map(|start| start >= signal_end && start <= deadline_ns)
                    .unwrap_or(false)
                    && contains_any_case_insensitive(&span.name, &safe_patterns)
            })
            .filter_map(|span| span.start_ns)
            .min();

        if safe_state_time.is_some() {
            safe_hits = safe_hits.saturating_add(1);
        }

        for span in spans {
            if !contains_any_case_insensitive(&span.name, &unsafe_patterns) {
                continue;
            }
            let Some(start) = span.start_ns else {
                continue;
            };
            if start < signal_end {
                continue;
            }
            if let Some(safe_ts) = safe_state_time {
                if start >= safe_ts {
                    continue;
                }
            }

            unsafe_after_loss = unsafe_after_loss.saturating_add(1);
            evidence.push(span.name.clone());
        }
    }

    let verdict = if unsafe_after_loss > 0 {
        "FAIL"
    } else {
        "PASS"
    };

    let mut metrics = vec![
        (
            "signal_loss_timeout_ms".to_string(),
            config.slfs_signal_loss_timeout_ms.to_string(),
        ),
        (
            "safe_state_deadline_ms".to_string(),
            config.slfs_safe_state_deadline_ms.to_string(),
        ),
        (
            "signal_loss_events".to_string(),
            signal_loss_spans.len().to_string(),
        ),
        ("safe_state_hits".to_string(), safe_hits.to_string()),
        (
            "unsafe_after_loss_count".to_string(),
            unsafe_after_loss.to_string(),
        ),
    ];

    metrics.push((
        "unsafe_action_pattern_count".to_string(),
        config.slfs_unsafe_action_patterns.len().to_string(),
    ));
    metrics.push((
        "safe_state_pattern_count".to_string(),
        config.slfs_safe_state_patterns.len().to_string(),
    ));

    ConstraintResult {
        verdict: verdict.to_string(),
        metrics,
        evidence_spans: dedupe_preserve(evidence),
        recommendations: if recommendations_enabled {
            vec!["Block unsafe operations when telemetry age exceeds threshold.".to_string()]
        } else {
            Vec::new()
        },
    }
}

fn evaluate_rtcb(
    config: &Config,
    spans: &[SpanRecord],
    recommendations_enabled: bool,
) -> ConstraintResult {
    let recovery_spans: Vec<&SpanRecord> = spans
        .iter()
        .filter(|span| span.name == config.rtcb_recovery_span_name)
        .collect();

    let mut max_recovery_ms_seen = 0_u64;
    let mut over_limit_count = 0_u64;

    for span in &recovery_spans {
        if let Some(duration_ms) = span_duration_ms(span) {
            if duration_ms > max_recovery_ms_seen {
                max_recovery_ms_seen = duration_ms;
            }
            if duration_ms > config.rtcb_max_recovery_ms {
                over_limit_count = over_limit_count.saturating_add(1);
            }
        }
    }

    let stability_ok = if config.rtcb_stability_check {
        recovery_spans.iter().any(|span| {
            span.attributes
                .get(&config.rtcb_recovery_attribute)
                .map(|value| value == "true")
                .unwrap_or(false)
        })
    } else {
        true
    };

    let evidence: Vec<String> = recovery_spans
        .iter()
        .map(|span| span.name.clone())
        .collect();

    let mut fail_reasons = 0_u64;
    if recovery_spans.is_empty() {
        fail_reasons = fail_reasons.saturating_add(1);
    }
    if over_limit_count > 0 {
        fail_reasons = fail_reasons.saturating_add(1);
    }
    if !stability_ok {
        fail_reasons = fail_reasons.saturating_add(1);
    }

    let verdict = if fail_reasons > 0 { "FAIL" } else { "PASS" };

    ConstraintResult {
        verdict: verdict.to_string(),
        metrics: vec![
            (
                "max_recovery_ms".to_string(),
                config.rtcb_max_recovery_ms.to_string(),
            ),
            (
                "recovery_span_matches".to_string(),
                recovery_spans.len().to_string(),
            ),
            (
                "max_recovery_ms_seen".to_string(),
                max_recovery_ms_seen.to_string(),
            ),
            ("over_limit_count".to_string(), over_limit_count.to_string()),
            (
                "stability_check".to_string(),
                config.rtcb_stability_check.to_string(),
            ),
            ("stability_satisfied".to_string(), stability_ok.to_string()),
            (
                "recovery_span_name".to_string(),
                quote_json(&config.rtcb_recovery_span_name),
            ),
            (
                "recovery_attribute".to_string(),
                quote_json(&config.rtcb_recovery_attribute),
            ),
        ],
        evidence_spans: dedupe_preserve(evidence),
        recommendations: if recommendations_enabled {
            vec!["Cap retry backoff and bound readiness checks.".to_string()]
        } else {
            Vec::new()
        },
    }
}

fn evaluate_brc(
    config: &Config,
    spans: &[SpanRecord],
    recommendations_enabled: bool,
) -> ConstraintResult {
    let mut id_to_span = BTreeMap::new();
    for (idx, span) in spans.iter().enumerate() {
        if let Some(span_id) = &span.span_id {
            id_to_span.insert(span_id.clone(), idx);
        }
    }

    let fault_roots: Vec<&SpanRecord> = spans
        .iter()
        .filter(|span| {
            let name = span.name.to_ascii_lowercase();
            name.contains("fault")
                || name.contains("error")
                || span
                    .attributes
                    .get("error")
                    .map(|value| value == "true")
                    .unwrap_or(false)
        })
        .collect();

    let root_ids: BTreeMap<String, bool> = fault_roots
        .iter()
        .filter_map(|span| span.span_id.clone())
        .map(|id| (id, true))
        .collect();

    let mut max_hops_seen = 0_u64;
    for span in spans {
        let mut hops = 0_u64;
        let mut cursor = span.parent_span_id.clone();

        while let Some(parent_id) = cursor {
            hops = hops.saturating_add(1);
            if root_ids.contains_key(&parent_id) {
                if hops > max_hops_seen {
                    max_hops_seen = hops;
                }
                break;
            }
            let Some(parent_idx) = id_to_span.get(&parent_id) else {
                break;
            };
            cursor = spans[*parent_idx].parent_span_id.clone();
            if hops > 1000 {
                break;
            }
        }
    }

    let first_fault_start = fault_roots.iter().filter_map(|span| span.start_ns).min();
    let first_boundary_start = spans
        .iter()
        .filter(|span| {
            span.attributes
                .get(&config.brc_isolation_boundary_attribute)
                .map(|value| value == "true")
                .unwrap_or(false)
        })
        .filter_map(|span| span.start_ns)
        .min();

    let containment_latency_ms = match (first_fault_start, first_boundary_start) {
        (Some(fault), Some(boundary)) if boundary >= fault => (boundary - fault) / 1_000_000,
        _ => 0,
    };

    let has_faults = !fault_roots.is_empty();
    let has_boundary = first_boundary_start.is_some();

    let mut fail_reasons = 0_u64;
    if has_faults && max_hops_seen > config.brc_max_propagation_hops {
        fail_reasons = fail_reasons.saturating_add(1);
    }
    if has_faults && !has_boundary {
        fail_reasons = fail_reasons.saturating_add(1);
    }
    if has_faults && has_boundary && containment_latency_ms > config.brc_containment_timeout_ms {
        fail_reasons = fail_reasons.saturating_add(1);
    }

    let verdict = if fail_reasons > 0 { "FAIL" } else { "PASS" };

    let evidence: Vec<String> = fault_roots.iter().map(|span| span.name.clone()).collect();

    ConstraintResult {
        verdict: verdict.to_string(),
        metrics: vec![
            (
                "max_propagation_hops".to_string(),
                config.brc_max_propagation_hops.to_string(),
            ),
            ("max_hops_seen".to_string(), max_hops_seen.to_string()),
            (
                "containment_timeout_ms".to_string(),
                config.brc_containment_timeout_ms.to_string(),
            ),
            (
                "containment_latency_ms".to_string(),
                containment_latency_ms.to_string(),
            ),
            (
                "fault_root_count".to_string(),
                fault_roots.len().to_string(),
            ),
            ("boundary_detected".to_string(), has_boundary.to_string()),
            (
                "isolation_boundary_attribute".to_string(),
                quote_json(&config.brc_isolation_boundary_attribute),
            ),
        ],
        evidence_spans: dedupe_preserve(evidence),
        recommendations: if recommendations_enabled {
            vec!["Introduce bulkheads and fan-out limits.".to_string()]
        } else {
            Vec::new()
        },
    }
}

fn skipped_constraint(reason: &str) -> ConstraintResult {
    ConstraintResult {
        verdict: "SKIPPED".to_string(),
        metrics: vec![("reason".to_string(), quote_json(reason))],
        evidence_spans: Vec::new(),
        recommendations: Vec::new(),
    }
}

fn span_duration_ms(span: &SpanRecord) -> Option<u64> {
    let start = span.start_ns?;
    let end = span.end_ns?;
    if end < start {
        return None;
    }
    Some((end - start) / 1_000_000)
}

fn lowercase_vec(values: &[String]) -> Vec<String> {
    values
        .iter()
        .map(|value| value.to_ascii_lowercase())
        .collect()
}

fn contains_any_case_insensitive(value: &str, patterns: &[String]) -> bool {
    let normalized = value.to_ascii_lowercase();
    patterns.iter().any(|pattern| normalized.contains(pattern))
}

fn dedupe_preserve(values: Vec<String>) -> Vec<String> {
    let mut seen = BTreeMap::new();
    let mut out = Vec::new();
    for value in values {
        if seen.contains_key(&value) {
            continue;
        }
        seen.insert(value.clone(), true);
        out.push(value);
    }
    out
}

fn validate_json_shape(raw: &str) -> Result<(), String> {
    let trimmed = raw.trim();
    if !trimmed.starts_with('{') || !trimmed.ends_with('}') {
        return Err("failed to parse trace: expected JSON object".to_string());
    }
    Ok(())
}

fn parse_config(raw: &str) -> Result<Config, String> {
    let mut map = BTreeMap::new();
    for line in raw.lines() {
        let cleaned = line.trim();
        if cleaned.is_empty() || cleaned.starts_with('[') || cleaned.starts_with('#') {
            continue;
        }
        if let Some((k, v)) = cleaned.split_once('=') {
            map.insert(k.trim().to_string(), v.trim().to_string());
        }
    }

    Ok(Config {
        audit_name: get_string(&map, "audit_name")?,
        auditor: get_string(&map, "auditor")?,
        standard: get_string(&map, "standard")?,
        slfs_signal_loss_timeout_ms: get_u64(&map, "signal_loss_timeout_ms")?,
        slfs_safe_state_deadline_ms: get_u64(&map, "safe_state_deadline_ms")?,
        slfs_unsafe_action_patterns: get_array(&map, "unsafe_action_patterns")?,
        slfs_safe_state_patterns: get_array(&map, "safe_state_patterns")?,
        rtcb_max_recovery_ms: get_u64(&map, "max_recovery_ms")?,
        rtcb_recovery_span_name: get_string(&map, "recovery_span_name")?,
        rtcb_recovery_attribute: get_string(&map, "recovery_attribute")?,
        rtcb_stability_check: get_bool(&map, "stability_check")?,
        brc_max_propagation_hops: get_u64(&map, "max_propagation_hops")?,
        brc_containment_timeout_ms: get_u64(&map, "containment_timeout_ms")?,
        brc_isolation_boundary_attribute: get_string(&map, "isolation_boundary_attribute")?,
    })
}

fn get_raw<'a>(map: &'a BTreeMap<String, String>, key: &str) -> Result<&'a str, String> {
    map.get(key)
        .map(|v| v.as_str())
        .ok_or_else(|| format!("missing config key: {key}"))
}

fn get_string(map: &BTreeMap<String, String>, key: &str) -> Result<String, String> {
    let raw = get_raw(map, key)?;
    Ok(raw.trim_matches('"').to_string())
}

fn get_u64(map: &BTreeMap<String, String>, key: &str) -> Result<u64, String> {
    let raw = get_raw(map, key)?;
    raw.parse::<u64>()
        .map_err(|_| format!("invalid integer for {key}: {raw}"))
}

fn get_bool(map: &BTreeMap<String, String>, key: &str) -> Result<bool, String> {
    let raw = get_raw(map, key)?;
    match raw {
        "true" => Ok(true),
        "false" => Ok(false),
        _ => Err(format!("invalid bool for {key}: {raw}")),
    }
}

fn get_array(map: &BTreeMap<String, String>, key: &str) -> Result<Vec<String>, String> {
    let raw = get_raw(map, key)?;
    let trimmed = raw.trim();
    if !(trimmed.starts_with('[') && trimmed.ends_with(']')) {
        return Err(format!("invalid array for {key}: {raw}"));
    }
    let inner = &trimmed[1..trimmed.len() - 1];
    if inner.trim().is_empty() {
        return Ok(Vec::new());
    }
    Ok(inner
        .split(',')
        .map(|item| item.trim().trim_matches('"').to_string())
        .collect())
}

fn quote_json(value: &str) -> String {
    format!("\"{}\"", value.replace('"', "\\\""))
}

fn parse_spans(raw: &str) -> Vec<SpanRecord> {
    let mut spans = Vec::new();
    let mut cursor = 0_usize;

    while let Some((array_start, array_end)) = find_array_after_key(raw, "spans", cursor) {
        let array = &raw[array_start..=array_end];
        for object in split_top_level_objects_in_array(array) {
            let name =
                get_json_string_value(object, "name").unwrap_or_else(|| "unknown".to_string());
            let span_id = get_json_string_value(object, "spanId");
            let parent_span_id = get_json_string_value(object, "parentSpanId");
            let start_ns = get_json_u64_value(object, "startTimeUnixNano");
            let end_ns = get_json_u64_value(object, "endTimeUnixNano");
            let attributes = parse_attributes(object);

            spans.push(SpanRecord {
                name,
                span_id,
                parent_span_id,
                start_ns,
                end_ns,
                attributes,
            });
        }
        cursor = array_end.saturating_add(1);
    }

    spans
}

fn parse_attributes(span_object: &str) -> BTreeMap<String, String> {
    let mut attributes = BTreeMap::new();

    let Some((array_start, array_end)) = find_array_after_key(span_object, "attributes", 0) else {
        return attributes;
    };

    let array = &span_object[array_start..=array_end];
    for object in split_top_level_objects_in_array(array) {
        let Some(key) = get_json_string_value(object, "key") else {
            continue;
        };

        let mut value = None;

        if let Some((value_start, value_end)) = find_object_after_key(object, "value", 0) {
            let value_obj = &object[value_start..=value_end];

            if let Some(s) = get_json_string_value(value_obj, "stringValue") {
                value = Some(s);
            } else if let Some(i) = get_json_u64_value(value_obj, "intValue") {
                value = Some(i.to_string());
            } else if let Some(b) = get_json_bool_value(value_obj, "boolValue") {
                value = Some(b.to_string());
            } else if let Some(n) = get_json_number_value(value_obj, "doubleValue") {
                value = Some(n);
            }
        }

        if let Some(v) = value {
            attributes.insert(key, v);
        }
    }

    attributes
}

fn find_array_after_key(raw: &str, key: &str, from: usize) -> Option<(usize, usize)> {
    let key_pattern = format!("\"{key}\"");
    let key_pos = raw[from..].find(&key_pattern)? + from;

    let mut idx = key_pos + key_pattern.len();
    let bytes = raw.as_bytes();

    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }
    if idx >= bytes.len() || bytes[idx] != b':' {
        return None;
    }
    idx += 1;
    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }
    if idx >= bytes.len() || bytes[idx] != b'[' {
        return None;
    }

    let end = find_matching_delimiter(raw, idx, b'[', b']')?;
    Some((idx, end))
}

fn find_object_after_key(raw: &str, key: &str, from: usize) -> Option<(usize, usize)> {
    let key_pattern = format!("\"{key}\"");
    let key_pos = raw[from..].find(&key_pattern)? + from;

    let mut idx = key_pos + key_pattern.len();
    let bytes = raw.as_bytes();

    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }
    if idx >= bytes.len() || bytes[idx] != b':' {
        return None;
    }
    idx += 1;
    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }
    if idx >= bytes.len() || bytes[idx] != b'{' {
        return None;
    }

    let end = find_matching_delimiter(raw, idx, b'{', b'}')?;
    Some((idx, end))
}

fn split_top_level_objects_in_array(array: &str) -> Vec<&str> {
    let bytes = array.as_bytes();
    let mut objects = Vec::new();

    let mut in_string = false;
    let mut escaped = false;
    let mut depth = 0_i32;
    let mut object_start = None;

    for (idx, byte) in bytes.iter().enumerate() {
        if in_string {
            if escaped {
                escaped = false;
                continue;
            }
            if *byte == b'\\' {
                escaped = true;
                continue;
            }
            if *byte == b'"' {
                in_string = false;
            }
            continue;
        }

        if *byte == b'"' {
            in_string = true;
            continue;
        }

        if *byte == b'{' {
            if depth == 0 {
                object_start = Some(idx);
            }
            depth += 1;
            continue;
        }

        if *byte == b'}' {
            depth -= 1;
            if depth == 0 {
                if let Some(start) = object_start {
                    objects.push(&array[start..=idx]);
                }
                object_start = None;
            }
        }
    }

    objects
}

fn find_matching_delimiter(raw: &str, start: usize, open: u8, close: u8) -> Option<usize> {
    let bytes = raw.as_bytes();
    if start >= bytes.len() || bytes[start] != open {
        return None;
    }

    let mut in_string = false;
    let mut escaped = false;
    let mut depth = 0_i32;

    for (idx, byte) in bytes.iter().enumerate().skip(start) {
        if in_string {
            if escaped {
                escaped = false;
                continue;
            }
            if *byte == b'\\' {
                escaped = true;
                continue;
            }
            if *byte == b'"' {
                in_string = false;
            }
            continue;
        }

        if *byte == b'"' {
            in_string = true;
            continue;
        }

        if *byte == open {
            depth += 1;
        } else if *byte == close {
            depth -= 1;
            if depth == 0 {
                return Some(idx);
            }
        }
    }

    None
}

fn get_json_string_value(raw: &str, key: &str) -> Option<String> {
    let key_pattern = format!("\"{key}\"");
    let key_pos = raw.find(&key_pattern)?;
    let mut idx = key_pos + key_pattern.len();
    let bytes = raw.as_bytes();

    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }
    if idx >= bytes.len() || bytes[idx] != b':' {
        return None;
    }
    idx += 1;
    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }
    if idx >= bytes.len() || bytes[idx] != b'"' {
        return None;
    }

    parse_json_string(raw, idx).map(|(value, _)| value)
}

fn get_json_u64_value(raw: &str, key: &str) -> Option<u64> {
    let key_pattern = format!("\"{key}\"");
    let key_pos = raw.find(&key_pattern)?;
    let mut idx = key_pos + key_pattern.len();
    let bytes = raw.as_bytes();

    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }
    if idx >= bytes.len() || bytes[idx] != b':' {
        return None;
    }
    idx += 1;
    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }

    if idx < bytes.len() && bytes[idx] == b'"' {
        let (value, _) = parse_json_string(raw, idx)?;
        return value.parse::<u64>().ok();
    }

    let end = find_literal_end(raw, idx);
    raw[idx..end].trim().parse::<u64>().ok()
}

fn get_json_number_value(raw: &str, key: &str) -> Option<String> {
    let key_pattern = format!("\"{key}\"");
    let key_pos = raw.find(&key_pattern)?;
    let mut idx = key_pos + key_pattern.len();
    let bytes = raw.as_bytes();

    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }
    if idx >= bytes.len() || bytes[idx] != b':' {
        return None;
    }
    idx += 1;
    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }

    let end = find_literal_end(raw, idx);
    let value = raw[idx..end].trim();
    if value.is_empty() {
        None
    } else {
        Some(value.to_string())
    }
}

fn get_json_bool_value(raw: &str, key: &str) -> Option<bool> {
    let key_pattern = format!("\"{key}\"");
    let key_pos = raw.find(&key_pattern)?;
    let mut idx = key_pos + key_pattern.len();
    let bytes = raw.as_bytes();

    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }
    if idx >= bytes.len() || bytes[idx] != b':' {
        return None;
    }
    idx += 1;
    while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
        idx += 1;
    }

    if raw[idx..].starts_with("true") {
        Some(true)
    } else if raw[idx..].starts_with("false") {
        Some(false)
    } else {
        None
    }
}

fn find_literal_end(raw: &str, start: usize) -> usize {
    let bytes = raw.as_bytes();
    let mut idx = start;
    while idx < bytes.len() {
        let b = bytes[idx];
        if b == b',' || b == b'}' || b == b']' || b.is_ascii_whitespace() {
            break;
        }
        idx += 1;
    }
    idx
}

fn parse_json_string(raw: &str, start_quote: usize) -> Option<(String, usize)> {
    let bytes = raw.as_bytes();
    if start_quote >= bytes.len() || bytes[start_quote] != b'"' {
        return None;
    }

    let mut idx = start_quote + 1;
    let mut out = String::new();

    while idx < bytes.len() {
        let b = bytes[idx];
        if b == b'\\' {
            idx += 1;
            if idx >= bytes.len() {
                return None;
            }
            let escaped = bytes[idx];
            let ch = match escaped {
                b'"' => '"',
                b'\\' => '\\',
                b'/' => '/',
                b'b' => '\u{0008}',
                b'f' => '\u{000C}',
                b'n' => '\n',
                b'r' => '\r',
                b't' => '\t',
                b'u' => '?',
                _ => escaped as char,
            };
            out.push(ch);
            idx += 1;
            continue;
        }

        if b == b'"' {
            return Some((out, idx));
        }

        out.push(b as char);
        idx += 1;
    }

    None
}

fn render_constraint_json(constraint: &ConstraintResult) -> String {
    let metrics_str = constraint
        .metrics
        .iter()
        .map(|(k, v)| format!("\"{}\": {}", quote_json(k).trim_matches('"'), v))
        .collect::<Vec<_>>()
        .join(", ");

    let evidence_str = constraint
        .evidence_spans
        .iter()
        .map(|span| quote_json(span))
        .collect::<Vec<_>>()
        .join(", ");

    let recommendations_str = constraint
        .recommendations
        .iter()
        .map(|value| quote_json(value))
        .collect::<Vec<_>>()
        .join(", ");

    format!(
        "{{\"verdict\": \"{}\", \"metrics\": {{{}}}, \"evidence_spans\": [{}], \"recommendations\": [{}]}}",
        constraint.verdict, metrics_str, evidence_str, recommendations_str
    )
}

fn write_json(
    outdir: &Path,
    _overall_verdict: &str,
    constraints: &BTreeMap<String, ConstraintResult>,
    metadata: &Metadata,
    summary: &Summary,
    timeline: &[TimelineEvent],
    graph: &TraceGraph,
) -> Result<(), String> {
    let mut ordered = Vec::new();
    for (name, value) in constraints {
        ordered.push(format!("\"{name}\": {}", render_constraint_json(value)));
    }

    let timeline_json = timeline
        .iter()
        .map(|e| {
            format!(
                "{{\"timestamp_ns\": {}, \"span_id\": \"{}\", \"parent_span_id\": {}, \"name\": \"{}\", \"event_type\": \"{}\", \"severity\": \"{}\", \"constraint_refs\": [{}]}}",
                e.timestamp_ns,
                e.span_id,
                e.parent_span_id.as_ref().map(|s| format!("\"{s}\"")).unwrap_or_else(|| "null".to_string()),
                e.name,
                e.event_type,
                e.severity,
                e.constraint_refs.iter().map(|r| format!("\"{r}\"")).collect::<Vec<_>>().join(", ")
            )
        })
        .collect::<Vec<_>>()
        .join(",\n    ");

    let nodes_json = graph
        .nodes
        .iter()
        .map(|n| {
            format!(
                "{{\"id\": \"{}\", \"label\": \"{}\", \"kind\": \"{}\", \"verdict\": \"{}\", \"duration_ms\": {}}}",
                n.id, n.label, n.kind, n.verdict, n.duration_ms
            )
        })
        .collect::<Vec<_>>()
        .join(",\n    ");

    let edges_json = graph
        .edges
        .iter()
        .map(|e| {
            format!(
                "{{\"source\": \"{}\", \"target\": \"{}\", \"kind\": \"{}\", \"latency_ms\": {}}}",
                e.source, e.target, e.kind, e.latency_ms
            )
        })
        .collect::<Vec<_>>()
        .join(",\n    ");

    let payload = format!(
        "{{\n  \"metadata\": {{\n    \"run_id\": \"{}\",\n    \"generated_at\": \"{}\",\n    \"trace_file\": \"{}\",\n    \"config_file\": \"{}\",\n    \"pinzit_version\": \"{}\"\n  }},\n  \"summary\": {{\n    \"overall_verdict\": \"{}\",\n    \"parsed_span_count\": {},\n    \"failed_constraint_count\": {},\n    \"critical_path_ms\": {},\n    \"max_propagation_hops_seen\": {}\n  }},\n  \"constraints\": {{\n    {}\n  }},\n  \"timeline\": [\n    {}\n  ],\n  \"graph\": {{\n    \"nodes\": [\n      {}\n    ],\n    \"edges\": [\n      {}\n    ]\n  }}\n}}\n",
        metadata.run_id,
        metadata.generated_at,
        metadata.trace_file,
        metadata.config_file,
        metadata.pinzit_version,
        summary.overall_verdict,
        summary.parsed_span_count,
        summary.failed_constraint_count,
        summary.critical_path_ms,
        summary.max_propagation_hops_seen,
        ordered.join(",\n    "),
        timeline_json,
        nodes_json,
        edges_json
    );

    let path = outdir.join("pinzit_verdict.json");
    fs::write(&path, payload).map_err(|e| format!("failed to write {}: {e}", path.display()))
}

fn write_csv(
    outdir: &Path,
    span_count: usize,
    parsed_spans: usize,
    overall_verdict: &str,
) -> Result<(), String> {
    let path = outdir.join("pinzit_stats.csv");
    let payload = format!(
        "metric,value\nresource_span_markers,{}\nparsed_span_count,{}\noverall_verdict,{}\n",
        span_count, parsed_spans, overall_verdict
    );
    fs::write(&path, payload).map_err(|e| format!("failed to write {}: {e}", path.display()))
}

fn write_constraints_csv(
    outdir: &Path,
    constraints: &BTreeMap<String, ConstraintResult>,
) -> Result<(), String> {
    let path = outdir.join("pinzit_constraints.csv");
    let mut payload = String::from(
        "constraint_id,verdict,metric,threshold,observed,evidence_count,recommendation_count\n",
    );
    for (name, result) in constraints {
        let threshold = result
            .metrics
            .iter()
            .find(|(k, _)| k.ends_with("_ms"))
            .map(|(_, v)| v.as_str())
            .unwrap_or("");
        let observed = result
            .metrics
            .iter()
            .find(|(k, _)| k.ends_with("_seen") || k.ends_with("_count"))
            .map(|(_, v)| v.as_str())
            .unwrap_or("");
        payload.push_str(&format!(
            "{},{},{},{},{},{},{}\n",
            name,
            result.verdict,
            result
                .metrics
                .first()
                .map(|(k, _)| k.as_str())
                .unwrap_or(""),
            threshold,
            observed,
            result.evidence_spans.len(),
            result.recommendations.len()
        ));
    }
    fs::write(&path, payload).map_err(|e| format!("failed to write {}: {e}", path.display()))
}

#[allow(clippy::too_many_arguments)]
fn write_html(
    outdir: &Path,
    config: &Config,
    span_count: usize,
    parsed_spans: usize,
    overall_verdict: &str,
    constraints: &BTreeMap<String, ConstraintResult>,
    recommendations_enabled: bool,
    metadata: &Metadata,
    summary: &Summary,
    timeline: &[TimelineEvent],
    graph: &TraceGraph,
) -> Result<(), String> {
    let path = outdir.join("pinzit_report.html");
    let recommendations = if recommendations_enabled {
        "Enabled"
    } else {
        "Disabled"
    };

    let mut constraint_rows = String::new();
    for (name, result) in constraints {
        constraint_rows.push_str(&format!(
            "<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>",
            name,
            result.verdict,
            result
                .metrics
                .first()
                .map(|(k, _)| k.as_str())
                .unwrap_or(""),
            result.evidence_spans.len(),
            result.recommendations.len()
        ));
    }

    let mut timeline_rows = String::new();
    for e in timeline.iter().take(20) {
        timeline_rows.push_str(&format!(
            "<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>",
            e.timestamp_ns, e.name, e.event_type, e.severity
        ));
    }

    let payload = format!(
        "<!DOCTYPE html>\n<html><head><meta charset=\"UTF-8\"><title>Pinzit Report</title><style>body{{font-family:sans-serif;background:#0a0a0b;color:#f6f7f9;padding:2rem}}table{{border-collapse:collapse;width:100%;margin-top:1rem}}th,td{{border:1px solid #26262b;padding:8px;text-align:left}}th{{background:#1a1a1e}}h1,h2{{color:#fff}}.pass{{color:#22c55e}}.fail{{color:#ef4444}}</style></head><body>\n<h1>Pinzit Audit Report</h1>\n<p><strong>Run ID:</strong> {}</p>\n<p><strong>Audit:</strong> {}</p>\n<p><strong>Auditor:</strong> {}</p>\n<p><strong>Standard:</strong> {}</p>\n<p><strong>Overall Verdict:</strong> <span class=\"{}\">{}</span></p>\n<p><strong>Resource Span Markers:</strong> {}</p>\n<p><strong>Parsed Span Count:</strong> {}</p>\n<p><strong>Failed Constraints:</strong> {}</p>\n<p><strong>Critical Path:</strong> {}ms</p>\n<p><strong>Recommendations:</strong> {}</p>\n<h2>Constraint Summary</h2>\n<table>\n<tr><th>Constraint</th><th>Verdict</th><th>Key Metric</th><th>Evidence</th><th>Recommendations</th></tr>\n{}\n</table>\n<h2>Incident Timeline</h2>\n<table>\n<tr><th>Timestamp</th><th>Name</th><th>Type</th><th>Severity</th></tr>\n{}\n</table>\n<h2>Graph Summary</h2>\n<p>Nodes: {} | Edges: {}</p>\n</body></html>\n",
        metadata.run_id,
        config.audit_name,
        config.auditor,
        config.standard,
        if overall_verdict == "PASS" { "pass" } else { "fail" },
        overall_verdict,
        span_count,
        parsed_spans,
        summary.failed_constraint_count,
        summary.critical_path_ms,
        recommendations,
        constraint_rows,
        timeline_rows,
        graph.nodes.len(),
        graph.edges.len()
    );

    fs::write(&path, payload).map_err(|e| format!("failed to write {}: {e}", path.display()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    const CONFIG_RAW: &str = r#"
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
"#;

    #[test]
    fn parses_arrays() {
        let mut map = BTreeMap::new();
        map.insert(
            "unsafe_action_patterns".to_string(),
            "[\"a\", \"b\"]".to_string(),
        );
        let parsed = get_array(&map, "unsafe_action_patterns").expect("array should parse");
        assert_eq!(parsed, vec!["a".to_string(), "b".to_string()]);
    }

    #[test]
    fn validates_json_shape() {
        assert!(validate_json_shape("{\"ok\":true}").is_ok());
        assert!(validate_json_shape("nope").is_err());
    }

    #[test]
    fn parses_full_config() {
        let cfg = parse_config(CONFIG_RAW).expect("config should parse");
        assert_eq!(cfg.audit_name, "Production Trace");
        assert_eq!(cfg.rtcb_max_recovery_ms, 30000);
        assert!(cfg.rtcb_stability_check);
        assert_eq!(cfg.brc_max_propagation_hops, 2);
    }

    #[test]
    fn run_returns_fail_exit_code_on_constraint_failure() {
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be monotonic")
            .as_nanos();
        let base = env::temp_dir().join(format!("pinzit_test_{ts}"));
        fs::create_dir_all(&base).expect("temp dir should be created");

        let trace_path = base.join("trace.json");
        let cfg_path = base.join("pinzit.toml");
        let outdir = base.join("out");

        let trace = r#"{
  "resourceSpans": [
    {
      "scopeSpans": [
        {
          "spans": [
            {
              "name": "signal_loss_event",
              "spanId": "1",
              "startTimeUnixNano": "1000000000",
              "endTimeUnixNano": "1100000000",
              "attributes": []
            },
            {
              "name": "actuate_motor",
              "spanId": "2",
              "parentSpanId": "1",
              "startTimeUnixNano": "1150000000",
              "endTimeUnixNano": "1200000000",
              "attributes": []
            }
          ]
        }
      ]
    }
  ]
}"#;

        fs::write(&trace_path, trace).expect("trace should write");
        fs::write(&cfg_path, CONFIG_RAW).expect("config should write");

        let cli = Cli {
            trace: trace_path,
            config: cfg_path,
            outdir,
            format: "json".to_string(),
            fail_fast: false,
            no_recommend: false,
        };

        let code = run(&cli).expect("run should succeed");
        assert_eq!(code, 1);
    }

    #[test]
    fn parse_args_requires_trace() {
        let args = vec!["pinzit".to_string()];
        let result = parse_args(args);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("--trace is required"));
    }

    #[test]
    fn parse_args_parses_all_flags() {
        let args = vec![
            "pinzit".to_string(),
            "--trace".to_string(),
            "./trace.json".to_string(),
            "--config".to_string(),
            "./pinzit.toml".to_string(),
            "--outdir".to_string(),
            "./out".to_string(),
            "--format".to_string(),
            "json".to_string(),
            "--fail-fast".to_string(),
            "--no-recommend".to_string(),
        ];
        let cli = parse_args(args).expect("should parse");
        assert_eq!(cli.trace, PathBuf::from("./trace.json"));
        assert_eq!(cli.config, PathBuf::from("./pinzit.toml"));
        assert_eq!(cli.outdir, PathBuf::from("./out"));
        assert_eq!(cli.format, "json");
        assert!(cli.fail_fast);
        assert!(cli.no_recommend);
    }

    #[test]
    fn invalid_config_missing_key() {
        let raw = "audit_name = \"test\"";
        let result = parse_config(raw);
        assert!(result.is_err());
    }

    #[test]
    fn invalid_json_shape_rejects_array() {
        assert!(validate_json_shape("[]").is_err());
        assert!(validate_json_shape("not json").is_err());
    }

    #[test]
    fn slfs_boundary_no_unsafe_actions_passes() {
        let cfg = parse_config(CONFIG_RAW).expect("config should parse");
        let spans = vec![
            SpanRecord {
                name: "signal_loss_event".to_string(),
                span_id: Some("1".to_string()),
                parent_span_id: None,
                start_ns: Some(1_000_000_000),
                end_ns: Some(1_100_000_000),
                attributes: BTreeMap::new(),
            },
            SpanRecord {
                name: "safe_state".to_string(),
                span_id: Some("3".to_string()),
                parent_span_id: None,
                start_ns: Some(1_200_000_000),
                end_ns: Some(1_300_000_000),
                attributes: BTreeMap::new(),
            },
        ];
        let result = evaluate_slfs(&cfg, &spans, true);
        assert_eq!(result.verdict, "PASS");
    }

    #[test]
    fn rtcb_boundary_within_limit_passes() {
        let cfg = parse_config(CONFIG_RAW).expect("config should parse");
        let mut attrs = BTreeMap::new();
        attrs.insert("recovery.complete".to_string(), "true".to_string());
        let spans = vec![SpanRecord {
            name: "system.recovery".to_string(),
            span_id: Some("1".to_string()),
            parent_span_id: None,
            start_ns: Some(1_000_000_000),
            end_ns: Some(1_010_000_000),
            attributes: attrs,
        }];
        let result = evaluate_rtcb(&cfg, &spans, true);
        assert_eq!(result.verdict, "PASS");
    }

    #[test]
    fn rtcb_boundary_over_limit_fails() {
        let cfg = parse_config(CONFIG_RAW).expect("config should parse");
        let spans = vec![SpanRecord {
            name: "system.recovery".to_string(),
            span_id: Some("1".to_string()),
            parent_span_id: None,
            start_ns: Some(1_000_000_000),
            end_ns: Some(1_000_000_000 + 31_000_000_000),
            attributes: BTreeMap::new(),
        }];
        let result = evaluate_rtcb(&cfg, &spans, true);
        assert_eq!(result.verdict, "FAIL");
    }

    #[test]
    fn brc_propagation_within_hops_passes() {
        let cfg = parse_config(CONFIG_RAW).expect("config should parse");
        let mut attrs = BTreeMap::new();
        attrs.insert("fault.isolation".to_string(), "true".to_string());
        let spans = vec![
            SpanRecord {
                name: "fault_root".to_string(),
                span_id: Some("1".to_string()),
                parent_span_id: None,
                start_ns: Some(1_000_000_000),
                end_ns: Some(1_100_000_000),
                attributes: BTreeMap::new(),
            },
            SpanRecord {
                name: "child_span".to_string(),
                span_id: Some("2".to_string()),
                parent_span_id: Some("1".to_string()),
                start_ns: Some(1_200_000_000),
                end_ns: Some(1_300_000_000),
                attributes: attrs,
            },
        ];
        let result = evaluate_brc(&cfg, &spans, true);
        assert_eq!(result.verdict, "PASS");
    }

    #[test]
    fn brc_propagation_exceeds_hops_fails() {
        let cfg = parse_config(CONFIG_RAW).expect("config should parse");
        let spans = vec![
            SpanRecord {
                name: "fault_root".to_string(),
                span_id: Some("1".to_string()),
                parent_span_id: None,
                start_ns: Some(1_000_000_000),
                end_ns: Some(1_100_000_000),
                attributes: BTreeMap::new(),
            },
            SpanRecord {
                name: "level1".to_string(),
                span_id: Some("2".to_string()),
                parent_span_id: Some("1".to_string()),
                start_ns: Some(1_200_000_000),
                end_ns: Some(1_300_000_000),
                attributes: BTreeMap::new(),
            },
            SpanRecord {
                name: "level2".to_string(),
                span_id: Some("3".to_string()),
                parent_span_id: Some("2".to_string()),
                start_ns: Some(1_400_000_000),
                end_ns: Some(1_500_000_000),
                attributes: BTreeMap::new(),
            },
            SpanRecord {
                name: "level3".to_string(),
                span_id: Some("4".to_string()),
                parent_span_id: Some("3".to_string()),
                start_ns: Some(1_600_000_000),
                end_ns: Some(1_700_000_000),
                attributes: BTreeMap::new(),
            },
        ];
        let result = evaluate_brc(&cfg, &spans, true);
        assert_eq!(result.verdict, "FAIL");
    }

    #[test]
    fn writers_produce_files() {
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let base = env::temp_dir().join(format!("pinzit_writer_test_{ts}"));
        fs::create_dir_all(&base).unwrap();

        let mut constraints = BTreeMap::new();
        constraints.insert(
            "slfs_001".to_string(),
            ConstraintResult {
                verdict: "PASS".to_string(),
                metrics: vec![("signal_loss_timeout_ms".to_string(), "500".to_string())],
                evidence_spans: vec!["trace.span.signal_loss".to_string()],
                recommendations: vec!["Block unsafe operations.".to_string()],
            },
        );

        let metadata = Metadata {
            run_id: "test_run".to_string(),
            generated_at: "0".to_string(),
            trace_file: "trace.json".to_string(),
            config_file: "pinzit.toml".to_string(),
            pinzit_version: "0.1.0".to_string(),
        };

        let summary = Summary {
            overall_verdict: "PASS".to_string(),
            parsed_span_count: 2,
            failed_constraint_count: 0,
            critical_path_ms: 100,
            max_propagation_hops_seen: 0,
        };

        let timeline = vec![];
        let graph = TraceGraph {
            nodes: vec![],
            edges: vec![],
        };

        write_json(
            &base,
            "PASS",
            &constraints,
            &metadata,
            &summary,
            &timeline,
            &graph,
        )
        .unwrap();
        write_csv(&base, 1, 2, "PASS").unwrap();
        write_constraints_csv(&base, &constraints).unwrap();
        write_html(
            &base,
            &parse_config(CONFIG_RAW).unwrap(),
            1,
            2,
            "PASS",
            &constraints,
            true,
            &metadata,
            &summary,
            &timeline,
            &graph,
        )
        .unwrap();

        assert!(base.join("pinzit_verdict.json").exists());
        assert!(base.join("pinzit_stats.csv").exists());
        assert!(base.join("pinzit_constraints.csv").exists());
        assert!(base.join("pinzit_report.html").exists());
    }
}
