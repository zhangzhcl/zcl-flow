import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  WorkflowNodeEntity,
  WorkflowSelectService,
  useNodeRender,
  useService,
} from '@flowgram.ai/free-layout-editor';
import { MousePointerClick, X } from 'lucide-react';
import { NODE_ICONS } from './node-registries';
import { NodeInlineForm } from './NodeFormControls';

/**
 * The actual editor for one node. Remounted (via `key`) whenever the selected
 * node changes so local field state never leaks between nodes.
 */
function PanelContent({ node, onClose }: { node: WorkflowNodeEntity; onClose: () => void }) {
  const { t } = useTranslation();
  const { form, data, type } = useNodeRender(node);
  const nodeType = String(type);

  if (!form) return null;

  const setValue = (name: string, v: unknown) => form.setValueIn(name, v);

  return (
    <aside className="sf-panel">
      <div className="sf-panel-header">
        <span className="sf-panel-icon">{NODE_ICONS[nodeType]}</span>
        <input
          className="sf-panel-title"
          value={String(data?.title ?? '')}
          placeholder={t(`nodes.${nodeType}`)}
          onChange={(event) => setValue('title', event.target.value)}
        />
        <button
          type="button"
          className="sf-panel-close"
          onClick={onClose}
          title={t('common.close')}
        >
          <X size={14} />
        </button>
      </div>
      <div className="sf-panel-type">{t(`nodes.${nodeType}Desc`)}</div>

      <div className="sf-panel-body">
        <NodeInlineForm
          nodeType={nodeType}
          data={data as Record<string, unknown> | undefined}
          setValue={setValue}
        />
      </div>
    </aside>
  );
}

/**
 * Right-side property panel.
 *
 * Tracks the canvas selection through `WorkflowSelectService`. When exactly one
 * node is selected its configuration form is rendered here (schema-driven);
 * otherwise a short usage guide is shown. The panel is always mounted so the
 * workspace layout stays stable.
 */
export default function PropertyPanel() {
  const { t } = useTranslation();
  const selectService = useService<WorkflowSelectService>(WorkflowSelectService);
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeEntity | null>(null);

  useEffect(() => {
    const update = () => {
      const nodes = selectService.selectedNodes;
      setSelectedNode(nodes.length === 1 ? nodes[0] : null);
    };
    update();
    const disposable = selectService.onSelectionChanged(update);
    return () => disposable.dispose();
  }, [selectService]);

  if (!selectedNode) {
    return (
      <aside className="sf-panel sf-panel--empty">
        <div className="sf-panel-empty">
          <MousePointerClick size={22} />
          <p className="sf-panel-empty-title">{t('editor.panelEmptyTitle')}</p>
          <p className="sf-panel-empty-hint">{t('editor.panelEmptyHint')}</p>
        </div>
      </aside>
    );
  }

  return (
    <PanelContent
      key={selectedNode.id}
      node={selectedNode}
      onClose={() => selectService.clear()}
    />
  );
}
