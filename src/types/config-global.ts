export type ApiKeyStrategy = 'memory' | 'local';

export type GlobalConfig = {
  version: string;                  // ex.: "1.0"
  openai: {
    api_key_strategy: ApiKeyStrategy;
    api_key?: string;               // presente apenas se strategy = "local"
    base_url?: string;              // default https://api.openai.com
    model_default: string;          // ex.: "gpt-4o-mini"
  };
  locale: 'pt-BR' | 'en-US';
  retries: number;                  // ex.: 10
};
