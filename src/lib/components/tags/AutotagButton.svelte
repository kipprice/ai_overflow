<!-- Offers to tag a context from its exchanges that tagging never ran for (saved before
     tagging existed) or whose run failed; shows progress while a run is underway. -->
<script lang="ts">
  import { autotagStatus, autotagTopic } from "$lib/state/tagging";
  import type { Topic } from "$lib/types";
  import Tag from "@lucide/svelte/icons/tag";

  let { topic }: { topic: Topic } = $props();

  const status = $derived(autotagStatus(topic));
</script>

<!----------------------------------------------------------------------------->

{#if status === "pending"}
  <span class="status">tagging…</span>
{:else if status !== "done"}
  <button
    class="icon-button autotag"
    onclick={() => autotagTopic(topic)}
    title={status === "failed"
      ? "Tagging failed — try again"
      : "Suggest tags from this question and its answers"}
  >
    <Tag size={11} />
    {status === "failed" ? "retry autotag" : "autotag"}
  </button>
{/if}

<!----------------------------------------------------------------------------->

<style>
  .autotag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-family: var(--font-code);
    font-size: 12px;
  }

  .status {
    font-size: 12px;
    color: var(--text-muted);
    animation: pulse 1.4s ease-in-out infinite;
  }

  @keyframes pulse {
    50% {
      opacity: 0.4;
    }
  }
</style>
