//! Unit tests for the small shared helpers: reply cleaning and NDJSON buffering.

use crate::ollama::ndjson::LineBuffer;
use crate::{resolution, tags, theme};

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
fn tags_read_facet_and_label_from_each_line() {
    let parsed = tags::clean("language: Rust\n- tool: Tauri\n**concept:** lifetimes").unwrap();
    let pairs: Vec<_> = parsed.iter().map(|t| (t.facet.as_str(), t.label.as_str())).collect();
    assert_eq!(pairs, [("language", "rust"), ("tool", "tauri"), ("concept", "lifetimes")]);
}

#[test]
fn tags_file_invented_facets_under_concept() {
    let parsed = tags::clean("framework: svelte").unwrap();
    assert_eq!((parsed[0].facet.as_str(), parsed[0].label.as_str()), ("concept", "svelte"));
}

#[test]
fn tags_skip_commentary_but_keep_the_list_under_it() {
    // A bare word is taken as a label; a sentence without a facet is not a tag.
    let parsed = tags::clean("Here are the tags for this exchange:\nrust\ntool: cargo").unwrap();
    let labels: Vec<_> = parsed.iter().map(|t| t.label.as_str()).collect();
    assert_eq!(labels, ["rust", "cargo"]);
}

#[test]
fn tags_drop_duplicates_and_cap_the_list() {
    let parsed = tags::clean("tool: tauri\nconcept: tauri\na\nb\nc\nd\ne").unwrap();
    let labels: Vec<_> = parsed.iter().map(|t| t.label.as_str()).collect();
    assert_eq!(labels, ["tauri", "a", "b", "c", "d"]);
}

#[test]
fn tags_reject_replies_with_nothing_usable() {
    assert!(tags::clean("I could not identify any tags here.").is_err());
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
