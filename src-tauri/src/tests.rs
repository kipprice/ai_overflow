//! Unit tests for the small shared helpers: theme cleaning and NDJSON buffering.

use crate::ollama::ndjson::LineBuffer;
use crate::theme;

#[test]
fn theme_strips_decoration() {
    assert_eq!(theme::clean("**Topic: Rust Lifetimes.**\n\nextra").unwrap(), "Rust Lifetimes");
    assert_eq!(theme::clean("\"Tauri IPC\"").unwrap(), "Tauri IPC");
}

#[test]
fn theme_rejects_empty_replies() {
    assert!(theme::clean("  \n ** ").is_err());
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
