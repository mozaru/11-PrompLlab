import type { ReactNode } from 'react';
import '../styles/modal.css';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 800,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ width: `min(${width}px, 95vw)` }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          {footer ?? <button className="btn btn-secondary" onClick={onClose}>Fechar</button>}
        </div>
      </div>
    </div>
  );
}
