//! Builds [`ChatEvent`]s from whole stream-json lines (init, assistant, result).

use super::tool_detail::tool_detail;
use crate::events::ChatEvent;
use serde_json::Value;

/// Builds the available-slash-commands event from the `init` line.
///
/// # Arguments
/// * `v` - the parsed `system`/`init` line.
///
/// # Returns
/// A `Commands` event, if the line lists commands.
pub fn init_events(v: &Value) -> Vec<ChatEvent> {
    let Some(list) = v["slash_commands"].as_array() else { return vec![] };
    let commands = list
        .iter()
        .filter_map(Value::as_str)
        .filter(|c| !c.starts_with("__"))
        .map(String::from)
        .collect();
    vec![ChatEvent::Commands { commands }]
}

/// Builds one `Tool` event per tool call in a completed assistant message.
///
/// # Arguments
/// * `message` - the `message` object of an `assistant` line.
///
/// # Returns
/// The tool events (usually none).
pub fn tool_events(message: &Value) -> Vec<ChatEvent> {
    let blocks = message["content"].as_array().into_iter().flatten();
    blocks
        .filter(|b| b["type"] == "tool_use")
        .map(|b| ChatEvent::Tool {
            name: b["name"].as_str().unwrap_or("tool").into(),
            detail: tool_detail(&b["input"]),
        })
        .collect()
}

/// Builds the final `Done` event from the `result` line.
///
/// # Arguments
/// * `v` - the parsed `result` line.
///
/// # Returns
/// The `Done` event carrying the final text, session id and error flag.
pub fn result_event(v: &Value) -> ChatEvent {
    ChatEvent::Done {
        result: v["result"].as_str().map(String::from),
        session_id: v["session_id"].as_str().map(String::from),
        is_error: v["is_error"].as_bool().unwrap_or(false),
    }
}
