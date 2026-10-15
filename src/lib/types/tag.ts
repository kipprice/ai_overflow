/** Which axis a tag labels: the language asked about, a tool, the concept at play, or the field. */
export type TagFacet = 'language' | 'tool' | 'concept' | 'domain';

/** Who put a tag on a context: the tagging model, or the user. */
export type TagSource = 'auto' | 'user';

/**
 * One label on a context. The label is the tag's identity: it is always lowercase, one word,
 * hyphenated, so the same idea can't be filed under two spellings.
 */
export interface Tag {
  label: string;
  facet: TagFacet;
  source: TagSource;
}

/**
 * Lifecycle of tagging one exchange. An exchange with no status has never been tagged, as
 * for those saved before tagging existed; the user can autotag it from the feed.
 */
export type TagStatus = 'pending' | 'done' | 'failed';

/** A tag as the tagging model suggested it, before it is normalised into a `Tag`. */
export interface ExtractedTag {
  label: string;
  facet: string;
}
