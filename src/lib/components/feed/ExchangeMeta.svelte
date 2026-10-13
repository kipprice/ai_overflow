<!-- Footer for an exchange: who answered it, and any error. -->
<script lang="ts">
  import { CLAUDE_MODELS } from "$lib/models";
  import type { Exchange } from "$lib/types";

  let { exchange }: { exchange: Exchange } = $props();

  const modelLabel = $derived(
    CLAUDE_MODELS.find((m) => m.id === exchange.model)?.label ?? exchange.model,
  );
</script>

<!----------------------------------------------------------------------------->

{#if exchange.status === "error"}
  <p class="error">⚠ {exchange.error}</p>
{/if}
<p class="meta">
  {#if exchange.selfAnswered}
    Answered by you
  {:else}
    {modelLabel}{exchange.effort ? ` · ${exchange.effort}` : ""}
  {/if}
</p>

<!----------------------------------------------------------------------------->

<style>
  .meta {
    margin: 4px 0 0;
    font-size: 11px;
    color: var(--text-muted);
  }

  .error {
    margin: 6px 0 0;
    color: var(--danger);
    white-space: pre-wrap;
  }
</style>
