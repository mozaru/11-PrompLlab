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
        case 'boolean': return ['true', '1', 'yes', 'y', 'sim'].includes(p.value?.toLowerCase() ?? '');
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
      template: '${0}',
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

  if (type === 'const') {
    return {
      ...base,
      type: 'const',
      value: ''
    };
  }

  if (type === 'restapi') {
    return {
      ...base,
      type: 'restapi',
      endpoint: 'http:\\<url>',
      method:'POST',
      headers:{ 'Authorization': 'Bearer <api-key>', 'Content-Type': 'application/json' },
      strJsonBody: "{}"
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
    template: "${0}",
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

  const buildAgentWithArgs = (editing: AgentTool, paramList: AgentParam[]): { agent: AgentTool, args: Record<string, any> } => {
    const parameters = Object.fromEntries(paramList.map(p => [p.name, { type: p.type }]));
    const args = paramList.reduce((acc, p) => {
      acc[p.name] = getValueFromAgentParam(p);
      return acc;
    }, {} as Record<string, any>);

    const extra = editing.type === 'regex' ? {
      regexTemplate: regexPlaceholder.regex,
      baseText: regexExampleText,
      flags: regexPlaceholder.flags,
      template: regexPlaceholder.template ?? '', 
      defaultValue: regexPlaceholder.default ?? '',
    } : editing.type === 'prompt' ? {
      systemPrompt: promptSystem,
      promptTemplate: promptUser,
    } : editing.type === 'function' ? {
      functionName: funcName,
      functionCode: funcCode,
    } : editing.type === 'restapi' ? {
      endpoint: editing.endpoint,
      method: editing.method,
      headers: editing.headers,
      strJsonBody: editing.strJsonBody
    } : editing.type === 'const' ? {
      value: editing.value
    } : {
    }

    return {
      agent: {
        ...editing,
        ...extra,
        parameters,
      },
      args,
    };
  }

  const isValidIdentifier = (id:string) =>{
    id = id.trim();
    const identifierRegex = /^[a-zA-Z_][0-9a-zA-Z_]*$/;
    return identifierRegex.test(id.trim());
  }
  const isDuplicatedAgents = (name:string) =>{
    name = name.trim().toLocaleLowerCase();
    const names = agents.filter( p => p.name.trim().toLocaleLowerCase() == name && editing?.id!=p.id)
    return names.length>0;
  }
  const isDuplicatedParams = () =>{
    const names = agentParams.map(p => p.name.trim());
    return new Set(names).size !== names.length;
  }
  
  const isValidParamNames = () => {
    const names = agentParams.map(p => p.name.trim());
    return names.every(name => isValidIdentifier(name));
  }

  const isDuplicatedParamName = (name:string) => {
    name = name.trim().toLocaleLowerCase();
    const names = agentParams.filter( p => p.name.trim().toLocaleLowerCase() == name)
    return names.length>1;
  }

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name.trim()) return alert('Nome é obrigatório.');

    if (!isValidIdentifier(editing.name))
    {
      alert('O Nome do agente deve ser um identificador valido!\nSó pode iniciar com letra ou _\nSó pode conter letras, numeros e sublinhado.');
      return;
    }

    if (isDuplicatedAgents(editing.name)) {
      alert('Nome do agente deve ser únicos.');
      return;
    }

    if (isDuplicatedParams()){
      alert('Nomes de parâmetros devem ser únicos.');
      return;
    }

    if (!isValidParamNames()){
      alert('Nomes de parâmetros devem ser identificadores validos.');
      return;
    }
    
    const { agent, args } = buildAgentWithArgs(editing!, agentParams);

    const exists = agents.find(a => a.id === editing.id);
    if (exists) {
      updateAgent(editing.id!, agent);
    } else {
      addAgent(agent);
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
        template: agent.template,
        default: agent.defaultValue ?? '',
    });
    setRegexExampleText(agent.baseText ?? '');
    } else if (agent.type === 'prompt') {
      setPromptSystem(agent.systemPrompt ?? '');
      setPromptUser(agent.promptTemplate ?? '');
    } else if (agent.type === 'function') {
      setFuncName(agent.functionName ?? '');
      setFuncCode(agent.functionCode ?? '');
    } else if (agent.type === 'const') {
      // nothing needed, value already in agent
    } else if (agent.type === 'restapi') {
      // nothing needed, endpoint/method/headers already in agent
    }
  };

  const executeAgentTest = async (agent:AgentTool, args:Record<string, any>) => {
    try {
        // Zustand permite acesso direto ao estado fora dos hooks
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
        name: editing?.name ?? "",
        value: response,
        status: response!="" ? 'matched_non_empty': 'matched_empty',
        error: undefined
        });
    } catch (err: any) {
        setTestResult({
        name: editing?.name ?? "",
        value: '',
        status: 'no_match',
        error: String(err.message ?? err),
        });
    }
  }

  const testAgent = async () => {
    const { agent, args } = buildAgentWithArgs(editing!, agentParams);
    executeAgentTest(agent, args);
  }

  const handleTest = async () => {
    const paramList = Object.entries(isTesting?.parameters ?? {}).map(([name, def]: any) => ({
      name,
      type: def.type ?? 'string',
      value: testArgs[name] ?? '',
    }));
    const { agent, args } = buildAgentWithArgs(isTesting!, paramList);
    executeAgentTest(agent, args);
  };

  const addParam = () => {
    setAgentParams([...agentParams, { name: '', type: 'string', value: '' }]);
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
                                <button className="btn btn-tool remove" onClick={() => { if (confirm(`Remover agente "${agent.name}"?`)) { removeAgent(agent.id!); }}}>🗑</button>
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
                            <input className={`input ${isDuplicatedAgents(editing.name) || !isValidIdentifier(editing.name) ? 'input-error' : ''}`} 
                                value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
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
                                setEditing({ ...editing, type, params:{} });
                                const copy = [...agentParams];
                                setAgentParams(copy);
                            }}
                            >
                            <option value="regex">Regex</option>
                            <option value="prompt">Prompt</option>
                            <option value="function">Função JS</option>
                            <option value="const">Constante</option>
                            <option value="restapi">rest api</option>
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
                            <th>Template</th>
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
                                        value={regexPlaceholder.template ?? ''}
                                        onChange={(e) => setRegexPlaceholder({ ...regexPlaceholder, template: e.target.value })}
                                        placeholder="Ex: ${nome}, ${1}, ${0}"
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
                        rows={3}
                        placeholder="Cole aqui um texto real para testar a regex."
                    />
                    </div>
                </>
                )}
                {editing.type === 'prompt' && (
                    <>
                        <div className="field">
                            <label>System Prompt:</label>
                            <textarea className="input" rows={3} value={promptSystem} onChange={(e) => setPromptSystem(e.target.value)} />
                        </div>
                        <div className="field">
                            <label>User Prompt:</label>
                            <textarea className="input" rows={2} value={promptUser} onChange={(e) => setPromptUser(e.target.value)} />
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
                        <textarea className="input" rows={4} value={funcCode} onChange={(e) => setFuncCode(e.target.value)} />
                    </div>
                </>
                )}
                {editing.type === 'const' && (
                  <div className="field">
                      <label>Valor Constante:</label>
                      <textarea
                          className="input"
                          rows={8}
                          value={editing.value ?? ''}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                      />
                  </div>
                )}
                {editing.type === 'restapi' && (
                  <>
                    <div className="grid-2">
                      <div className="field">
                          <label>URL do Endpoint:</label>
                          <input
                              className="input"
                              value={editing.endpoint ?? ''}
                              onChange={(e) => setEditing({ ...editing, endpoint: e.target.value })}
                          />
                      </div>
                      <div className="field">
                          <label>Método:</label>
                          <select
                              className="input"
                              value={editing.method ?? 'POST'}
                              onChange={(e) => setEditing({ ...editing, method: e.target.value })}
                          >
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                              <option value="PATCH">PATCH</option>
                              <option value="OPTIONS">OPTIONS</option>
                          </select>
                      </div>
                    </div>
                    <div className="grid-2">
                    <div className="field">
                        <label>Headers (JSON):</label>
                        <textarea
                            className="input"
                            rows={4}
                            value={JSON.stringify(editing.headers ?? {}, null, 2)}
                            onChange={(e) => {
                                try {
                                  const headers = JSON.parse(e.target.value);
                                  setEditing({ ...editing, headers });
                                } catch {}
                            }}
                        />
                    </div>
                    <div className="field">
                        <label>Body (JSON):</label>
                        <textarea
                            className="input"
                            rows={4}
                            value={editing.strJsonBody ?? ''}
                            onChange={(e) => setEditing({ ...editing, strJsonBody: e.target.value })}
                        />
                    </div>
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
                    {testResult && testResult.status !== 'matched_non_empty' &&  testResult.status !== 'matched_empty' ? (
                      <div className="error">
                        <strong>Erro:</strong>
                        <pre>{testResult.error}</pre>
                      </div>
                    ) : (
                      <div className="card">
                        <label>Resultado:</label>
                        <pre>{testResult?.value}</pre>
                      </div>
                    )}
                    <div style={{ marginTop:"0.5em", height:"6em", overflowY: 'auto' }}>
                    {agentParams.map((param, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <input
                        className={`input ${isDuplicatedParamName(param.name) || !isValidIdentifier(param.name) ? 'input-error' : ''}`}
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

                {testResult && testResult.status !== 'matched_empty' && testResult.status !== 'matched_non_empty'   ? (
                  <div className="error">
                    <strong>Erro:</strong>
                    <pre>{testResult.error}</pre>
                  </div>
                ) : (
                  <div>
                    <label>Resultado:</label>
                    <pre>{testResult?.value}</pre>
                  </div>
                )}
            </div>
            </div>
        </div>
      )}
    </div>
  );
}

