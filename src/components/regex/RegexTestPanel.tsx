import { useState } from 'react';
import { usePlaceholders } from '../../state/placeholders.store';
import type { TestResult } from '../../types/placeholders';
import { TestResultModal } from './TestResultModal';

export function RegexTestPanel() {
  const exampleText = usePlaceholders((s) => s.exampleText);
  const setExampleText = usePlaceholders((s) => s.setExampleText);
  const runAll = usePlaceholders((s) => s.runTestAll);
  const results = usePlaceholders((s) => s.results);
  const placeholders = usePlaceholders((s) => s.placeholders);

  const [modal, setModal] = useState<{open: boolean; title?: string; content?: string; status?: string; error?: string}>({ open: false });

  const openModal = (r: TestResult) => setModal({ open: true, title: `Resultado – {{${r.name}}}`, content: r.value, status: r.status, error: r.error });
  const closeModal = () => setModal({ open: false });

  return (
    <div className="panel">
      <h3>📄 Texto de Exemplo</h3>
      <textarea
        className="input"
        style={{ minHeight: 160 }}
        placeholder="Cole aqui o conteúdo de um arquivo de entrada para testar as regex."
        value={exampleText}
        onChange={(e) => setExampleText(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-secondary" onClick={() => setExampleText('')}>Limpar</button>
        <button className="btn btn-primary" onClick={async () => { await runAll(); }}>Processar todas</button>
      </div>

      <h3 style={{ marginTop: 16 }}>🔍 Resultados</h3>
      {Object.keys(results).length === 0 ? (
        <p className="muted">Nenhuma execução ainda. Clique em “Processar todas”.</p>
      ) : (
        <div className="results">
          <table className="table">
            <thead>
              <tr>
                <th>Variável</th>
                <th>Status</th>
                <th>Visualizar</th>
              </tr>
            </thead>
            <tbody>
              {placeholders.map((p) => {
                const r = results[p.name];
                return (
                  <tr key={p.name}>
                    <td className="mono">{`{{${p.name}}}`}</td>
                    <td>{r ? human(r.status) : '—'}</td>
                    <td>
                      {r ? <button className="btn btn-secondary" onClick={() => openModal(r)}>Abrir</button> : <span className="muted">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TestResultModal
        open={modal.open}
        onClose={closeModal}
        title={modal.title ?? ''}
        content={modal.content ?? ''}
        status={modal.status ?? ''}
        error={modal.error}
      />
    </div>
  );
}

function human(s: TestResult['status']): string {
  switch (s) {
    case 'matched_non_empty': return 'match (≠ vazio)';
    case 'matched_empty': return 'match (vazio)';
    case 'no_match': return 'sem match';
    case 'invalid_regex': return 'regex inválida';
  }
}
