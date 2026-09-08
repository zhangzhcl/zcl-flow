import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ModelConfig } from '../types';

let cache: ModelConfig[] | null = null;
let pending: Promise<ModelConfig[]> | null = null;
const listeners = new Set<(models: ModelConfig[]) => void>();

async function load(): Promise<ModelConfig[]> {
  if (!pending) {
    pending = api
      .listModels()
      .then((models) => {
        cache = models;
        listeners.forEach((listener) => listener(models));
        return models;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

/** Invalidate the cache after mutations on the models page. */
export function refreshModels(): Promise<ModelConfig[]> {
  cache = null;
  return load();
}

/** Drop cached models on sign-in/sign-out so accounts never share state. */
export function clearModelsCache(): void {
  cache = null;
  listeners.forEach((listener) => listener([]));
}

/**
 * Shared model config list with module-level cache,
 * safe to use inside FlowGram node forms.
 */
export function useModels(): ModelConfig[] {
  const [models, setModels] = useState<ModelConfig[]>(cache ?? []);

  useEffect(() => {
    listeners.add(setModels);
    if (cache) {
      setModels(cache);
    } else {
      load().catch(() => undefined);
    }
    return () => {
      listeners.delete(setModels);
    };
  }, []);

  return models;
}
