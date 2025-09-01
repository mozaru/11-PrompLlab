import '../..//styles/design.css';

export function TestResultModal({
  open,
  onClose,
  title,
  content,
  status,
  error,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  status: string;
  error?: string;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p className="muted">Status: <b>{status}</b>{error ? ` — ${error}` : ''}</p>
        <div className="card" style={{ maxHeight: 300, overflow: 'auto' }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{content}</pre>
        </div>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
