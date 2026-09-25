//! Builds and launches `claude` CLI processes.

use crate::env::{login_path, resolve_claude};
use crate::{focus, theme};
use std::process::Stdio;
use tokio::io::AsyncWriteExt;
use tokio::process::{Child, Command};

/// Creates a `claude` command with piped stdio and the user's full PATH.
///
/// # Arguments
/// * `claude_path` - optional explicit path to the executable (from Settings).
///
/// # Returns
/// A command ready for arguments.
///
/// # Errors
/// Returns an error if the executable can't be found.
pub fn command(claude_path: Option<&str>) -> Result<Command, String> {
    let mut cmd = Command::new(resolve_claude(claude_path)?);
    cmd.env("PATH", login_path())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    Ok(cmd)
}

/// Spawns the command and writes `input` to its stdin as the prompt.
///
/// The prompt goes over stdin rather than argv because `--allowedTools` is variadic and
/// would otherwise swallow it.
///
/// # Arguments
/// * `cmd` - the fully configured command.
/// * `input` - the prompt text.
///
/// # Returns
/// The running child process, with stdin closed.
///
/// # Errors
/// Returns an error if the process can't be started or written to.
pub async fn spawn_with_input(mut cmd: Command, input: &str) -> Result<Child, String> {
    let mut child = cmd.spawn().map_err(|e| format!("Failed to start claude: {e}"))?;
    let mut stdin = child.stdin.take().expect("stdin is piped");
    stdin.write_all(input.as_bytes()).await.map_err(|e| e.to_string())?;
    Ok(child)
}

/// Arguments for a streaming chat turn.
///
/// The focus prompt is appended (not substituted) so Claude Code keeps its tool
/// instructions, and is passed every turn because the CLI records it with the session.
///
/// # Arguments
/// * `model` - the model id.
/// * `effort` - optional effort level; omitted to use the CLI default.
/// * `resume` - optional session to continue. Each turn forks it, so a cancelled turn
///   never becomes part of the conversation.
///
/// # Returns
/// The argument list.
pub fn chat_args(model: &str, effort: Option<&str>, resume: Option<&str>) -> Vec<String> {
    let mut args = strings(&["-p", "--output-format", "stream-json", "--verbose"]);
    args.extend(strings(&["--include-partial-messages", "--model", model]));
    args.extend(strings(&["--append-system-prompt", focus::SYSTEM_PROMPT]));
    if let Some(effort) = effort.filter(|e| !e.is_empty()) {
        args.extend(strings(&["--effort", effort]));
    }
    if let Some(session) = resume.filter(|s| !s.is_empty()) {
        args.extend(strings(&["--resume", session, "--fork-session"]));
    }
    args.extend(strings(&["--allowedTools", "WebSearch", "WebFetch"]));
    args
}

/// Arguments for a cheap, one-shot theme request.
///
/// Replaces the Claude Code system prompt and disables tools, MCP, settings and sessions,
/// which cuts the cost of a Haiku call to a fraction of a cent.
///
/// # Arguments
/// * `model` - the model id.
///
/// # Returns
/// The argument list.
pub fn theme_args(model: &str) -> Vec<String> {
    strings(&[
        "-p", "--model", model, "--system-prompt", theme::SYSTEM_PROMPT,
        "--tools", "", "--strict-mcp-config", "--no-session-persistence",
        "--setting-sources", "", "--disable-slash-commands", "--output-format", "json",
    ])
}

/// Converts string slices to owned strings.
fn strings(items: &[&str]) -> Vec<String> {
    items.iter().map(|s| s.to_string()).collect()
}
