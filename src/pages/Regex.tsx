import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaceholders } from '../state/placeholders.store';
import type { TestResult } from '../types/placeholders';
import { RegexRow } from '../components/regex/RegexRow';
import { RegexTestPanel } from '../components/regex/RegexTestPanel';
import { ActionBar, type AppAction, type AppActionId } from '../components/ActionBar';
import { savePromptsRegexToDisk, openPromptsRegexFromDisk, applyPromptsRegex } from '../lib/projects';

import '../styles/forms.css';
import '../styles/regex.css';
import '../styles/design.css';

export default function RegexPage() {
  const phs = usePlaceholders((s) => s.placeholders);
  const results = usePlaceholders((s) => s.results);
  const runOne = usePlaceholders((s) => s.runTestOne);
  const runAll = usePlaceholders((s) => s.runTestAll);
  const clearResults = usePlaceholders((s) => s.clearResults);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const actions: AppAction[] = [
    { id: 'goHome', label: 'Voltar', variant: 'secondary' },
    { id: 'importPR', label: 'Importar JSON', variant: 'secondary', disabled: busy },
    { id: 'exportPR', label: 'Exportar JSON', variant: 'secondary', disabled: busy },
    { id: 'runAll', label: 'Processar todas', variant: 'secondary', disabled: busy },
    { id: 'clearRes', label: 'Limpar resultados', variant: 'secondary', disabled: busy },
  ];

  const onAction = async (id: AppActionId) => {
    if (id === 'goHome') navigate('/');
    if (id === 'clearRes') clearResults();
    if (id === 'runAll') { setBusy(true); try { await runAll(); } finally { setBusy(false); } }

    if (id === 'exportPR') {
      await savePromptsRegexToDisk();
      alert('Exportado com sucesso.');
    }
    if (id === 'importPR') {
      try {
        setBusy(true);
        const data = await openPromptsRegexFromDisk();
        applyPromptsRegex(data);
        alert('Importado e aplicado com sucesso.');
      } catch (e: any) {
        alert(`Falha ao importar: ${String(e?.message ?? e)}`);
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <div className="page">
      <div className="card form">
        <h1>Regex & Defaults</h1>
        <p className="muted">Configure as regex e valores default para preencher os placeholders do User Template.</p>

        <div className="group">
          <h2>🧩 Placeholders</h2>
          {phs.length === 0 ? (
            <p className="muted">Nenhum placeholder detectado. Defina primeiro o User Template em <b>Prompts</b>.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Variável</th>
                    <th>Regex</th>
                    <th>Flags</th>
                    <th>Grupo</th>
                    <th>Default</th>
                    <th>Ações</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {phs.map((p) => (
                    <RegexRow
                      key={p.name}
                      ph={p}
                      result={results[p.name] as TestResult | undefined}
                      onTest={async (name) => { setBusy(true); try { await runOne(name); } finally { setBusy(false); } }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="group">
          <RegexTestPanel />
        </div>

        <ActionBar actions={actions} onAction={onAction} align="right" />
      </div>
    </div>
  );
}
