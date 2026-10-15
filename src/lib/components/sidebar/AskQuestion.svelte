<!-- Starts a fresh context, as /clear does, and reads as selected whenever one is open however
     it got there. Sits above the newest context: a full row in the sidebar, a plus in the rail. -->
<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import { isFreshContext, newContext } from "$lib/state/context";
  import { railTip } from "./rail-tip";

  let { compact = false }: { compact?: boolean } = $props();
  const active = $derived(isFreshContext());
</script>

<!----------------------------------------------------------------------------->

{#if compact}
  <button
    class="ask compact"
    class:active
    onclick={newContext}
    aria-label="Ask Question"
    aria-pressed={active}
    {@attach railTip("Ask Question")}
  >
    <Plus size={14} />
  </button>
{:else}
  <button class="ask" class:active onclick={newContext} aria-pressed={active}>
    <Plus size={14} />
    Ask Question
  </button>
{/if}

<!----------------------------------------------------------------------------->

<style>
  .ask {
    display: flex;
    gap: 6px;
    align-items: center;
    width: 100%;
    padding: 5px 8px;
    border: none;
    border-radius: 6px;
    background: none;
    color: var(--text-muted);
    text-align: left;
  }

  .ask:hover {
    background: var(--accent-overlay);
    color: var(--text);
  }

  .ask.active {
    color: var(--accent-ink);
    background: var(--accent-wash);
  }

  .compact {
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 24px;
    padding: 0;
  }
</style>
