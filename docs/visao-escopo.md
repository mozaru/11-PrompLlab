# Visão e Escopo do Projeto  
**11-PromptLab**  

---

## 1. Visão Geral

O **11-PromptLab** é uma aplicação que permite a **configuração avançada de interações com modelos de linguagem (LLMs)**, como o ChatGPT (OpenAI), oferecendo ao usuário controle total sobre:

- **Prompts do sistema (System Prompt)**  
- **Prompts do usuário (User Prompt)** com placeholders dinâmicos  
- **Histórico de conversas** (inclusão/exclusão seletiva)  
- **Parâmetros da LLM** (temperature, max tokens, seed, response format etc.)  
- **Execução em lote (Batch)** de arquivos, com extração de variáveis via regex  

A proposta central é oferecer **flexibilidade**, **transparência** e **qualidade** no uso de IAs, rodando **100% localmente** (somente a comunicação com a API da OpenAI sai do dispositivo).

---

## 2. Objetivos do Projeto

### 2.1 Objetivo Principal
Fornecer uma ferramenta que permita a **configuração detalhada de conversas com IA**, de forma **simples**, **reprodutível** e **controlada**, com suporte a **execução em lote**.

### 2.2 Objetivos Específicos
- Permitir a criação de **projetos configuráveis** exportáveis em JSON.  
- Oferecer **interface gráfica amigável** para edição de prompts, placeholders e parâmetros.  
- Prover um **mecanismo de batch** robusto, incluindo fallback universal via **upload/download ZIP**.  
- Garantir que a aplicação seja **independente de servidores** ou bancos externos, rodando apenas no ambiente do usuário.  
- Apoiar fluxos de trabalho de quem precisa de **respostas consistentes e documentadas** de IAs.  

---

## 3. Escopo Funcional

### 3.1 Funcionalidades Essenciais
- **Chat Textual**
  - System Prompt configurável.  
  - User Prompt com placeholders dinâmicos.  
  - Histórico de mensagens ativável/desativável globalmente ou por mensagem.  
  - Preview do contexto final antes da execução.  

- **Gestão de Placeholders**
  - Associação de variáveis a regex.  
  - Valores default quando não houver match.  
  - Teste interativo de regex com texto de exemplo.  
  - Exibição de resultados completos, inclusive textos extensos.  

- **Batch Processing**
  - Seleção de diretórios (quando suportado) ou múltiplos arquivos.  
  - Geração de saída em arquivos separados ou em ZIP.  
  - Retentativas automáticas (até 10) com backoff exponencial.  
  - Geração de `.error.txt` para falhas.  

- **Configurações**
  - **Globais:** chave da API, modelo default, locale, baseURL.  
  - **Por Projeto:** título, prompts, placeholders, parâmetros, histórico, batch.  
  - Exportação/importação em JSON.  

### 3.2 Funcionalidades Futuras (não no escopo inicial)
- Internacionalização (i18n).  
- Cancelamento e retomada de batch.  
- Sumarização automática ou assistida do histórico.  
- Multi-projeto e lista de recentes.  
- Plugins ou integrações externas.  

---

## 4. Escopo Não Funcional

- **Execução Local:** toda a lógica roda no dispositivo; apenas chamadas à API da OpenAI saem pela internet.  
- **Segurança:**  
  - Chave da API pode ser armazenada em `localStorage` ou apenas em memória.  
  - Nenhum dado é enviado a terceiros.  
- **Portabilidade:**  
  - Um único código para Tauri (desktop) e Web/PWA.  
  - Fallback consistente para ambientes sem FSA (ZIP).  
- **Usabilidade:**  
  - Interface simples, baseada em modais.  
  - Previews claros e testes antes da execução.  
- **Performance:**  
  - Performance não é prioridade.  
  - Qualidade da resposta da IA prevalece sobre velocidade.  
- **Confiabilidade:**  
  - Retentativas automáticas no batch.  
  - Tratamento explícito de erros (arquivos `.error.txt`).  

---

## 5. Público-Alvo

- **Pesquisadores e desenvolvedores** que precisam experimentar diferentes prompts.  
- **Empresas** que desejam processar documentos em lote com regras claras.  
- **Instrutores/consultores** que criam material de treinamento usando LLMs.  
- **Usuários avançados** que querem controle total sobre as interações com IA.  

---

## 6. Restrições

- Código-fonte **proprietário**; apenas o uso do software é livre.  
- Sem suporte a voz (apenas chat textual).  
- Sem persistência em banco de dados.  
- Sem servidor backend; todo processamento é local.  
- Sem telemetria ou coleta de dados de uso.  
- Sem logs globais de execução (apenas `.error.txt` por arquivo).  

---

## 7. Riscos

- **Dependência da OpenAI**: mudanças na API podem impactar o funcionamento.  
- **Manuseio de arquivos grandes**: no browser, lotes muito grandes podem exigir memória alta.  
- **Exposição da API Key no navegador**: ainda que opcional salvar, há risco se o usuário armazenar em `localStorage`.  
- **Regex complexas**: podem travar processamento; mitigado rodando em Web Worker.  
- **Limitações de FSA em Safari/iOS**: mitigadas via fallback de ZIP.  

---

## 8. Roadmap de Entregas

1. **MVP (versão inicial)**  
   - Chat textual.  
   - Configuração de system/user prompt.  
   - Placeholders com regex e default.  
   - Exportação/importação de projetos em JSON.  
   - Batch básico com upload de arquivos + ZIP.  

2. **Versão Desktop (Tauri)**  
   - Acesso a diretórios via FSA.  
   - Armazenamento seguro de API key no SO.  
   - Batch com input/output direto em pastas.  

3. **Versão Web/PWA**  
   - Manifest e service worker (instalável).  
   - Fallback consistente via ZIP.  
   - Suporte offline para abrir projetos.  

4. **Iterações Futuras**  
   - Melhorias de UX (atalhos, previews avançados).  
   - Cancelamento/retomada de batch.  
   - Suporte a multi-projetos.  
   - Plugins opcionais.  

---

## 9. Conclusão

O **11-PromptLab** tem como diferencial:  
- **Controle total** do contexto de interação com IA.  
- **Execução local** sem dependência de infraestrutura de terceiros.  
- **Transparência** no processo de geração (preview do contexto, placeholders claros).  
- **Flexibilidade** para rodar em desktop (Tauri) ou web/PWA com o mesmo código.  

Esse documento estabelece a visão clara do produto e os limites do escopo, servindo como referência tanto para desenvolvimento quanto para alinhamento com usuários e stakeholders.

---
