import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JsonEditorModal } from '../components/JsonEditorModal';
import { caps } from '../lib/capabilities';
import { useBatch } from '../state/batch.store';
import type { BatchJob } from '../types/batch';
import { ActionBar, type AppAction, type AppActionId } from '../components/ActionBar';
import '../styles/forms.css';
import '../styles/batch.css';
import '../styles/design.css';

// Tipagem local p/ relatório (evita any aqui)
type OutputReportItem = { fullName: string; action: 'created' | 'modified' | 'appended' };

export default function Batch() {
  const b = useBatch();
  const [busy, setBusy] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const navigate = useNavigate();

  const actions: AppAction[] = [
    { id: 'goHome', label: 'Voltar', variant: 'secondary' },
    { id: 'run', label: 'Executar', variant: 'primary', disabled: busy || b.vector.length === 0 },
    { id: 'reset', label: 'Reset', variant: 'secondary', disabled: busy },
  ];

  const onAction = async (id: AppActionId) => {
    if (id === 'goHome') navigate('/');
    if (id === 'reset') b.reset();
    if (id === 'run') {
      try {
        setBusy(true);
        await b.runFromVector(); // sempre a partir do vetor JSON
        alert('Batch concluído.');
      } catch (e: any) {
        alert(`Erro no batch: ${String(e?.message ?? e)}`);
      } finally {
        setBusy(false);
      }
    }
  };

  const canUseFsa = caps.hasFsa && 'showDirectoryPicker' in window;

  return (
    <div className="page">
      <div className="card form">
        <h1>Execução em Lote (Batch)</h1>
        <p className="muted">Tudo roda a partir de um vetor JSON de itens (content/input/output).</p>

        <section className="group">
          <h2>🚦 Modo</h2>
          <div className="radio-row">
            <label className="radio">
              <input
                type="radio"
                name="mode"
                checked={b.mode === 'fsa'}
                onChange={() => b.setMode('fsa')}
                disabled={!canUseFsa}
              />
              <span>Diretórios (FSA)</span>
              {!canUseFsa && <span className="hint">&nbsp;— indisponível neste navegador</span>}
            </label>
            <label className="radio">
              <input
                type="radio"
                name="mode"
                checked={b.mode === 'zip'}
                onChange={() => b.setMode('zip')}
              />
              <span>Arquivos → ZIP</span>
            </label>
          </div>
        </section>

        {/* Renderiza a seleção conforme o modo */}
        {b.mode === 'fsa' ? <FsaSection /> : <ZipSection />}

        <section className="group">
          <h2>📦 JSON do Lote</h2>
          <div className="radio-row">
            {/* Sempre habilitado: gera a partir da seleção ZIP, ou abre JSON salvo */}
            <button className="btn btn-secondary" onClick={b.handleGenerateButton}>
              Abrir JSON
            </button>

            <button className="btn btn-secondary" onClick={() => setEditorOpen(true)}>
              Editar JSON
            </button>

            {/* Sempre habilitado: abre Save As / download */}
            <button className="btn btn-secondary" onClick={b.saveVectorJson}>
              Salvar JSON
            </button>
          </div>
          <div className="hint">
            {b.vector.length} item(ns) no vetor.
            {b.mode === 'fsa' && ' Ao selecionar a pasta de ENTRADA o JSON é gerado automaticamente.'}
          </div>
        </section>

        <section className="group">
          <h2>⚙️ Configuração</h2>
          <div className="grid-2">
            <div className="field">
              <label>Concorrência</label>
              <input
                type="number"
                min={1}
                className="input"
                value={b.cfg.concurrency}
                onChange={(e) => b.setPartialCfg({ concurrency: Math.max(1, parseInt(e.target.value || '1', 10)) })}
              />
            </div>
            <div className="field">
              <label>Sufixo do arquivo de saída</label>
              <input
                className="input"
                value={b.cfg.outputSuffix}
                onChange={(e) => b.setPartialCfg({ outputSuffix: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Limite de erros para abortar</label>
              <input
                type="number"
                min={1}
                className="input"
                value={b.cfg.abortAfterErrors}
                onChange={(e) => b.setPartialCfg({ abortAfterErrors: Math.max(1, parseInt(e.target.value || '1', 10)) })}
              />
              <p className="hint">Somente se “Falhar no primeiro erro” estiver ativado.</p>
            </div>
            <div className="field">
              <label>Tamanho máximo por arquivo (MB)</label>
              <input
                type="number"
                min={1}
                className="input"
                value={b.cfg.maxFileSizeMB}
                onChange={(e) => b.setPartialCfg({ maxFileSizeMB: Math.max(1, parseInt(e.target.value || '1', 10)) })}
              />
            </div>
          </div>

          <div className="radio-row">
            <label className="radio">
              <input
                type="checkbox"
                checked={b.cfg.overwrite}
                onChange={(e) => b.setPartialCfg({ overwrite: e.target.checked })}
              />
              <span>Sobrescrever arquivos existentes (FSA)</span>
            </label>
            <label className="radio">
              <input
                type="checkbox"
                checked={b.cfg.failOnError}
                onChange={(e) => b.setPartialCfg({ failOnError: e.target.checked })}
              />
              <span>Falhar no erro (abortar após limite)</span>
            </label>
          </div>
        </section>

        <section className="group">
          <h2>📊 Progresso</h2>
          <ProgressBar total={b.progress.total} done={b.progress.done} errors={b.progress.errors} />
          <JobsTable jobs={b.jobs} />
        </section>

        {b.outputsReport.length > 0 && (
          <section className="group">
            <h2>🧾 Relatório de Saída (novos/modificados)</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Arquivo</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {b.outputsReport.map((r: OutputReportItem, i: number) => (
                    <tr key={`${r.fullName}-${i}`}>
                      <td className="mono">{r.fullName}</td>
                      <td>{r.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted">
              * Em navegador (FSA), o caminho absoluto real não é exposto pelo SO; exibimos o nome do arquivo e/ou caminho
              relativo de saída.
            </p>
          </section>
        )}

        <ActionBar actions={actions} onAction={onAction} align="right" />
      </div>

      {/* Modal do editor */}
      {editorOpen && (
        <JsonEditorModal
          initialValue={JSON.stringify(b.vector, null, 2)}
          onCancel={() => setEditorOpen(false)}
          onSave={(text) => {
            b.setVectorFromJsonText(text);
            setEditorOpen(false);
          }}
        />
      )}
    </div>
  );
}

function FsaSection() {
  const b = useBatch();
  return (
    <section className="group">
      <h2>📁 Diretórios</h2>
      <div className="fsa-row">
        <div>
          <div className="muted">Entrada</div>
          <button className="btn btn-secondary" onClick={b.chooseInputDir}>
            Selecionar
          </button>
          <div className="hint">
            {b.inputDir ? 'Selecionado (JSON é gerado automaticamente)' : '—'}
          </div>
        </div>
        <div>
          <div className="muted">Saída</div>
          <button className="btn btn-secondary" onClick={b.chooseOutputDir}>
            Selecionar
          </button>
          <div className="hint">{b.outputDir ? 'Selecionado' : '—'}</div>
        </div>
      </div>
    </section>
  );
}

function ZipSection() {
  const b = useBatch();
  return (
    <section className="group">
      <h2>📄 Arquivos (será gerado um ZIP)</h2>
      <input
        type="file"
        multiple
        onChange={(e) => e.target.files && b.chooseFilesFallback(e.target.files)}
      />
      <div className="hint">{b.selectedFiles.length} arquivo(s) selecionado(s)</div>
      <p className="muted">Ao concluir, você fará download de um ZIP com os resultados.</p>
    </section>
  );
}

function ProgressBar({ total, done, errors }: { total: number; done: number; errors: number }) {
  const ok = Math.max(0, done - errors);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="bar">
        <div className="ok" style={{ width: `${total ? (ok / total) * 100 : 0}%` }} />
        <div className="err" style={{ width: `${total ? (errors / total) * 100 : 0}%` }} />
      </div>
      <div className="muted" style={{ marginTop: 4 }}>
        {done}/{total} concluídos — {errors} erro(s) — {pct}%.
      </div>
    </div>
  );
}

function JobsTable({ jobs }: { jobs: BatchJob[] }) {
  if (jobs.length === 0) return <p className="muted">Sem jobs ainda.</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Entrada</th>
            <th>Saída</th>
            <th>Status</th>
            <th>Tentativas</th>
            <th>Erro</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id}>
              <td className="mono">{j.inputName}</td>
              <td className="mono">{j.outputName}</td>
              <td>{statusHuman(j.status)}</td>
              <td>{j.attempts}</td>
              <td
                className="muted"
                style={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {j.error ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusHuman(s: BatchJob['status']): string {
  if (s === 'pending') return 'aguardando';
  if (s === 'processing') return 'processando';
  if (s === 'done') return 'ok';
  return 'erro';
}
