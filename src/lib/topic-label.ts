import type { Topic } from "$lib/types";

/**
 * A topic's own name, with no resolution marker. Use this when the name is about to be
 * edited, so the marker can't be typed into it.
 * @param topic - the topic to name.
 * @returns its theme, or a placeholder while it is still being named.
 */
export function topicName(topic: Topic): string {
  return topic.theme ?? "Naming…";
}

/**
 * The label shown for a topic in the sidebar and feed, marked once its question has been
 * resolved so a settled question is recognisable at a glance.
 * @param topic - the topic to label.
 * @returns the display label.
 */
export function topicLabel(topic: Topic): string {
  const name = topicName(topic);
  if (!topic.theme) {
    return name;
  }
  return topic.resolution?.state === "active" ? `${name} (Resolved)` : name;
}
