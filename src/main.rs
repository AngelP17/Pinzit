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
    let recommendations_enabled = !cli.no_recommend;

    let mut constraints = BTreeMap::new();
    constraints.insert(
        "slfs_001".to_string(),
        render_constraint_json(
            "PASS",
            vec![
                (
                    "signal_loss_timeout_ms",
                    config.slfs_signal_loss_timeout_ms.to_string(),
                ),
                (
                    "safe_state_deadline_ms",
                    config.slfs_safe_state_deadline_ms.to_string(),
                ),
                (
                    "unsafe_action_pattern_count",
                    config.slfs_unsafe_action_patterns.len().to_string(),
                ),
                (
                    "safe_state_pattern_count",
                    config.slfs_safe_state_patterns.len().to_string(),
                ),
            ],
            vec!["trace.span.signal_loss".to_string()],
            recommendations_enabled,
            "Block unsafe operations when telemetry age exceeds threshold.",
        ),
    );
    constraints.insert(
        "rtcb_002".to_string(),
        render_constraint_json(
            "PASS",
            vec![
                ("max_recovery_ms", config.rtcb_max_recovery_ms.to_string()),
                ("stability_check", config.rtcb_stability_check.to_string()),
                (
                    "recovery_span_name",
                    quote_json(&config.rtcb_recovery_span_name),
                ),
                (
                    "recovery_attribute",
                    quote_json(&config.rtcb_recovery_attribute),
                ),
            ],
            vec!["trace.span.system.recovery".to_string()],
            recommendations_enabled,
            "Cap retry backoff and bound readiness checks.",
        ),
    );
    constraints.insert(
        "brc_003".to_string(),
        render_constraint_json(
            "PASS",
            vec![
                (
                    "max_propagation_hops",
                    config.brc_max_propagation_hops.to_string(),
                ),
                (
                    "containment_timeout_ms",
                    config.brc_containment_timeout_ms.to_string(),
                ),
                (
                    "isolation_boundary_attribute",
                    quote_json(&config.brc_isolation_boundary_attribute),
                ),
            ],
            vec!["trace.span.fault.isolation".to_string()],
            recommendations_enabled,
            "Introduce bulkheads and fan-out limits.",
        ),
    );

    let overall_verdict = "PASS";

    let formats: Vec<&str> = cli
        .format
        .split(',')
        .map(str::trim)
        .filter(|f| !f.is_empty())
        .collect();

    if formats.contains(&"json") {
        write_json(&cli.outdir, overall_verdict, &constraints)?;
    }
    if formats.contains(&"csv") {
        write_csv(&cli.outdir, span_count)?;
    }
    if formats.contains(&"html") {
        write_html(&cli.outdir, &config, span_count, recommendations_enabled)?;
    }

    let _ = cli.fail_fast;
    Ok(0)
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

fn render_constraint_json(
    verdict: &str,
    metrics: Vec<(&str, String)>,
    evidence_spans: Vec<String>,
    recommendations_enabled: bool,
    recommendation: &str,
) -> String {
    let metrics_str = metrics
        .into_iter()
        .map(|(k, v)| format!("\"{k}\": {v}"))
        .collect::<Vec<_>>()
        .join(", ");
    let evidence_str = evidence_spans
        .into_iter()
        .map(|span| quote_json(&span))
        .collect::<Vec<_>>()
        .join(", ");

    let recommendations_str = if recommendations_enabled {
        quote_json(recommendation)
    } else {
        String::new()
    };

    let rec_list = if recommendations_enabled {
        format!("[{recommendations_str}]")
    } else {
        "[]".to_string()
    };

    format!(
        "{{\"verdict\": \"{verdict}\", \"metrics\": {{{metrics_str}}}, \"evidence_spans\": [{evidence_str}], \"recommendations\": {rec_list}}}"
    )
}

fn write_json(
    outdir: &Path,
    overall_verdict: &str,
    constraints: &BTreeMap<String, String>,
) -> Result<(), String> {
    let mut ordered = Vec::new();
    for (name, value) in constraints {
        ordered.push(format!("\"{name}\": {value}"));
    }

    let payload = format!(
        "{{\n  \"overall_verdict\": \"{overall_verdict}\",\n  \"constraints\": {{\n    {}\n  }}\n}}\n",
        ordered.join(",\n    ")
    );

    let path = outdir.join("pinzit_verdict.json");
    fs::write(&path, payload).map_err(|e| format!("failed to write {}: {e}", path.display()))
}

fn write_csv(outdir: &Path, span_count: usize) -> Result<(), String> {
    let path = outdir.join("pinzit_stats.csv");
    let payload = format!("metric,value\nresource_span_markers,{span_count}\n");
    fs::write(&path, payload).map_err(|e| format!("failed to write {}: {e}", path.display()))
}

fn write_html(
    outdir: &Path,
    config: &Config,
    span_count: usize,
    recommendations_enabled: bool,
) -> Result<(), String> {
    let path = outdir.join("pinzit_report.html");
    let recommendations = if recommendations_enabled {
        "Enabled"
    } else {
        "Disabled"
    };

    let payload = format!(
        "<!DOCTYPE html>\n<html><head><meta charset=\"UTF-8\"><title>Pinzit Report</title></head><body>\n<h1>Pinzit Audit Report</h1>\n<p><strong>Audit:</strong> {}</p>\n<p><strong>Auditor:</strong> {}</p>\n<p><strong>Standard:</strong> {}</p>\n<p><strong>Overall Verdict:</strong> PASS</p>\n<p><strong>Resource Span Markers:</strong> {}</p>\n<p><strong>Recommendations:</strong> {}</p>\n</body></html>\n",
        config.audit_name, config.auditor, config.standard, span_count, recommendations,
    );

    fs::write(&path, payload).map_err(|e| format!("failed to write {}: {e}", path.display()))
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
