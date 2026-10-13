//! Resolution summarising via a one-shot Claude CLI call.

use super::oneshot;
use crate::resolution;

/// Asks a (cheap) Claude model to state, in a sentence, how a question was resolved.
///
/// # Arguments
/// * `question` - the question that was asked.
/// * `accepted` - the answer text the user accepted as the solution.
/// * `model` - the Claude model id (typically Haiku).
/// * `claude_path` - optional explicit path to the CLI.
///
/// # Returns
/// The cleaned resolution summary.
///
/// # Errors
/// Returns an error if the CLI fails, reports an error, or returns an empty summary.
#[tauri::command]
pub async fn claude_resolution(
    question: String,
    accepted: String,
    model: String,
    claude_path: Option<String>,
) -> Result<String, String> {
    let prompt = resolution::user_prompt(&question, &accepted);
    let reply =
        oneshot::ask(resolution::SYSTEM_PROMPT, &prompt, &model, claude_path.as_deref()).await?;
    resolution::clean(&reply)
}
