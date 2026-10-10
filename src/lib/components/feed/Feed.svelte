<!-- The scrollable feed for the current context; keeps each new question anchored at the top. -->
<script lang="ts">
  import { tick, untrack } from 'svelte';
  import { openLinkExternally } from '$lib/links';
  import { scrollToExchange } from '$lib/scroll';
  import { turn } from '$lib/state/chat.svelte';
  import { store } from '$lib/state/store.svelte';
  import { currentTopic } from '$lib/state/topics';
  import TopicSection from './TopicSection.svelte';

  const topic = $derived(currentTopic());
  let feedHeight = $state(0);

  /** Scrolls to the context's latest question once it has rendered, showing its response below. */
  function revealLatest(smooth: boolean) {
    const latest = untrack(() => topic?.exchanges.at(-1));
    if (latest) void tick().then(() => scrollToExchange(latest.id, smooth));
  }

  // A new question: bring it to the top of the view as its response starts streaming.
  $effect(() => {
    if (turn.requestId) revealLatest(true);
  });

  // Opening a context: jump to its latest question.
  $effect(() => {
    void store.data.currentTopicId;
    revealLatest(false);
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="feed" bind:clientHeight={feedHeight} style:--feed-height="{feedHeight}px" onclick={openLinkExternally}>
  {#if topic}
    <TopicSection {topic} />
  {:else}
    <div class="empty">
      <p>New context. Ask anything below.</p>
      <p>Earlier contexts are in the sidebar; <code>/clear</code> starts another fresh one.</p>
    </div>
  {/if}
</div>

<style>
  .feed {
    flex: 1;
    overflow-y: auto;
    padding: 0 24px;
  }

  .empty {
    margin: 20vh auto 0;
    text-align: center;
    color: var(--text-muted);
  }
</style>
