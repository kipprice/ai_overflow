<!-- Renders sanitised markdown from a model answer. -->
<script lang="ts">
  import { renderMarkdown } from "$lib/markdown";

  let { text }: { text: string } = $props();

  const html = $derived(renderMarkdown(text));
</script>

<!----------------------------------------------------------------------------->

<div class="markdown">
  <!-- Safe: renderMarkdown sanitises with DOMPurify. -->
  {@html html}
</div>

<!----------------------------------------------------------------------------->

<style>
  .markdown {
    word-break: break-word;
  }

  .markdown :global(:first-child) {
    margin-top: 0;
  }

  .markdown :global(:last-child) {
    margin-bottom: 0;
  }

  .markdown :global(pre) {
    padding: 10px 12px;
    border-radius: var(--radius);
    background: var(--code-bg);
    overflow-x: auto;
  }

  .markdown :global(code) {
    font-family: var(--font-code);
    font-size: 13.5px;
  }

  .markdown :global(:not(pre) > code) {
    padding: 1px 4px;
    border-radius: 4px;
    background: var(--code-bg);
  }

  .markdown :global(table) {
    border-collapse: collapse;
    display: block;
    overflow-x: auto;
  }

  .markdown :global(th),
  .markdown :global(td) {
    padding: 4px 10px;
    border: 1px solid var(--border);
  }

  .markdown :global(a) {
    padding: 0 2px;
    border-radius: 3px;
    color: var(--accent-ink);
    background: var(--accent-wash);
  }

  .markdown :global(blockquote) {
    margin-left: 0;
    padding-left: 12px;
    border-left: 3px solid var(--border);
    color: var(--text-muted);
  }
</style>
