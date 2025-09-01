# Arquitetura do Projeto  
**11-PromptLab**

---

## 1. Visão de Arquitetura

O projeto segue uma arquitetura **frontend-first** em **React + TypeScript + Vite**, com empacotamento via **Tauri** para desktop e build como **PWA** para web.  

Toda a lógica de negócio roda no **frontend**.  
A única chamada externa permitida é para a **API da OpenAI**.  

> Decisão chave: **um único código** para todos os targets.  
> - No desktop (Tauri), aproveita File System Access API (quando disponível) ou diretórios via APIs do SO.  
> - No web/PWA, usa FSA e, quando indisponível, fallback para **upload/download em ZIP**.  

---

## 2. Estrutura de Pastas

```

app/
├─ public/
│  ├─ manifest.json
│  └─ icons/
│     ├─ icon-192.png
│     └─ icon-512.png
├─ src/
│  ├─ main.tsx                     # bootstrap React
│  ├─ app.css
│  ├─ router.tsx                   # (opcional) rotas das telas
│  ├─ types/                       # tipos globais;
│  │  ├─ config-global.d.ts
│  │  ├─ project-json.d.ts
│  │  ├─ placeholders.d.ts
│  │  └─ model-client.d.ts
│  ├─ adapters/                    # abstrações com implementações "web-first"
│  │  ├─ filesystem/
│  │  │  ├─ index.ts               # exporta IFileSystem + factory por capability
│  │  │  ├─ fs.fsa.ts              # FSA (showDirectoryPicker)
│  │  │  ├─ fs.zip.ts              # fallback Arquivos→ZIP
│  │  │  └─ fs.utils.ts            # detecção de capabilities
│  │  ├─ keystore/
│  │  │  ├─ index.ts
│  │  │  ├─ keystore.local.ts      # localStorage / memória
│  │  │  └─ keystore.memory.ts
│  │  ├─ model-client/
│  │  │  ├─ index.ts               # IModelClient (fetch OpenAI + retries)
│  │  │  └─ openai.fetch.ts
│  │  └─ config-store/
│  │     ├─ index.ts               # IConfigStore (global em localStorage; projeto via file picker)
│  │     └─ config.local.ts
│  ├─ workers/                     # sempre web workers (inclusive no Tauri)
│  │  ├─ regex.worker.ts           # executa regex em lote/preview
│  │  ├─ batch.worker.ts           # pipeline do batch por arquivo
│  │  └─ worker.types.ts
│  ├─ lib/                         # utilidades transversais
│  │  ├─ encoding/
│  │  │  ├─ detect.ts              # UTF-8 default, fallback latin1
│  │  │  └─ normalize.ts           # normaliza quebras de linha / caracteres não imprimíveis
│  │  ├─ retry/
│  │  │  └─ backoff.ts             # 10 tentativas, exponencial + jitter
│  │  ├─ zip/
│  │  │  └─ zip.ts                 # empacota/gera Blob com fflate
│  │  ├─ schema/
│  │  │  ├─ project.schema.ts      # validação Zod dos JSONs
│  │  │  └─ global.schema.ts
│  │  ├─ context/
│  │  │  └─ compile.ts             # monta contexto final (system + histórico + input atual)
│  │  └─ ui/
│  │     └─ shortcuts.ts           # atalhos de teclado
│  ├─ components/                  # UI reutilizável (botões, dialogs, tabelas)
│  │  ├─ Dialog.tsx
│  │  ├─ TextAreaAuto.tsx
│  │  ├─ KeyField.tsx
│  │  ├─ TableVirtualized.tsx
│  │  └─ FileDrop.tsx
│  └─ features/                    # agrupado por domínio de negócio
│     ├─ chat/
│     │  ├─ pages/
│     │  │  └─ ChatPage.tsx
│     │  ├─ components/
│     │  │  ├─ MessageList.tsx
│     │  │  ├─ MessageInput.tsx
│     │  │  └─ ContextPreview.tsx
│     │  ├─ state/
│     │  │  └─ chat.store.ts       # Zustand
│     │  └─ index.ts
│     ├─ prompts/
│     │  ├─ modals/
│     │  │  ├─ SystemPromptModal.tsx
│     │  │  └─ UserPromptModal.tsx
│     │  ├─ state/
│     │  │  └─ prompts.store.ts
│     │  └─ index.ts
│     ├─ history/
│     │  ├─ modals/
│     │  │  └─ HistoryModal.tsx    # inclui/exclui mensagens do contexto
│     │  ├─ state/
│     │  │  └─ history.store.ts
│     │  └─ index.ts
│     ├─ regex/
│     │  ├─ modals/
│     │  │  └─ RegexDefaultsModal.tsx
│     │  ├─ components/
│     │  │  ├─ RegexRow.tsx
│     │  │  └─ RegexResultsTable.tsx
│     │  ├─ state/
│     │  │  └─ regex.store.ts
│     │  └─ index.ts
│     ├─ batch/
│     │  ├─ modals/
│     │  │  └─ BatchModal.tsx
│     │  ├─ components/
│     │  │  ├─ BatchProgress.tsx
│     │  │  └─ DryRunPanel.tsx
│     │  ├─ state/
│     │  │  └─ batch.store.ts
│     │  └─ index.ts
│     └─ settings/
│        ├─ pages/
│        │  └─ SettingsPage.tsx    # Config Global (API key, modelo, locale)
│        ├─ state/
│        │  └─ settings.store.ts
│        └─ index.ts
└─ src-tauri/                       # Tauri mínimo (não usado pelo core do app)
   ├─ tauri.conf.json
   └─ src/
      └─ main.rs                    # apenas boot; sem lógica de negócio

```

