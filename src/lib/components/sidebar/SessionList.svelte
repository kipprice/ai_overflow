<!-- Every session, newest first, with the current one highlighted; picking one opens it. -->
<script lang="ts">
  import { sessionChoices, switchSession } from "$lib/state/sessions";
  import { store } from "$lib/state/store.svelte";

  let { onChosen }: { onChosen: () => void } = $props();

  function choose(sessionId: string) {
    switchSession(sessionId);
    onChosen();
  }
</script>

<!----------------------------------------------------------------------------->

<ul>
  {#each sessionChoices() as session (session.id)}
    <li>
      <button
        class:current={session.id === store.data.currentSessionId}
        onclick={() => choose(session.id)}
        title={session.name}>{session.name}</button
      >
    </li>
  {/each}
</ul>

<!----------------------------------------------------------------------------->

<style>
  /* Sized by its sessions, shrinking (and scrolling) only once the dialog hits its max height;
     a zero flex-basis would collapse it, since the dialog's own height is unset. */
  ul {
    flex: 0 1 auto;
    min-height: 0;
    overflow-y: auto;
    margin: 0;
    padding: 6px;
    list-style: none;
  }

  button {
    width: 100%;
    padding: 6px 8px;
    border: none;
    border-radius: 6px;
    background: none;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button:hover {
    background: var(--accent-overlay);
  }

  button.current {
    color: var(--accent-ink);
    background: var(--accent-wash);
  }
</style>
