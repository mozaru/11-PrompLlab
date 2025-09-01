export type BatchJobStatus = 'pending' | 'processing' | 'done' | 'error';

export type BatchJob = {
  id: string;
  inputName: string;
  outputName: string;
  status: BatchJobStatus;
  attempts: number;
  error?: string;
  bytesIn?: number;
  bytesOut?: number;
};

export type BatchConfig = {
  concurrency: number;
  overwrite: boolean;
  failOnError: boolean;
  abortAfterErrors: number; // ex.: 10
  outputSuffix: string;     // ex.: ".out.txt"
  maxFileSizeMB: number;    // segurança básica (ex.: 10)
};
