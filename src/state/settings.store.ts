import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ENV } from '../lib/env';
import { getJson, setJson, getString, setString, remove } from '../lib/storage';
import type { GlobalConfig, ApiKeyStrategy } from '../types/config-global';

// chaves de storage
const GLOBAL_CFG_KEY = '11promptlab_global_cfg_v1';
const API_KEY_STORAGE = '11promptlab_api_key';

// config padrão (usa ENV)
const defaultCfg: GlobalConfig = {
  version: '1.0',
  openai: {
    api_key_strategy: 'memory',
    base_url: ENV.OPENAI_BASE_URL,
    model_default: ENV.MODEL_DEFAULT,
  },
  locale: (ENV.LOCALE as 'pt-BR' | 'en-US') ?? 'pt-BR',
  retries: ENV.RETRIES ?? 10,
};

type SettingsState = {
  cfg: GlobalConfig;
  // ações
  setPartial: (p: Partial<GlobalConfig>) => void;
  setApiKeyStrategy: (s: ApiKeyStrategy) => void;
  setApiKey: (k: string | undefined) => void;
  resetDefaults: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  // helpers
  readApiKeyEffective: () => string | undefined;
};

export const useSettings = create<SettingsState>()(
  immer((set, get) => ({
    cfg: defaultCfg,

    setPartial: (p) =>
      set((state) => {
        // merge raso; se quiser granular por seções, ajuste aqui
        state.cfg = { ...state.cfg, ...p };
      }),

    setApiKeyStrategy: (strategy) =>
      set((state) => {
        state.cfg.openai.api_key_strategy = strategy;
        if (strategy === 'memory') {
          // apagar storage e remover do estado
          remove(API_KEY_STORAGE);
          delete state.cfg.openai.api_key;
        } else {
          // se já houver api_key no estado, persistir
          const k = state.cfg.openai.api_key;
          if (k && k.length) setString(API_KEY_STORAGE, k);
        }
      }),

    setApiKey: (k) =>
      set((state) => {
        const strategy = state.cfg.openai.api_key_strategy;
        if (strategy === 'local') {
          if (k && k.length) {
            state.cfg.openai.api_key = k;
            setString(API_KEY_STORAGE, k);
          } else {
            delete state.cfg.openai.api_key;
            remove(API_KEY_STORAGE);
          }
        } else {
          // memory: manter apenas durante a sessão
          if (k && k.length) state.cfg.openai.api_key = k;
          else delete state.cfg.openai.api_key;
        }
      }),

    resetDefaults: () =>
      set((state) => {
        state.cfg = { ...defaultCfg };
      }),

    loadFromStorage: () => {
      const persisted = getJson<GlobalConfig>(GLOBAL_CFG_KEY);
      const apiKeyLocal = getString(API_KEY_STORAGE);
      set((state) => {
        const base = persisted ?? defaultCfg;
        state.cfg = { ...base };
        if (state.cfg.openai.api_key_strategy === 'local' && apiKeyLocal) {
          state.cfg.openai.api_key = apiKeyLocal;
        } else {
          delete state.cfg.openai.api_key;
        }
      });
    },

    saveToStorage: () => {
      const s = get().cfg;
      const toSave: GlobalConfig = JSON.parse(JSON.stringify(s));
      if (toSave.openai.api_key_strategy === 'memory') {
        delete toSave.openai.api_key;
      } else {
        if (toSave.openai.api_key && toSave.openai.api_key.length) {
          setString(API_KEY_STORAGE, toSave.openai.api_key);
        } else {
          remove(API_KEY_STORAGE);
        }
      }
      setJson(GLOBAL_CFG_KEY, toSave);
    },

    readApiKeyEffective: () => {
      const s = get().cfg;
      if (s.openai.api_key && s.openai.api_key.length) return s.openai.api_key;
      const fromStorage = getString(API_KEY_STORAGE);
      if (fromStorage) return fromStorage;
      return ENV.OPENAI_API_KEY; // dev-only fallback
    },
  }))
);
