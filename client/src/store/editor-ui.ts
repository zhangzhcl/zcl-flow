import { create } from 'zustand';

interface ContextMenuState {
  /** Node the menu was opened for. `null` means the menu is closed. */
  nodeId: string | null;
  /** Viewport coordinates of the menu anchor. */
  x: number;
  y: number;
  open: (nodeId: string, x: number, y: number) => void;
  close: () => void;
}

/**
 * Canvas context-menu state. Written by the node card's `onContextMenu`,
 * read by the floating `ContextMenu` rendered at the editor root. Kept in a
 * store (rather than React state threaded through FlowGram materials) because
 * node cards are instantiated by the editor, not by our component tree.
 */
export const useContextMenuStore = create<ContextMenuState>((set) => ({
  nodeId: null,
  x: 0,
  y: 0,
  open: (nodeId, x, y) => set({ nodeId, x, y }),
  close: () => set({ nodeId: null }),
}));
