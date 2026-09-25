import { openUrl } from '@tauri-apps/plugin-opener';

/**
 * Click handler that opens links in the system browser instead of navigating the app
 * window away from the feed.
 * @param event - a click anywhere inside rendered content.
 */
export function openLinkExternally(event: MouseEvent) {
  const link = (event.target as HTMLElement).closest('a[href]');
  if (!link) return;
  event.preventDefault();
  const href = link.getAttribute('href') ?? '';
  if (/^https?:\/\//.test(href)) void openUrl(href);
}
