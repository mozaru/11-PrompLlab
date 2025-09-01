import { useState } from 'react';
import type { ChatMessage } from '../../types/chat';
import { usePrompts } from '../../state/prompts.store';
import { usePlaceholders } from '../../state/placeholders.store';
import { renderTemplate } from '../../lib/template/render';
import { Modal } from '../Modal';
import '../../styles/chat.css';

export function MessageBubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === 'user';
  const { userTemplate } = usePrompts();
  const phStore = usePlaceholders();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rendered, setRendered] = useState<string>('');
  const [error, setError] = useState<string | undefined>(undefined);

  const openPreview = async () => {
    try {
      setError(undefined);
      setLoading(true);

      if (!userTemplate || !userTemplate.trim()) {
        setRendered(m.content);
      } else {
        const values = await phStore.valuesFromText(m.content);
        const out = renderTemplate(userTemplate, values, { keepUnresolved: true });
        setRendered(out);
      }

      setOpen(true);
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setRendered('');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rendered);
    } catch { /* ignore */ }
  };

  return (
    <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-ai'}`}>
      <div className="bubble-meta">
        <span className="bubble-role">{isUser ? 'Você' : 'IA'}</span>
        <span className="bubble-time">{new Date(m.createdAt).toLocaleTimeString()}</span>
      {isUser && (
        <div className="bubble-tools">
          <button className="tool-btn" onClick={openPreview} title="Ver o que foi enviado para a IA">
            <span className="tool-icon">🔎</span>
            <span>ver conteúdo enviado</span>
          </button>
        </div>
      )}
      </div>

      <div className={`bubble-content ${m.error ? 'bubble-error' : ''}`}>
        <pre>{m.content}</pre>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Conteúdo enviado para a IA (renderizado)"
        width={900}
        footer={
          <>
            {error && <span className="hint" style={{ marginRight: 'auto', color: 'var(--err)' }}>{error}</span>}
            <button className="btn btn-secondary" onClick={() => setOpen(false)}>Fechar</button>
            <button className="btn btn-primary" onClick={copyToClipboard} disabled={!rendered || loading}>Copiar</button>
          </>
        }
      >
        {loading ? (
          <div className="muted">Processando…</div>
        ) : (
          <div className="card" style={{ maxHeight: 420, overflow: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{rendered}</pre>
          </div>
        )}
        {!userTemplate?.trim() && (
          <p className="hint" style={{ marginTop: 8 }}>
            Template vazio — foi enviado exatamente o texto digitado.
          </p>
        )}
      </Modal>
    </div>
  );
}
