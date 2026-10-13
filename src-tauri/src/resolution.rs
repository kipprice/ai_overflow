//! Shared pieces of resolution summarising used by both the Claude and Ollama harnesses.
//!
//! When the user accepts an answer (or a highlighted part of one) as what settled their
//! question, a cheap model turns that excerpt into a standalone sentence, so the recorded
//! resolution reads as an answer rather than as a fragment torn out of a longer reply.

use crate::text;

/// Instructions given to the summarising model.
pub const SYSTEM_PROMPT: &str = "You summarise solutions. The user gives a question and the part of an answer they accepted as its solution. Reply with ONLY one or two plain sentences, at most 40 words, saying what the resolution was, written as a note to the asker's future self. Do not restate the question. No preamble, headings, markdown, code fences or quotes.";

/// Longest summary we keep, in characters.
const MAX_SUMMARY_CHARS: usize = 240;

/// Prefixes small models like to put in front of the summary.
const LABEL_PREFIXES: [&str; 3] = ["Resolution:", "Summary:", "Answer:"];

/// Wraps the question and the accepted text in the message sent to the model.
///
/// # Arguments
/// * `question` - the question that was asked.
/// * `accepted` - the answer text the user accepted as the solution.
///
/// # Returns
/// The prompt text.
pub fn user_prompt(question: &str, accepted: &str) -> String {
    format!(
        "<question>\n{question}\n</question>\n\n<accepted>\n{accepted}\n</accepted>\n\nResolution:"
    )
}

/// Normalises a model's reply into one short paragraph.
///
/// Unlike a theme label this keeps every line, because a summary may run to two sentences;
/// they are collapsed onto one line so the banner that shows it stays a fixed height.
///
/// # Arguments
/// * `raw` - the model's raw reply.
///
/// # Returns
/// The cleaned summary.
///
/// # Errors
/// Returns an error if nothing usable is left after cleaning.
pub fn clean(raw: &str) -> Result<String, String> {
    let collapsed = raw.split_whitespace().collect::<Vec<_>>().join(" ");
    let summary = text::strip_decoration(&collapsed, &LABEL_PREFIXES);
    if summary.is_empty() {
        return Err("Model returned an empty summary".into());
    }
    Ok(text::truncate(summary, MAX_SUMMARY_CHARS))
}
