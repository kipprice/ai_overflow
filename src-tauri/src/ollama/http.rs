//! Small HTTP helpers shared by every Ollama call.

use reqwest::Response;
use serde_json::Value;

/// Sends a GET request and decodes the JSON response.
///
/// # Arguments
/// * `base_url` - the Ollama server, e.g. `http://localhost:11434`.
/// * `path` - the API path, e.g. `/api/tags`.
///
/// # Returns
/// The decoded JSON body.
///
/// # Errors
/// Returns a readable error if Ollama is unreachable or replies with an error.
pub async fn get_json(base_url: &str, path: &str) -> Result<Value, String> {
    let resp = reqwest::get(endpoint(base_url, path))
        .await
        .map_err(|e| unreachable(base_url, e))?;
    decode(ensure_success(resp).await?).await
}

/// Sends a JSON POST request and returns the (successful) response.
///
/// # Arguments
/// * `base_url` - the Ollama server.
/// * `path` - the API path, e.g. `/api/chat`.
/// * `body` - the JSON request body.
///
/// # Returns
/// The response, which the caller may stream or decode.
///
/// # Errors
/// Returns a readable error if Ollama is unreachable or replies with an error.
pub async fn post(base_url: &str, path: &str, body: &Value) -> Result<Response, String> {
    let resp = reqwest::Client::new()
        .post(endpoint(base_url, path))
        .json(body)
        .send()
        .await
        .map_err(|e| unreachable(base_url, e))?;
    ensure_success(resp).await
}

/// Decodes a response body as JSON.
///
/// # Arguments
/// * `resp` - a successful response.
///
/// # Returns
/// The decoded JSON body.
///
/// # Errors
/// Returns an error if the body isn't valid JSON.
pub async fn decode(resp: Response) -> Result<Value, String> {
    resp.json().await.map_err(|e| e.to_string())
}

/// Joins the base URL and path, tolerating a trailing slash on the base.
fn endpoint(base_url: &str, path: &str) -> String {
    format!("{}{}", base_url.trim_end_matches('/'), path)
}

/// Explains a connection failure.
fn unreachable(base_url: &str, e: reqwest::Error) -> String {
    format!("Could not reach Ollama at {base_url}: {e}")
}

/// Turns a non-2xx response into Ollama's error message.
async fn ensure_success(resp: Response) -> Result<Response, String> {
    let status = resp.status();
    if status.is_success() {
        return Ok(resp);
    }
    let body: Value = resp.json().await.unwrap_or_default();
    Err(body["error"].as_str().map(String::from).unwrap_or_else(|| format!("Ollama returned {status}")))
}
