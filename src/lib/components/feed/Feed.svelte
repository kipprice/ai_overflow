<!-- The scrollable feed for the current context; keeps each new question anchored at the top
     and offers quick actions for text highlighted inside an answer. -->
<script lang="ts">
  import { openLinkExternally } from "$lib/links";
  import { scrollToExchange } from "$lib/scroll";
  import {
    answerSelection,
    copyAnswerSelection,
    resolveAnswerSelection,
    watchAnswerSelection,
  } from "$lib/state/answer-selection.svelte";
  import { turn } from "$lib/state/chat.svelte";
  import { pendingForkParent } from "$lib/state/forking";
  import { store } from "$lib/state/store.svelte";
  import { currentTopic } from "$lib/state/topics";
  import { topicName } from "$lib/topic-label";
  import { tick, untrack } from "svelte";
  import AnswerActions from "./AnswerActions.svelte";
  import TopicSection from "./TopicSection.svelte";

  const topic = $derived(currentTopic());
  const forkParent = $derived(pendingForkParent());
  let feedHeight = $state(0);

  /** Scrolls to the context's latest question once it has rendered, showing its response below. */
  function revealLatest(smooth: boolean) {
    const latest = untrack(() => topic?.exchanges.at(-1));
    if (latest) void tick().then(() => scrollToExchange(latest.id, smooth));
  }

  $effect(watchAnswerSelection);

  // A new question: bring it to the top of the view as its response starts streaming.
  $effect(() => {
    if (turn.requestId) revealLatest(true);
  });

  // Opening a context, or an exchange appearing with no turn to stream (a question the user
  // answered themselves): jump straight to the latest question.
  $effect(() => {
    void store.data.currentTopicId;
    void topic?.exchanges.at(-1)?.id;
    if (!untrack(() => turn.requestId)) revealLatest(false);
  });
</script>

<!----------------------------------------------------------------------------->

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="feed"
  bind:clientHeight={feedHeight}
  style:--feed-height="{feedHeight}px"
  onclick={openLinkExternally}
>
  {#if topic}
    <TopicSection {topic} />
  {:else if forkParent}
    <div class="empty">
      <p>Following on from <strong>{topicName(forkParent)}</strong>.</p>
      <p>
        Your next question keeps that conversation, in a context of its own.
      </p>
    </div>
  {:else}
    <div class="empty">
      <p>New context. Ask anything below.</p>
      <p>
        Earlier contexts are in the sidebar; <code>/clear</code> starts another fresh
        one.
      </p>
    </div>
  {/if}
</div>

{#if answerSelection.text}
  <AnswerActions
    left={answerSelection.left}
    top={answerSelection.top}
    onCopy={copyAnswerSelection}
    onResolve={resolveAnswerSelection}
  />
{/if}

<!----------------------------------------------------------------------------->

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
