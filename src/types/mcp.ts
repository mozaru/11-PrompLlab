// src/types/mcp.ts
export type MCPProtocol = {
    protocol: 'restapi' | 'json-rpc2',
    type: 'http' | 'websocket' | 'stdio',
} & (
  | {
      type: 'http';
      url: string;
    }
  | {
      type: 'websocket';
      url: string;
    }
  | {
      type: 'stdio';
      command: string;
      args: string[];
    }
)

export type MCPTool = {
  id: string;           // identificador único da tool (ex: "summarize" ou "tool_xyz")
  name: string;         // nome amigável (ex: "Summarizer")
  description?: string; // descrição da ferramenta
  parameters: Record<string, any>;
  input_schema?: any;   // schema de entrada (pode ser JSON Schema ou OpenAPI Schema)
  output_schema?: any;  // schema de saída (se disponível)
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';  
  raw?: any;            // opcional: objeto bruto retornado no discovery
};

export type MCPInfo = {
  id: string;                 // identificador único (UUID ou slug gerado)
  name: string;               // nome dado pelo usuário ou detectado
  base_url: string;          // URL base (ex: https://my-server.com)
  discovered_from?: string;  // qual arquivo retornou os dados (ex: "ai-plugin.json")
  protocol?: MCPProtocol;
  tools: MCPTool[];          // lista de tools encontradas
  last_updated: string;      // ISO date da última descoberta
  error?: string;            // erro durante discovery (se houver)
};
