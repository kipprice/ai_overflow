//! Shared pieces of theme extraction used by both the Claude and Ollama harnesses.

use crate::text;

/// Instructions given to the theme model.
pub const SYSTEM_PROMPT: &str = "You label questions. Read the question the user provides and reply with ONLY a concise 2-5 word topic label in Title Case that captures its theme. Do not answer the question. No quotes, no trailing punctuation, no explanation.";

/// Longest theme we keep, in characters.
const MAX_THEME_CHARS: usize = 60;

/// Prefixes small models like to put in front of the label.
const LABEL_PREFIXES: [&str; 3] = ["Topic label:", "Topic:", "Theme:"];

/// Wraps the user's question in the message sent to the theme model.
///
/// # Arguments
/// * `question` - the first question asked in a context.
///
/// # Returns
/// The prompt text.
pub fn user_prompt(question: &str) -> String {
    format!("<question>\n{question}\n</question>\n\nTopic label:")
}

/// Normalises a model's reply into a short, single-line label.
///
/// # Arguments
/// * `raw` - the model's raw reply.
///
/// # Returns
/// The cleaned label.
///
/// # Errors
/// Returns an error if nothing usable is left after cleaning.
pub fn clean(raw: &str) -> Result<String, String> {
    let first_line = raw.lines().find(|l| !l.trim().is_empty()).unwrap_or("");
    let label = text::strip_decoration(first_line, &LABEL_PREFIXES)
        .trim_end_matches(['.', '!', '?'])
        .trim();
    if label.is_empty() {
        return Err("Model returned an empty theme".into());
    }
    Ok(text::truncate(label, MAX_THEME_CHARS))
}
