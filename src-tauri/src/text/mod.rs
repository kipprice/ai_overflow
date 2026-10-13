//! Small text helpers for tidying the short replies of one-shot model calls.
//!
//! Small models routinely wrap a one-line answer in markdown, quotes or a `Label:` prefix
//! despite being told not to, so every helper reply is normalised before it is shown.

mod decoration;

pub use decoration::strip_decoration;

/// Shortens text to a character budget, marking the cut with an ellipsis.
///
/// # Arguments
/// * `text` - the text to shorten.
/// * `max_chars` - the most characters to keep, not counting the ellipsis.
///
/// # Returns
/// The text, truncated only if it was longer than the budget.
pub fn truncate(text: &str, max_chars: usize) -> String {
    if text.chars().count() <= max_chars {
        return text.to_string();
    }
    let kept: String = text.chars().take(max_chars).collect();
    format!("{}…", kept.trim_end())
}
