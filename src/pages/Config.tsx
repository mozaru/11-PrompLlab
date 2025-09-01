import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSettings } from '../state/settings.store';
import type { ApiKeyStrategy } from '../types/config-global';
import { SecretInput } from '../components/SecretInput';
import { ActionBar, type AppAction, type AppActionId } from '../components/ActionBar';
import '../styles/forms.css';
import '../styles/design.css';

export default function Config() {
  const {
    cfg,
    setPartial,
    setApiKeyStrategy,
    setApiKey,
    resetDefaults,
    loadFromStorage,
    saveToStorage,
  } = useSettings();

  const [strategy, setStrategy] = useState<ApiKeyStrategy>(cfg.openai.api_key_strategy);
  const [apiKey, setApiKeyLocal] = useState<string>(cfg.openai.api_key ?? '');
  const [baseUrl, setBaseUrl] = useState<string>(cfg.openai.base_url ?? '');
  const [model, setModel] = useState<string>(cfg.openai.model_default);
  const [locale, setLocale] = useState<'pt-BR' | 'en-US'>(cfg.locale);
  const [retries, setRetries] = useState<number>(cfg.retries);
  const navigate = useNavigate();

  useEffect(() => {
    // carregar persistido ao montar (idempotente)
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    // sincronizar estado com cfg quando mudar
    setStrategy(cfg.openai.api_key_strategy);
    setApiKeyLocal(cfg.openai.api_key ?? '');
    setBaseUrl(cfg.openai.base_url ?? '');
    setModel(cfg.openai.model_default);
    setLocale(cfg.locale);
    setRetries(cfg.retries);
  }, [cfg]);

  const actions: AppAction[] = [
    { id: 'goHome', label: 'Voltar', variant: 'secondary' },
    { id: 'reset', label: 'Restaurar Padrões', variant: 'secondary', tooltip: 'Voltar para valores default' },
    { id: 'save', label: 'Salvar Configurações', variant: 'primary' },
  ];

  const handleAction = (id: AppActionId) => {
    switch (id) {
      case 'goHome':
        // navegação mínima: evento customizado (App.tsx escuta)
        navigate('/');
        break;
      case 'reset':
        resetDefaults();
        break;
      case 'save':
        // aplicar mudanças no store
        setApiKeyStrategy(strategy);
        setApiKey(strategy === 'local' ? apiKey : undefined);
        setPartial({
          openai: { ...cfg.openai, base_url: baseUrl, model_default: model, api_key_strategy: strategy, api_key: strategy === 'local' ? apiKey : undefined },
          locale,
          retries,
        });
        saveToStorage();
        alert('Configurações salvas com sucesso.');
        break;
      default:
        break;
    }
  };

  return (
    <div className="page">
      <div className="card form">
        <h1>Configurações Globais</h1>
        <p className="muted">
          Estas configurações afetam todos os projetos. A chave da API pode ser usada apenas em memória
          ou salva localmente por sua conta e risco.
        </p>

        <section className="group">
          <h2>🔑 OpenAI API</h2>

          <div className="field">
            <label>Estrategia de armazenamento da API key</label>
            <div className="radio-row">
              <label className="radio">
                <input
                  type="radio"
                  name="api_strategy"
                  checked={strategy === 'memory'}
                  onChange={() => setStrategy('memory')}
                />
                <span>Não salvar (memória)</span>
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="api_strategy"
                  checked={strategy === 'local'}
                  onChange={() => setStrategy('local')}
                />
                <span>Salvar localmente</span>
              </label>
            </div>
          </div>

          <div className="field">
            <label>API Key</label>
            <SecretInput
              value={apiKey}
              onChange={setApiKeyLocal}
              disabled={strategy === 'memory'}
              placeholder="sk-..."
              autoComplete="off"
            />
            {strategy === 'memory' && (
              <p className="hint">Com “Não salvar”, a chave será mantida apenas enquanto o app estiver aberto.</p>
            )}
          </div>
        </section>

        <section className="group">
          <h2>⚙️ Modelo e Endpoint</h2>
          <div className="field">
            <label>Modelo padrão</label>
            <input
              className="input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
            />
            <p className="hint">Você pode alterar por projeto depois.</p>
          </div>

          <div className="field">
            <label>Base URL</label>
            <input
              className="input"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com"
            />
          </div>
        </section>

        <section className="group">
          <h2>🌎 Preferências</h2>
          <div className="field">
            <label>Locale</label>
            <select className="input" value={locale} onChange={(e) => setLocale(e.target.value as 'pt-BR' | 'en-US')}>
              <option value="pt-BR">pt-BR</option>
              <option value="en-US">en-US</option>
            </select>
          </div>

          <div className="field">
            <label>Retries (tentativas)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={retries}
              onChange={(e) => setRetries(parseInt(e.target.value || '0', 10))}
            />
            <p className="hint">Número máximo de retentativas automáticas nas chamadas à OpenAI.</p>
          </div>
        </section>

        <ActionBar actions={actions} onAction={handleAction} align="right" />
      </div>
    </div>
  );
}
