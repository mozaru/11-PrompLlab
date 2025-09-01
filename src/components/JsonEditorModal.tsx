import { useState } from 'react';
import '../styles/modal.css';

export function JsonEditorModal({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initialValue);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('O JSON raiz deve ser um array.');
      for (const [i, it] of parsed.entries()) {
        if (!it || typeof it !== 'object') throw new Error(`Item #${i} não é objeto.`);
        if (typeof it.content !== 'string') throw new Error(`Item #${i} sem 'content' string.`);
        if (it.inputName && typeof it.inputName !== 'string') throw new Error(`Item #${i} 'inputName' deve ser string.`);
        if (it.outputName && typeof it.outputName !== 'string') throw new Error(`Item #${i} 'outputName' deve ser string.`);
      }
      onSave(text);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Editar JSON do Lote</h3>
        <textarea rows={20} className="input mono" value={text} onChange={(e) => setText(e.target.value)} />
        {err && <p className="error">{err}</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Ok</button>
        </div>
      </div>
    </div>
  );
}
