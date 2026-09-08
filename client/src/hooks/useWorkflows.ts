import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Workflow } from '../types';

let cache: Workflow[] | null = null;
let pending: Promise<Workflow[]> | null = null;
const listeners = new Set<(workflows: Workflow[]) => void>();

async function load(): Promise<Workflow[]> {
  if (!pending) {
    pending = api
      .listWorkflows()
      .then((workflows) => {
        cache = workflows;
        listeners.forEach((listener) => listener(workflows));
        return workflows;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

/** Invalidate the cache after creating/deleting workflows. */
export function refreshWorkflows(): Promise<Workflow[]> {
  cache = null;
  return load();
}

/** Drop cached workflows on sign-in/sign-out so accounts never share state. */
export function clearWorkflowsCache(): void {
  cache = null;
  listeners.forEach((listener) => listener([]));
}

/**
 * Shared workflow list with a module-level cache, safe to use inside FlowGram
 * node forms (sub-workflow / loop nodes pick their target here).
 */
export function useWorkflows(): Workflow[] {
  const [workflows, setWorkflows] = useState<Workflow[]>(cache ?? []);

  useEffect(() => {
    listeners.add(setWorkflows);
    if (cache) {
      setWorkflows(cache);
    } else {
      load().catch(() => undefined);
    }
    return () => {
      listeners.delete(setWorkflows);
    };
  }, []);

  return workflows;
}
