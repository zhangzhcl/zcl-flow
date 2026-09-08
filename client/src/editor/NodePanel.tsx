import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowDragService, useService } from '@flowgram.ai/free-layout-editor';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { NODE_ICONS, NODE_CATEGORIES } from './node-registries';

const MIN_WIDTH = 160;
const MAX_WIDTH = 360;
const DEFAULT_WIDTH = 200;

export default function NodePanel() {
  const { t } = useTranslation();
  const dragService = useService<WorkflowDragService>(WorkflowDragService);

  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const resizing = useRef(false);
  const startX = useRef(0);
  const startW = useRef(DEFAULT_WIDTH);

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    startX.current = e.clientX;
    startW.current = panelWidth;

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW.current + ev.clientX - startX.current));
      setPanelWidth(next);
    };
    const onUp = () => {
      resizing.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [panelWidth]);

  const toggleCategory = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside
      className="relative flex shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white"
      style={{ width: panelWidth }}
    >
      {/* Header */}
      <div className="border-b border-gray-100 px-3 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t('editor.addNode')}
        </span>
      </div>

      {/* Scrollable node list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {NODE_CATEGORIES.map((category) => {
          const isCollapsed = collapsed[category.key];
          return (
            <div key={category.key} className="mb-1">
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.key)}
                className="flex w-full items-center gap-1.5 rounded px-1 py-1.5 text-left transition-colors hover:bg-gray-50"
              >
                <span className="text-gray-400">
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </span>
                <span className="text-[13px] font-bold text-gray-700">
                  {t(category.labelKey)}
                </span>
              </button>

              {/* Node cards */}
              {!isCollapsed && (
                <div className="mt-0.5 flex flex-col gap-1 pb-1">
                  {category.types.map((type) => (
                    <div
                      key={type}
                      role="button"
                      tabIndex={0}
                      className="flex cursor-grab select-none items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 transition-colors hover:border-blue-300 hover:bg-white active:cursor-grabbing"
                      onMouseDown={(event) => {
                        const defaultData: Record<string, unknown> = { title: t(`nodes.${type}`) };
                        if (type === 'start') {
                          defaultData.inputParams = [{ name: 'input', label: t('form.inputParam') || '输入', type: 'text' }];
                        } else if (type === 'end') {
                          defaultData.outputParams = [{ name: 'result', label: t('form.outputResult') || '结果', expr: '' }];
                        }
                        dragService.startDragCard(type, event, { data: defaultData });
                      }}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-gray-500">
                        {NODE_ICONS[type]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-semibold text-gray-800">
                          {t(`nodes.${type}`)}
                        </div>
                        <div className="truncate text-[10px] leading-tight text-gray-400">
                          {t(`nodes.${type}Desc`)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drag handle */}
      <div
        className="absolute right-0 top-0 flex h-full w-3 cursor-col-resize items-center justify-center opacity-0 transition-opacity hover:opacity-100"
        onMouseDown={onResizeMouseDown}
      >
        <GripVertical size={12} className="text-gray-400" />
      </div>
    </aside>
  );
}
