//! Tag extraction via a one-shot Claude CLI call.

use super::oneshot;
use crate::tags::{self, ExtractedTag};

/// Asks a (cheap) Claude model which languages, tools and concepts an exchange was about.
///
/// # Arguments
/// * `question` - the question that was asked.
/// * `answer` - the answer it got.
/// * `vocabulary` - labels already used elsewhere in the feed, for the model to reuse.
/// * `model` - the Claude model id (typically Haiku).
/// * `claude_path` - optional explicit path to the CLI.
///
/// # Returns
/// The tags the model suggested.
///
/// # Errors
/// Returns an error if the CLI fails, reports an error, or returns no usable tags.
#[tauri::command]
pub async fn claude_tags(
    question: String,
    answer: String,
    vocabulary: Vec<String>,
    model: String,
    claude_path: Option<String>,
) -> Result<Vec<ExtractedTag>, String> {
    let prompt = tags::user_prompt(&question, &answer, &vocabulary);
    let reply = oneshot::ask(tags::SYSTEM_PROMPT, &prompt, &model, claude_path.as_deref()).await?;
    tags::clean(&reply)
}
