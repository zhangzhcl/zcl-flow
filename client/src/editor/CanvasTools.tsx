import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useClientContext,
  usePlaygroundTools,
} from '@flowgram.ai/free-layout-editor';
import {
  LayoutGrid,
  Maximize,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

/**
 * Floating canvas toolbar: zoom / fit / auto-layout / undo / redo.
 */
export default function CanvasTools() {
  const { t } = useTranslation();
  const tools = usePlaygroundTools();
  const { history } = useClientContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const disposable = history.undoRedoService.onChange(() => {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    });
    return () => disposable.dispose();
  }, [history]);

  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-gray-200 bg-white/95 px-2 py-1 shadow-xl backdrop-blur">
      <button type="button" className={buttonClass} title={t('editor.zoomOut')} onClick={() => tools.zoomout()}>
        <ZoomOut size={15} />
      </button>
      <span className="w-11 text-center font-mono text-[11px] text-gray-500">
        {Math.floor(tools.zoom * 100)}%
      </span>
      <button type="button" className={buttonClass} title={t('editor.zoomIn')} onClick={() => tools.zoomin()}>
        <ZoomIn size={15} />
      </button>
      <div className="mx-1 h-4 w-px bg-gray-100" />
      <button type="button" className={buttonClass} title={t('editor.fitView')} onClick={() => tools.fitView()}>
        <Maximize size={15} />
      </button>
      <button type="button" className={buttonClass} title={t('editor.autoLayout')} onClick={() => tools.autoLayout()}>
        <LayoutGrid size={15} />
      </button>
      <div className="mx-1 h-4 w-px bg-gray-100" />
      <button
        type="button"
        className={buttonClass}
        title={t('editor.undo')}
        disabled={!canUndo}
        onClick={() => history.undo()}
      >
        <Undo2 size={15} />
      </button>
      <button
        type="button"
        className={buttonClass}
        title={t('editor.redo')}
        disabled={!canRedo}
        onClick={() => history.redo()}
      >
        <Redo2 size={15} />
      </button>
    </div>
  );
}
