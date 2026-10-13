//! One-shot Ollama calls: one prompt in, one short reply out.
//!
//! Exists so the small helper requests (theme labels, resolution summaries) share a single
//! non-streaming request. Thinking is disabled to keep them fast; models that reject the
//! `think` flag are retried without it.

use super::http;
use serde_json::{json, Value};

/// Runs a prompt through a non-streaming `/api/chat` request and returns what it said.
///
/// # Arguments
/// * `base_url` - the Ollama server.
/// * `model` - the model name.
/// * `system` - the system prompt for the task.
/// * `prompt` - the user message.
///
/// # Returns
/// The model's raw reply text, for the caller to clean.
///
/// # Errors
/// Returns an error if Ollama is unreachable or replies with an error.
pub async fn ask(base_url: &str, model: &str, system: &str, prompt: &str) -> Result<String, String> {
    let mut body = request(model, system, prompt);
    let resp = match http::post(base_url, "/api/chat", &body).await {
        Ok(resp) => resp,
        Err(_) => {
            body.as_object_mut().expect("object body").remove("think");
            http::post(base_url, "/api/chat", &body).await?
        }
    };
    let reply = http::decode(resp).await?;
    Ok(reply["message"]["content"].as_str().unwrap_or_default().to_string())
}

/// Builds the non-streaming chat request for a helper call.
fn request(model: &str, system: &str, prompt: &str) -> Value {
    json!({
        "model": model,
        "stream": false,
        "think": false,
        "messages": [
            { "role": "system", "content": system },
            { "role": "user", "content": prompt },
        ],
    })
}
