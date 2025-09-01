import { useState } from 'react';

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState('');

  const send = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-input">
      <textarea
        className="input ta"
        placeholder="Escreva sua mensagem... (Enter envia, Shift+Enter quebra linha)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={3}
      />
      <button className="btn btn-primary" onClick={send} disabled={disabled}>
        Enviar
      </button>
    </div>
  );
}
