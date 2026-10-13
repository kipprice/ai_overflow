<!-- The model's side of an exchange: tools used, reasoning, the answer and its footer. The
     answer is tagged so highlighting text inside it offers quick actions, and marked when
     it is the answer that resolved the question. -->
<script lang="ts">
  import { resolveWithAnswer } from "$lib/state/resolutions";
  import type { Acceptance, Exchange } from "$lib/types";
  import Check from "@lucide/svelte/icons/check";
  import ExchangeMeta from "./ExchangeMeta.svelte";
  import ExchangeTrace from "./ExchangeTrace.svelte";
  import Markdown from "./Markdown.svelte";

  let { exchange, acceptance }: { exchange: Exchange; acceptance: Acceptance } =
    $props();

  const waiting = $derived(exchange.status === "streaming" && !exchange.answer);
  const acceptable = $derived(
    exchange.status === "done" && exchange.answer.length > 0,
  );
</script>

<!----------------------------------------------------------------------------->

<div
  class="response"
  class:accepted={acceptance !== "none"}
  class:current={acceptance === "current"}
>
  <ExchangeTrace {exchange} />
  {#if waiting}
    <p class="waiting">Thinking…</p>
  {:else if exchange.answer}
    <!-- Must match ANSWER_ATTR in answer-selection.svelte.ts. -->
    <div data-answer-of={exchange.id}><Markdown text={exchange.answer} /></div>
  {/if}
  <footer>
    <ExchangeMeta {exchange} />
    {#if acceptable && acceptance !== "current"}
      <button
        class="icon-button accept"
        onclick={() => resolveWithAnswer(exchange.id, exchange.answer)}
      >
        <Check size={13} /> Resolve with this answer
      </button>
    {/if}
  </footer>
</div>

<!----------------------------------------------------------------------------->

<style>
  /* The answer that was accepted; only a resolution that still stands gets the accent. */
  .response.accepted {
    padding-left: 10px;
    border-left: 2px solid var(--border);
  }

  .response.accepted.current {
    border-left-color: var(--accent);
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

  footer {
    display: flex;
    gap: 10px;
    align-items: baseline;
    justify-content: space-between;
  }

  /* Kept out of the way until the answer is hovered, so finished answers stay uncluttered.
     Faded rather than hidden, so it stays reachable by keyboard. */
  .accept {
    display: inline-flex;
    flex: none;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    opacity: 0;
  }

  .response:hover .accept,
  .accept:focus-visible {
    opacity: 1;
  }
</style>
