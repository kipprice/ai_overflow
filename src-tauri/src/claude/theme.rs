//! Theme extraction via a one-shot Claude CLI call.

use super::oneshot;
use crate::theme;

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
    let prompt = theme::user_prompt(&text);
    let reply =
        oneshot::ask(theme::SYSTEM_PROMPT, &prompt, &model, claude_path.as_deref()).await?;
    theme::clean(&reply)
}
