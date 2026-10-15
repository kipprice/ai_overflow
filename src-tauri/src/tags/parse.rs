//! Turning the tagging model's reply into a list of tags.

use super::ExtractedTag;
use crate::text;

/// Facets a tag may be filed under. Anything else the model invents becomes `concept`, which
/// is the catch-all the prompt describes.
const FACETS: [&str; 4] = ["language", "tool", "concept", "domain"];

/// Most tags we keep from one reply, however many the model lists.
const MAX_TAGS: usize = 5;

/// Prefixes small models like to put in front of the list.
const LABEL_PREFIXES: [&str; 2] = ["Tags:", "Tag:"];

/// Parses the model's `facet: label` lines into tags, dropping duplicates and anything
/// unusable.
///
/// Unparseable lines are skipped rather than failing the whole reply: a small model that
/// prefixes its list with a sentence has still given us four good tags underneath it.
///
/// # Arguments
/// * `raw` - the model's raw reply.
///
/// # Returns
/// The tags, in the order the model listed them.
///
/// # Errors
/// Returns an error if no line held a usable tag.
pub fn clean(raw: &str) -> Result<Vec<ExtractedTag>, String> {
    let mut tags: Vec<ExtractedTag> = Vec::new();
    for line in raw.lines() {
        let Some(tag) = parse_line(line) else { continue };
        if tags.iter().any(|kept| kept.label == tag.label) {
            continue;
        }
        tags.push(tag);
        if tags.len() == MAX_TAGS {
            break;
        }
    }
    if tags.is_empty() {
        return Err("Model returned no usable tags".into());
    }
    Ok(tags)
}

/// One `facet: label` line, or `None` when the line holds nothing usable.
///
/// A line with no facet is only taken as a bare label when it is a single word, which is
/// what keeps a stray sentence of commentary from being filed as a tag.
fn parse_line(line: &str) -> Option<ExtractedTag> {
    let stripped = text::strip_decoration(line, &LABEL_PREFIXES);
    // Each half is stripped again: emphasis wrapping only the facet, as in `**tool:** cargo`,
    // leaves its closing marker behind on the label once the line is split.
    let (facet, label) = match stripped.split_once(':') {
        Some((facet, label)) => (facet_of(facet), text::strip_decoration(label, &[])),
        None => (facet_of(""), stripped),
    };
    if label.is_empty() || (!stripped.contains(':') && label.contains(char::is_whitespace)) {
        return None;
    }
    Some(ExtractedTag { label: label.to_lowercase(), facet })
}

/// The facet named, or `concept` when the model made one up.
fn facet_of(raw: &str) -> String {
    let named = raw.trim().to_lowercase();
    if FACETS.contains(&named.as_str()) {
        named
    } else {
        "concept".to_string()
    }
}
