<!-- One search match: its theme, which session it is in, and its tags. Clicking opens it. -->
<script lang="ts">
  import { sessionName } from "$lib/state/session-name";
  import { openResult } from "$lib/state/search.svelte";
  import { store } from "$lib/state/store.svelte";
  import { sessionTopics } from "$lib/state/topics";
  import { topicLabel } from "$lib/topic-label";
  import type { Topic } from "$lib/types";

  let { topic }: { topic: Topic } = $props();

  const session = $derived(
    store.data.sessions.find((s) => s.id === topic.sessionId),
  );
  const where = $derived(
    session ? sessionName(session, sessionTopics(session.id)) : "",
  );
</script>

<!----------------------------------------------------------------------------->

<button
  class="result"
  class:active={topic.id === store.data.currentTopicId}
  onclick={() => openResult(topic)}
>
  <span class="label">{topicLabel(topic)}</span>
  <small>{where}</small>
  {#if topic.tags.length}
    <small class="tags">{topic.tags.map((t) => `#${t.label}`).join(" ")}</small>
  {/if}
</button>

<!----------------------------------------------------------------------------->

<style>
  .result {
    display: grid;
    width: 100%;
    padding: 5px 8px;
    border: none;
    border-radius: 6px;
    background: none;
    text-align: left;
  }

  .result:hover {
    background: var(--accent-overlay);
  }

  .result.active {
    color: var(--accent-ink);
    background: var(--accent-wash);
  }

  .label,
  small {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  small {
    font-size: 11px;
    color: var(--text-muted);
  }

  .tags {
    font-family: var(--font-code);
  }
</style>
