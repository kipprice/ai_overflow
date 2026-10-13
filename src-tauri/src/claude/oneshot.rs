//! One-shot Claude CLI calls: one prompt in, one short reply out.
//!
//! Exists so the small helper requests (theme labels, resolution summaries) share a single
//! cheap, tool-less invocation that never touches the user's sessions, MCP or settings.

use super::cli;
use serde_json::Value;

/// Runs a prompt through a minimal `claude -p` invocation and returns what it said.
///
/// # Arguments
/// * `system` - the system prompt for the task, replacing Claude Code's own.
/// * `prompt` - the user message.
/// * `model` - the Claude model id (typically Haiku).
/// * `claude_path` - optional explicit path to the CLI.
///
/// # Returns
/// The model's raw reply text, for the caller to clean.
///
/// # Errors
/// Returns an error if the CLI can't start, can't be read, or reports an error.
pub async fn ask(
    system: &str,
    prompt: &str,
    model: &str,
    claude_path: Option<&str>,
) -> Result<String, String> {
    let mut cmd = cli::command(claude_path)?;
    cmd.current_dir(std::env::temp_dir()).args(cli::oneshot_args(model, system));
    let child = cli::spawn_with_input(cmd, prompt).await?;
    let output = child.wait_with_output().await.map_err(|e| e.to_string())?;
    parse_reply(&output.stdout, &output.stderr)
}

/// Extracts the reply text from the CLI's `--output-format json` result.
fn parse_reply(stdout: &[u8], stderr: &[u8]) -> Result<String, String> {
    let v: Value = serde_json::from_slice(stdout)
        .map_err(|_| failed(String::from_utf8_lossy(stderr).trim()))?;
    let result = v["result"].as_str().unwrap_or_default().to_string();
    if v["is_error"].as_bool().unwrap_or(false) {
        return Err(failed(&result));
    }
    Ok(result)
}

/// Phrases a CLI failure for the frontend.
fn failed(detail: &str) -> String {
    format!("Claude helper call failed: {detail}")
}
