//! Claude harness: drives the Claude Code CLI (`claude -p`) with stream-json output.
//!
//! Using the CLI rather than the API means the user's existing Claude Code login, slash
//! commands and effort settings all work unchanged.

pub mod chat;
mod cli;
mod failure;
mod line_events;
mod parser;
#[cfg(test)]
mod parser_tests;
pub mod status;
pub mod theme;
mod tool_detail;
