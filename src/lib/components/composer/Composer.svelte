<!-- Message input at the bottom of the feed, suggesting slash commands, tags and
     `@resolved` as they are typed. -->
<script lang="ts">
  import SuggestList from "$lib/components/common/SuggestList.svelte";
  import { turn } from "$lib/state/chat.svelte";
  import { notice } from "$lib/state/notice.svelte";
  import { ComposerState } from "./composer-state.svelte";

  const MAX_HEIGHT_PX = 240;
  const composer = new ComposerState();

  // Grow with the content up to a limit.
  $effect(() => {
    void composer.text;
    const el = composer.textarea;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  });
</script>

<!----------------------------------------------------------------------------->

<svelte:window onkeydown={(e) => composer.onWindowKeydown(e)} />

<div class="composer">
  {#if composer.menu.trigger}
    <SuggestList
      items={composer.menu.trigger.items}
      selected={composer.menu.selected}
      onPick={(item) => composer.menu.pick(item)}
      left={24}
    />
  {/if}
  <!-- svelte-ignore a11y_autofocus -->
  <textarea
    bind:this={composer.textarea}
    bind:value={composer.text}
    oninput={() => composer.onInput()}
    onkeydown={(e) => composer.onKeydown(e)}
    onkeyup={() => composer.syncCaret()}
    onclick={() => composer.syncCaret()}
    placeholder="Ask anything — / for commands, # to tag"
    rows="1"
    autofocus
  ></textarea>
  <p class="hint">
    {#if turn.requestId}
      Generating… <kbd>Esc</kbd> to stop and edit
    {:else if notice.text}
      {notice.text}
    {:else}
      <kbd>Enter</kbd> send · <kbd>Shift+Enter</kbd> new line ·
      <kbd>/clear</kbd>
      new context ·
      <kbd>#tag</kbd> tag it ·
      <kbd>@resolved</kbd> answer it yourself
    {/if}
  </p>
</div>

<!----------------------------------------------------------------------------->

<style>
  .composer {
    position: relative;
    padding: 10px 24px 8px;
    border-top: 1px solid var(--border);
  }

  textarea {
    display: block;
    width: 100%;
    max-width: 820px;
    margin: 0 auto;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-raised);
    resize: none;
    outline: none;
  }

  textarea:focus {
    border-color: var(--accent);
  }

  .hint {
    max-width: 820px;
    margin: 4px auto 0;
    font-size: 11px;
    color: var(--text-muted);
  }

  kbd {
    font-family: var(--font-code);
    font-size: 11.5px;
  }
</style>
