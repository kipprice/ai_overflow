import type { Attachment } from 'svelte/attachments';

/**
 * Shows a label beside a rail button while it is hovered or focused. The rail is too narrow
 * for text, so its buttons explain themselves this way. The label lives in the top layer, so
 * the rail's scrolling can't clip it; it is styled by `.rail-tip` in `styles/overlays.css`.
 * @param label - the text to show.
 * @returns an attachment for the button.
 */
export function railTip(label: string): Attachment<HTMLElement> {
  return (button) => {
    const tip = createTip(label);
    const show = () => placeBeside(tip, button);
    const hide = () => tip.hidePopover();
    const events = { mouseenter: show, mouseleave: hide, focus: show, blur: hide };
    for (const [name, handler] of Object.entries(events)) button.addEventListener(name, handler);
    return () => {
      for (const [name, handler] of Object.entries(events)) {
        button.removeEventListener(name, handler);
      }
      tip.remove();
    };
  };
}

/** Builds the (hidden) popover holding the label. */
function createTip(label: string): HTMLElement {
  const tip = document.createElement('div');
  tip.popover = 'manual';
  tip.className = 'rail-tip';
  tip.textContent = label;
  document.body.append(tip);
  return tip;
}

/** Opens the popover vertically centred just to the right of the button. */
function placeBeside(tip: HTMLElement, button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  tip.style.top = `${rect.top + rect.height / 2}px`;
  tip.style.left = `${rect.right + 6}px`;
  tip.showPopover();
}
