<!-- A reopened question's former resolution. Kept so what was once accepted isn't lost, but
     drawn plainly, so only a question that still stands resolved looks settled. -->
<script lang="ts">
  import type { Resolution } from "$lib/types";
  import X from "@lucide/svelte/icons/x";
  import ResolutionText from "./ResolutionText.svelte";

  let {
    resolution,
    onDiscard,
  }: { resolution: Resolution; onDiscard: () => void } = $props();
</script>

<!----------------------------------------------------------------------------->

<aside>
  <header>
    <p class="tag">Previously resolved · reopened</p>
    <button
      class="icon-button discard"
      onclick={onDiscard}
      title="Forget this resolution"
      aria-label="Forget this resolution"
    >
      <X size={14} />
    </button>
  </header>
  <ResolutionText {resolution} />
</aside>

<!----------------------------------------------------------------------------->

<style>
  aside {
    margin-bottom: 18px;
    padding: 8px 12px 10px;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    color: var(--text-muted);
    font-size: 13px;
  }

  header {
    display: flex;
    gap: 8px;
    align-items: baseline;
    justify-content: space-between;
  }

  .discard {
    display: inline-flex;
    align-items: center;
    padding: 3px;
  }

  .tag {
    margin: 0 0 4px;
    font-family: var(--font-heading);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
</style>
