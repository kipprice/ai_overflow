import type { Topic } from '$lib/types';

/**
 * The label shown for a topic in the sidebar and feed.
 * @param topic - the topic to label.
 * @returns its theme, or a placeholder while it is still being named.
 */
export function topicLabel(topic: Topic): string {
  return topic.theme ?? 'Naming…';
}
