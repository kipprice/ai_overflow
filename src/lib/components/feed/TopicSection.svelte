<!-- The current context: its theme heading followed by each exchange. -->
<script lang="ts">
  import { topicLabel } from '$lib/topic-label';
  import type { Topic } from '$lib/types';
  import ExchangeView from './ExchangeView.svelte';

  let { topic }: { topic: Topic } = $props();

  const started = $derived(
    new Date(topic.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
  );
</script>

<section>
  <h2>
    <span>{topicLabel(topic)}</span>
    <time>{started}</time>
  </h2>
  {#each topic.exchanges as exchange, i (exchange.id)}
    <ExchangeView {exchange} latest={i === topic.exchanges.length - 1} />
  {/each}
</section>

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
