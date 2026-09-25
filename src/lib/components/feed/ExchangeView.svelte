<!-- One question and its streamed reply: tools used, reasoning, answer and status. -->
<script lang="ts">
  import { responseElementId } from '$lib/scroll';
  import type { Exchange } from '$lib/types';
  import ExchangeMeta from './ExchangeMeta.svelte';
  import Markdown from './Markdown.svelte';

  let { exchange, latest }: { exchange: Exchange; latest: boolean } = $props();

  const waiting = $derived(exchange.status === 'streaming' && !exchange.answer);
</script>

<article>
  <div class="question">{exchange.question}</div>
  <!-- The latest response is at least a screen tall so its top can always scroll to the top. -->
  <div class="response" class:latest id={responseElementId(exchange.id)}>
    {#each exchange.tools as tool, i (i)}
      <div class="tool">⚒ {tool.name}: {tool.detail}</div>
    {/each}
    {#if exchange.thinking}
      <details>
        <summary>Reasoning</summary>
        <div class="thinking">{exchange.thinking}</div>
      </details>
    {/if}
    {#if waiting}
      <p class="waiting">Thinking…</p>
    {:else if exchange.answer}
      <Markdown text={exchange.answer} />
    {/if}
    <ExchangeMeta {exchange} />
  </div>
</article>

<style>
  article {
    margin-bottom: 22px;
  }

  .question {
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: var(--radius);
    background: var(--bg-question);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .response {
    scroll-margin-top: 12px;
  }

  .response.latest {
    min-height: calc(var(--feed-height) - 12px);
  }

  .tool {
    margin: 2px 0;
    font-size: 12px;
    color: var(--text-muted);
    font-family: var(--font-code);
  }

  details {
    margin: 6px 0;
    color: var(--text-muted);
    font-size: 13px;
  }

  .thinking {
    white-space: pre-wrap;
    padding: 6px 10px;
    border-left: 2px solid var(--border);
  }

  .waiting {
    color: var(--text-muted);
    animation: pulse 1.4s ease-in-out infinite;
  }

  @keyframes pulse {
    50% {
      opacity: 0.4;
    }
  }
</style>
