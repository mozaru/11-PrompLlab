// src/lib/capabilities.ts
import { ENV } from './env';

// chaves padronizadas de storage (podemos reaproveitar em outras telas)
export const STORAGE_KEYS = {
  apiKey: '11promptlab_api_key',
  welcomeDismissed: '11promptlab_welcome_dismissed',
} as const;

// detecção de capacidades do ambiente
export const caps = {
  hasFsa: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
};

// utilitários para lidar com a API key local (sem obrigar a salvar)
export function getApiKeyFromLocalStorage(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const v = localStorage.getItem(STORAGE_KEYS.apiKey);
    return v && v.trim().length > 0 ? v : null;
  } catch {
    return null;
  }
}

export function saveApiKeyToLocalStorage(key: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.apiKey, key);
}

export function clearApiKeyFromLocalStorage(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.apiKey);
}

// status consolidado (env + localStorage)
export function getApiKeyStatus(): 'present' | 'absent' {
  const fromLocal = getApiKeyFromLocalStorage();
  const fromEnv = ENV.OPENAI_API_KEY; // pode vir undefined; só para DEV
  return (fromLocal && fromLocal.length > 0) || (fromEnv && fromEnv.length > 0)
    ? 'present'
    : 'absent';
}
