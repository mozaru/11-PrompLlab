// src/adapters/mcp-discovery.ts
import { v4 as uuidv4 } from 'uuid';
import type { MCPTool, MCPInfo } from '../types/mcp';

const DEFAULT_DISCOVERY_PATHS = [
  '/ai-plugin.json',
  '/openapi.json',
  '/tools',
  '/tool_manifest.json',
];

type ManifestType = 'ai-plugin' | 'openapi' | 'generic-manifest' | 'unknown';

export interface DiscoveryResult {
  tools: MCPTool[];
  source: string; // URL ou "manual upload"
  manifestType: ManifestType;
}

async function discoverToolsViaMCPJsonRPC(baseUrl: string): Promise<MCPInfo | null> {
  try {
    const initResponse = await jsonRpcRequest(baseUrl, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { roots: { listChanged: false }, sampling: {}, elicitation: {} },
      clientInfo: {
        name: 'ExampleClient',
        title: 'Example Client',
        version: '1.0.0',
      },
    },'');

    if (!initResponse.result) return null;

    //const r = await jsonRpcRequest(baseUrl, 'notifications/initialize', {});
    //if (!r.result) return null;

    const tools: MCPTool[] = [];
    for(const key of  Object.keys(initResponse.result.capabilities))
    {
      let allResources: any[] = [];
      let cursor: string | undefined = undefined;
      do {
        const params = cursor ? { cursor } : {};
        const res = await jsonRpcRequest(baseUrl, `${key}/list`, params);
        if (!res.result || !res.result[key]) break;

        allResources = allResources.concat(res.result[key]);
        cursor = res.result.nextCursor;
      } while (cursor);

      
      for (const resource of allResources) {
        let content: any = null;
        if (resource.text) {
          content = parseContent(resource.text, resource.mimeType);
        } else if (resource.blob) {
          const decoded = atob(resource.blob);
          content = parseContent(decoded, resource.mimeType);
        }
        if (content){
          const manifestType = detectManifestType(content);
          if (manifestType !== 'unknown') {
            const extracted = extractToolsFromManifest(content, manifestType);
            tools.push(...extracted);
          }
        }
        else if (resource.description && resource.name)
        {
            tools.push({
              id: resource.id || uuidv4(),
              name: resource.name,
              description: resource.description,
              input_schema: resource.arguments,
              parameters: !resource.arguments?[] : resource.arguments.map((x:any) => ({[x.name] : x.type || 'string'}))
            });
        }
      }
    }
    if (tools.length === 0) return null;

    return {
      id: uuidv4(), // ou gerar UUID
      name: 'MCP JSON-RPC Discovery',
      base_url: baseUrl,
      discovered_from: 'MCP JSON-RPC resources/list',
      protocol: {
        protocol: 'json-rpc2',
        type: 'http',
        url: baseUrl,
      },
      tools,
      last_updated: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('MCP JSON-RPC discovery failed:', err);
    return null;
  }
}
let LastMCPSessionId:string|null=null;
async function jsonRpcRequest(url: string, method: string, params: any, mcpSessionId:string|null=null): Promise<any> {
  const body = {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 100000),
    method,
    params,
  };
  if (mcpSessionId===null) mcpSessionId=LastMCPSessionId;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'mcp-session-id': mcpSessionId?mcpSessionId:'',
      'Content-Type': 'application/json',
      'Accept': 'application/json;text/event-stream',
      'MCP-Protocol-Version': '2024-11-05', // cabeçalho obrigatório para MCP HTTP
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP error ${res.status}`);

  LastMCPSessionId = res.headers.get('mcp-session-id');
  const contentType = res.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json'))
     return await res.json();
  else if (contentType && contentType.includes('text/event-stream'))
  {
    const lines = (await res.text()).split('\n');
    const event = { event: 'message', data: '', id: "" };

    for (let line of lines)
      if (line.startsWith('event:'))
        event.event = line.slice(6).trim();
      else if (line.startsWith('data:'))
        event.data += line.slice(5).trim() + '\n';
      else if (line.startsWith('id:')) 
        event.id = line.slice(3).trim();
    return JSON.parse(event.data||"{}");
  }
  else
      return await res.text(); // ou outra forma de lidar com o conteúdo
}

function parseContent(text: string, mimeType: string): any | null {
  if (mimeType.includes('json') || mimeType === 'text/plain') {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  return null;
}

export async function discoverToolsFromMCP(baseUrl: string): Promise<MCPInfo | null> {
  // Primeiro tenta MCP JSON-RPC HTTP
  const mcpResult = await discoverToolsViaMCPJsonRPC(baseUrl);
  if (mcpResult) return mcpResult;

  // Se falhar, tenta endpoints fixos REST API
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  for (const path of DEFAULT_DISCOVERY_PATHS) {
    const url = `${normalizedBase}${path}`;

    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) continue;

      const json = await res.json();
      const manifestType = detectManifestType(json);
      if (manifestType === 'unknown') continue;

      const tools = extractToolsFromManifest(json, manifestType);
      if (tools.length === 0) continue;

      return {
        id: `restapi-${Date.now()}`,
        name: `REST API Discovery ${path}`,
        base_url: baseUrl,
        discovered_from: path,
        protocol: {
          protocol: 'restapi',
          type: 'http',
          url,
        },
        tools,
        last_updated: new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`Discovery failed for ${url}:`, err);
    }
  }

  return null;
}

export function detectManifestType(json: any): ManifestType {
  if (json['ai_plugin'] !== undefined || json['schema_version'] !== undefined) {
    return 'ai-plugin';
  }

  if (typeof json.openapi === 'string' && json.paths && typeof json.paths === 'object') {
    return 'openapi';
  }

  if (Array.isArray(json.tools)) {
    return 'generic-manifest';
  }

  return 'unknown';
}

export function extractToolsFromManifest(json: any, type: ManifestType): MCPTool[] {
  switch (type) {
    case 'ai-plugin':
      return extractToolsFromAIPlugin(json);
    case 'openapi':
      return extractToolsFromOpenAPI(json);
    case 'generic-manifest':
      return extractToolsFromGenericManifest(json);
    default:
      return [];
  }
}

function extractToolsFromAIPlugin(json: any): MCPTool[] {
  const toolsArray = json.commands || json.tools || [];

  if (!Array.isArray(toolsArray)) return [];

  return toolsArray.map((tool: any, idx: number) => ({
    id: tool.id || tool.name || `tool-ai-plugin-${idx}`,
    name: tool.name || `Tool ${idx}`,
    description: tool.description || '',
    input_schema: tool.parameters || undefined,
  }));
}

function extractToolsFromOpenAPI(json: any): MCPTool[] {
  const tools: MCPTool[] = [];

  if (!json.paths) return tools;

  for (const [path, methods] of Object.entries(json.paths)) {
    if (typeof methods !== 'object' || methods === null) continue;

    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation !== 'object' || operation === null) continue;

      tools.push({
        id: operation.operationId || `${method.toUpperCase()} ${path}`,
        name: operation.summary || `${method.toUpperCase()} ${path}`,
        description: operation.description || '',
        input_schema: extractInputSchemaFromOpenAPIOperation(operation),
      });
    }
  }

  return tools;
}

function extractInputSchemaFromOpenAPIOperation(operation: any): MCPTool['input_schema'] {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  if (Array.isArray(operation.parameters)) {
    for (const param of operation.parameters) {
      if (!param.name || !param.schema) continue;
      properties[param.name] = {
        type: param.schema.type || 'string',
        description: param.description || '',
      };
      if (param.required) required.push(param.name);
    }
  }

  if (operation.requestBody?.content?.['application/json']?.schema?.properties) {
    Object.assign(properties, operation.requestBody.content['application/json'].schema.properties);
    if (Array.isArray(operation.requestBody.content['application/json'].schema.required)) {
      required.push(...operation.requestBody.content['application/json'].schema.required);
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length ? required : undefined,
  };
}

function extractToolsFromGenericManifest(json: any): MCPTool[] {
  if (!Array.isArray(json.tools)) return [];

  return json.tools.map((tool: any, idx: number) => ({
    id: tool.id || tool.name || `tool-generic-${idx}`,
    name: tool.name || `Tool ${idx}`,
    description: tool.description || '',
    input_schema: tool.input_schema || undefined,
  }));
}

export function processManualManifest(json: any): DiscoveryResult {
  const manifestType = detectManifestType(json);
  const tools = extractToolsFromManifest(json, manifestType);

  return {
    tools,
    source: 'manual upload',
    manifestType,
  };
}
