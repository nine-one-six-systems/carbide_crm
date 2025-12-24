import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  shortcuts: ShortcutItem[];
}

const shortcutSections: ShortcutSection[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open global search' },
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'C'], description: 'Go to Contacts' },
      { keys: ['G', 'O'], description: 'Go to Organizations' },
      { keys: ['G', 'T'], description: 'Go to Tasks' },
      { keys: ['G', 'P'], description: 'Go to Pipelines' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['N'], description: 'Create new item (context-dependent)' },
      { keys: ['E'], description: 'Edit current item' },
      { keys: ['⌘', 'S'], description: 'Save current form' },
      { keys: ['Escape'], description: 'Close dialog / Cancel action' },
    ],
  },
  {
    title: 'Lists & Tables',
    shortcuts: [
      { keys: ['↑', '↓'], description: 'Navigate items' },
      { keys: ['Enter'], description: 'Open selected item' },
      { keys: ['Space'], description: 'Toggle selection' },
      { keys: ['⌘', 'A'], description: 'Select all' },
    ],
  },
  {
    title: 'Help',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
];

interface KeyboardShortcutHelpProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcutHelp({
  open: controlledOpen,
  onOpenChange,
}: KeyboardShortcutHelpProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  // Listen for ? key to open help
  useKeyboardShortcut(
    { key: '?', shiftKey: true },
    () => setOpen(true),
    { preventDefault: false }
  );

  // Also listen for ? without shift on some keyboards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {shortcutSections.map((section, sectionIndex) => (
              <div key={section.title}>
                {sectionIndex > 0 && <Separator className="mb-4" />}
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center">
                            {keyIndex > 0 && (
                              <span className="text-muted-foreground mx-0.5">+</span>
                            )}
                            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">?</kbd> to toggle this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility component to display a keyboard shortcut inline
interface KeyboardShortcutBadgeProps {
  keys: string[];
  className?: string;
}

export function KeyboardShortcutBadge({ keys, className }: KeyboardShortcutBadgeProps) {
  return (
    <span className={className}>
      {keys.map((key, index) => (
        <span key={index}>
          {index > 0 && <span className="text-muted-foreground mx-0.5">+</span>}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}

