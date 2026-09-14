import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamenti condivisi da tutte le finestre modali:
 * blocco dello scroll di fondo, focus trap con Tab e ripristino
 * del focus sull'elemento che ha aperto la finestra.
 *
 * Escape resta gestito dal chiamante perché ogni modale decide
 * se scartare o salvare le modifiche.
 */
export function useDialog(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Porta il focus dentro la finestra così che la tastiera non resti sul fondo,
    // ma rispetta un eventuale autoFocus già applicato dal contenuto.
    const container = containerRef.current;
    if (container && !container.contains(document.activeElement)) {
      const firstField =
        container.querySelector<HTMLElement>('input, textarea') ??
        container.querySelector<HTMLElement>(FOCUSABLE);
      firstField?.focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;
      const items = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !containerRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  return containerRef;
}
