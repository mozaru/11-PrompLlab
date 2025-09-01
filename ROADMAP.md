# Roadmap – 11-PromptLab

Este documento apresenta a visão de evolução do projeto **11-PromptLab**, organizado em etapas e versões previstas.  
O roadmap pode ser ajustado conforme necessidades técnicas e de negócio.

---

## 🎯 Objetivo Geral
Construir uma aplicação **desktop (Tauri)** e **Web/PWA**, para **configuração avançada de prompts** e **processamento em lote de arquivos**, com foco em **execução local** e **apenas a API da OpenAI como dependência externa**.

---

## 🛠 Versão 0.1.x – Fase Inicial (Setup e Documentação)

- [x] Criar repositório e estrutura inicial.  
- [x] Adicionar `.gitignore`, `README.md`, `LICENSE`.  
- [x] Escrever documentação: visão, escopo, arquitetura, contribuição, segurança, código de conduta.  
- [x] Configuração mínima de Tauri + React/TS + Vite.  
- [x] Definir adapters e contratos (FileSystem, KeyStore, ModelClient, ConfigStore, BatchRunner).  

---

## 🚧 Versão 0.2.x – MVP (Funcionalidades básicas)

### Funcionalidades
- [ ] Tela de **Configuração Global** (API key, modelo, locale).  
- [ ] Tela de **Chat textual** com System/User Prompt.  
- [ ] Edição do **Histórico** (ativar/desativar global e por mensagem).  
- [ ] **User Prompt** com placeholders (`{{variavel}}`).  
- [ ] Editor de placeholders com regex, defaults e testes com texto de exemplo.  
- [ ] Exportar e importar **Projeto JSON**.  

### Técnicas
- [ ] Implementar `IModelClient` com retries (10 tentativas, backoff exponencial + jitter).  
- [ ] Estruturar `IConfigStore` com `localStorage` (web) e arquivos JSON (desktop).  
- [ ] Configuração mínima de **Web Workers** para regex (não travar UI).  

---

## 🔄 Versão 0.3.x – Batch Básico

### Funcionalidades
- [ ] Tela/Modal de **Batch**.  
- [ ] Execução em lote com seleção de arquivos (upload múltiplo).  
- [ ] Saída em **ZIP** com resultados e `.error.txt` para falhas.  
- [ ] Dry-run (executa regex + renderização de template sem chamar LLM).  

### Técnicas
- [ ] `IBatchRunner` com execução sequencial/paralela controlada.  
- [ ] Geração de ZIP com `fflate`.  
- [ ] Workers dedicados para batch.  

---

## 💻 Versão 0.4.x – Desktop (Tauri)

### Funcionalidades
- [ ] Suporte a seleção de diretórios (FSA/Tauri).  
- [ ] Escrita direta em arquivos de saída no sistema.  
- [ ] Armazenamento seguro da API key via secure storage do SO (quando suportado).  

### Técnicas
- [ ] Integração mínima com APIs do Tauri (`dialog`, `fs`).  
- [ ] Adaptação de `IFileSystem` para diretórios reais.  
- [ ] CSP restrita a `https://api.openai.com`.  

---

## 🌐 Versão 0.5.x – Web/PWA

### Funcionalidades
- [ ] Manifest e Service Worker (instalável como PWA).  
- [ ] Fallback automático para **ZIP** quando FSA não disponível (Safari/iOS).  
- [ ] Opção “não salvar API key” (uso apenas em memória).  

### Técnicas
- [ ] Build otimizado para web/PWA.  
- [ ] Testes de compatibilidade em navegadores modernos.  
- [ ] Cache básico da interface (Workbox).  

---

## 🚀 Futuro (1.x e além)

- Melhorias de UX:
  - [ ] Atalhos de teclado para abrir modais.  
  - [ ] Preview expandido do contexto final.  
- Batch avançado:
  - [ ] Cancelar execução em andamento.  
  - [ ] Retomar somente arquivos com falha.  
- Multi-projeto:
  - [ ] Lista de projetos recentes.  
  - [ ] Modo multi-janela.  
- Internacionalização (i18n).  
- Extensões/plugins opcionais (ex.: sumarização de histórico, integração com APIs locais).  

---

## 📌 Notas

- O projeto **não terá banco de dados** nem **servidor backend**.  
- **Logs globais** não serão mantidos; apenas `.error.txt` por arquivo em caso de falha.  
- O foco principal é **controle e qualidade** das interações com IA, não performance.  
- Todas as features devem respeitar o princípio de **execução 100% local**.  

---
