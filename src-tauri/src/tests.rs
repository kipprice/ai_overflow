//! Unit tests for the small shared helpers: reply cleaning and NDJSON buffering.

use crate::ollama::ndjson::LineBuffer;
use crate::{resolution, theme};

#[test]
fn theme_strips_decoration() {
    assert_eq!(theme::clean("**Topic: Rust Lifetimes.**\n\nextra").unwrap(), "Rust Lifetimes");
    assert_eq!(theme::clean("\"Tauri IPC\"").unwrap(), "Tauri IPC");
}

#[test]
fn theme_strips_quotes_from_behind_a_label() {
    // The label has to go before the quotes are a balanced pair to strip.
    assert_eq!(theme::clean("Topic: \"Session Resume Bug\"").unwrap(), "Session Resume Bug");
    assert_eq!(theme::clean("**Topic:** Session Resume Bug").unwrap(), "Session Resume Bug");
}

#[test]
fn theme_rejects_empty_replies() {
    assert!(theme::clean("  \n ** ").is_err());
}

#[test]
fn resolution_collapses_to_one_line() {
    let cleaned = resolution::clean("Summary: Pass `--fork-session`\nso the resume never\nmutates.");
    assert_eq!(cleaned.unwrap(), "Pass `--fork-session` so the resume never mutates.");
}

#[test]
fn resolution_keeps_flags_and_code_spans_intact() {
    // A leading `-` is a bullet only when whitespace follows it, never a flag's own dash.
    let flag = resolution::clean("--fork-session keeps the parent session intact.");
    assert_eq!(flag.unwrap(), "--fork-session keeps the parent session intact.");
    // A lone backtick closes an inline-code span; stripping it would leave it unbalanced.
    let span = resolution::clean("Summary: Pass the flag `--fork-session`");
    assert_eq!(span.unwrap(), "Pass the flag `--fork-session`");
    // A real bullet still goes.
    assert_eq!(resolution::clean("- Use `--fork-session`").unwrap(), "Use `--fork-session`");
}

#[test]
fn resolution_strips_quotes_from_behind_a_label() {
    assert_eq!(resolution::clean("Summary: \"Pass the flag\"").unwrap(), "Pass the flag");
}

#[test]
fn resolution_rejects_empty_replies() {
    assert!(resolution::clean("\n  ## \n").is_err());
}

#[test]
fn line_buffer_reassembles_split_lines() {
    let mut buffer = LineBuffer::default();
    assert!(buffer.push(br#"{"a":"#).is_empty());
    let values = buffer.push(b"1}\n{\"b\":2}\n{\"c\"");
    assert_eq!(values.len(), 2);
    assert_eq!(values[0]["a"], 1);
    assert_eq!(values[1]["b"], 2);
}
