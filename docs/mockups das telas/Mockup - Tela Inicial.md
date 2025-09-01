# Mockup – Tela de Boas-vindas / Sobre (11 PromptLab)

# Objetivo da tela

* **Onboarding rápido**: explicar o que é o **11 PromptLab**, como funciona em alto nível e o que precisa para começar.
* **Transparência**: licenças, privacidade (execução local) e bibliotecas usadas.
* **Checagens do ambiente**: API key presente? FSA disponível? online/offline?
* **CTA claros**: Configurar API, Criar/Carregar Projeto, Abrir Docs.

# O que deve ter (seções)

1. **Hero / Identidade**

   * Logo “11 PromptLab”
   * Subtítulo curto: “Laboratório de prompts e batch com LLM — execução local; só a OpenAI é chamada.”
   * Botões principais:

     * **Começar agora** → abre **Config Global** (API key)
     * **Criar novo projeto** → abre tela de **Prompts**
     * **Carregar projeto (.json)** → file picker

2. **Resumo do Produto (2–3 bullets)**

   * Chat textual com **System/User Prompt** configuráveis + histórico opcional.
   * **Placeholders via regex** com defaults e testes.
   * **Batch**: diretórios (quando disponível) ou **Arquivos→ZIP** (fallback universal).

3. **Privacidade & Segurança (destacado)**

   * “Tudo roda **localmente**; a **única** comunicação externa é com a **API da OpenAI**.”
   * “Sem telemetria. Sem logs globais. Projeto e configs ficam no seu dispositivo.”
   * Link para **SECURITY.md**.

4. **Licenciamento**

   * “Uso do software é **livre**; o **código-fonte é proprietário** (Mozar + 11tech).”
   * Botão/link “Ler a licença” (abre **LICENSE** em modal).
   * Checkbox **\[ ] Li e concordo com a Licença** (habilita “Começar agora” na 1ª execução).
   * **\[ ] Não mostrar novamente** (grava flag no localStorage).

5. **Bibliotecas utilizadas** (curta e categorizada)

   * **Core**: React, TypeScript, Vite
   * **Desktop**: Tauri
   * **Estado/validação**: Zustand, Zod
   * **Workers/Util**: fflate (ZIP), (opcional) Comlink
   * **Estilo/UI**: (Mantine/Chakra — o que escolher)
   * Observação: “As versões exatas estão em **About** (menu) e `package.json`.”
   * (Opcional) **Ver dependências** → abre modal com a lista gerada de build (um `dependencies.json` embutido)

6. **Checagem do Ambiente (badges)**

   * **API key**: Ausente / Presente
   * **OpenAI**: Online / Offline (um ping leve ou tentativa controlada)
   * **FSA** (File System Access): Disponível / Indisponível (mostra nota “usaremos ZIP”)
   * **PWA**: Instalável / Já instalado (no web)
   * Cada badge com dica: “Clique para solucionar” (leva para Config / Batch)

7. **Acesso rápido à documentação**

   * **Guia de Uso**, **FAQ**, **Visão & Escopo**, **Arquitetura**, **Design Guide**
   * Abrir em modal in-app ou nova aba (no desktop abre webview).

---

## Mockup textual (escuro, preto/grafite)

```
┌────────────────────────────────────────────────────────────────┐
│  11 PromptLab                                                  │
│  Laboratório de prompts e batch com LLM — execução local.      │
│                                                                │
│  [ Começar agora ]  [ Criar novo projeto ]  [ Carregar .json ] │
│                                                                │
│  • Chat textual com System/User Prompt e histórico opcional    │
│  • Placeholders via regex com defaults e testes                │
│  • Batch: diretórios (FSA) ou Arquivos→ZIP (fallback)          │
│                                                                │
│  Privacidade & Segurança                                       │
│  Tudo roda localmente; só chamamos a API da OpenAI.            │
│  Sem telemetria. Sem logs globais.                             │
│  ( Ler SECURITY )                                              │
│                                                                │
│  Licença                                                       │
│  Uso livre; código proprietário (Mozar + 11tech).              │
│  ( Ler LICENSE )                                               │
│  [ ] Li e concordo com a Licença   [ ] Não mostrar novamente   │
│                                                                │
│  Bibliotecas                                                   │
│  React • TypeScript • Vite • Tauri • Zustand • Zod • fflate    │
│  ( Ver dependências )                                          │
│                                                                │
│  Checagem do ambiente                                          │
│  [API key: AUSENTE]  [OpenAI: OFFLINE]  [FSA: INDISPONÍVEL]    │
│  Dica: configure a chave da OpenAI para começar.               │
│                                                                │
│  Documentação: [ Guia de Uso ] [ FAQ ] [ Visão & Escopo ]      │
│                 [ Arquitetura ] [ Design Guide ]               │
└────────────────────────────────────────────────────────────────┘
```

---

## Comportamentos recomendados

* **Primeira execução**: exigir “Concordo com a Licença” para habilitar os CTAs.
* **Flag “Não mostrar novamente”**: guarda `welcomeDismissed=true` no localStorage.
* **Exibir novamente**: link “Sobre” no menu (abre esta tela como modal “About”).
* **Badges clicáveis**:

  * API key ausente → abre **Config**.
  * FSA indisponível → abre **Batch** já no modo Arquivos→ZIP com um “por quê?”.
  * Offline → exibe dicas (ver conexão, proxy, firewall).
* **A11y**: foco por teclado, contraste AA, links óbvios.

---
