import { create } from 'zustand';

export type NodeRunStatus = 'running' | 'success' | 'failed' | 'skipped' | 'cancelled';

interface RunStatusState {
  /** nodeId -> status of the node in the currently observed execution. */
  statuses: Record<string, NodeRunStatus>;
  /** Node currently being executed, used for the pulse animation. */
  activeNodeId: string | null;
  setStatus: (nodeId: string, status: NodeRunStatus) => void;
  reset: () => void;
}

/**
 * Live per-node run status shared between the run panel (producer, fed by the
 * SSE stream) and the canvas node renderer (consumer). Kept outside the
 * FlowGram document so highlighting never mutates the saved definition.
 */
export const useRunStatusStore = create<RunStatusState>((set) => ({
  statuses: {},
  activeNodeId: null,

  setStatus: (nodeId, status) =>
    set((state) => ({
      statuses: { ...state.statuses, [nodeId]: status },
      activeNodeId: status === 'running' ? nodeId : state.activeNodeId === nodeId ? null : state.activeNodeId,
    })),

  reset: () => set({ statuses: {}, activeNodeId: null }),
}));

/** Subscribe to a single node's status without re-rendering on unrelated changes. */
export function useNodeRunStatus(nodeId: string): NodeRunStatus | undefined {
  return useRunStatusStore((state) => state.statuses[nodeId]);
}
