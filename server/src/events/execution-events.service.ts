import { Injectable } from '@nestjs/common';
import { Observable, Subject, filter, map } from 'rxjs';

export type ExecutionEventType =
  | 'execution.started'
  | 'node.started'
  | 'node.finished'
  | 'execution.finished'
  | 'debug.paused'
  | 'debug.resumed'
  | 'node.retrying';

export interface ExecutionEvent {
  type: ExecutionEventType;
  /** Used to scope the stream to the authenticated account. */
  ownerId: string;
  executionId: string;
  workflowId: string;
  at: number;
  payload: Record<string, unknown>;
}

/**
 * In-process pub/sub for live execution progress.
 *
 * Deliberately not persisted: the SQLite tables remain the source of truth,
 * this bus only powers the SSE stream so the editor can highlight nodes while
 * a run is still in flight. A single process instance is sufficient for the
 * local-first deployment model; swapping in Redis later only requires
 * replacing this provider.
 */
@Injectable()
export class ExecutionEventsService {
  private readonly bus = new Subject<ExecutionEvent>();

  emit(event: Omit<ExecutionEvent, 'at'>): void {
    this.bus.next({ ...event, at: Date.now() });
  }

  /**
   * Returns the event stream for one account, optionally narrowed to a single
   * execution id.
   */
  stream(ownerId: string, executionId?: string): Observable<ExecutionEvent> {
    return this.bus.asObservable().pipe(
      filter((event) => event.ownerId === ownerId),
      filter((event) => !executionId || event.executionId === executionId),
    );
  }

  /** Maps the stream into the SSE envelope expected by Nest's `@Sse()`. */
  sseStream(ownerId: string, executionId?: string): Observable<{ data: string }> {
    return this.stream(ownerId, executionId).pipe(
      map((event) => ({ data: JSON.stringify(event) })),
    );
  }
}
