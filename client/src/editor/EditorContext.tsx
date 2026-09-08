import { createContext, useContext } from 'react';
import type { WorkflowDefinition } from '../types';

interface EditorContextValue {
  /** Reads the current live definition from the FlowGram document. */
  getDefinition: () => WorkflowDefinition | null;
}

export const EditorContext = createContext<EditorContextValue>({
  getDefinition: () => null,
});

export function useEditorContext() {
  return useContext(EditorContext);
}
