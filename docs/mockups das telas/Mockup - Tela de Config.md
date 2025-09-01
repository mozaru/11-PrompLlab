# Mockup – Tela de Configuração Global (11 PromptLab)

---

## Estrutura Geral
- **Header (topo fixo)**
  - Logo: **11 PromptLab**
  - Ícone de voltar para o **Chat**

- **Área principal (card centralizado)**
  - Card grafite `#1E1E1E` com padding 24px
  - Título: **Configurações Globais**
  - Texto explicativo:  
    > “Estas configurações afetam todos os projetos.  
    > Você pode exportar/importar projetos separados, mas a chave da API e preferências globais ficam aqui.”

### Seções

#### 🔑 OpenAI API
- Campo: **API Key**
  - Input de texto (`#1E1E1E`, borda `#2C2C2C`, texto claro)
  - Botão de **visibilidade** (👁 mostrar/ocultar)
- Opções de armazenamento:
  - ( ) Não salvar (usar apenas em memória)  
  - ( ) Salvar em localStorage (Web) ou Secure Storage (Desktop)

#### ⚙️ Modelo Padrão
- Dropdown com modelos disponíveis
  - `gpt-4o-mini` (default)  
  - `gpt-4o`  
  - `gpt-3.5-turbo`  
- Campo opcional: **Base URL** (caso use endpoint customizado)

#### 🌎 Preferências
- Locale: dropdown fixo → **pt-BR** (default), en-US (futuro)
- Retries (tentativas): slider ou campo numérico (default = 10)
- Timeouts: **não aplicável** (desabilitado, cinza)

---

## Footer (fixo no card)
- Botão **Salvar Configurações** (primário, cor de acento, texto branco)
- Botão **Restaurar Padrões** (secundário, grafite, texto claro)

---

## Estados Visuais

- **Salvo com sucesso**  
  - Snackbar canto inferior direito: “Configurações atualizadas com sucesso” (cor info `#2196F3`)
- **Erro de validação (API Key vazia e storage=local)**  
  - Mensagem em vermelho abaixo do campo: “Informe uma chave válida ou selecione ‘Não salvar’”
- **API Key oculta**  
  - Campo exibe `************` até clicar em 👁

---

## Exemplo Visual (ASCII)

```

┌───────────────────────────────────────────┐
│ 11 PromptLab                ⬅️ Voltar     │
│───────────────────────────────────────────│
│                                           │
│  Configurações Globais                    │
│  Estas configurações afetam todos os      │
│  projetos e são salvas localmente.        │
│                                           │
│  🔑 OpenAI API                            │
│  API Key: \[ \*\*\*\*\*\*\*\*\*\*\*\*\*\* ] (👁)          │
│  (•) Não salvar (memória)                 │
│  ( ) Salvar em localStorage / SecureStore │
│                                           │
│  ⚙️ Modelo Padrão                         │
│  Modelo: \[ gpt-4o-mini ▼ ]                │
│  Base URL: \[ [https://api.openai.com](https://api.openai.com) ]     │
│                                           │
│  🌎 Preferências                          │
│  Locale: \[ pt-BR ▼ ]                      │
│  Retries: \[ 10 ]                          │
│  Timeouts: (desativado)                   │
│                                           │
│  \[ Restaurar Padrões ]   \[ Salvar ]       │
└───────────────────────────────────────────┘

```

---

## UX Chave da Tela de Config
- **Clareza**: o usuário entende o que é global (API, modelo, idioma).  
- **Segurança**: opção explícita de não salvar a API Key.  
- **Neutralidade visual**: fundo grafite, acento apenas nos botões principais.  
- **Feedback imediato**: snackbar confirma salvamento, mensagens claras em erro.  



