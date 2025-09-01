import { useNavigate } from 'react-router-dom';
import { useChat } from '../state/chat.store';
import { ActionBar, type AppAction, type AppActionId } from '../components/ActionBar';
import '../styles/forms.css';
import '../styles/design.css';

export default function History() {
  const { messages, clear } = useChat();
  const toggleInclude = useChat((s) => s.toggleInclude);
  const useHistory = useChat((s) => s.useHistory);
  const setUseHistory = useChat((s) => s.toggleHistory);
  const navigate = useNavigate();

  const actions: AppAction[] = [
    { id: 'goHome', label: 'Voltar', variant: 'secondary' },
    { id: 'toggleHistory', label: useHistory ? 'Histórico: ON' : 'Histórico: OFF', variant: 'secondary' },
    { id: 'clear', label: 'Limpar histórico', variant: 'danger' },
  ];

  const onAction = (id: AppActionId) => {
    if (id === 'goHome') navigate('/');
    if (id === 'toggleHistory') setUseHistory(!useHistory);
    if (id === 'clear') clear();
  };

  return (
    <div className="page">
      <div className="card form">
        <h1>Histórico da Conversa</h1>
        <p className="muted">Selecione quais mensagens entram no contexto enviado à IA.</p>

        <div className="group">
          {messages.length === 0 && <p className="muted">Ainda não há mensagens.</p>}
          {messages.map((m) => (
            <div key={m.id} className="field" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <label style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={m.include !== false}
                  onChange={(e) => toggleInclude(m.id, e.target.checked)}
                />
                <span style={{ minWidth: 70 }}>{m.role.toUpperCase()}</span>
                <span style={{ color: 'var(--text-2)' }}>{new Date(m.createdAt).toLocaleString()}</span>
              </label>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.content}</pre>
            </div>
          ))}
        </div>

        <ActionBar actions={actions} onAction={onAction} align="right" />
      </div>
    </div>
  );
}
