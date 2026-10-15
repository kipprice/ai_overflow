<!-- Dropdown of all sessions (named by date and top themes) plus a button to start a new one. -->
<script lang="ts">
  import {
    sessionChoices,
    startSession,
    switchSession,
  } from "$lib/state/sessions";
  import { store } from "$lib/state/store.svelte";

  const options = $derived(sessionChoices());
</script>

<!----------------------------------------------------------------------------->

<div class="picker">
  <select
    value={store.data.currentSessionId}
    onchange={(e) => switchSession(e.currentTarget.value)}
    title="Switch session"
  >
    {#each options as option (option.id)}
      <option value={option.id}>{option.name}</option>
    {/each}
  </select>
  <button
    class="icon-button new"
    onclick={startSession}
    title="New session"
    aria-label="New session"
  >
    +
  </button>
</div>

<!----------------------------------------------------------------------------->

<style>
  .picker {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 12px 10px 10px;
    border-bottom: 1px solid var(--border);
  }

  select {
    flex: 1;
    min-width: 0;
    font-size: 12px;
  }

  .new {
    font-size: 18px;
    line-height: 1;
    padding: 2px 8px;
  }
</style>
