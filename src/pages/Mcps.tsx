// src/pages/Mcps.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMCPStore } from '../state/mcp.store';
import { discoverToolsFromMCP } from '../adapters/mcp-discovery';
import type { MCPInfo, MCPTool } from '../types/mcp';
import type { OpenAIChatParams } from '../adapters/model-client/openai';
import { useSettings } from '../state/settings.store';
import { ActionBar, type AppAction, type AppActionId } from '../components/ActionBar';
import { executeTool } from '../adapters/model-client/openai';  // reutilizar executeTool para testar chamadas
import '../styles/forms.css';
import '../styles/design.css';
import '../styles/modal.css';
import type { AgentTool } from '../types/chat';

type TestArgs = Record<string, string>;

export default function Mcps() {
  const { mcps, addMCP, updateMCP, removeMCP } = useMCPStore();
  const navigate = useNavigate();

  const settings = useSettings();
  const [editing, setEditing] = useState<MCPInfo | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [name, setName] = useState('');
  const [discoveredTools, setDiscoveredTools] = useState<MCPTool[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTestTool, setActiveTestTool] = useState<string | null>(null); // tool id sendo testada

  const [testArgsMap, setTestArgsMap] = useState<Record<string, TestArgs>>({});
  const [testResultsMap, setTestResultsMap] = useState<Record<string, string>>({});

  const actions: AppAction[] = [
    { id: 'goHome', label: 'Voltar', variant: 'secondary' },
    { id: 'addMCP', label: 'Novo MCP', variant: 'primary' },
  ];

  const onAction = (id: AppActionId) => {
    if (id === 'goHome') navigate('/');
    else if (id === 'addMCP') {
      setEditing({
        id: '',
        name: '',
        base_url: '',
        tools: [],
        last_updated: new Date().toISOString(),
      });
      setDiscoveredTools([]);
      setName('');
      setBaseUrl('');
      setError(null);
    }
  };

  const handleDiscovery = async () => {
    if (!editing) return;
    try {
        const discoveryResult = await discoverToolsFromMCP(editing.base_url);
        if (discoveryResult) {
            setDiscoveredTools(discoveryResult.tools);
            setError(null);
        } else {
            setDiscoveredTools([]);
            setError('Nenhuma ferramenta encontrada.');
        }
    } catch (e: any) {
      setError(`Falha no discovery: ${e.message}`);
      setDiscoveredTools([]);
    }
  };

  const handleSave = () => {
    if (!editing) return;
    const mcpToSave: MCPInfo = {
      ...editing,
      name: name.trim() || editing.name,
      base_url: baseUrl.trim(),
      tools: discoveredTools,
      last_updated: new Date().toISOString(),
    };
    if (editing.id) {
      updateMCP(editing.id, mcpToSave);
    } else {
      addMCP({ ...mcpToSave, id: '' }); // store vai gerar id
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover MCP?')) removeMCP(id);
  };

  const testTool = async (tool: MCPTool) => {
    if (!editing) return;
    try {
      // montar args convertendo testArgs (strings) para tipos corretos se necessário
      const params: OpenAIChatParams = {
        apiKey: settings.cfg.openai.api_key!,
        baseUrl: settings.cfg.openai.base_url ?? 'https://api.openai.com',
        model: settings.cfg.openai.model_default,
      };

      const args = testArgsMap[tool.id] ?? {};
      const bodyObj = args;

      const endpoint = editing.base_url.endsWith('/')
      ? `${editing.base_url}${tool.name}`
      : `${editing.base_url}/${tool.name}`;

      const toolCall:AgentTool = {
        type: 'restapi',
        name: tool.name,
        description: tool.description || '',
        parameters: tool.input_schema ?? {},
        endpoint,
        method: tool.method || 'POST',
        headers: {},
        strJsonBody: JSON.stringify(bodyObj),
      };
      const result = await executeTool(params, toolCall, bodyObj);
      setTestResultsMap((prev) => ({
            ...prev,
            [tool.id]: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
      }));
    } catch (e: any) {
      setTestResultsMap((prev) => ({
        ...prev,
        [tool.id]: `Erro: ${e.message}`,
      }));
    }
  };

  return (
    <div className="page">
      <header className="chat-header">
        <h1 className="app-title">Gerenciamento de MCPs</h1>
      </header>

      <div className="card form">
        <div className="group">
          <h2>MCPS</h2>
          <table className="table">
            <thead>
              <tr><th>Nome</th><th>URL Base</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {mcps.map((mcp) => (
                <tr key={mcp.id}>
                  <td className="mono">{mcp.name}</td>
                  <td className="mono">{mcp.base_url}</td>
                  <td className="actions">
                    <div className='btn-tool-bar'>
                        <button className="btn btn-tool edit" onClick={() => {
                            setEditing(mcp);
                            setName(mcp.name);
                            setBaseUrl(mcp.base_url);
                            setDiscoveredTools(mcp.tools);
                        }}>✏️</button>
                        <button className="btn btn-tool remove" onClick={() => handleDelete(mcp.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ActionBar actions={actions} onAction={onAction} align="right" />
      </div>

      {editing && (
        <div className="modal-backdrop">
          <div className="modal large">
            <div className="modal-body">
              <h2>{editing.id ? 'Editar MCP' : 'Novo MCP'}</h2>
              <div className="field">
                <label>Nome:</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => { const val = e.target.value; setName(val); setEditing((e) => e ? { ...e, name: val } : e);}}
                  placeholder="Nome do MCP"
                />
              </div>
              <div className="field">
                <label>URL Base:</label>
                <input
                  className="input"
                  value={baseUrl}
                  onChange={(e) => { const val = e.target.value; setBaseUrl(e.target.value); setEditing((e) => e ? { ...e, base_url: val } : e);}}
                  placeholder="https://seu-mcp.com"
                />
              </div>
              <div className="field">
                <button onClick={handleDiscovery}>🔍 Descobrir ferramentas</button>
                {error && <div className="error">{error}</div>}
              </div>

              <div className="group">
                <h3>Ferramentas descobertas</h3>
                {discoveredTools.map((tool) => (
                  <div key={tool.id} className="accordion">
                    <div
                      className="accordion-header"
                      onClick={() => setActiveTestTool(activeTestTool === tool.id ? null : tool.id)}
                    >
                      {tool.name} — {tool.description}
                    </div>
                    {activeTestTool === tool.id && (
                      <div className="accordion-body">
                        {/* Mostrar parâmetros e botão de teste */}
                       {tool.input_schema &&
                        Object.keys(tool.input_schema.properties ?? {}).map((key) => {
                            const currentArgs = testArgsMap[tool.id] ?? {};
                            return (
                            <div key={key} className="field">
                                <label>{key}:</label>
                                <input
                                className="input"
                                value={currentArgs[key] ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setTestArgsMap((prev) => ({
                                    ...prev,
                                    [tool.id]: { ...prev[tool.id], [key]: val },
                                    }));
                                }}
                                />
                            </div>
                            );
                        })}
                        <button onClick={() => testTool(tool)}>▶️ Testar</button>
                        {testResultsMap[tool.id] && (
                        <div className="card">
                            <label>Resultado:</label>
                            <pre>{testResultsMap[tool.id]}</pre>
                        </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
            <div className="modal-footer">
              <button onClick={handleSave} className="btn btn-primary">💾 Salvar MCP</button>
              <button onClick={() => setEditing(null)} className="btn btn-secondary">❌ Fechar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
