//! Claude harness: drives the Claude Code CLI (`claude -p`) with stream-json output.
//!
//! Using the CLI rather than the API means the user's existing Claude Code login, slash
//! commands and effort settings all work unchanged.

pub mod chat;
mod cli;
mod failure;
mod line_events;
mod oneshot;
mod parser;
#[cfg(test)]
mod parser_tests;
pub mod resolution;
pub mod status;
pub mod tags;
pub mod theme;
mod tool_detail;
