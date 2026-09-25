//! The streaming chat turn against Ollama's `/api/chat`.

use super::message::{with_focus_prompt, Message};
use super::{http, ndjson::LineBuffer};
use crate::events::{emit, ChatEvent};
use crate::requests::Requests;
use futures_util::StreamExt;
use serde_json::{json, Value};
use tauri::{AppHandle, State};
use tokio_util::sync::CancellationToken;

/// Runs one chat turn through Ollama, streaming `chat-event`s until it finishes.
///
/// Ollama is stateless, so the frontend sends the whole context each turn and the focus
/// system prompt is prepended here.
///
/// # Arguments
/// * `app` - the Tauri app handle, used to emit events.
/// * `requests` - the registry that makes the turn cancellable.
/// * `request_id` - frontend-generated id that tags every emitted event.
/// * `base_url` - the Ollama server.
/// * `model` - the model name.
/// * `messages` - the conversation so far, ending with the new user message.
/// * `think` - optional thinking setting (`true`/`false`, or a level for gpt-oss).
///
/// # Errors
/// Never fails directly; failures arrive as `Error` events.
#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn ollama_chat(
    app: AppHandle,
    requests: State<'_, Requests>,
    request_id: String,
    base_url: String,
    model: String,
    messages: Vec<Message>,
    think: Option<Value>,
) -> Result<(), String> {
    let messages = with_focus_prompt(messages);
    let mut body = json!({ "model": model, "messages": messages, "stream": true });
    if let Some(think) = think {
        body["think"] = think;
    }
    let token = requests.register(&request_id);
    let outcome = stream_reply(&app, &request_id, &base_url, &body, &token).await;
    requests.finish(&request_id);
    if !token.is_cancelled() {
        let event = match outcome {
            Ok(()) => ChatEvent::done(),
            Err(message) => ChatEvent::Error { message },
        };
        emit(&app, &request_id, event);
    }
    Ok(())
}

/// Streams the reply, forwarding each chunk, until Ollama says it's done or we're cancelled.
async fn stream_reply(
    app: &AppHandle,
    request_id: &str,
    base_url: &str,
    body: &Value,
    token: &CancellationToken,
) -> Result<(), String> {
    let mut stream = http::post(base_url, "/api/chat", body).await?.bytes_stream();
    let mut buffer = LineBuffer::default();
    loop {
        let chunk = tokio::select! {
            _ = token.cancelled() => return Ok(()),
            chunk = stream.next() => chunk,
        };
        let Some(chunk) = chunk else { return Ok(()) };
        for line in buffer.push(&chunk.map_err(|e| e.to_string())?) {
            if forward_line(app, request_id, &line)? {
                return Ok(());
            }
        }
    }
}

/// Emits the thinking/text in one streamed line. Returns `true` once the reply is complete.
fn forward_line(app: &AppHandle, request_id: &str, line: &Value) -> Result<bool, String> {
    if let Some(error) = line["error"].as_str() {
        return Err(error.into());
    }
    let message = &line["message"];
    if let Some(text) = message["thinking"].as_str().filter(|t| !t.is_empty()) {
        emit(app, request_id, ChatEvent::Thinking { text: text.into() });
    }
    if let Some(text) = message["content"].as_str().filter(|t| !t.is_empty()) {
        emit(app, request_id, ChatEvent::Text { text: text.into() });
    }
    Ok(line["done"].as_bool() == Some(true))
}
