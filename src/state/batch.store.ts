import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { BatchConfig, BatchJob } from '../types/batch';
import { ENV } from '../lib/env';
import { useSettings } from './settings.store';
import { usePrompts } from './prompts.store';
import { usePlaceholders } from './placeholders.store';
import { renderTemplate } from '../lib/template/render';
import { compileContext } from '../lib/context/compile';
import { openaiChat } from '../adapters/model-client/openai';
import { fsa, type FsaDirHandle } from '../adapters/fs/fsa';
import { readFileAsText } from '../lib/encoding';
import { buildZipFromTextMap, downloadZip } from '../lib/zip';

type Mode = 'fsa' | 'zip';

// ===== Tipos do vetor JSON =====
export type BatchVectorItem = {
  content: string;            // obrigatório
  inputName?: string;         // opcional (para log/trace)
  outputName?: string;        // opcional (relativo ao diretório de saída)
};
export type BatchJson = BatchVectorItem[];

type OutputReportItem = {
  fullName: string;
  action: 'created' | 'appended' | 'modified';
};

type BatchState = {
  cfg: BatchConfig;
  mode: Mode;
  running: boolean;
  progress: {
    total: number;
    done: number;
    errors: number;
  };
  jobs: BatchJob[];

  // FSA handles
  inputDir?: FsaDirHandle;
  outputDir?: FsaDirHandle;

  // seleção fallback (sem FSA)
  selectedFiles: File[];

  // vetor JSON e relatório
  vector: BatchJson;
  outputsReport: OutputReportItem[];

  // actions (config/mode)
  setPartialCfg: (p: Partial<BatchConfig>) => void;
  setMode: (m: Mode) => void;

  // seleção FSA/ZIP
  chooseInputDir: () => Promise<void>;           // escolhe pasta e já gera JSON
  chooseOutputDir: () => Promise<void>;
  chooseFilesFallback: (files: FileList | File[]) => void; // ao escolher, já gera JSON (ZIP)
  clearFilesFallback: () => void;
  reset: () => void;

  // JSON: carregar/salvar/editar
  loadVectorFromJsonFile: () => Promise<void>;   // abre “Open File” para .json
  setVectorFromJsonText: (text: string) => void; // editor → vetor
  saveVectorJson: () => Promise<void>;           // “Salvar como…” ou download

  // Botão “Gerar/Atualizar JSON…”
  handleGenerateButton: () => Promise<void>;

  // Execução
  runFsa: () => Promise<void>;
  runZipFallback: () => Promise<void>;
  runFromVector: () => Promise<void>;

  // internos (não exportar na UI)
  _generateVectorFromSelectedFiles: () => Promise<void>;
  _generateVectorFromFsaDir: (dir?: FsaDirHandle) => Promise<void>;
};

function defaultCfg(): BatchConfig {
  return {
    concurrency: ENV.BATCH.CONCURRENCY ?? 2,
    overwrite: ENV.BATCH.OVERWRITE ?? false, // mantido, mas 1º write sempre trunca
    failOnError: ENV.BATCH.FAIL_ON_ERROR ?? false,
    abortAfterErrors: 10,
    outputSuffix: '.out.txt',
    maxFileSizeMB: 10,
  };
}

async function pool<T>(items: T[], worker: (item: T, idx: number) => Promise<void>, concurrency: number) {
  const queue = [...items];
  let active = 0;
  let i = 0;
  return new Promise<void>((resolve, reject) => {
    const next = () => {
      if (queue.length === 0 && active === 0) return resolve();
      while (active < concurrency && queue.length > 0) {
        const item = queue.shift()!;
        const idx = i++;
        active++;
        worker(item, idx).then(() => {
          active--; next();
        }).catch((e) => {
          active--; reject(e);
        });
      }
    };
    next();
  });
}

