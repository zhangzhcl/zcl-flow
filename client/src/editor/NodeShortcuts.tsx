import { useEffect } from 'react';
import {
  WorkflowSelectService,
  useClientContext,
  useService,
} from '@flowgram.ai/free-layout-editor';

/**
 * Keyboard shortcuts for the canvas.
 *
 * FlowGram's free-layout editor ships without a built-in "delete selection"
 * binding, so pressing Delete/Backspace used to do nothing. This component
 * removes the currently selected node(s) on Delete/Backspace, respecting
 * `document.canRemove` (which keeps the last remaining start/end node safe).
 * It ignores keystrokes while the user is typing in a form control (property
 * panel, run panel, etc.).
 */
export default function NodeShortcuts() {
  const ctx = useClientContext();
  const selectService = useService<WorkflowSelectService>(WorkflowSelectService);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;

      // Never swallow keystrokes aimed at form controls.
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName?.toLowerCase();
        if (
          tag === 'input' ||
          tag === 'textarea' ||
          tag === 'select' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      const document = ctx?.document;
      if (!document) return;
      const selected = selectService.selectedNodes;
      if (!selected.length) return;

      event.preventDefault();
      for (const node of selected) {
        if (document.canRemove(node)) {
          node.dispose();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ctx, selectService]);

  return null;
}
