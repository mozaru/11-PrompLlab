import { useEffect, useState } from 'react';
import { useNavigate, type To, type NavigateOptions } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ActionBar, type AppAction, type AppActionId } from '../components/ActionBar';
import { caps, getApiKeyStatus } from '../lib/capabilities';
import {
  openPromptsRegexFromDisk,
  applyPromptsRegex,
  savePromptsRegexToLocal,
} from '../lib/projects';
import '../styles/design.css';

type WelcomeProps = {
  onNavigate?: (to: To, options?: NavigateOptions) => void;
};

export default function Welcome({ onNavigate }: WelcomeProps) {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [apiKeyPresent, setApiKeyPresent] = useState<boolean>(getApiKeyStatus() === 'present');
  //const navigate = useNavigate();

  const navigateInternal = useNavigate();
  const navigate = onNavigate ?? ((to: To, options?: NavigateOptions) => navigateInternal(to, options));

  const actions: AppAction[] = [
    { id: 'openConfig',  label: 'Começar agora',      variant: 'primary',   tooltip: 'Abrir Configurações Globais' },
    { id: 'newProject',  label: 'Criar novo projeto', variant: 'secondary', tooltip: 'Ir para o Chat' },
    { id: 'loadProject', label: 'Carregar .json',     variant: 'secondary', tooltip: 'Importar Prompts+Regex do disco' },
  ];

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // se você quiser atualizar o badge de API key quando o usuário a salvar na mesma sessão:
  useEffect(() => {
    const i = setInterval(() => setApiKeyPresent(getApiKeyStatus() === 'present'), 1500);
    return () => clearInterval(i);
  }, []);

  const handleAction = async (id: AppActionId) => {
    if (id === 'openConfig') {
      navigate('/config');
      return;
    }
    if (id === 'newProject') {
      navigate('/chat'); // ou '/prompts' se preferir editar o template antes
      return;
    }
    if (id === 'loadProject') {
      try {
        const data = await openPromptsRegexFromDisk();
        applyPromptsRegex(data);
        savePromptsRegexToLocal(); // mantém como “último profile” no navegador
        navigate('/prompts');      // leva o usuário pra revisar o que foi importado
      } catch (e: any) {
        alert(`Falha ao importar: ${String(e?.message ?? e)}`);
      }
      return;
    }
  };

  return (
    <div className="welcome-root">
      <header className="welcome-header">
        <h1 className="app-title">11 PromptLab</h1>
        <p className="app-subtitle">
          Laboratório de prompts e processamento em lote com LLM — execução local; somente a API da OpenAI é acessada.
        </p>

        <ActionBar actions={actions} onAction={handleAction} />
      </header>

      <main className="welcome-main">
        <section className="card">
          <h2>O que este app faz</h2>
          <ul className="bullets">
            <li>Chat textual com <strong>System/User Prompt</strong> e histórico opcional.</li>
            <li><strong>Placeholders via regex</strong> com valores default, seleção de grupo e testes interativos.</li>
            <li><strong>Batch</strong>: diretórios (FSA) ou <em>Arquivos → ZIP</em> (fallback universal).</li>
          </ul>
        </section>

        <section className="card">
          <h2>Privacidade &amp; Segurança</h2>
          <p>Todo o processamento roda <strong>localmente</strong>. A única chamada externa é para <strong>https://api.openai.com</strong>.</p>
          <p>Sem telemetria. Sem logs globais. Projetos e configurações ficam no seu dispositivo.</p>
        </section>

        <section className="card">
          <h2>Licenciamento</h2>
          <p>Uso do software é <strong>livre</strong>; o <strong>código-fonte é proprietário</strong> (Mozar + 11Tech).</p>
          <p>Consulte o arquivo <strong>LICENSE</strong> no repositório para os termos completos.</p>
        </section>

        <section className="card">
          <h2>Bibliotecas utilizadas</h2>
          <p>React • TypeScript • Vite • (Desktop) Tauri • Zustand • react-router-dom • fflate</p>
          <small>As versões exatas estão em <code>package.json</code>.</small>
        </section>

        <section className="card">
          <h2>Checagem do ambiente</h2>
          <div className="badges">
            <Badge
              label={`API key: ${apiKeyPresent ? 'Presente' : 'Ausente'}`}
              status={apiKeyPresent ? 'ok' : 'warn'}
            />
            <Badge
              label={`OpenAI: ${online ? 'Online' : 'Offline'}`}
              status={online ? 'ok' : 'error'}
            />
            <Badge
              label={`FSA (acesso a diretórios): ${caps.hasFsa ? 'Disponível' : 'Indisponível'}`}
              status={caps.hasFsa ? 'ok' : 'warn'}
            />
          </div>
          {!apiKeyPresent && (
            <div className="hint">
              Dica: configure sua API key na tela de Configurações Globais.
            </div>
          )}
          {!caps.hasFsa && (
            <div className="hint">
              Sem FSA: usaremos o modo <em>Arquivos → ZIP</em> para o batch.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
