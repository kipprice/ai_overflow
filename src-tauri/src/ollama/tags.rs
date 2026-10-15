//! Tag extraction via a local Ollama model.

use super::oneshot;
use crate::tags::{self, ExtractedTag};

/// Asks a local Ollama model which languages, tools and concepts an exchange was about.
///
/// # Arguments
/// * `base_url` - the Ollama server.
/// * `model` - the model name.
/// * `question` - the question that was asked.
/// * `answer` - the answer it got.
/// * `vocabulary` - labels already used elsewhere in the feed, for the model to reuse.
///
/// # Returns
/// The tags the model suggested.
///
/// # Errors
/// Returns an error if Ollama fails or returns no usable tags.
#[tauri::command]
pub async fn ollama_tags(
    base_url: String,
    model: String,
    question: String,
    answer: String,
    vocabulary: Vec<String>,
) -> Result<Vec<ExtractedTag>, String> {
    let prompt = tags::user_prompt(&question, &answer, &vocabulary);
    let reply = oneshot::ask(&base_url, &model, tags::SYSTEM_PROMPT, &prompt).await?;
    tags::clean(&reply)
}
