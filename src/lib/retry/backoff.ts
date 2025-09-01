// src/lib/retry/backoff.ts

export type BackoffOptions = {
  /** Número máximo de tentativas (ex.: 10) */
  retries: number;
  /** Tempo base em ms (ex.: 500) */
  baseMs: number;
  /** Fator exponencial (ex.: 2) */
  factor: number;
  /** Jitter aleatório em ms somado ao backoff (ex.: 250) */
  jitterMs: number;
  /** Teto máximo do atraso entre tentativas (ex.: 30000) */
  maxMs: number;
};

export async function backoff<T>(fn: () => Promise<T>, o: BackoffOptions): Promise<T> {
  let attempt = 0;
  let lastErr: unknown;

  while (attempt <= o.retries) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt === o.retries) break;

      const delay = Math.min(
        o.baseMs * Math.pow(o.factor, attempt) + Math.random() * o.jitterMs,
        o.maxMs
      );
      await sleep(delay);
      attempt++;
    }
  }

  throw lastErr;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
