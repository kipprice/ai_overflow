import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

/**
 * Renders model output as sanitised HTML. Sanitising matters because answers can echo
 * arbitrary web content.
 * @param text - markdown text.
 * @returns safe HTML.
 */
export function renderMarkdown(text: string): string {
  return DOMPurify.sanitize(marked.parse(text, { async: false }));
}
