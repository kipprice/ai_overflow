//! Stripping the decoration a model wraps a short reply in: markdown markers, a `Label:`
//! prefix, and quotes around the value.
//!
//! Each kind of decoration is its own step, and the order they run in is the whole point of
//! this module — see `strip_decoration`.

/// Markdown decoration that can only ever open a marker run, never start an answer.
const LEADING_MARKERS: [char; 3] = ['#', '*', '>'];

/// Marks that quote a value. These count as decoration only as a matched pair, since a lone
/// one belongs to the text: a reply may well end in an inline-code span.
const QUOTES: [char; 3] = ['"', '\'', '`'];

/// Strips the decoration a model wraps a short reply in.
///
/// Markers are stripped on both sides of the label, and that order is the point of this
/// function. `Topic: "Session Resume Bug"` has balanced quotes to strip only once its prefix
/// is gone, and `**Topic:** X` only shows its second marker run at that point too. Callers
/// get this one step rather than the three, so the order cannot be got wrong again.
///
/// # Arguments
/// * `text` - the raw reply, or one line of it.
/// * `labels` - the `Label:` prefixes to drop, each including its colon.
///
/// # Returns
/// The reply with its decoration removed.
pub fn strip_decoration<'a>(text: &'a str, labels: &[&str]) -> &'a str {
    strip_markers(strip_labels(strip_markers(text), labels))
}

/// Strips markers and wrapping quotes, repeating while either exposes the other: `"**Bold**"`
/// has to lose its quotes before its emphasis is reachable.
fn strip_markers(text: &str) -> &str {
    let mut rest = text.trim();
    loop {
        let stripped = strip_wrapping_quotes(strip_marker_runs(rest));
        if stripped.len() == rest.len() {
            return stripped;
        }
        rest = stripped;
    }
}

/// Strips the runs of markdown markers at either end, including a `- ` bullet.
fn strip_marker_runs(text: &str) -> &str {
    let mut rest = text.trim();
    while let Some(shorter) = strip_one_leading_marker(rest) {
        rest = shorter.trim_start();
    }
    // Emphasis closing a run that was opened (and stripped) at the front.
    rest.trim_end_matches(|c: char| c == '*' || c.is_whitespace())
}

/// One marker off the front, or `None` once the text no longer starts with one. A hyphen
/// counts only when whitespace follows it, so a flag like `--fork-session` keeps its dashes.
fn strip_one_leading_marker(text: &str) -> Option<&str> {
    let first = text.chars().next()?;
    if LEADING_MARKERS.contains(&first) {
        return Some(&text[first.len_utf8()..]);
    }
    let rest = text.strip_prefix('-')?;
    (rest.is_empty() || rest.starts_with(char::is_whitespace)).then_some(rest)
}

/// Strips one quote mark from each end for as long as they match each other.
fn strip_wrapping_quotes(text: &str) -> &str {
    let mut rest = text;
    loop {
        let mut chars = rest.chars();
        let Some(open) = chars.next().filter(|c| QUOTES.contains(c)) else {
            return rest;
        };
        if chars.next_back() != Some(open) {
            return rest;
        }
        rest = &rest[open.len_utf8()..rest.len() - open.len_utf8()];
    }
}

/// Removes a leading `Label:` prefix, whichever of `labels` the model chose to use.
fn strip_labels<'a>(text: &'a str, labels: &[&str]) -> &'a str {
    labels
        .iter()
        .find_map(|label| text.strip_prefix(label))
        .unwrap_or(text)
        .trim()
}
