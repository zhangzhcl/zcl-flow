import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  WorkflowNodeEntity,
  WorkflowSelectService,
  useClientContext,
  useService,
} from '@flowgram.ai/free-layout-editor';
import { Copy, CircleDot, Pencil, Trash2 } from 'lucide-react';
import { useContextMenuStore } from '../store/editor-ui';
import { useDebugStore } from '../store/debug';

const MENU_WIDTH = 176;
const MENU_HEIGHT = 174;

function MenuItem({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="sf-menu-item"
      disabled={disabled}
      onClick={onClick}
    >
      <span className="sf-menu-item-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/**
 * Floating context menu opened by right-clicking a canvas node.
 *
 * Actions: edit (select the node so the property panel opens), duplicate
 * (`document.copyNode`, offset +30px) and delete (guarded by
 * `document.canRemove`, so start/end stay protected). Closes on outside
 * mousedown, Escape or scroll, and clamps itself to the viewport.
 */
export default function ContextMenu() {
  const { t } = useTranslation();
  const ctx = useClientContext();
  const selectService = useService<WorkflowSelectService>(WorkflowSelectService);
  const { nodeId, x, y, close } = useContextMenuStore();
  const hasBreakpoint = useDebugStore((state) => (nodeId ? Boolean(state.breakpoints[nodeId]) : false));
  const toggleBreakpoint = useDebugStore((state) => state.toggleBreakpoint);
  const menuRef = useRef<HTMLDivElement>(null);

  const node = nodeId ? (ctx?.document?.getNode(nodeId) as WorkflowNodeEntity | undefined) : undefined;

  // Close on outside mousedown / Escape / scroll while the menu is open.
  useEffect(() => {
    if (!nodeId) return;
    const onMouseDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        close();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onScroll = () => close();
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [nodeId, close]);

  if (!ctx || !node) return null;

  const { document } = ctx;
  const deletable = document.canRemove(node, true);

  const handleEdit = () => {
    selectService.selectNode(node);
    close();
  };
  const handleDuplicate = () => {
    document.copyNode(node);
    close();
  };
  const handleToggleBreakpoint = () => {
    if (nodeId) toggleBreakpoint(nodeId);
    close();
  };
  const handleDelete = () => {
    if (document.canRemove(node)) {
      node.dispose();
    }
    close();
  };

  const left = Math.max(8, Math.min(x, window.innerWidth - MENU_WIDTH - 8));
  const top = Math.max(8, Math.min(y, window.innerHeight - MENU_HEIGHT - 8));

  return (
    <div
      ref={menuRef}
      className="sf-context-menu"
      style={{ left, top }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <MenuItem icon={<Pencil size={14} />} label={t('editor.menuEdit')} onClick={handleEdit} />
      <MenuItem
        icon={<Copy size={14} />}
        label={t('editor.menuDuplicate')}
        onClick={handleDuplicate}
      />
      <MenuItem
        icon={<CircleDot size={14} />}
        label={hasBreakpoint ? t('debug.removeBreakpoint') : t('debug.addBreakpoint')}
        onClick={handleToggleBreakpoint}
      />
      <div className="sf-menu-divider" />
      <MenuItem
        icon={<Trash2 size={14} />}
        label={t('editor.menuDelete')}
        disabled={!deletable}
        onClick={handleDelete}
      />
    </div>
  );
}