---

## 3. Adapters (abstrações)

Os adapters isolam dependências específicas de ambiente.  
Todos expõem **interfaces estáveis**, e a implementação varia conforme capacidades detectadas (FSA ou ZIP, memória ou localStorage).

### 3.1 IFileSystem
```ts
interface IFileSystem {
  pickInputFiles(): Promise<File[]>;
  pickInputDirectory?(): Promise<FileSystemDirectoryHandle>;
  pickOutputDirectory?(): Promise<FileSystemDirectoryHandle>;
  readText(file: File | FileSystemFileHandle): Promise<string>;
  writeOutputs(
    outputs: { path: string; content: string }[],
    outDir?: FileSystemDirectoryHandle
  ): Promise<Blob | void>;
}
````

* **Desktop/Tauri**: FSA disponível, grava arquivos direto no SO.
* **Web/PWA sem FSA**: Upload múltiplo de arquivos → saída em ZIP (via `fflate`).

### 3.2 IKeyStore

```ts
interface IKeyStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}
```

* **Desktop**: pode usar secure storage via Tauri.
* **Web/PWA**: IndexedDB ou `localStorage`.
* Sempre oferecer opção de **não salvar** (usar só em memória).

### 3.3 IModelClient

```ts
interface IModelClient {
  chat(request: ChatRequest): Promise<ChatResponse>;
  stream?(request: ChatRequest): AsyncIterable<Delta>;
}
```

* Implementado via `fetch` → `api.openai.com/v1/chat/completions`.
* Inclui lógica de **retry/backoff** (até 10 tentativas, exponencial + jitter).

### 3.4 IConfigStore

```ts
interface IConfigStore {
  saveGlobal(config: GlobalConfig): Promise<void>;
  loadGlobal(): Promise<GlobalConfig | null>;
  saveProject(project: ProjectJson): Promise<void>;
  loadProject(file: File): Promise<ProjectJson>;
}
```

* **GlobalConfig**: salvo em `localStorage`.
* **ProjectJson**: export/import manual de `.json`.

### 3.5 IBatchRunner

```ts
interface IBatchRunner {
  run(files: File[], cfg: RunConfig): AsyncGenerator<BatchEvent>;
}
```

* Usa **Web Workers** para não travar UI.
* Para cada arquivo:

  1. Lê conteúdo (encoding detectado).
  2. Extrai placeholders (regex).
  3. Renderiza template.
  4. Monta contexto final.
  5. Chama `IModelClient`.
  6. Emite evento `BatchEvent` com progresso.
* Saídas:

  * Sucesso: arquivo de saída.
  * Falha: arquivo `.error.txt`.

---

## 4. Fluxos Principais

### 4.1 Chat (interação única)

1. Usuário edita prompts e parâmetros via modais.
2. Preview do contexto final.
3. Envia → `IModelClient.chat()` → resposta.
4. Mensagem registrada no histórico (se ativo).

### 4.2 Regex & Defaults

1. Usuário define variáveis (nome, regex, default).
2. Carrega **texto de exemplo**.
3. Testa → Worker executa regex e retorna resultado.
4. Exibe preview do match (completo, mesmo se longo).

### 4.3 Batch

1. Usuário seleciona **arquivos** ou diretório.
2. (Opcional) Executa **Dry-run** (só regex/template).
3. Inicia execução: Worker roda pipeline em cada arquivo.
4. Resultados são gravados em diretório (FSA) ou ZIP.
5. Progresso mostrado na UI (ok/erro).

---

## 5. Decisões Arquiteturais

* **Um único código**: build web = build desktop.
* **Execução isolada**: regex/batch sempre em Workers.
* **Fallbacks claros**:

  * FSA disponível → usar diretórios.
  * Sem FSA → Upload múltiplo + Download ZIP.
* **Sem servidor, sem BD**: tudo no cliente.
* **Sem logs globais**: apenas `.error.txt` em caso de falha.
* **Segurança mínima**:

  * CSP permitindo apenas `https://api.openai.com`.
  * Nenhum outro host externo.
  * API Key opcionalmente persistida.

---

## 6. Riscos Técnicos e Mitigações

* **Regex catastrófica** → roda em Worker, isola UI.
* **Arquivos grandes em batch web** → processar sequencialmente, gerar ZIP incremental.
* **Safari/iOS sem FSA** → fallback automático para ZIP.
* **Exposição da API Key** → opção de não salvar; usuário consciente.
* **Rate limits da OpenAI** → retries com backoff.

---

## 7. Roadmap Técnico

1. Definição dos **tipos de dados** (GlobalConfig, ProjectJson, Placeholder, BatchConfig).
2. Implementação dos **adapters mínimos** (FileSystem, ModelClient, ConfigStore).
3. Infra de **Workers** (regex e batch).
4. Telas principais: Chat, Regex, Batch, Config.
5. Export/Import de projetos JSON.
6. Build Desktop (Tauri) e Web/PWA (manifest, SW).

---

## 8. Conclusão

A arquitetura foi desenhada para ser:

* **Simples** (sem backend, sem banco, sem serviços extras).
* **Portável** (desktop e web com mesmo código).
* **Segura** (somente OpenAI como saída de rede).
* **Robusta** (isolamento em Workers, retries automáticos).

Esse documento serve como guia técnico de alto nível para desenvolvimento e evolução do projeto.

---
