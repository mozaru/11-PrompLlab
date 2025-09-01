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

  // actions
  setPartialCfg: (p: Partial<BatchConfig>) => void;
  setMode: (m: Mode) => void;
  chooseInputDir: () => Promise<void>;
  chooseOutputDir: () => Promise<void>;
  chooseFilesFallback: (files: FileList | File[]) => void;
  clearFilesFallback: () => void;
  reset: () => void;

  runFsa: () => Promise<void>;
  runZipFallback: () => Promise<void>;
};

function defaultCfg(): BatchConfig {
  return {
    concurrency: ENV.BATCH.CONCURRENCY ?? 2,
    overwrite: ENV.BATCH.OVERWRITE ?? false,
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

    setPartialCfg: (p) => set((s) => { s.cfg = { ...s.cfg, ...p }; }),
    setMode: (m) => set((s) => { s.mode = m; }),

    chooseInputDir: async () => {
      const handle = await fsa.pickInputDir();
      set((s) => { s.inputDir = handle; });
    },

    chooseOutputDir: async () => {
      const handle = await fsa.pickOutputDir();
      set((s) => { s.outputDir = handle; });
    },

    chooseFilesFallback: (files) => {
      const arr = Array.from(files);
      set((s) => { s.selectedFiles = arr; });
    },

    clearFilesFallback: () => set((s) => { s.selectedFiles = []; }),

    reset: () => set((s) => {
      s.running = false;
      s.progress = { total: 0, done: 0, errors: 0 };
      s.jobs = [];
    }),

    runFsa: async () => {
      const state = get();
      if (!state.inputDir || !state.outputDir) throw new Error('Selecione diretórios de entrada e saída.');
      const files = await fsa.listFiles(state.inputDir);
      await get()._runGeneric(files.map(x => ({ name: x.name, file: x.file })), 'fsa');
    },

    runZipFallback: async () => {
      const state = get();
      if (state.selectedFiles.length === 0) throw new Error('Selecione arquivos de entrada.');
      await get()._runGeneric(state.selectedFiles.map(f => ({ name: f.name, file: f })), 'zip');
    },

    // ===== função interna: execução genérica =====
    _runGeneric: async (items: { name: string; file: File }[], mode: Mode) => {
      const s = get();
      const cfg = s.cfg;
      const settings = useSettings.getState();
      const apiKey = settings.readApiKeyEffective();
      if (!apiKey) throw new Error('API key ausente.');
      const baseUrl = settings.cfg.openai.base_url ?? 'https://api.openai.com';
      const model   = settings.cfg.openai.model_default;

      const { systemPrompt, userTemplate } = usePrompts.getState();
      if (!userTemplate?.trim()) throw new Error('User Template vazio. Defina em Prompts.');

      // preparar jobs
      const jobs: BatchJob[] = items.map((it) => ({
        id: nanoid(),
        inputName: it.name,
        outputName: it.name + cfg.outputSuffix,
        status: 'pending',
        attempts: 0,
      }));

      set((st) => {
        st.mode = mode;
        st.running = true;
        st.jobs = jobs;
        st.progress = { total: jobs.length, done: 0, errors: 0 };
      });

      const outputs: Record<string, string> = {};
      let errorCount = 0;
      let aborted = false;

      const worker = async (it: { name: string; file: File }, idx: number) => {
        const job = get().jobs[idx];

        const fileSizeMB = it.file.size / (1024 * 1024);
        if (fileSizeMB > cfg.maxFileSizeMB) {
          updateJob(idx, { status: 'error', attempts: 1, error: `Arquivo grande (${fileSizeMB.toFixed(1)} MB) > limite ${cfg.maxFileSizeMB} MB` });
          errorCount++;
          checkAbort();
          return;
        }

        updateJob(idx, { status: 'processing' });

        try {
          const text = await readFileAsText(it.file);
          updateJob(idx, { bytesIn: it.file.size });

          // extrai valores do arquivo
          const ph = usePlaceholders.getState();
          const values = await ph.valuesFromText(text);

          // renderiza template
          const userMsg = renderTemplate(userTemplate, values, { keepUnresolved: true });

          // monta contexto (sem histórico de chat)
          const ctx = compileContext({
            systemPrompt,
            messages: [], // sem histórico
            useHistory: false,
            userTemplate: userMsg,
            injectUserFromTemplate: true,
          });

          // chama OpenAI (com backoff interno)
          const reply = await openaiChat(
            { apiKey, baseUrl, model, temperature: 0.2, maxTokens: 2000 },
            ctx
          );

          if (mode === 'fsa') {
            await fsa.writeText(get().outputDir!, job.outputName, reply, cfg.overwrite);
          } else {
            outputs[job.outputName] = reply;
          }

          updateJob(idx, { status: 'done', attempts: job.attempts + 1, bytesOut: reply.length });
          incDone();
        } catch (e: any) {
          updateJob(idx, { status: 'error', attempts: job.attempts + 1, error: String(e?.message ?? e) });
          errorCount++;
          checkAbort();
        }
      };

      const updateJob = (idx: number, patch: Partial<BatchJob>) => {
        set((st) => { st.jobs[idx] = { ...st.jobs[idx], ...patch }; });
      };
      const incDone = () => set((st) => { st.progress.done += 1; });
      const incErrors = () => set((st) => { st.progress.errors += 1; });

      const checkAbort = () => {
        incErrors();
        if (cfg.failOnError && errorCount >= cfg.abortAfterErrors) {
          aborted = true;
        }
      };

      try {
        await pool(items, async (it, idx) => {
          if (aborted) return;
          await worker(it, idx);
        }, cfg.concurrency);

        if (aborted) throw new Error(`Abortado após ${errorCount} erros (limite: ${cfg.abortAfterErrors}).`);

        // se ZIP
        if (mode === 'zip') {
          const zipBytes = buildZipFromTextMap(outputs);
          downloadZip(zipBytes, 'batch_results.zip');
        }
      } finally {
        set((st) => { st.running = false; });
      }
    },
  }))
) as any;

// TS não sabe do método interno; aqui extendemos o tipo
declare module 'zustand' {
  // nada
}
