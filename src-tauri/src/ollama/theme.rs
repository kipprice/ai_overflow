//! Theme extraction via a local Ollama model.

use super::http;
use crate::theme;
use serde_json::{json, Value};

/// Asks a local Ollama model for a short label for a context, from its first question.
///
/// Thinking is disabled to keep it fast; models that reject the `think` flag are retried
/// without it.
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
    let mut body = theme_request(&model, &text);
    let resp = match http::post(&base_url, "/api/chat", &body).await {
        Ok(resp) => resp,
        Err(_) => {
            body.as_object_mut().expect("object body").remove("think");
            http::post(&base_url, "/api/chat", &body).await?
        }
    };
    let reply = http::decode(resp).await?;
    theme::clean(reply["message"]["content"].as_str().unwrap_or_default())
}

/// Builds the non-streaming chat request for theme extraction.
fn theme_request(model: &str, text: &str) -> Value {
    json!({
        "model": model,
        "stream": false,
        "think": false,
        "messages": [
            { "role": "system", "content": theme::SYSTEM_PROMPT },
            { "role": "user", "content": theme::user_prompt(text) },
        ],
    })
}
