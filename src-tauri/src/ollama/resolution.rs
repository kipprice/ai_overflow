//! Resolution summarising via a local Ollama model.

use super::oneshot;
use crate::resolution;

/// Asks a local Ollama model to state, in a sentence, how a question was resolved.
///
/// # Arguments
/// * `base_url` - the Ollama server.
/// * `model` - the model name.
/// * `question` - the question that was asked.
/// * `accepted` - the answer text the user accepted as the solution.
///
/// # Returns
/// The cleaned resolution summary.
///
/// # Errors
/// Returns an error if Ollama fails or returns an empty summary.
#[tauri::command]
pub async fn ollama_resolution(
    base_url: String,
    model: String,
    question: String,
    accepted: String,
) -> Result<String, String> {
    let prompt = resolution::user_prompt(&question, &accepted);
    let reply = oneshot::ask(&base_url, &model, resolution::SYSTEM_PROMPT, &prompt).await?;
    resolution::clean(&reply)
}
