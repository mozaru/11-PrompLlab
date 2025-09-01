# 11-PromptLab

**11-PromptLab** é um sistema de chat textual com IA projetado para permitir **configuração avançada de prompts**, **gestão de histórico**, **processamento em batch de arquivos** e **controle total sobre parâmetros da LLM** (ChatGPT/OpenAI).  

O foco é **flexibilidade**, **controle total do contexto** e **execução 100% local**, onde **a única comunicação externa é com a API da OpenAI**.  
O software é distribuído de forma gratuita para uso, mas o código-fonte é proprietário, de autoria de **Mozar Baptista da Silva e 11tech**.

---

## 📖 Motivação

A maioria das ferramentas de chat com IA abstraem ou escondem parâmetros importantes como system prompt, granularidade do histórico ou placeholders dinâmicos.  
Este projeto nasceu para:

- Permitir ao usuário **definir com precisão o comportamento da IA** (system prompt, user prompt com placeholders, parâmetros de geração).  
- Possibilitar **processamento em lote** de arquivos (batch), com substituição automática de variáveis via regex.  
- Oferecer **transparência total**: preview do contexto final antes do envio para a IA.  
- Garantir **independência de servidores externos**: toda lógica roda localmente, exceto a chamada para a API da OpenAI.  
- Facilitar a **exportação/importação** de projetos em JSON, para reprodutibilidade e portabilidade.  

---

## ✨ Funcionalidades

### Chat Textual
- Interface de chat simples e direta.  
- **System Prompt** configurável (definições de estilo e comportamento).  
- **User Prompt Template** com placeholders dinâmicos.  
- Histórico:
  - Ativar/desativar globalmente.  
  - Incluir/excluir mensagens específicas.  
  - Preview do contexto final.  
- Parâmetros de IA:
  - temperature, top_p, max_tokens, penalties, seed, response_format.  
  - configuráveis via tela ou system prompt.

### Placeholders com Regex
- Cada variável no user prompt (`{{variavel}}`) é associada a uma regex.  
- Valor do placeholder = **match completo da regex** (pode ser vazio).  
- Se não houver match → usar valor **default**.  
- Interface dedicada para:
  - Criar e editar placeholders.  
  - Inserir regex, defaults e flags.  
  - Testar com um **texto de exemplo**.  
  - Ver resultado em popup (inclusive textos grandes).

### Batch Processing
- **Entrada/Saída**:
  - Com File System Access API (quando disponível): escolher diretórios de entrada e saída.  
  - Fallback universal: selecionar múltiplos arquivos e gerar saída em **ZIP** para download.  
- Para cada arquivo:
  - Extrair placeholders via regex.  
  - Renderizar user prompt.  
  - Montar contexto final (system + histórico habilitado + entrada atual).  
  - Executar chamada à OpenAI.  
  - Salvar resultado em arquivo de saída (ou ZIP).  
- Retentativas automáticas: até **10 tentativas** com backoff exponencial + jitter.  
- Em caso de falha:
  - Desktop/FSA: `.error.txt` ao lado do arquivo.  
  - ZIP: arquivos de erro incluídos no pacote.  

### Configurações
- **Configuração Global** (armazenada localmente):
  - Chave da API (com opção de não salvar, apenas em memória).  
  - Modelo default (ex.: `gpt-4o-mini`).  
  - BaseURL (para compatibilidade futura).  
  - Locale: pt-BR.  
- **Projeto (.json)**:
  - Título do projeto.  
  - System prompt.  
  - User prompt template.  
  - Placeholders e regexes.  
  - Histórico e overrides.  
  - Parâmetros de IA.  
  - Configurações de batch.  
- Exportação e importação de projetos em JSON.

---

## 🏗 Arquitetura

- **Frontend:** React + TypeScript + Vite.  
- **Empacotamento Desktop:** Tauri (binários pequenos, leves).  
- **Distribuição Web/PWA:** build única reaproveitada.  
- **Armazenamento local:**  
  - Config Global → `localStorage`.  
  - Projetos → exportar/importar `.json`.  
- **FS (arquivos):**  
  - Preferência: File System Access API.  
  - Fallback: Upload de múltiplos arquivos e download de ZIP.  
- **Execução paralela:** Web Workers para regex e batch (não travam UI).  
- **LLM:** chamadas diretas à API da OpenAI via `fetch`.  
- **Sem banco, sem servidor**: toda lógica no cliente.  

---

## 🚀 Instalação & Uso

### Requisitos
- Node.js (>=18)  
- pnpm ou npm  
- Rust (>=1.70) para build Tauri (desktop)  

### Clonar e instalar
```bash
git clone https://github.com/11tech/ia-chat-configurator.git
cd ia-chat-configurator
pnpm install
````

### Desenvolvimento (web)

```bash
pnpm dev
```

### Desenvolvimento (desktop - Tauri)

```bash
pnpm tauri dev
```

### Build produção (desktop)

```bash
pnpm tauri build
```

### Build produção (web/PWA)

```bash
pnpm build
```

---

## 🔐 Segurança

* **Apenas a API da OpenAI** é acessada via internet.
* Nenhum dado é enviado para terceiros.
* Configurações e projetos ficam 100% no dispositivo do usuário.
* API Key:

  * Pode ser salva em `localStorage` (com risco consciente).
  * Ou utilizada apenas em memória.
* No desktop, Tauri pode integrar com secure storage do SO (opcional).

---

## 📌 Escopo Atual

* Chat textual com prompts configuráveis.
* Regex placeholders com testes.
* Batch com FSA/ZIP fallback.
* Configuração global e por projeto.
* Exportação/importação de JSON.
* Retentativas automáticas no batch.
* Nenhum suporte a voz, logs ou telemetria.

---

## 🛣️ Roadmap Futuro

* Melhorias de UX:

  * Atalhos de teclado (System, User, Batch, etc).
  * Preview expandido do contexto final.
* Funções opcionais:

  * Sumarização manual do histórico.
  * Cancelamento de batch em andamento.
  * Retomada parcial (executar apenas falhas).
* Internacionalização (i18n).
* Modo multi-projeto e abertura de recentes.
* Extensões/plugins (RAG, ferramentas externas).

---

## 🤝 Contribuições

* O código-fonte é **proprietário**.
* Sugestões de melhorias podem ser enviadas diretamente para [mozar.silva@gmail.com](mailto:mozar.silva@gmail.com).
* O uso do software é gratuito, conforme a [Licença de Uso](LICENSE).

---

## 📜 Licença

Este projeto é licenciado sob a **Licença de Uso Proprietária da 11tech**, de autoria de **Mozar Baptista da Silva e 11tech**.
O software pode ser usado livremente, mas o **código-fonte não é aberto**.

Consulte o arquivo [LICENSE](LICENSE) para detalhes.

---
