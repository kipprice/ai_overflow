//! Streaming events sent from a harness to the frontend on the `chat-event` channel.

use serde::Serialize;
use tauri::{AppHandle, Emitter};

/// One unit of streamed output from a harness.
#[derive(Serialize, Clone, Debug)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum ChatEvent {
    /// Slash commands the harness reported as available.
    Commands { commands: Vec<String> },
    /// A chunk of answer text.
    Text { text: String },
    /// A chunk of the model's visible reasoning.
    Thinking { text: String },
    /// The model invoked a tool (e.g. a web search).
    Tool { name: String, detail: String },
    /// The turn finished; `result` is the final text (used for slash command output).
    #[serde(rename_all = "camelCase")]
    Done {
        result: Option<String>,
        session_id: Option<String>,
        is_error: bool,
    },
    /// The turn failed.
    Error { message: String },
}

impl ChatEvent {
    /// A successful completion with no extra payload (used by Ollama).
    ///
    /// # Returns
    /// A `Done` event with no result text or session id.
    pub fn done() -> Self {
        ChatEvent::Done { result: None, session_id: None, is_error: false }
    }
}

/// The wire format: the event plus the request it belongs to.
#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Envelope<'a> {
    request_id: &'a str,
    #[serde(flatten)]
    event: ChatEvent,
}

/// Sends an event to the frontend, tagged with its request id.
///
/// All requests share one channel so the frontend needs a single listener.
///
/// # Arguments
/// * `app` - the Tauri app handle used to emit.
/// * `request_id` - the request the event belongs to.
/// * `event` - the event to send.
pub fn emit(app: &AppHandle, request_id: &str, event: ChatEvent) {
    let _ = app.emit("chat-event", Envelope { request_id, event });
}
