//! Ollama harness: talks to the local Ollama HTTP API (`/api/chat`, `/api/tags`, `/api/show`).

pub mod chat;
mod http;
mod message;
pub mod models;
pub(crate) mod ndjson;
mod oneshot;
pub mod resolution;
pub mod theme;
