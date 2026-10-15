//! Shared pieces of tag extraction used by both the Claude and Ollama harnesses.
//!
//! Tags are what makes the archive searchable once a question has scrolled out of reach: a
//! context is labelled with the language, tools and concepts it touches, so a later question
//! about the same thing can find it. Extraction runs after every answered prompt, because a
//! follow-up often brings in something the context's first question never mentioned.

mod parse;
mod prompt;

pub use parse::clean;
pub use prompt::user_prompt;

use serde::Serialize;

/// One tag suggested by the model.
///
/// The label arrives roughly as the model wrote it: the frontend owns the rules every tag in
/// the feed follows, so that a tag typed by the user and a tag from a model are normalised
/// in exactly one place.
#[derive(Serialize)]
pub struct ExtractedTag {
    /// What the tag is called, e.g. `rust`.
    pub label: String,
    /// Which axis it labels: one of `language`, `tool`, `concept` or `domain`.
    pub facet: String,
}

/// Instructions given to the tagging model.
///
/// The vocabulary rule is the important one: without it the same idea accumulates a tag per
/// spelling (`ts`, `typescript`, `type-script`) and search stops working.
pub const SYSTEM_PROMPT: &str = "You tag questions in a developer's personal Q&A archive so that related questions can be found later. Read the exchange and reply with ONLY 1 to 5 lines, each of the form `facet: label`. The facets are language (a programming language), tool (a library, framework, CLI or service), concept (a technique, pattern or idea) and domain (the area of work). A label is lowercase, names one thing, and uses hyphens instead of spaces. Reuse a label from the vocabulary whenever one fits; invent a label only when nothing there applies. Do not tag the obvious act of asking. No numbering, no markdown, no commentary.";
