//! Chat messages sent to Ollama, and the focus prompt that heads every context.

use crate::focus;
use serde::{Deserialize, Serialize};

/// One message of conversation history.
#[derive(Serialize, Deserialize, Debug)]
pub struct Message {
    role: String,
    content: String,
}

/// Puts the focus system prompt at the top of the conversation.
///
/// Ollama is stateless, so the prompt is added on every turn rather than stored.
///
/// # Arguments
/// * `messages` - the conversation from the frontend (user/assistant turns).
///
/// # Returns
/// The conversation headed by the system prompt.
pub fn with_focus_prompt(messages: Vec<Message>) -> Vec<Message> {
    let system = Message { role: "system".into(), content: focus::SYSTEM_PROMPT.into() };
    std::iter::once(system).chain(messages).collect()
}
