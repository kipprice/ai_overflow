//! Discovery of installed Ollama models and their capabilities.

use super::http;
use serde_json::{json, Value};

/// Lists the models installed in Ollama, so the user can pick one.
///
/// # Arguments
/// * `base_url` - the Ollama server.
///
/// # Returns
/// Model names (e.g. `llama3.2:latest`), sorted alphabetically.
///
/// # Errors
/// Returns an error if Ollama is unreachable.
#[tauri::command]
pub async fn ollama_models(base_url: String) -> Result<Vec<String>, String> {
    let body = http::get_json(&base_url, "/api/tags").await?;
    let mut names = string_list(&body["models"], |m| m["name"].as_str());
    names.sort();
    Ok(names)
}

/// Reports a model's capabilities, used to decide whether it offers an effort (thinking) setting.
///
/// # Arguments
/// * `base_url` - the Ollama server.
/// * `model` - the model name.
///
/// # Returns
/// Capability names such as `completion`, `thinking` or `tools`.
///
/// # Errors
/// Returns an error if Ollama is unreachable or the model is unknown.
#[tauri::command]
pub async fn ollama_model_info(base_url: String, model: String) -> Result<Vec<String>, String> {
    let resp = http::post(&base_url, "/api/show", &json!({ "model": model })).await?;
    let body = http::decode(resp).await?;
    Ok(string_list(&body["capabilities"], Value::as_str))
}

/// Collects the strings `pick` extracts from each element of a JSON array.
fn string_list(array: &Value, pick: impl Fn(&Value) -> Option<&str>) -> Vec<String> {
    array
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|item| pick(item).map(String::from))
        .collect()
}
