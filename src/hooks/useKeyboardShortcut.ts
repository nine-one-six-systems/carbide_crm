import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

export function useKeyboardShortcut(
  config: ShortcutConfig,
  callback: () => void,
  enabled = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (!config?.key) return;

      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target.isContentEditable) return;

      const matchesKey = event.key.toLowerCase() === config.key.toLowerCase();
      const matchesCtrl = config.ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const matchesMeta = config.metaKey ? event.metaKey : !event.metaKey;
      const matchesShift = config.shiftKey ? event.shiftKey : !event.shiftKey;
      const matchesAlt = config.altKey ? event.altKey : !event.altKey;

      if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
        event.preventDefault();
        callback();
      }
    },
    [config, callback, enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

