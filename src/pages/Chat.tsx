import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../state/chat.store';
import { useSettings } from '../state/settings.store';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { ActionBar, type AppAction, type AppActionId } from '../components/ActionBar';
import '../styles/chat.css';
import '../styles/design.css';

export default function Chat() {
  const { messages, send, status, clear, useHistory, toggleHistory, lastError } = useChat();
  const { readApiKeyEffective } = useSettings();
  const navigate = useNavigate();
  
  const actions: AppAction[] = [
    { id: 'goHome', label: 'Voltar', variant: 'secondary' },
    { id: 'toggleHistory', label: useHistory ? 'Histórico: ON' : 'Histórico: OFF', variant: 'secondary' },
    { id: 'openPrompts', label: 'Prompts', variant: 'secondary' },   // novo
    { id: 'openHistory', label: 'Gerenciar histórico', variant: 'secondary' }, // novo
    { id: 'clearChat', label: 'Limpar', variant: 'danger' },
  ];

  const onAction = (id: AppActionId) => {
    if (id === 'goHome') navigate('/');
    else if (id === 'clearChat') clear();
    else if (id === 'toggleHistory') toggleHistory(!useHistory);
    else if (id === 'openPrompts') navigate('/prompts');
    else if (id === 'openHistory') navigate('/history');
  };

  useEffect(() => {
    // Se não tiver API key, você pode mostrar um aviso aqui (além do badge na Welcome)
    // ou até desabilitar o input (já desabilitamos se status === 'sending')
  }, []);

  const hasApiKey = !!readApiKeyEffective();

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h1 className="app-title">11 PromptLab — Chat</h1>
      </header>

      {!hasApiKey && (
        <div className="alert error">
          API key ausente. Vá em <b>Configurações</b> e informe sua chave da OpenAI.
        </div>
      )}

      <div className="chat-main">
        <MessageList messages={messages} />
      </div>

      {lastError && <div className="alert error">{lastError}</div>}

      <div className="chat-footer">
        <MessageInput onSend={(t) => send(t)} disabled={status === 'sending' || !hasApiKey} />
      </div>

      <div className="chat-actions">
        <ActionBar actions={actions} onAction={onAction} align="space-between" />
      </div>
    </div>
  );
}
