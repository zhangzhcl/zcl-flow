import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { KnowledgeBase } from '../types';

let cache: KnowledgeBase[] | null = null;
let pending: Promise<KnowledgeBase[]> | null = null;
const listeners = new Set<(kbs: KnowledgeBase[]) => void>();

async function load(): Promise<KnowledgeBase[]> {
  if (!pending) {
    pending = api
      .listKnowledge()
      .then((kbs) => {
        cache = kbs;
        listeners.forEach((l) => l(kbs));
        return kbs;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export function refreshKnowledgeBases(): Promise<KnowledgeBase[]> {
  cache = null;
  return load();
}

export function clearKnowledgeBasesCache(): void {
  cache = null;
  listeners.forEach((l) => l([]));
}

export function useKnowledgeBases(): KnowledgeBase[] {
  const [kbs, setKbs] = useState<KnowledgeBase[]>(cache ?? []);

  useEffect(() => {
    listeners.add(setKbs);
    if (cache) {
      setKbs(cache);
    } else {
      load().catch(() => undefined);
    }
    return () => {
      listeners.delete(setKbs);
    };
  }, []);

  return kbs;
}
