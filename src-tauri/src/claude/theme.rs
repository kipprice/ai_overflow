//! Theme extraction via a minimal, tool-less Claude CLI call.

use super::cli;
use crate::theme;
use serde_json::Value;

/// Asks a (cheap) Claude model for a short label for a context, from its first question.
///
/// # Arguments
/// * `text` - the first question asked in the context.
/// * `model` - the Claude model id (typically Haiku).
/// * `claude_path` - optional explicit path to the CLI.
///
/// # Returns
/// The cleaned theme label.
///
/// # Errors
/// Returns an error if the CLI fails, reports an error, or returns an empty label.
#[tauri::command]
pub async fn claude_theme(
    text: String,
    model: String,
    claude_path: Option<String>,
) -> Result<String, String> {
    let mut cmd = cli::command(claude_path.as_deref())?;
    cmd.current_dir(std::env::temp_dir()).args(cli::theme_args(&model));
    let child = cli::spawn_with_input(cmd, &theme::user_prompt(&text)).await?;
    let output = child.wait_with_output().await.map_err(|e| e.to_string())?;
    let reply = parse_reply(&output.stdout, &output.stderr)?;
    theme::clean(&reply)
}

/// Extracts the reply text from the CLI's `--output-format json` result.
fn parse_reply(stdout: &[u8], stderr: &[u8]) -> Result<String, String> {
    let v: Value = serde_json::from_slice(stdout).map_err(|_| {
        format!("Theme extraction failed: {}", String::from_utf8_lossy(stderr).trim())
    })?;
    let result = v["result"].as_str().unwrap_or_default().to_string();
    if v["is_error"].as_bool().unwrap_or(false) {
        return Err(format!("Theme extraction failed: {result}"));
    }
    Ok(result)
}
