import { useEffect } from 'react';

/** Keep keyboard focus in the topmost modal, then return it to its opener. */
export function useDialogAccessibility() {
  useEffect(() => {
    const selector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let active: HTMLElement | null = null;
    let previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const openers = new Map<HTMLElement, HTMLElement>();
    const controls = (dialog: HTMLElement) => Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter(el => el.getClientRects().length && !el.closest('[inert]'));
    const update = () => {
      const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'));
      const next = dialogs.at(-1) || null;
      if (next === active) return;
      if (active && !active.isConnected) {
        const opener = openers.get(active);
        if (opener?.isConnected) opener.focus();
        openers.delete(active);
      }
      active = next;
      if (next) {
        const opener = next.contains(document.activeElement) ? previousFocus : document.activeElement;
        if (!openers.has(next) && opener instanceof HTMLElement) openers.set(next, opener);
        if (!next.contains(document.activeElement)) (controls(next)[0] || next).focus();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!active) return;
      if (event.key === 'Escape') {
        const close = active.querySelector<HTMLButtonElement>('[data-dialog-close], button[aria-label^="Fechar"]')
          || Array.from(active.querySelectorAll<HTMLButtonElement>('button')).find(b => /^(Voltar|Concluir|Fechar)$/.test(b.textContent?.trim() || ''));
        if (close) { event.preventDefault(); event.stopPropagation(); close.click(); }
      }
      if (event.key !== 'Tab') return;
      const list = controls(active);
      if (!list.length) { event.preventDefault(); return; }
      const index = list.indexOf(document.activeElement as HTMLElement);
      if (index < 0 || (!event.shiftKey && index === list.length - 1) || (event.shiftKey && index === 0)) {
        event.preventDefault(); (event.shiftKey ? list.at(-1)! : list[0]).focus();
      }
    };
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && !event.target.closest('[role="dialog"][aria-modal="true"]')) previousFocus = event.target;
      if (active?.isConnected && !active.contains(event.target as Node)) controls(active)[0]?.focus();
    };
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocus);
    update();
    return () => { observer.disconnect(); document.removeEventListener('keydown', onKeyDown, true); document.removeEventListener('focusin', onFocus); };
  }, []);
}
