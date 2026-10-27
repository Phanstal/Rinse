import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

interface SheetProps {
  children: ReactNode;
  label: string;
  onClose: () => void;
  autoFocusClose?: boolean;
}

export function Sheet({ children, label, onClose, autoFocusClose = false }: SheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocusClose) closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [autoFocusClose, onClose]);

  return (
    <div
      className="sheet-layer"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="sheet" role="dialog" aria-modal="true" aria-label={label}>
        <div className="sheet-handle" />
        <button
          ref={closeRef}
          type="button"
          className="button icon-button close-button"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="close" />
        </button>
        {children}
      </section>
    </div>
  );
}
