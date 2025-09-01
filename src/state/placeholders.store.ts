// src/state/placeholders.store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Placeholder, RegexFlag, TestResult } from '../types/placeholders';
import { flagsToString } from '../lib/regex/flags';

type ValuesMap = Record<string, string>;

function getWorker(): Worker {
  if (!(window as any).__regexWorker) {
    (window as any).__regexWorker = new Worker(
      new URL('../workers/regex.worker.ts', import.meta.url),
      { type: 'module' }
    );
  }
  return (window as any).__regexWorker as Worker;
}

function buildValuesMap(placeholders: Placeholder[], resultsByName: Record<string, TestResult>): ValuesMap {
  const map: ValuesMap = {};
  for (const p of placeholders) {
    const r = resultsByName[p.name];
    if (!r) { map[p.name] = p.default ?? ''; continue; }
    switch (r.status) {
      case 'matched_non_empty': map[p.name] = r.value; break;
      case 'matched_empty':     map[p.name] = ''; break;
      case 'no_match':
      case 'invalid_regex':
      case 'group_not_found':   map[p.name] = p.default ?? ''; break;
    }
  }
  return map;
}

type PHState = {
  placeholders: Placeholder[];
  exampleText: string;
  results: Record<string, TestResult>;

  // CRUD
  syncFromTemplate: (names: string[], removeOrphans?: boolean) => void;
  upsert: (name: string, patch: Partial<Placeholder>) => void;
  setRegex: (name: string, regex: string) => void;
  setFlags: (name: string, flags: RegexFlag[]) => void;
  setDefault: (name: string, def?: string) => void;
  setGroup: (name: string, group?: number | string) => void;
  remove: (name: string) => void;

  // Testes (UI)
  setExampleText: (t: string) => void;
  runTestOne: (name: string) => Promise<TestResult | undefined>;
  runTestAll: () => Promise<TestResult[]>;
  clearResults: () => void;

  // Avaliação em um texto arbitrário (para Chat/Batch)
  evalOnText: (text: string) => Promise<Record<string, TestResult>>;
  valuesFromText: (text: string) => Promise<ValuesMap>;

  // Map baseado no último run da UI
  valuesMap: () => ValuesMap;
};

export const usePlaceholders = create<PHState>()(
  immer((set, get) => ({
    placeholders: [],
    exampleText: '',
    results: {},

    syncFromTemplate: (names, removeOrphans = false) =>
      set((s) => {
        const index = new Map(s.placeholders.map((p) => [p.name, p]));
        for (const n of names) {
          if (!index.has(n)) {
            s.placeholders.push({ name: n, regex: '', flags: [], default: '', group: 0 });
          }
        }
        if (removeOrphans) {
          s.placeholders = s.placeholders.filter((p) => names.includes(p.name));
        }
      }),

    upsert: (name, patch) =>
      set((s) => {
        const i = s.placeholders.findIndex((p) => p.name === name);
        if (i >= 0) s.placeholders[i] = { ...s.placeholders[i], ...patch, name };
        else s.placeholders.push({ name, regex: '', flags: [], default: '', group: 0, ...patch });
      }),

    setRegex: (name, regex) =>
      set((s) => {
        const p = s.placeholders.find((x) => x.name === name);
        if (p) p.regex = regex;
      }),

    setFlags: (name, flags) =>
      set((s) => {
        const p = s.placeholders.find((x) => x.name === name);
        if (p) p.flags = flags;
      }),

    setDefault: (name, def) =>
      set((s) => {
        const p = s.placeholders.find((x) => x.name === name);
        if (p) p.default = def ?? '';
      }),

    setGroup: (name, group) =>
      set((s) => {
        const p = s.placeholders.find((x) => x.name === name);
        if (!p) return;
        if (group === '' as any) p.group = undefined;
        else if (typeof group === 'string' && /^\d+$/.test(group)) p.group = parseInt(group, 10);
        else p.group = group;
      }),

    remove: (name) =>
      set((s) => {
        s.placeholders = s.placeholders.filter((p) => p.name !== name);
        delete s.results[name];
      }),

    setExampleText: (t) => set((s) => void (s.exampleText = t)),

    runTestOne: async (name) => {
      const s = get();
      const p = s.placeholders.find((x) => x.name === name);
      if (!p) return;
      const worker = getWorker();
      const res = await new Promise<TestResult[]>((resolve) => {
        const onMsg = (e: MessageEvent<TestResult[]>) => {
          worker.removeEventListener('message', onMsg as any);
          resolve(e.data);
        };
        worker.addEventListener('message', onMsg as any);
        worker.postMessage({
          text: s.exampleText,
          jobs: [{
            name: p.name,
            regex: p.regex,
            flags: flagsToString(p.flags),
            default: p.default,
            group: p.group,
          }],
        });
      });
      const r = res[0];
      set((st) => void (st.results[r.name] = r));
      return r;
    },

    runTestAll: async () => {
      const s = get();
      const worker = getWorker();
      const res = await new Promise<TestResult[]>((resolve) => {
        const onMsg = (e: MessageEvent<TestResult[]>) => {
          worker.removeEventListener('message', onMsg as any);
          resolve(e.data);
        };
        worker.addEventListener('message', onMsg as any);
        worker.postMessage({
          text: s.exampleText,
          jobs: s.placeholders.map((p) => ({
            name: p.name,
            regex: p.regex,
            flags: flagsToString(p.flags),
            default: p.default,
            group: p.group,
          })),
        });
      });
      set((st) => {
        for (const r of res) st.results[r.name] = r;
      });
      return res;
    },

    clearResults: () => set((s) => void (s.results = {})),

    // ===== NOVO: avaliação em um texto arbitrário =====
    evalOnText: async (text: string) => {
      const s = get();
      const worker = getWorker();
      const res = await new Promise<TestResult[]>((resolve) => {
        const onMsg = (e: MessageEvent<TestResult[]>) => {
          worker.removeEventListener('message', onMsg as any);
          resolve(e.data);
        };
        worker.addEventListener('message', onMsg as any);
        worker.postMessage({
          text,
          jobs: s.placeholders.map((p) => ({
            name: p.name,
            regex: p.regex,
            flags: flagsToString(p.flags),
            default: p.default,
            group: p.group,
          })),
        });
      });
      const byName: Record<string, TestResult> = {};
      for (const r of res) byName[r.name] = r;
      return byName;
    },

    valuesFromText: async (text: string) => {
      const s = get();
      const resultsByName = await get().evalOnText(text);
      return buildValuesMap(s.placeholders, resultsByName);
    },

    // Map baseado no último run da UI (exemplo)
    valuesMap: () => {
      const s = get();
      return buildValuesMap(s.placeholders, s.results);
    },
  }))
);
