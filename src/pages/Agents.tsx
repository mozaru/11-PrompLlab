import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentsStore } from '../state/agents.store';
import { executeTool } from '../adapters/model-client/openai';
import { useSettings } from '../state/settings.store';
import { ActionBar, type AppAction, type AppActionId } from '../components/ActionBar';
import type { AgentTool } from '../types/chat';
import type { OpenAIChatParams } from '../adapters/model-client/openai';
import '../styles/forms.css';
import '../styles/design.css';
import '../styles/modal.css';
import type { Placeholder, RegexFlag, TestResult } from '../types/placeholders';


type AgentParam = { name: string; type: string, value:string };

function getValueFromAgentParam(p:AgentParam) : any
{
    switch(p.type)
    {
        case 'number': return p.value?parseFloat(p.value):0;
        case 'boolean': return p.value? (p.value.toLowerCase()[0]=='t') : false;
        default: return p.value;
    }
}

function createEmptyAgent(type: AgentTool['type']): AgentTool {
  const base = { name: '', description: '', parameters: {}, type };

  if (type === 'regex') {
    return {
      ...base,
      type: 'regex',
      regexTemplate: '',
      baseText: '',
      flags: [],
      group: undefined,
      defaultValue: '',
    };
  }

  if (type === 'prompt') {
    return {
      ...base,
      type: 'prompt',
      systemPrompt: '',
      promptTemplate: '',
    };
  }

  if (type === 'function') {
    return {
      ...base,
      type: 'function',
      functionName: '',
      functionCode: '',
    };
  }

  throw new Error('Tipo inválido');
}

