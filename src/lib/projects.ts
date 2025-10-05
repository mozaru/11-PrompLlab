// src/lib/projects.ts
import { caps } from './capabilities';
import { usePrompts } from '../state/prompts.store';
import { usePlaceholders } from '../state/placeholders.store';
import { useAgentsStore } from '../state/agents.store';
import type { RegexFlag } from '../types/placeholders';
import type { AgentTool } from '../types/chat';
import type { MCPInfo } from '../types/mcp';
import { useMCPStore } from '../state/mcp.store';

const LS_KEY = '11promptlab:last_profile_v1';

// --------- Tipos do payload (v1) ----------
export type PromptsRegexV1 = {
  kind: 'prompts+regex';
  version: '1.0';
  title?: string;
  updatedAt: string; // ISO
  prompts: {
    system: string;
    knowledge_base?: string; 
    user_template: string;
  };
  /** Texto de exemplo usado na tela de Regex (opcional p/ compatibilidade) */
  example_text?: string;
  placeholders: Array<{
    name: string;
    regex: string;
    flags?: RegexFlag[];
    default?: string;
    group?: number | string;
  }>;
  agents?: AgentTool[];
  mcps?: MCPInfo[];
};

// --------- build -> coleta atual dos stores ----------
export function buildPromptsRegex(): PromptsRegexV1 {
  const { systemPrompt, knowledgeBase, userTemplate } = usePrompts.getState();
  const phStore = usePlaceholders.getState();
  const agentStore = useAgentsStore.getState();
  const mcpStore = useMCPStore.getState();
  const phs = phStore.placeholders;

  return {
    kind: 'prompts+regex',
    version: '1.0',
    title: 'Projeto 11 PromptLab',
    updatedAt: new Date().toISOString(),
    prompts: {
      system: systemPrompt ?? '',
      knowledge_base: knowledgeBase ?? '',
      user_template: userTemplate ?? '',
    },
    example_text: phStore.exampleText ?? '',
    placeholders: phs.map((p) => ({
      name: p.name,
      regex: p.regex ?? '',
      flags: p.flags ?? [],
      default: p.default ?? '',
      group: p.group,
    })),
    agents: agentStore.agents ?? [],
    mcps: mcpStore.mcps ?? [],
  };
}

// --------- apply -> carrega no estado ----------
export function applyPromptsRegex(data: PromptsRegexV1) {
  const prompts = usePrompts.getState();
  const phStore = usePlaceholders.getState();
  const agentStore = useAgentsStore.getState();
  const mcpStore = useMCPStore.getState();

  // 1) prompts
  prompts.setSystem(data.prompts.system ?? '');
  prompts.setKnowledgeBase(data.prompts.knowledge_base ?? '');
  prompts.setUserTpl(data.prompts.user_template ?? '');

  // 2) texto de exemplo (se vier)
  phStore.setExampleText(data.example_text ?? '');

  // 3) placeholders
  const names = data.placeholders.map((x) => x.name);
  phStore.syncFromTemplate(names, true);
  for (const item of data.placeholders) {
    phStore.upsert(item.name, {
      regex: item.regex ?? '',
      flags: item.flags ?? [],
      default: item.default ?? '',
      group: item.group,
    });
  }
  agentStore.setAgents(data.agents ?? []);
  mcpStore.setMCPs(data.mcps ?? []);
}

// --------- validação básica ----------
function isPromptsRegexV1(obj: any): obj is PromptsRegexV1 {
  return (
    obj &&
    obj.kind === 'prompts+regex' &&
    obj.version === '1.0' &&
    obj.prompts &&
    typeof obj.prompts.system === 'string' &&
    typeof obj.prompts.user_template === 'string' 
    && Array.isArray(obj.placeholders)
    && (obj.agents === undefined || Array.isArray(obj.agents))
    && (obj.mcps === undefined || Array.isArray(obj.mcps))
  );
}

export function savePromptsRegexToLocal(): void {
  const data = buildPromptsRegex();
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Falha ao salvar no localStorage:', e);
  }
}

export function loadPromptsRegexFromLocal(): PromptsRegexV1 | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const json = JSON.parse(raw);
    // valida estrutura básica para evitar lixo
    if (
      json &&
      json.kind === 'prompts+regex' &&
      typeof json.version === 'string' &&
      json.prompts &&
      typeof json.prompts.system === 'string' &&
      typeof json.prompts.user_template === 'string'
    ) {
      return json as PromptsRegexV1;
    }
  } catch (e) {
    console.warn('Falha ao ler do localStorage:', e);
  }
  return null;
}

export function clearLocalProfile(): void {
  try { localStorage.removeItem(LS_KEY); } catch {}
}

// --------- salvar em disco ----------
export async function savePromptsRegexToDisk(fileName = 'prompts_regex_v1.json') {
  const data = buildPromptsRegex();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

  if (caps.hasFsa && 'showSaveFilePicker' in window) {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: fileName,
      types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } else {
    // fallback: download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  }
}

// --------- ler do disco ----------
export async function openPromptsRegexFromDisk(): Promise<PromptsRegexV1> {
  let text = '';

  if (caps.hasFsa && 'showOpenFilePicker' in window) {
    const [handle] = await (window as any).showOpenFilePicker({
      multiple: false,
      types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
    });
    const file = await handle.getFile();
    text = await file.text();
  } else {
    // fallback: input[type=file]
    text = await new Promise<string>((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = () => {
        const f = input.files?.[0];
        if (!f) return reject(new Error('Nenhum arquivo selecionado'));
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(f);
      };
      input.click();
    });
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error('Arquivo JSON inválido.');
  }
  if (!isPromptsRegexV1(json)) {
    throw new Error('Estrutura não reconhecida (esperado kind="prompts+regex", version="1.0").');
  }
  return json as PromptsRegexV1;
}
