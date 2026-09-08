import type { WorkflowDefinition } from '../types';
import { getTemplates } from './templates';

/**
 * Default definition for a workflow without one:
 * the localized "greeting" starter template (start -> llm -> end).
 */
export function defaultDefinition(): WorkflowDefinition {
  const templates = getTemplates();
  const greeting = templates.find((template) => template.id === 'greeting');
  return (greeting ?? templates[0]).build();
}
