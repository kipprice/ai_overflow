<!-- One context as a dot; hovering shows its theme beside it, clicking opens it (switching
     session first when it is a search match from another session). -->
<script lang="ts">
  import { openTopic } from "$lib/state/sessions";
  import { store } from "$lib/state/store.svelte";
  import { topicLabel } from "$lib/topic-label";
  import type { Topic } from "$lib/types";
  import { railTip } from "./rail-tip";

  let { topic }: { topic: Topic } = $props();
</script>

<!----------------------------------------------------------------------------->

<button
  class="dot"
  class:current={topic.id === store.data.currentTopicId}
  class:resolved={topic.resolution?.state === "active"}
  onclick={() => openTopic(topic)}
  aria-label={topicLabel(topic)}
  {@attach railTip(topicLabel(topic))}
>
  <span></span>
</button>

<!----------------------------------------------------------------------------->

<style>
  .dot {
    display: grid;
    place-items: center;
    width: 28px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: none;
  }

  .dot:hover {
    background: var(--bg-hover);
  }

  span {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--dot-inactive);
  }

  .current span {
    background: var(--accent);
  }

  /* A resolved context reads as settled even in the collapsed rail. */
  .resolved:not(.current) span {
    background: none;
    box-shadow: inset 0 0 0 2px var(--accent);
  }
</style>
