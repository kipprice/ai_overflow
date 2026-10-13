<!-- What the model did on the way to its answer: the tools it called, and its reasoning
     behind a fold. Renders nothing when it went straight to the answer. -->
<script lang="ts">
  import type { Exchange } from "$lib/types";

  let { exchange }: { exchange: Exchange } = $props();
</script>

<!----------------------------------------------------------------------------->

{#each exchange.tools as tool, i (i)}
  <div class="tool">⚒ {tool.name}: {tool.detail}</div>
{/each}
{#if exchange.thinking}
  <details>
    <summary>Reasoning</summary>
    <div class="thinking">{exchange.thinking}</div>
  </details>
{/if}

<!----------------------------------------------------------------------------->

<style>
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
</style>
