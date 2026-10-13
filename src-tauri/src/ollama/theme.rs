//! Theme extraction via a local Ollama model.

use super::oneshot;
use crate::theme;

/// Asks a local Ollama model for a short label for a context, from its first question.
///
/// # Arguments
/// * `base_url` - the Ollama server.
/// * `model` - the model name.
/// * `text` - the first question asked in the context.
///
/// # Returns
/// The cleaned theme label.
///
/// # Errors
/// Returns an error if Ollama fails or returns an empty label.
#[tauri::command]
pub async fn ollama_theme(base_url: String, model: String, text: String) -> Result<String, String> {
    let prompt = theme::user_prompt(&text);
    let reply = oneshot::ask(&base_url, &model, theme::SYSTEM_PROMPT, &prompt).await?;
    theme::clean(&reply)
}
