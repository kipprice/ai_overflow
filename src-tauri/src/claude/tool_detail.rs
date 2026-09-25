//! Summarises a tool call's input for display in the feed.

use serde_json::Value;

/// Input fields that best describe a tool call, in order of preference.
const DESCRIPTIVE_FIELDS: [&str; 7] =
    ["query", "url", "command", "file_path", "pattern", "description", "prompt"];

/// Longest summary shown, in characters.
const MAX_CHARS: usize = 160;

/// Produces a one-line summary of a tool call's input, e.g. the search query.
///
/// # Arguments
/// * `input` - the tool call's JSON input.
///
/// # Returns
/// The most descriptive field (or the raw JSON), truncated with an ellipsis.
pub fn tool_detail(input: &Value) -> String {
    let detail = DESCRIPTIVE_FIELDS
        .iter()
        .find_map(|field| input[*field].as_str().map(String::from))
        .unwrap_or_else(|| input.to_string());
    truncate(&detail)
}

/// Truncates to [`MAX_CHARS`], adding an ellipsis when shortened.
fn truncate(text: &str) -> String {
    if text.chars().count() <= MAX_CHARS {
        return text.to_string();
    }
    let mut short: String = text.chars().take(MAX_CHARS).collect();
    short.push('…');
    short
}