export default function Agents() {
  const { agents, addAgent, updateAgent, removeAgent } = useAgentsStore();
  const navigate = useNavigate();

  const [editing, setEditing] = useState<AgentTool | null>(null);
  const [agentParams, setAgentParams] = useState<AgentParam[]>([]);
  const [promptSystem, setPromptSystem] = useState('');
  const [promptUser, setPromptUser] = useState('');
  const [funcName, setFuncName] = useState('');
  const [funcCode, setFuncCode] = useState('');

  const [regexPlaceholder, setRegexPlaceholder] = useState<Placeholder>({
    name: 'output', // nome arbitrário, pois é um único regex por agente
    regex: '',
    flags: [],
    group: undefined,
    default: '',
    });
  const [regexExampleText, setRegexExampleText] = useState('');
  
  const [isTesting, setIsTesting] = useState<AgentTool | null>(null);
  const [testArgs, setTestArgs] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const actions: AppAction[] = [
    { id: 'goHome', label: 'Voltar', variant: 'secondary' },
    { id: 'addAgent', label: 'Novo Agente', variant: 'primary' },
  ];

  const onAction = (id: AppActionId) => {
    if (id === 'goHome') navigate('/');
    else if (id === 'addAgent') {
      const newAgent = createEmptyAgent('regex');
      setEditing(newAgent);
      setAgentParams([]);
      setRegexPlaceholder({ name: 'output', regex: '',  flags: [], group: undefined, default: '', });
      setRegexExampleText('');
      setPromptSystem('');
      setPromptUser('');
      setFuncName('');
      setFuncCode('');
    }
  };

  const syncParamsToEditing = (): Record<string, any> => {
    const parameters = Object.fromEntries(agentParams.map(p => [p.name, { type: p.type }]));
    if (editing?.type === 'regex')  return { parameters, regexTemplate: regexPlaceholder.regex, baseText: regexExampleText, flags: regexPlaceholder.flags ?? [], group: regexPlaceholder.group, defaultValue: regexPlaceholder.default ?? '', };
    if (editing?.type === 'prompt') return { systemPrompt: promptSystem, promptTemplate: promptUser, parameters };
    if (editing?.type === 'function') return { functionName: funcName, functionCode: funcCode, parameters };
    return {};
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name.trim()) return alert('Nome é obrigatório.');

    const partial = syncParamsToEditing();

    const newAgent: AgentTool = {
        ...editing,
        ...partial, // espalha regexTemplate, functionName, etc no nível raiz
        parameters: partial.parameters, // mantém os parâmetros no lugar certo
    };

    const exists = agents.find(a => a.name === editing.name);
    if (exists) {
      updateAgent(editing.name, newAgent);
    } else {
      addAgent(newAgent);
    }

    setEditing(null);
  };

  const handleEditAgent = (agent: AgentTool) => {
    setEditing(agent);
    const paramList = Object.entries(agent.parameters ?? {}).map(([name, def]: any) => ({
      name,
      type: def.type ?? 'string',
      value: '' 
    }));
    setAgentParams(paramList);
    
    if (agent.type === 'regex') {
    setRegexPlaceholder({
        name: 'output',
        regex: agent.regexTemplate ?? '',
        flags: agent.flags ?? [],
        group: agent.group,
        default: agent.defaultValue ?? '',
    });
    setRegexExampleText(agent.baseText ?? '');
    } else if (agent.type === 'prompt') {
      setPromptSystem(agent.systemPrompt ?? '');
      setPromptUser(agent.promptTemplate ?? '');
    } else if (agent.type === 'function') {
      setFuncName(agent.functionName ?? '');
      setFuncCode(agent.functionCode ?? '');
    }
  };

  const executeAgentTest = async (agent:AgentTool, args:Record<string, any>) => {
    try {
        const settings = useSettings.getState();
        const apiKey = settings.readApiKeyEffective();

        if (!apiKey) 
            throw new Error('API key ausente. Configure em Configurações Globais.');

        const params: OpenAIChatParams = {
            apiKey,
            baseUrl: settings.cfg.openai.base_url ?? 'https://api.openai.com',
            model: settings.cfg.openai.model_default,
        };
        const response = await executeTool(params, agent, args);
        setTestResult({
        name: editing.name,
        value: response,
        status: 'success',
        group: editing.group,
        error: null
        });
    } catch (err: any) {
        setTestResult({
        name: editing.name,
        value: editing.default ?? '',
        status: 'fail',
        group: editing.group,
        error: String(err.message ?? err),
        });
    }
  }

  const testAgent = async () => {
    const partial = syncParamsToEditing();

    const newAgent: AgentTool = {
        ...editing,
        ...partial, // espalha regexTemplate, functionName, etc no nível raiz
        parameters: partial.parameters, // mantém os parâmetros no lugar certo
    };
    const args:Record<string, any>=  agentParams.reduce((acc:Record<string, any>, x:AgentParam) => { acc[x.name] = getValueFromAgentParam(x); return acc; }, {});
    executeAgentTest(newAgent, args);
  }

  const handleTest = async () => {
    if (!isTesting) return;
    executeAgentTest(isTesting, testArgs);
  };

  const addParam = () => {
    setAgentParams([...agentParams, { name: '', type: 'string' }]);
  };

  const removeParam = (index: number) => {
    const copy = [...agentParams];
    copy.splice(index, 1);
    setAgentParams(copy);
  };

  return (
    <div className="page">
      <header className="chat-header">
        <h1 className="app-title">11 PromptLab — Agentes</h1>
      </header>

      <div className="card form">
        <p className="muted">Gerencie seus agentes personalizados (tools). Eles podem ser utilizados durante o chat para executar ações específicas.</p>
        <div className="group">
            <h2>🧩 Agents (Tools)</h2>
            {agents.length === 0 ? (
            <p className="muted">Nenhum placeholder detectado. Defina primeiro o User Template em <b>Prompts</b>.</p>
            ) : (
            <div className="table-wrap">
                <table className="table">
                <thead>
                    <tr>
                    <th>Agent Name</th>
                    <th>Description</th>
                    <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {agents.map((agent:AgentTool, index: number) => (
                        <tr key={agent.name || index}>
                          <td className="mono">{`${agent.name}`}</td>
                          <td className="mono">{`${agent.description}`}</td>
                          <td className="actions">
                            <div className='btn-tool-bar'>
                                <button className="btn btn-tool edit" onClick={() =>handleEditAgent(agent)}>✏️</button>
                                <button className="btn btn-tool test" onClick={() => setIsTesting(agent)}>🧪</button>
                                <button className="btn btn-tool remove" onClick={() => { if (confirm(`Remover agente "${agent.name}"?`)) { removeAgent(agent.name); }}}>🗑</button>
                            </div>
                          </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
        <ActionBar actions={actions} onAction={onAction} align="right" />
      </div>

      {/* Modal de Edição */}
      {editing && (
        <div className="modal-backdrop">
            <div className="modal">
            <div className="modal-body">
                <h2>{agents.find(a => a.name === editing.name) ? 'Editar Agente' : 'Novo Agente'}</h2>

                <section className="group">
                    <div className="grid-2">
                        <div className="field">
                            <label>Nome:</label>
                            <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                        </div>
                        <div className="field">
                            <label>Descrição:</label>
                            <input className="input" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                        </div>
                        <div className="field">
                            <label>Tipo:</label>
                            <select
                            className="input"
                            value={editing.type}
                            onChange={(e) => {
                                const type = e.target.value as AgentTool['type'];
                                setEditing({ ...editing, type, params: {} });
                                setAgentParams([]);
                            }}
                            >
                            <option value="regex">Regex</option>
                            <option value="prompt">Prompt</option>
                            <option value="function">Função JS</option>
                            </select>
                        </div>
                    </div>
                </section>
                {/* Campos específicos por tipo */}
                {editing.type === 'regex' && (
                <>
                    <div className="table-wrap">
                        <table className="table">
                        <thead>
                            <tr>
                            <th>Regex</th>
                            <th>Flags</th>
                            <th>Grupo</th>
                            <th>Default</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <input
                                        className="input"
                                        value={regexPlaceholder.regex}
                                        onChange={(e) => setRegexPlaceholder({ ...regexPlaceholder, regex: e.target.value })}
                                        placeholder="Ex: ^Nome: (.*)$ ou (?<nome>.+)"
                                    />
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {(['i', 'm', 's'] as RegexFlag[]).map((flag) => (
                                        <label key={flag} className="flag">
                                            <input
                                            type="checkbox"
                                            checked={regexPlaceholder.flags?.includes(flag) ?? false}
                                            onChange={(e) => {
                                                const next = new Set(regexPlaceholder.flags ?? []);
                                                if (e.target.checked) next.add(flag); else next.delete(flag);
                                                setRegexPlaceholder({ ...regexPlaceholder, flags: Array.from(next) as RegexFlag[] });
                                            }}
                                            />
                                            {flag}
                                        </label>
                                        ))}
                                    </div>
                                </td>

                                <td>
                                    <input
                                        className="input"
                                        style={{width: "4em"}}
                                        value={regexPlaceholder.group ?? ''}
                                        onChange={(e) => setRegexPlaceholder({ ...regexPlaceholder, group: e.target.value })}
                                        placeholder="0 = match inteiro, 1..n ou nome"
                                    />
                                </td>

                                <td>
                                    <input
                                        className="input"
                                        value={regexPlaceholder.default ?? ''}
                                        onChange={(e) => setRegexPlaceholder({ ...regexPlaceholder, default: e.target.value })}
                                    />
                                </td>
                            </tr>
                        </tbody>
                        </table>
                    </div>

                    <div className="field">
                    <label>Texto de Exemplo:</label>
                    <textarea
                        className="input"
                        value={regexExampleText}
                        onChange={(e) => setRegexExampleText(e.target.value)}
                        rows={6}
                        placeholder="Cole aqui um texto real para testar a regex."
                    />
                    </div>
                </>
                )}
                {editing.type === 'prompt' && (
                    <>
                        <div className="field">
                            <label>System Prompt:</label>
                            <textarea className="input" rows={5} value={promptSystem} onChange={(e) => setPromptSystem(e.target.value)} />
                        </div>
                        <div className="field">
                            <label>User Prompt:</label>
                            <textarea className="input" rows={3} value={promptUser} onChange={(e) => setPromptUser(e.target.value)} />
                        </div>
                    </>
                )}
                {editing.type === 'function' && (
                <>
                    <div className="field">
                        <label>Nome da Função:</label>
                        <input className="input" value={funcName} onChange={(e) => setFuncName(e.target.value)} />
                    </div><div className="field">
                        <label>Código JS:</label>
                        <textarea className="input" rows={7} value={funcCode} onChange={(e) => setFuncCode(e.target.value)} />
                    </div>
                </>
                )}

                {/* Parâmetros */}
                <section className="group">
                    <div>
                        <h2 style={{display:'inline'}}>Parâmetros:</h2> 
                        <button className='btn btn-tool add' style={{ marginLeft:3,  display:'inline'}} onClick={addParam}>➕</button>
                        <button className='btn btn-tool test' style={{ marginLeft:3,  display:'inline'}} onClick={testAgent}>🧪</button>
                    </div>
                    {testResult && (
                    <div style={{ marginTop: 16 }}>
                        <h4>Resultado</h4>
                        <p>Status: <strong>{testResult.status}</strong></p>
                        {testResult.error && <p className="error">Erro: {testResult.error}</p>}
                        <div className="card">
                        <pre>{testResult.value}</pre>
                        </div>
                    </div>
                    )}
                    <div style={{ marginTop:"0.5em", height:"6em", overflowY: "overlay" }}>
                    {agentParams.map((param, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <input
                        className="input"
                        placeholder="nome"
                        value={param.name}
                        onChange={(e) => {
                            const copy = [...agentParams];
                            copy[idx].name = e.target.value;
                            setAgentParams(copy);
                        }}
                        />
                        <select
                        className="input"
                        value={param.type}
                        onChange={(e) => {
                            const copy = [...agentParams];
                            copy[idx].type = e.target.value;
                            setAgentParams(copy);
                        }}
                        >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        </select>
                        <label className="mono control">Test Value:</label>
                        <input
                        className="input"
                        placeholder="test value"
                        value={getValueFromAgentParam(param)}
                        onChange={(e) => {
                            const copy = [...agentParams];
                            copy[idx].value = e.target.value;
                            setAgentParams(copy);
                        }}
                        />
                        <div className='btn-tool-bar'>
                        <button className='btn btn-tool remove' onClick={() => removeParam(idx)}>🗑</button>
                        </div>
                    </div>
                    ))}
                </div>

                <div className="modal-footer">
                    <button onClick={handleSave} className="btn btn-primary">💾 Salvar</button>
                    <button onClick={() => setEditing(null)} className="btn btn-secondary">❌ Cancelar</button>
                
                </div>
                </section>
            </div>
            </div>
        </div>
      )}

      {/* Modal de Teste */}
      {isTesting && (
        <div className="modal-backdrop">
            <div className="modal">
            <div className="modal-body">
                <h2>🧪 Testar Agente: {isTesting.name}</h2>
                <p className="muted">Informe os valores para os parâmetros abaixo:</p>

                {Object.keys(isTesting.parameters ?? {}).map((key) => (
                <div className="field" key={key}>
                    <label>{key}:</label>
                    <input
                    className="input"
                    value={testArgs[key] ?? ''}
                    onChange={(e) => setTestArgs({ ...testArgs, [key]: e.target.value })}
                    />
                </div>
                ))}

                <div style={{ marginTop: 12 }}>
                <button onClick={handleTest}>▶️ Executar</button>{' '}
                <button onClick={() => { setIsTesting(null); setTestResult(null); }}>❌ Fechar</button>
                </div>

                {testResult && (
                <div className="output" style={{ marginTop: 16 }}>
                    <label>Resposta:</label>
                    <pre>{testResult}</pre>
                </div>
                )}
            </div>
            </div>
        </div>
      )}
    </div>
  );
}

