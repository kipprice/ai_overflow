//! Health check for the Claude CLI, shown in Settings.

use super::cli;

/// Reports the Claude CLI version, confirming it can be found and run.
///
/// # Arguments
/// * `claude_path` - optional explicit path to the CLI.
///
/// # Returns
/// The version string, e.g. `2.1.273 (Claude Code)`.
///
/// # Errors
/// Returns an error if the CLI can't be found or run.
#[tauri::command]
pub async fn claude_status(claude_path: Option<String>) -> Result<String, String> {
    let mut cmd = cli::command(claude_path.as_deref())?;
    let output = cmd.arg("--version").output().await.map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}