export const useBatch = create<BatchState>()(
  immer((set, get) => ({
    cfg: defaultCfg(),
    mode: fsa.supported() ? 'fsa' : 'zip',
    running: false,
    progress: { total: 0, done: 0, errors: 0 },
    jobs: [],
    inputDir: undefined,
    outputDir: undefined,
    selectedFiles: [],

    vector: [],
    outputsReport: [],

    setPartialCfg: (p) => set((s) => { s.cfg = { ...s.cfg, ...p }; }),
    setMode: (m) => set((s) => { s.mode = m; }),

    // ===== Seleção FSA (gera JSON automaticamente após escolher a pasta)
    chooseInputDir: async () => {
      const handle = await fsa.pickInputDir();
      set((s) => { s.inputDir = handle; });
      await get()._generateVectorFromFsaDir(handle); // auto-gerar JSON
    },

    chooseOutputDir: async () => {
      const handle = await fsa.pickOutputDir();
      set((s) => { s.outputDir = handle; });
    },

    // ===== Seleção de arquivos (ZIP) — já gera JSON ao selecionar
    chooseFilesFallback: (files) => {
      const arr = Array.from(files);
      set((s) => { s.selectedFiles = arr; });
      // dispara geração de JSON (assíncrono) — não aguarda aqui para não travar UI
      get()._generateVectorFromSelectedFiles().catch(() => {/* silencioso: user pode cancelar depois */});
    },

    clearFilesFallback: () => set((s) => { s.selectedFiles = []; }),

    reset: () => set((s) => {
      s.running = false;
      s.progress = { total: 0, done: 0, errors: 0 };
      s.jobs = [];
      s.vector = [];
      s.outputsReport = [];
    }),

    // ===== Carregar JSON salvo (abre “Open File”)
    loadVectorFromJsonFile: async () => {
      const file = await pickUserJsonFile();
      if (!file) return; // cancelado
      const text = await readFileAsText(file);
      const vec = parseVectorJson(text);
      set((st) => { st.vector = vec; });
    },

    // ===== Editor JSON → vetor
    setVectorFromJsonText: (text: string) => {
      const vec = parseVectorJson(text);
      set((st) => { st.vector = vec; });
    },

    // ===== Salvar JSON — “Salvar como…” (FSA) ou download (fallback)
    saveVectorJson: async () => {
      const s = get();
      const jsonText = JSON.stringify(s.vector ?? [], null, 2);
      const defaultName = '.batch.json';

      try {
        if ('showSaveFilePicker' in window) {
          const picker = await (window as any).showSaveFilePicker({
            suggestedName: defaultName,
            types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
            excludeAcceptAllOption: false,
          });
          const writable = await picker.createWritable();
          await writable.write(new Blob([jsonText], { type: 'application/json' }));
          await writable.close();
          return;
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return; // usuário cancelou
        // cai no fallback
      }

      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },

    // ===== Botão “Gerar/Atualizar JSON a partir da seleção”
    // ZIP (com arquivos) => gera JSON; caso contrário => abre arquivo .json salvo
    handleGenerateButton: async () => {
      const s = get();
      if (s.mode === 'zip' && s.selectedFiles.length > 0) {
        await get()._generateVectorFromSelectedFiles();
        return;
      }
      await get().loadVectorFromJsonFile();
    },

    // ===== Execução (atalhos p/ compatibilidade)
    runFsa: async () => {
      // vetor já é gerado ao escolher inputDir
      await get().runFromVector();
    },

    runZipFallback: async () => {
      // vetor já é gerado ao selecionar arquivos
      await get().runFromVector();
    },

    // ===== Execução unificada a partir do vetor JSON =====
    runFromVector: async () => {
      const s = get();
      const cfg = s.cfg;

      const settings = useSettings.getState();
      const apiKey = settings.readApiKeyEffective();
      if (!apiKey) throw new Error('API key ausente.');
      const baseUrl = settings.cfg.openai.base_url ?? 'https://api.openai.com';
      const model   = settings.cfg.openai.model_default;

      const { systemPrompt, userTemplate } = usePrompts.getState();
      if (!userTemplate?.trim()) throw new Error('User Template vazio. Defina em Prompts.');

      const vector = s.vector;
      if (!vector || vector.length === 0) throw new Error('Vetor JSON vazio. Gere/importe antes de executar.');

      // preparar jobs
      const jobs: BatchJob[] = vector.map((it, idx) => ({
        id: nanoid(),
        inputName: it.inputName ?? `item-${idx}`,
        outputName: (it.outputName && it.outputName.trim())
          ? it.outputName.trim()
          : `auto-${idx}${cfg.outputSuffix}`,
        status: 'pending',
        attempts: 0,
      }));

      set((st) => {
        st.running = true;
        st.jobs = jobs;
        st.progress = { total: jobs.length, done: 0, errors: 0 };
        st.outputsReport = [];
      });

      // ZIP: acumulamos os textos finais já com append
      const zipOutputs: Record<string, string> = {};
      // FSA: manter o último conteúdo escrito nesta sessão (evita reler disco toda hora)
      const fsaSessionWrites: Record<string, string> = {};
      // Serialização por arquivo para manter ordem (append)
      const chains = new Map<string, Promise<void>>();

      let errorCount = 0;
      let aborted = false;

      const updateJob = (idx: number, patch: Partial<BatchJob>) => {
        set((st) => { st.jobs[idx] = { ...st.jobs[idx], ...patch }; });
      };
      const incDone = () => set((st) => { st.progress.done += 1; });
      const incErrors = () => set((st) => { st.progress.errors += 1; });
      const checkAbort = () => {
        incErrors();
        if (cfg.failOnError && errorCount >= cfg.abortAfterErrors) aborted = true;
      };

      const worker = async (_: BatchVectorItem, idx: number) => {
        const job = get().jobs[idx];
        const item = vector[idx];
        updateJob(idx, { status: 'processing' });

        try {
          const text = item.content ?? '';
          updateJob(idx, { bytesIn: text.length });

          // placeholders do content
          const ph = usePlaceholders.getState();
          const values = await ph.valuesFromText(text);

          // renderiza template
          const userMsg = renderTemplate(userTemplate, values, { keepUnresolved: true });

          // contexto (sem histórico)
          const ctx = compileContext({
            systemPrompt,
            messages: [],
            useHistory: false,
            userTemplate: userMsg,
            injectUserFromTemplate: true,
          });

          // chamada ao modelo
          const reply = await openaiChat(
            { apiKey, baseUrl, model, temperature: 0.2, maxTokens: 2000 },
            ctx
          );

          if (s.mode === 'zip') {
            if (zipOutputs[job.outputName] == null) {
              zipOutputs[job.outputName] = reply;
              pushReportZip(job.outputName, 'created');
            } else {
              zipOutputs[job.outputName] += reply;
              pushReportZip(job.outputName, 'appended');
            }
          } else {
            if (!s.outputDir) throw new Error('Selecione o diretório de saída (FSA).');
            const key = job.outputName;
            const prev = chains.get(key) ?? Promise.resolve();
            const next = prev.then(async () => {
              if (fsaSessionWrites[key] == null) {
                // primeira escrita: cria/trunca (mesmo se já existir)
                await writeFsaCreateTruncate(s.outputDir!, key, reply);
                fsaSessionWrites[key] = reply;
                pushReportFsa(key, 'created');
              } else {
                // append: concatena ao que já foi escrito nesta sessão
                const newContent = fsaSessionWrites[key] + reply;
                await writeFsaCreateTruncate(s.outputDir!, key, newContent);
                fsaSessionWrites[key] = newContent;
                pushReportFsa(key, 'appended');
              }
            });
            chains.set(key, next);
            await next;
          }

          updateJob(idx, { status: 'done', attempts: job.attempts + 1, bytesOut: reply.length });
          incDone();
        } catch (e: any) {
          updateJob(idx, { status: 'error', attempts: (get().jobs[idx].attempts ?? 0) + 1, error: String(e?.message ?? e) });
          errorCount++;
          checkAbort();
        }
      };

      const pushReportFsa = (relPath: string, action: OutputReportItem['action']) => {
        set((st) => { st.outputsReport.push({ fullName: `[saida]/${relPath}`, action })} );
      };
      const pushReportZip = (relPath: string, action: OutputReportItem['action']) => {
        set((st) => { st.outputsReport.push({ fullName: `zip://${relPath}`, action })} );
      };

      try {
        await pool(vector, async (it, idx) => {
          if (aborted) return;
          await worker(it, idx);
        }, cfg.concurrency);

        if (aborted) throw new Error(`Abortado após ${errorCount} erros (limite: ${cfg.abortAfterErrors}).`);

        // ZIP: baixa resultados (já com appends consolidados)
        if (get().mode === 'zip') {
          const zipBytes = buildZipFromTextMap(zipOutputs);
          downloadZip(zipBytes, 'batch_results.zip');
        }
      } finally {
        set((st) => { st.running = false; });
      }
    },

    // ===== internos =====
    _generateVectorFromSelectedFiles: async () => {
      const s = get();
      const cfg = s.cfg;
      if (s.selectedFiles.length === 0) return;

      const vec: BatchJson = [];
      for (const f of s.selectedFiles) {
        const sizeMB = f.size / (1024 * 1024);
        if (sizeMB > cfg.maxFileSizeMB) continue;
        const text = await readFileAsText(f);
        vec.push({
          content: text,
          inputName: f.name,
          outputName: f.name + cfg.outputSuffix,
        });
      }
      set((st) => { st.vector = vec; });
    },

    _generateVectorFromFsaDir: async (dir?: FsaDirHandle) => {
      const s = get();
      const cfg = s.cfg;
      const handle = dir ?? s.inputDir;
      if (!handle) throw new Error('Selecione o diretório de entrada.');

      const files = await fsa.listFiles(handle);
      const vec: BatchJson = [];
      for (const x of files) {
        const f = x.file;
        const sizeMB = f.size / (1024 * 1024);
        if (sizeMB > cfg.maxFileSizeMB) continue;
        const text = await readFileAsText(f);
        vec.push({
          content: text,
          inputName: x.name,
          outputName: x.name + cfg.outputSuffix,
        });
      }
      set((st) => { st.vector = vec; });
    },
  }))
) as any;

// ===== Helpers =====

// salva (trunca/cria) — usamos para 1º write e para sobrescrever com concat após "append"
async function writeFsaCreateTruncate(outDir: FsaDirHandle, relPath: string, content: string) {
  // O adapter expõe writeText(dir, name, text, overwrite). Com overwrite=true, trunca/cria.
  // Caso seu adapter tenha outra assinatura, ajuste aqui.
  await fsa.writeText(outDir, relPath, content, true);
}

function parseVectorJson(text: string): BatchJson {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('O JSON raiz deve ser um array.');
  for (const [i, it] of parsed.entries()) {
    if (!it || typeof it !== 'object') throw new Error(`Item #${i} inválido.`);
    const any = it as any;
    if (typeof any.content !== 'string') throw new Error(`Item #${i} precisa de 'content' string.`);
    if (any.inputName && typeof any.inputName !== 'string') throw new Error(`Item #${i} 'inputName' deve ser string.`);
    if (any.outputName && typeof any.outputName !== 'string') throw new Error(`Item #${i} 'outputName' deve ser string.`);
  }
  return parsed as BatchJson;
}

// Abre um file picker para JSON (FSA se disponível; fallback input[type=file])
async function pickUserJsonFile(): Promise<File | null> {
  try {
    if ('showOpenFilePicker' in window) {
      const [h] = await (window as any).showOpenFilePicker({
        multiple: false,
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        excludeAcceptAllOption: false,
      });
      return await h.getFile();
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') return null; // cancelado
    // segue para fallback
  }

  return await new Promise<File | null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

// TS não sabe do método interno; aqui extendemos o tipo
declare module 'zustand' {
  // nada
}
