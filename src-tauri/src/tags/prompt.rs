//! Building the message sent to the tagging model.

use crate::text;

/// Longest question we send. The opening lines carry the subject; a wall of pasted code
/// after them would only cost tokens.
const MAX_QUESTION_CHARS: usize = 1000;

/// Longest answer we send. Enough to show which tools and concepts the answer leant on.
const MAX_ANSWER_CHARS: usize = 2000;

/// Shown in place of the vocabulary before the feed has any tags.
const NO_VOCABULARY: &str = "(empty — this is the first tagged question)";

/// Wraps an exchange, and the tags already in use, in the message sent to the model.
///
/// The vocabulary comes first so it frames how the exchange is read, rather than arriving as
/// an afterthought once the model has already settled on labels of its own.
///
/// # Arguments
/// * `question` - the question that was asked.
/// * `answer` - the answer it got.
/// * `vocabulary` - labels already used elsewhere in the feed, most common first.
///
/// # Returns
/// The prompt text.
pub fn user_prompt(question: &str, answer: &str, vocabulary: &[String]) -> String {
    let known = if vocabulary.is_empty() {
        NO_VOCABULARY.to_string()
    } else {
        vocabulary.join(", ")
    };
    format!(
        "<vocabulary>\n{known}\n</vocabulary>\n\n<question>\n{}\n</question>\n\n<answer>\n{}\n</answer>\n\nTags:",
        text::truncate(question, MAX_QUESTION_CHARS),
        text::truncate(answer, MAX_ANSWER_CHARS),
    )
}
