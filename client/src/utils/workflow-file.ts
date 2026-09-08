import type { WorkflowExport } from '../types';

/** Filesystem-safe slug used for the downloaded file name. */
function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'workflow'
  );
}

/** Triggers a browser download of the export envelope as pretty JSON. */
export function downloadWorkflow(envelope: WorkflowExport): void {
  const blob = new Blob([JSON.stringify(envelope, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugify(envelope.name)}.zclflow.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a tick to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Reads and validates a user-selected workflow file. */
export async function readWorkflowFile(file: File): Promise<Partial<WorkflowExport>> {
  const text = await file.text();
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('The selected file is not valid JSON');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('The selected file is not a workflow export');
  }
  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('The workflow file is missing a "name" field');
  }
  return parsed as Partial<WorkflowExport>;
}
