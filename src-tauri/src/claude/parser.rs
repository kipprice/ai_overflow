//! Translates the CLI's stream-json lines into [`ChatEvent`]s.

use super::line_events::{init_events, result_event, tool_events};
use crate::events::ChatEvent;
use serde_json::Value;

/// Stateful parser for one turn's stream-json output.
#[derive(Default)]
pub struct StreamParser {
    /// The latest `Done` event. Held back rather than emitted, because a turn that uses
    /// background agents reports several results and only the last one is final.
    pub result: Option<ChatEvent>,
    /// Whether any answer text has been streamed yet (to separate later text blocks).
    wrote_text: bool,
}

impl StreamParser {
    /// Parses one line of CLI output.
    ///
    /// Subagent output and unrecognised lines are ignored.
    ///
    /// # Arguments
    /// * `line` - one line of stream-json.
    ///
    /// # Returns
    /// The events it produced (often none).
    pub fn parse_line(&mut self, line: &str) -> Vec<ChatEvent> {
        let Ok(v) = serde_json::from_str::<Value>(line) else { return vec![] };
        if v.get("parent_tool_use_id").is_some_and(|p| !p.is_null()) {
            return vec![];
        }
        match (v["type"].as_str(), v["subtype"].as_str()) {
            (Some("system"), Some("init")) => init_events(&v),
            (Some("stream_event"), _) => self.stream_event(&v["event"]).into_iter().collect(),
            (Some("assistant"), _) => tool_events(&v["message"]),
            (Some("result"), _) => {
                self.result = Some(result_event(&v));
                vec![]
            }
            _ => vec![],
        }
    }

    /// Handles a raw API streaming event: text and thinking deltas.
    fn stream_event(&mut self, event: &Value) -> Option<ChatEvent> {
        let delta = &event["delta"];
        match (event["type"].as_str(), delta["type"].as_str()) {
            // Blank line between text blocks from separate messages (e.g. around a tool call).
            (Some("content_block_start"), _) if event["content_block"]["type"] == "text" => {
                self.wrote_text.then(|| ChatEvent::Text { text: "\n\n".into() })
            }
            (Some("content_block_delta"), Some("text_delta")) => {
                let text = non_empty(&delta["text"])?;
                self.wrote_text = true;
                Some(ChatEvent::Text { text })
            }
            (Some("content_block_delta"), Some("thinking_delta")) => {
                non_empty(&delta["thinking"]).map(|text| ChatEvent::Thinking { text })
            }
            _ => None,
        }
    }
}

/// Returns the string value if it's a non-empty string.
fn non_empty(v: &Value) -> Option<String> {
    v.as_str().filter(|s| !s.is_empty()).map(String::from)
}
