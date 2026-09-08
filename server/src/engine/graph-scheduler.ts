import { FlowDocument, FlowEdge, FlowNode } from './engine.types';

/** Why a node never ran. */
export type SkipReason = 'unreachable' | 'branch-not-taken';

export interface NodeOutcome {
  /** Port selected by a branching node; undefined means "follow every edge". */
  branch?: string;
}

export interface SchedulerHooks {
  /** Runs one node. Throwing aborts the whole schedule. */
  execute(node: FlowNode): Promise<NodeOutcome>;
  /** Records a node that will never run. */
  skip(node: FlowNode, reason: SkipReason): Promise<void>;
  /** Called before each wave; throw to cancel the run. */
  checkpoint?(): void;
}

export interface SchedulerOptions {
  /** Hard cap on executed nodes, guards against pathological graphs. */
  maxNodes: number;
  /** How many nodes of the same wave may run concurrently. */
  parallelism: number;
}

/**
 * Dependency-aware scheduler for a free-layout workflow graph.
 *
 * Why not a plain BFS: with BFS a fan-in node runs as soon as its *first*
 * predecessor completes, so `{{nodes.<other-predecessor>.x}}` interpolates to
 * nothing. This scheduler is a Kahn topological walk instead - a node only runs
 * once every incoming edge has been resolved (either satisfied by an executed
 * predecessor, or pruned because its branch was not taken).
 *
 * Nodes that become ready together form a "wave" and are executed
 * concurrently, bounded by `parallelism`.
 */
export class GraphScheduler {
  private readonly nodeMap: Map<string, FlowNode>;
  private readonly outEdges = new Map<string, FlowEdge[]>();
  private readonly pending = new Map<string, number>();
  /** How many executed predecessors actually fed data into a node. */
  private readonly liveIncoming = new Map<string, number>();
  private readonly settled = new Set<string>();
  private readonly queued = new Set<string>();
  private ready: string[] = [];
  private executed = 0;

  constructor(
    private readonly document: FlowDocument,
    private readonly hooks: SchedulerHooks,
    private readonly options: SchedulerOptions,
  ) {
    this.nodeMap = new Map(document.nodes.map((node) => [node.id, node]));
    for (const node of document.nodes) {
      this.outEdges.set(node.id, []);
      this.pending.set(node.id, 0);
      this.liveIncoming.set(node.id, 0);
    }
    for (const edge of document.edges) {
      // Ignore dangling edges left behind by a deleted node.
      if (!this.nodeMap.has(edge.sourceNodeID) || !this.nodeMap.has(edge.targetNodeID)) continue;
      this.outEdges.get(edge.sourceNodeID)!.push(edge);
      this.pending.set(edge.targetNodeID, (this.pending.get(edge.targetNodeID) ?? 0) + 1);
    }
  }

  /** Nodes reachable from the start node, ignoring branch selection. */
  private reachableFromStart(startId: string): Set<string> {
    const seen = new Set<string>([startId]);
    const stack = [startId];
    while (stack.length) {
      const current = stack.pop()!;
      for (const edge of this.outEdges.get(current) ?? []) {
        if (!seen.has(edge.targetNodeID)) {
          seen.add(edge.targetNodeID);
          stack.push(edge.targetNodeID);
        }
      }
    }
    return seen;
  }

