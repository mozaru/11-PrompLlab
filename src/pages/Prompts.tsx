import { useNavigate } from 'react-router-dom';
import { usePrompts } from '../state/prompts.store';
import { usePlaceholders } from '../state/placeholders.store';
import { extractPlaceholderNames } from '../types/placeholders';
import { ActionBar, type AppAction, type AppActionId } from '../components/ActionBar';
import { savePromptsRegexToDisk, openPromptsRegexFromDisk, applyPromptsRegex,
         loadPromptsRegexFromLocal } from '../lib/projects';
import '../styles/forms.css';
import '../styles/design.css';

export default function Prompts() {
  const { systemPrompt, userTemplate, setSystem, setUserTpl } = usePrompts();
  const syncFromTemplate = usePlaceholders((s) => s.syncFromTemplate);
  const navigate = useNavigate();

  const actions: AppAction[] = [
    { id: 'goHome', label: 'Voltar', variant: 'secondary' },
    { id: 'importPR', label: 'Importar JSON', variant: 'secondary' },
    { id: 'exportPR', label: 'Exportar JSON', variant: 'secondary' },
    { id: 'reset', label: 'Restaurar', variant: 'secondary' },
    { id: 'clear', label: 'Limpar', variant: 'secondary' },
  ];
  
  const onAction = async (id: AppActionId) => {
    if (id === 'goHome') navigate('/');
    if (id === 'clear') { 
      setSystem('');
      setUserTpl('');
      return;
    }
    if (id === 'reset'){
      const data = loadPromptsRegexFromLocal();
      if (!data) { alert('Nenhum perfil salvo no navegador.'); return; }
      applyPromptsRegex(data);
      alert('Perfil restaurado do armazenamento local.');
      return;
    }
    if (id === 'exportPR') {
      await savePromptsRegexToDisk();
      alert('Exportado com sucesso.');
    }
    if (id === 'importPR') {
      try {
        const data = await openPromptsRegexFromDisk();
        applyPromptsRegex(data);
        alert('Importado e aplicado com sucesso.');
      } catch (e: any) {
        alert(`Falha ao importar: ${String(e?.message ?? e)}`);
      }
    }
  };

  return (
    <div className="page">
      <div className="card form">
        <h1>Prompts</h1>
        <p className="muted">
          As alterações são aplicadas imediatamente. Ao trocar de tela, o perfil (prompts+regex) é salvo no navegador.
          Use <b>Exportar JSON</b> para salvar em arquivo ou <b>Restaurar do local</b> para reverter ao último salvo automaticamente.
        </p>
        <p className="muted">
          Defina o System Prompt e o User Prompt Template (com <code>{'{{placeholders}}'}</code> se desejar).
        </p>

        <section className="group">
          <h2>📌 System Prompt</h2>
          <textarea
            className="input"
            style={{ minHeight: 120 }}
            placeholder="ex.: Você é um assistente técnico que responde de forma objetiva..."
            value={systemPrompt}
            onChange={(e) => setSystem(e.target.value)}
          />
        </section>

        <section className="group">
          <h2>👤 User Prompt Template</h2>
          <textarea
            className="input"
            style={{ minHeight: 160 }}
            placeholder="ex.: Resuma o texto: {{texto}}"
            value={userTemplate}
            onChange={(e) => {
              const v = e.target.value;
              setUserTpl(v);
              const names = extractPlaceholderNames(v);
              syncFromTemplate(names, false); // adiciona novas; não remove órfãos
            }}
          />
          <p className="hint">Use <code>{'{{variavel}}'}</code> para placeholders. Configure regex na tela “Regex”.</p>
        </section>

        <ActionBar actions={actions} onAction={onAction} align="right" />
      </div>
    </div>
  );
}
