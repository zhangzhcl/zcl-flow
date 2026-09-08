import { create } from 'zustand';
import type { DebugSnapshot, NodeMock } from '../types';

export type DebugStatus = 'idle' | 'running' | 'paused' | 'finished';

interface DebugStateShape {
  /** nodeId -> true for nodes with a breakpoint (session-scoped). */
  breakpoints: Record<string, true>;
  /** Optional condition expression per breakpoint. Empty means always pause. */
  conditions: Record<string, string>;
  /** nodeId -> mock applied to that node during a debug run. */
  mocks: Record<string, NodeMock>;
  /** Execution id of the live debug run, if any. */
  activeExecutionId: string | null;
  status: DebugStatus;
  pausedNode: { nodeId: string; title: string; step: number } | null;
  /** Latest variable snapshot (kept after resume so the monitor stays useful). */
  snapshot: DebugSnapshot | null;

  toggleBreakpoint: (nodeId: string) => void;
  setCondition: (nodeId: string, expression: string) => void;
  setMock: (nodeId: string, mock: NodeMock) => void;
  removeMock: (nodeId: string) => void;
  startSession: (executionId: string) => void;
  handlePaused: (nodeId: string, title: string, step: number, snapshot: DebugSnapshot) => void;
  handleResumed: () => void;
  finish: () => void;
  reset: () => void;
}

/**
 * Interactive debugger state shared between the debug panel (producer, fed by
 * the SSE stream and the debug REST API) and the canvas node renderer
 * (consumer: breakpoint dots and the paused highlight). Breakpoints and mocks
 * live outside the FlowGram document so they never pollute the saved
 * definition; they are session-scoped and intentionally not persisted.
 */
export const useDebugStore = create<DebugStateShape>((set) => ({
  breakpoints: {},
  conditions: {},
  mocks: {},
  activeExecutionId: null,
  status: 'idle',
  pausedNode: null,
  snapshot: null,

  toggleBreakpoint: (nodeId) =>
    set((state) => {
      const breakpoints = { ...state.breakpoints };
      const conditions = { ...state.conditions };
      if (breakpoints[nodeId]) {
        delete breakpoints[nodeId];
        delete conditions[nodeId];
      } else {
        breakpoints[nodeId] = true;
      }
      return { breakpoints, conditions };
    }),

  setCondition: (nodeId, expression) =>
    set((state) => {
      const conditions = { ...state.conditions };
      const trimmed = expression.trim();
      if (trimmed) conditions[nodeId] = trimmed;
      else delete conditions[nodeId];
      return { conditions };
    }),

  setMock: (nodeId, mock) => set((state) => ({ mocks: { ...state.mocks, [nodeId]: mock } })),

  removeMock: (nodeId) =>
    set((state) => {
      const mocks = { ...state.mocks };
      delete mocks[nodeId];
      return { mocks };
    }),

  startSession: (executionId) =>
    set({ activeExecutionId: executionId, status: 'running', pausedNode: null, snapshot: null }),

  handlePaused: (nodeId, title, step, snapshot) =>
    set({ status: 'paused', pausedNode: { nodeId, title, step }, snapshot }),

  // Keep the last snapshot so the variable monitor still has data while the
  // run is briefly in flight between two pauses.
  handleResumed: () => set((state) => ({ status: 'running', pausedNode: null, snapshot: state.snapshot })),

  finish: () => set({ status: 'finished', pausedNode: null }),

  reset: () => set({ activeExecutionId: null, status: 'idle', pausedNode: null, snapshot: null }),
}));

/** Whether a node carries a breakpoint (subscribed per node card). */
export function useNodeBreakpoint(nodeId: string): boolean {
  return useDebugStore((state) => Boolean(state.breakpoints[nodeId]));
}

/** Whether a node is the one the debug run is currently paused at. */
export function useNodePaused(nodeId: string): boolean {
  return useDebugStore((state) => state.pausedNode?.nodeId === nodeId);
}
