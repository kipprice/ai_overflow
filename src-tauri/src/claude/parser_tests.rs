//! Tests for [`StreamParser`] using line shapes captured from real `claude -p` output.

use super::parser::StreamParser;
use crate::events::ChatEvent;

const INIT: &str = r#"{"type":"system","subtype":"init","session_id":"s1","slash_commands":["compact","__internal","cost"]}"#;
const TEXT_START: &str = r#"{"type":"stream_event","event":{"type":"content_block_start","index":1,"content_block":{"type":"text","text":""}},"parent_tool_use_id":null}"#;
const TOOL_CALL: &str = r#"{"type":"assistant","message":{"content":[{"type":"tool_use","name":"WebSearch","input":{"query":"tauri version"}}]},"parent_tool_use_id":null}"#;
const SUBAGENT_TEXT: &str = r#"{"type":"stream_event","event":{"type":"content_block_delta","delta":{"type":"text_delta","text":"hidden"}},"parent_tool_use_id":"toolu_1"}"#;

fn text_delta(text: &str) -> String {
    format!(r#"{{"type":"stream_event","event":{{"type":"content_block_delta","index":1,"delta":{{"type":"text_delta","text":"{text}"}}}},"parent_tool_use_id":null}}"#)
}

fn result(text: &str) -> String {
    format!(r#"{{"type":"result","subtype":"success","is_error":false,"result":"{text}","session_id":"s2"}}"#)
}

fn texts(events: &[ChatEvent]) -> String {
    events
        .iter()
        .filter_map(|e| match e {
            ChatEvent::Text { text } => Some(text.as_str()),
            _ => None,
        })
        .collect()
}

#[test]
fn init_reports_public_slash_commands() {
    let events = StreamParser::default().parse_line(INIT);
    assert!(matches!(&events[..], [ChatEvent::Commands { commands }] if commands == &["compact", "cost"]));
}

#[test]
fn streams_text_and_separates_later_blocks() {
    let mut parser = StreamParser::default();
    let lines = [TEXT_START.to_string(), text_delta("Hi"), TEXT_START.to_string(), text_delta("there")];
    let events: Vec<_> = lines.iter().flat_map(|l| parser.parse_line(l)).collect();
    assert_eq!(texts(&events), "Hi\n\nthere");
}

#[test]
fn reports_tool_calls_and_ignores_subagents() {
    let mut parser = StreamParser::default();
    assert!(matches!(&parser.parse_line(TOOL_CALL)[..], [ChatEvent::Tool { name, detail }] if name == "WebSearch" && detail == "tauri version"));
    assert!(parser.parse_line(SUBAGENT_TEXT).is_empty());
}

#[test]
fn keeps_only_the_last_result() {
    // Turns that use background agents report one result per model turn.
    let mut parser = StreamParser::default();
    assert!(parser.parse_line(&result("Let me wait")).is_empty());
    parser.parse_line(&result("Tauri is at version 2"));
    assert!(matches!(parser.result, Some(ChatEvent::Done { result: Some(ref r), .. }) if r == "Tauri is at version 2"));
}

#[test]
fn ignores_garbage() {
    assert!(StreamParser::default().parse_line("not json").is_empty());
}
