// src/lib/env.ts
export const ENV = {
  APP_NAME: import.meta.env.VITE_APP_NAME ?? '11 PromptLab',
  OPENAI_BASE_URL: import.meta.env.VITE_OPENAI_BASE_URL ?? 'https://api.openai.com',
  MODEL_DEFAULT: import.meta.env.VITE_MODEL_DEFAULT ?? 'gpt-4o-mini',
  LOCALE: import.meta.env.VITE_LOCALE ?? 'pt-BR',
  RETRIES: Number(import.meta.env.VITE_DEFAULT_RETRIES ?? 10),

  // Opcional: só para DEV. Em produção, prefira pedir a chave pela UI.
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY as string | undefined,

  // Batch defaults
  BATCH: {
    CONCURRENCY: Number(import.meta.env.VITE_BATCH_DEFAULT_CONCURRENCY ?? 2),
    OVERWRITE: (import.meta.env.VITE_BATCH_DEFAULT_OVERWRITE ?? 'false') === 'true',
    FAIL_ON_ERROR: (import.meta.env.VITE_BATCH_DEFAULT_FAIL_ON_ERROR ?? 'false') === 'true',
  },
};
