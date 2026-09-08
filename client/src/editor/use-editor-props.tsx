import { useMemo, useState } from 'react';
import {
  FreeLayoutProps,
  WorkflowNodeEntity,
  WorkflowNodeProps,
  WorkflowNodeRenderer,
  useNodeRender,
} from '@flowgram.ai/free-layout-editor';
import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import { createFreeSnapPlugin } from '@flowgram.ai/free-snap-plugin';
import { ChevronDown, ChevronUp, GitBranch } from 'lucide-react';
import { nodeRegistries, NODE_ICONS } from './node-registries';
import { getNodeSummary } from './node-summary';
import { NodeInlineForm } from './NodeFormControls';
import type { WorkflowDefinition } from '../types';
import { useNodeRunStatus } from '../store/run-status';
import { useDebugStore, useNodeBreakpoint, useNodePaused } from '../store/debug';
import { useContextMenuStore } from '../store/editor-ui';
import i18n from '../i18n';

const t = (key: string) => i18n.t(key);

/**
 * Canvas node card with optional inline form expansion.
 *
 * Collapsed: compact card showing icon, title, type and a one-line summary.
 * Expanded: the card grows to show the full configuration form inline,
 * matching the Dify-style canvas-expandable node pattern.
 *
 * Clicking the chevron toggle expands/collapses the form. All editing still
 * syncs into the FlowGram form via setValueIn, so undo/redo and the right-side
 * panel all stay consistent.
 */
function CanvasNode(props: WorkflowNodeProps) {
  const { data, node, form, type } = useNodeRender();
  const status = useNodeRunStatus(props.node.id);
  const hasBreakpoint = useNodeBreakpoint(props.node.id);
  const isPaused = useNodePaused(props.node.id);
  const toggleBreakpoint = useDebugStore((state) => state.toggleBreakpoint);
  const openMenu = useContextMenuStore((state) => state.open);
  const nodeType = String(type ?? node.flowNodeType);
  const title = String(data?.title ?? '') || t(`nodes.${nodeType}`);
  const summary = getNodeSummary(nodeType, data as Record<string, unknown> | undefined);
  const [expanded, setExpanded] = useState(false);

  const setValue = (name: string, v: unknown) => form?.setValueIn(name, v);

  return (
    <WorkflowNodeRenderer
      className={`sf-node${status ? ` sf-node--${status}` : ''}${isPaused ? ' sf-node--paused' : ''}${expanded ? ' sf-node--expanded' : ''}`}
      node={props.node}
    >
      <div
        className={`sf-node-card${expanded ? ' sf-node-card--expanded' : ''}`}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openMenu(node.id, event.clientX, event.clientY);
        }}
      >
        <button
          type="button"
          className={`sf-node-bp${hasBreakpoint ? ' sf-node-bp--on' : ''}`}
          title={t('debug.breakpoint')}
          onClick={(event) => {
            event.stopPropagation();
            toggleBreakpoint(props.node.id);
          }}
        />
        <div className="sf-node-card-header">
          <span className="sf-node-card-icon">{NODE_ICONS[nodeType]}</span>
          <span className="sf-node-card-title" title={title}>
            {title}
          </span>
          <button
            type="button"
            className="sf-node-expand-btn"
            title={expanded ? t('editor.collapseNode') : t('editor.expandNode')}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
        {!expanded && (
          <>
            <div className="sf-node-card-type">{t(`nodes.${nodeType}`)}</div>
            {summary ? <div className="sf-node-card-summary">{summary}</div> : null}
            {nodeType === 'condition_branch' && (() => {
              const branches = Array.isArray(data?.branches)
                ? (data.branches as Array<{ id: string; name: string; condition: string }>)
                : [];
              if (branches.length === 0) return null;
              return (
                <div className="mt-1 space-y-0.5">
                  {branches.map((b, i) => (
                    <div key={b.id} className="flex items-center gap-1 px-1">
                      <span className="shrink-0 rounded bg-blue-100 px-1 py-0.5 text-[9px] font-semibold text-blue-600">
                        IF {i + 1}
                      </span>
                      <span className="truncate text-[10px] text-gray-600">{b.name}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1 px-1">
                    <span className="shrink-0 rounded bg-gray-200 px-1 py-0.5 text-[9px] font-semibold text-gray-500">
                      ELSE
                    </span>
                    <span className="text-[10px] text-gray-400">默认</span>
                  </div>
                </div>
              );
            })()}
          </>
        )}
        {expanded && form && (
          // Stop mousedown so the canvas drag handler doesn't intercept form interactions
          <div
            className="sf-node-expanded-body"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <NodeInlineForm
              nodeType={nodeType}
              data={data as Record<string, unknown> | undefined}
              setValue={setValue}
            />
          </div>
        )}
      </div>
    </WorkflowNodeRenderer>
  );
}

/**
 * Deletion guard for the free-layout editor.
 *
 * Ordinary nodes are always removable. `start` / `end` used to be locked via
 * the registry's `deleteDisable`, but that also locked *duplicated* start/end
 * nodes, leaving stray copies that could never be removed. Instead we allow
 * deletion as long as at least one node of the same type remains, so the
 * workflow always keeps an entry and an exit while redundant copies (e.g. a
 * copied start node) can be cleaned up.
 */
function canDeleteNode(
  ctx: Parameters<NonNullable<FreeLayoutProps['canDeleteNode']>>[0],
  node: WorkflowNodeEntity,
): boolean {
  const type = String(node.flowNodeType);
  if (type !== 'start' && type !== 'end') return true;
  const json = ctx.document.toJSON() as unknown as { nodes?: Array<{ type?: unknown }> };
  const sameTypeCount = (json.nodes ?? []).filter((item) => String(item.type) === type).length;
  return sameTypeCount > 1;
}

/**
 * FlowGram free-layout editor configuration.
 * @param definition initial document loaded from the server
 */
export function useEditorProps(definition: WorkflowDefinition): FreeLayoutProps {
  return useMemo<FreeLayoutProps>(
    () => ({
      background: true,
      readonly: false,
      initialData: definition as FreeLayoutProps['initialData'],
      nodeRegistries,
      canDeleteNode,
      nodeEngine: {
        enable: true,
      },
      history: {
        enable: true,
        enableChangeNode: true,
      },
      materials: {
        renderDefaultNode: (props: WorkflowNodeProps) => <CanvasNode {...props} />,
      },
      onAllLayersRendered(ctx) {
        ctx.document.fitView(false);
      },
      plugins: () => [
        createMinimapPlugin({
          disableLayer: true,
          canvasStyle: {
            canvasWidth: 160,
            canvasHeight: 90,
            canvasPadding: 40,
            canvasBackground: 'rgba(20, 20, 20, 1)',
            canvasBorderRadius: 8,
            viewportBackground: 'rgba(40, 40, 40, 1)',
            viewportBorderRadius: 4,
            viewportBorderColor: 'rgba(80, 80, 80, 1)',
            viewportBorderWidth: 1,
            nodeColor: 'rgba(120, 120, 120, 1)',
            nodeBorderRadius: 2,
            nodeBorderWidth: 0.15,
            nodeBorderColor: 'rgba(255, 255, 255, 0.2)',
            overlayColor: 'rgba(0, 0, 0, 0)',
          },
        }),
        createFreeSnapPlugin({
          edgeColor: '#fafafa',
          alignColor: '#fafafa',
          edgeLineWidth: 1,
          alignLineWidth: 1,
          alignCrossWidth: 8,
        }),
      ],
    }),
    // The definition is only used for initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}
