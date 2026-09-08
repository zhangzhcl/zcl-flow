import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Unified dropdown select.
 *
 * The project standardises on this component instead of the native
 * `<select>`, whose popup is rendered by the OS and clashes with the dark
 * theme. The menu is rendered through a portal with fixed positioning so it
 * is never clipped by scrolling containers (e.g. the property panel body or a
 * modal), flips upward when there is not enough room below, and closes on
 * outside mousedown / Escape / scroll.
 */

export interface SelectOption {
  value: string;
  label: string;
  /** Secondary line rendered under the label. */
  description?: string;
  /** Small chip rendered next to the label (e.g. a capability tag). */
  tag?: string;
  /** Right-aligned monospace badge (e.g. a context window like "64K"). */
  badge?: string;
  /** Leading icon. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Shown when no option matches the current value. */
  placeholder?: string;
  /**
   * Class for the trigger button. Pass the same class used for sibling
   * inputs (`sf-panel-input` in the property panel, the tailwind `inputClass`
   * in modal forms) so the trigger matches them exactly.
   */
  className?: string;
  disabled?: boolean;
}

interface MenuPos {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos>({ top: 0, left: 0, width: 0, openUp: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  const toggle = () => {
    if (disabled) return;
    if (!open) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const estimated = Math.min(options.length * 44 + 10, 300);
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < estimated && rect.top > estimated;
        setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width, openUp });
      }
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const menuStyle: React.CSSProperties = pos.openUp
    ? { position: 'fixed', left: pos.left, width: pos.width, bottom: window.innerHeight - pos.top + 8 }
    : { position: 'fixed', top: pos.top, left: pos.left, width: pos.width };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={toggle}
        disabled={disabled}
        className={`sf-select-trigger ${className ?? ''}`}
      >
        <span className={`sf-select-value${selected ? '' : ' sf-select-value--placeholder'}`}>
          {selected ? selected.label : placeholder ?? ''}
        </span>
        <ChevronDown size={14} className={`sf-select-caret${open ? ' sf-select-caret--open' : ''}`} />
      </button>

      {open &&
        createPortal(
          <div ref={menuRef} className="sf-select-menu" style={menuStyle}>
            {options.length === 0 ? (
              <div className="sf-select-empty">—</div>
            ) : (
              options.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    className={`sf-select-option${active ? ' sf-select-option--active' : ''}`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.icon ? <span className="sf-select-option-icon">{option.icon}</span> : null}
                    <span className="sf-select-option-main">
                      <span className="sf-select-option-row">
                        <span className="sf-select-option-label">{option.label}</span>
                        {option.tag ? <span className="sf-select-option-tag">{option.tag}</span> : null}
                      </span>
                      {option.description ? (
                        <span className="sf-select-option-desc">{option.description}</span>
                      ) : null}
                    </span>
                    {option.badge ? <span className="sf-select-option-badge">{option.badge}</span> : null}
                    {active ? <Check size={14} className="sf-select-option-check" /> : null}
                  </button>
                );
              })
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
