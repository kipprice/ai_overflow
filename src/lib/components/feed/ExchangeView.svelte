<!-- One question paired with the reply streamed back for it. -->
<script lang="ts">
  import { exchangeElementId } from "$lib/scroll";
  import type { Acceptance, Exchange } from "$lib/types";
  import ExchangeResponse from "./ExchangeResponse.svelte";

  let {
    exchange,
    latest,
    acceptance,
  }: { exchange: Exchange; latest: boolean; acceptance: Acceptance } = $props();
</script>

<!----------------------------------------------------------------------------->

<!-- The latest exchange is at least a screen tall so its question can always scroll to the top. -->
<article class:latest id={exchangeElementId(exchange.id)}>
  <!-- A note the user wrote on an earlier question answers it without asking anything. -->
  {#if exchange.question}
    <div class="question">{exchange.question}</div>
  {/if}
  <ExchangeResponse {exchange} {acceptance} />
</article>

<!----------------------------------------------------------------------------->

<style>
  article {
    margin-bottom: 22px;
    scroll-margin-top: 12px;
  }

  article.latest {
    min-height: calc(var(--feed-height) - 12px);
  }

  .question {
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: var(--radius);
    background: var(--bg-question);
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