  async run(startNode: FlowNode): Promise<void> {
    const reachable = this.reachableFromStart(startNode.id);

    // Orphan nodes (dragged onto the canvas but never wired up) are recorded as
    // skipped rather than executed, matching what the user sees on the canvas.
    for (const node of this.document.nodes) {
      if (!reachable.has(node.id)) {
        this.settled.add(node.id);
        await this.hooks.skip(node, 'unreachable');
      }
    }
    // Unreachable predecessors must not keep a reachable node waiting.
    for (const node of this.document.nodes) {
      if (reachable.has(node.id)) continue;
      for (const edge of this.outEdges.get(node.id) ?? []) {
        if (reachable.has(edge.targetNodeID)) this.decrement(edge.targetNodeID);
      }
    }

    this.enqueue(startNode.id);

    while (this.ready.length) {
      this.hooks.checkpoint?.();

      const wave = this.ready;
      this.ready = [];
      const outcomes: Array<{ nodeId: string; branch?: string }> = [];

      for (const chunk of chunked(wave, this.options.parallelism)) {
        if (this.executed + chunk.length > this.options.maxNodes) {
          throw new Error(
            `Run aborted: exceeded MAX_NODES_PER_RUN (${this.options.maxNodes})`,
          );
        }
        const results = await Promise.all(
          chunk.map(async (nodeId) => {
            const outcome = await this.hooks.execute(this.nodeMap.get(nodeId)!);
            return { nodeId, branch: outcome.branch };
          }),
        );
        this.executed += chunk.length;
        outcomes.push(...results);
      }

      // Edges are resolved after the whole wave so concurrent nodes cannot
      // race each other while mutating the pending counters.
      for (const { nodeId, branch } of outcomes) {
        this.settled.add(nodeId);
        await this.resolveEdges(nodeId, branch);
      }
    }

    const stuck = this.document.nodes.filter(
      (node) => !this.settled.has(node.id) && reachable.has(node.id),
    );
    if (stuck.length) {
      throw new Error(
        `Workflow contains a cycle: ${stuck.map((node) => node.data?.title ?? node.id).join(', ')}`,
      );
    }
  }

  /** Propagates a completed node's outputs along the edges it selected. */
  private async resolveEdges(nodeId: string, branch?: string): Promise<void> {
    const outgoing = this.outEdges.get(nodeId) ?? [];
    const taken =
      branch !== undefined
        ? outgoing.filter((edge) => !edge.sourcePortID || edge.sourcePortID === branch)
        : outgoing;
    const takenSet = new Set(taken);

    for (const edge of taken) {
      this.liveIncoming.set(
        edge.targetNodeID,
        (this.liveIncoming.get(edge.targetNodeID) ?? 0) + 1,
      );
    }
    for (const edge of outgoing) {
      const satisfied = this.decrement(edge.targetNodeID);
      if (!satisfied) continue;
      if ((this.liveIncoming.get(edge.targetNodeID) ?? 0) > 0) {
        this.enqueue(edge.targetNodeID);
      } else if (!takenSet.has(edge)) {
        await this.prune(edge.targetNodeID);
      }
    }
  }

  /**
   * Marks a node as never-running and cascades: its own successors lose one
   * dependency, and any successor left with no live predecessor is pruned too.
   */
  private async prune(nodeId: string): Promise<void> {
    const stack = [nodeId];
    while (stack.length) {
      const current = stack.pop()!;
      if (this.settled.has(current)) continue;
      this.settled.add(current);
      await this.hooks.skip(this.nodeMap.get(current)!, 'branch-not-taken');

      for (const edge of this.outEdges.get(current) ?? []) {
        if (!this.decrement(edge.targetNodeID)) continue;
        if ((this.liveIncoming.get(edge.targetNodeID) ?? 0) > 0) {
          this.enqueue(edge.targetNodeID);
        } else {
          stack.push(edge.targetNodeID);
        }
      }
    }
  }

  /** Returns true when the node has no unresolved incoming edge left. */
  private decrement(nodeId: string): boolean {
    const next = (this.pending.get(nodeId) ?? 0) - 1;
    this.pending.set(nodeId, next);
    return next <= 0;
  }

  private enqueue(nodeId: string): void {
    if (this.settled.has(nodeId) || this.queued.has(nodeId)) return;
    this.queued.add(nodeId);
    this.ready.push(nodeId);
  }
}

/** Splits a list into fixed-size chunks (size >= 1). */
function chunked<T>(items: T[], size: number): T[][] {
  const limit = Math.max(1, Math.floor(size));
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += limit) {
    chunks.push(items.slice(i, i + limit));
  }
  return chunks;
}
