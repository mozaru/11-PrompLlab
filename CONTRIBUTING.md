# Guia de Contribuição  
**11-PromptLab**

Este documento orienta os colaboradores internos (Mozar + equipe 11tech) sobre como contribuir com o desenvolvimento do projeto.

---

## 📦 Configuração de Ambiente

### Requisitos
- Node.js >= 18
- pnpm (ou npm, mas pnpm é preferido)
- Rust >= 1.70 (para build Tauri)
- Git

### Passos iniciais
```bash
git clone <repo-url>
cd ia-chat-configurator
pnpm install
````

### Rodar em modo desenvolvimento

* **Web/PWA:**

  ```bash
  pnpm dev
  ```
* **Desktop (Tauri):**

  ```bash
  pnpm tauri dev
  ```

---

## 🧩 Estrutura de Código

```
/src
  /adapters        -> abstrações (FS, KeyStore, ModelClient, ConfigStore, BatchRunner)
  /workers         -> Web Workers (regex, batch)
  /features        -> funcionalidades principais (chat, batch, prompts, regex, settings)
  /components      -> UI genérica/reutilizável
  /lib             -> utilitários (encoding, backoff, zip, etc.)
  main.tsx         -> entrada React
/src-tauri         -> config mínima Tauri
/docs              -> documentação (visão, escopo, arquitetura, etc.)
```

---

## 🎨 Padrões de Código

* **Linguagem:** TypeScript (strict mode).
* **Framework:** React (com hooks).
* **Estado global:** Zustand.
* **Validação:** Zod (para configs e schemas JSON).
* **Estilo:**

  * Use Prettier (config no repo).
  * ESLint ativo (sem warnings na pipeline).
* **Componentes:** sempre funcionais; sem classes.

---

## 🌿 Fluxo de Branches

* `main`: branch estável, sempre rodável.
* `develop`: branch de integração (merge das features antes de irem para `main`).
* `feature/<nome>`: desenvolvimento de funcionalidades isoladas.
* `fix/<nome>`: correções específicas.
* `docs/<nome>`: ajustes de documentação.

---

## ✅ Commits

* Seguir [Conventional Commits](https://www.conventionalcommits.org/).
* Exemplos:

  * `feat(chat): adicionar suporte a seed no user prompt`
  * `fix(batch): corrigir erro ao gerar arquivos ZIP`
  * `docs(arquitetura): atualizar diagrama de fluxos`

---

## 🔄 Pull Requests

* Abrir PR da branch `feature/*` ou `fix/*` para `develop`.
* Revisão por pelo menos **1 membro da equipe** antes do merge.
* Requisitos do PR:

  * Build sem erros (`pnpm build`).
  * Lint sem warnings (`pnpm lint`).
  * Descrição clara do que foi alterado.
  * Atualizar docs caso necessário.

---

## 🧪 Testes

* Testes unitários simples para utils (`/lib`).
* Testes de integração para parsing de projeto JSON.
* Workers testados em isolamento (regex/batch).
* Scripts:

  ```bash
  pnpm test
  pnpm test:watch
  ```

---

## 📖 Documentação

* Todos os documentos ficam em `/docs`:

  * `visao-e-escopo.md`
  * `arquitetura.md`
  * outros relevantes.
* Cada nova funcionalidade relevante deve ser documentada no **README.md** ou em um doc separado.

---

## 🔐 Política de Segurança

* Nenhuma dependência deve enviar dados a terceiros (sem analytics, sem telemetria).
* CSP restrito apenas a `https://api.openai.com`.
* Nenhum dado sensível (API key, histórico, projetos) deve ser enviado para fora da máquina.
* API key deve sempre ter opção de **não salvar** (uso só em memória).

---

## 📌 Checklist antes do merge

* [ ] Código compila sem erros.
* [ ] Lint/Prettier aplicados.
* [ ] Testes relevantes rodando.
* [ ] Documentação atualizada.
* [ ] Revisão aprovada.

---

## ⚠️ Observações Importantes

* Este repositório é **privado**.
* O software é de **uso livre**, mas o **código é proprietário** da 11tech.
* Não é permitido compartilhar trechos do código fora da equipe sem autorização expressa.

---


