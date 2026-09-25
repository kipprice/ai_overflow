//! Shared pieces of theme extraction used by both the Claude and Ollama harnesses.

/// Instructions given to the theme model.
pub const SYSTEM_PROMPT: &str = "You label questions. Read the question the user provides and reply with ONLY a concise 2-5 word topic label in Title Case that captures its theme. Do not answer the question. No quotes, no trailing punctuation, no explanation.";

/// Longest theme we keep, in characters.
const MAX_THEME_CHARS: usize = 60;

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
/// Small models often add markdown, quotes or a "Topic:" prefix despite instructions.
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
    let first_line = raw.lines().map(str::trim).find(|l| !l.is_empty()).unwrap_or("");
    let label = strip_decoration(first_line);
    if label.is_empty() {
        return Err("Model returned an empty theme".into());
    }
    Ok(label.chars().take(MAX_THEME_CHARS).collect())
}

/// Removes markdown markers, label prefixes, quotes and trailing punctuation.
fn strip_decoration(line: &str) -> &str {
    line.trim_start_matches(|c: char| c == '#' || c == '*' || c.is_whitespace())
        .trim_start_matches("Topic label:")
        .trim_start_matches("Topic:")
        .trim_start_matches("Theme:")
        .trim()
        .trim_matches(|c: char| matches!(c, '"' | '\'' | '*' | '`'))
        .trim_end_matches(['.', '!', '?'])
        .trim()
}
