<!-- The current context: its theme heading, a reopened question's former resolution, then
     each exchange. A standing resolution isn't shown here — it is pinned below the feed. -->
<script lang="ts">
  import PastResolution from "$lib/components/resolution/PastResolution.svelte";
  import { discardResolution } from "$lib/state/resolution-state";
  import { topicLabel } from "$lib/topic-label";
  import type { Acceptance, Exchange, Topic } from "$lib/types";
  import ExchangeView from "./ExchangeView.svelte";

  let { topic }: { topic: Topic } = $props();

  const started = $derived(
    new Date(topic.createdAt).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  );
  const reopened = $derived(
    topic.resolution?.state === "reopened" ? topic.resolution : undefined,
  );

  /** How an exchange relates to the context's resolution, which decides how it's marked. */
  function acceptanceOf(exchange: Exchange): Acceptance {
    const resolution = topic.resolution;
    if (resolution?.exchangeId !== exchange.id) return "none";
    return resolution.state === "active" ? "current" : "past";
  }
</script>

<!----------------------------------------------------------------------------->

<section>
  <h2>
    <span>{topicLabel(topic)}</span>
    <time>{started}</time>
  </h2>
  {#if reopened}
    <PastResolution
      resolution={reopened}
      onDiscard={() => discardResolution(topic)}
    />
  {/if}
  {#each topic.exchanges as exchange, i (exchange.id)}
    <ExchangeView
      {exchange}
      latest={i === topic.exchanges.length - 1}
      acceptance={acceptanceOf(exchange)}
    />
  {/each}
</section>

<!----------------------------------------------------------------------------->

<style>
  section {
    max-width: 820px;
    margin: 0 auto;
    padding-top: 16px;
  }

  h2 {
    display: flex;
    gap: 10px;
    align-items: baseline;
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  h2 span {
    padding: 1px 6px;
    border-radius: 4px;
    color: var(--accent-ink);
    background: var(--accent-wash);
  }

  time {
    font-weight: 400;
    text-transform: none;
    font-size: 12px;
    color: var(--text-muted);
  }
</style>
