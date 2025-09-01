# Mockup – Tela de Chat (11 PromptLab)

---

## Estrutura Geral
- **Header (topo fixo)**
  - Logo pequeno: **11 PromptLab**
  - Botões rápidos:  
    - ⚙️ Configurações globais  
    - 📑 Prompts (System/User)  
    - 🕘 Histórico  
    - 🔎 Regex & Defaults  
    - 📂 Batch  

- **Área central (scroll)**
  - Lista de mensagens (estilo chat bubbles):
    - **Usuário**:
      - Card grafite escuro `#1E1E1E`
      - Borda em **cor de acento** (azul ciano ou verde-água)
      - Texto primário claro `#E0E0E0`
      - Timestamp (pequeno, `#A0A0A0`)
    - **IA**:
      - Card mais escuro `#181818`
      - Borda cinza `#2C2C2C`
      - Texto claro
      - Pode conter **trechos de código** → renderizados em fonte monoespaçada (JetBrains Mono), fundo levemente diferente (`#202020`)

- **Footer (fixo na base)**
  - Caixa de input:
    - Textarea expansível (`#1E1E1E`, borda `#2C2C2C`)
    - Placeholder em cinza médio (`#A0A0A0`)
    - Foco: borda **acento** + leve brilho
  - Botão **Enviar** (cor de acento, texto branco, altura 40px)
  - Botão de **Preview do Contexto** (secundário, grafite, texto claro)

---

## Estados Visuais

- **Carregando resposta da IA**
  - Mostra um "skeleton loader" dentro do balão da IA
  - Pontos animados "digitando..." em `#A0A0A0`

- **Erro na chamada da IA**
  - Mensagem dentro do balão da IA com fundo `#1E1E1E` e texto vermelho `#F44336`
  - Snackbar no canto inferior direito: “Erro ao contatar a API da OpenAI (tentativa 3/10)”

- **Histórico desligado**
  - Banner discreto no topo da lista: “Histórico desativado – apenas mensagem atual será enviada” (texto `#FFC107`)

---

## Exemplo Visual (ASCII)

```

┌───────────────────────────────────────────────────────┐
│ 11 PromptLab               ⚙️  Prompts  🕘 Histórico │
│-------------------------------------------------------│
│ Usuário (10:15)                                       │
│ ┌───────────────────────────────────────────────────┐ │
│ │ Como você resumiria esse texto?                   │ │
│ └───────────────────────────────────────────────────┘ │
│                                                       │
│ IA  (10:15)                                           │
│ ┌───────────────────────────────────────────────────┐ │
│ │ Aqui está um resumo em 3 pontos principais:       │ │
│ │ 1. ...                                            │ │
│ │ 2. ...                                            │ │
│ │ 3. ...                                            │ │
│ └───────────────────────────────────────────────────┘ │
│                                                       │
│ Usuário (10:16)                                       │
│ ┌───────────────────────────────────────────────────┐ │
│ │ Agora gere um título criativo.                    │ │
│ └───────────────────────────────────────────────────┘ │
│                                                       │
│ IA (10:16)                                            │
│ ┌───────────────────────────────────────────────────┐ │
│ │ "O Futuro em Poucas Palavras"                     │ │
│ └───────────────────────────────────────────────────┘ │
│                                                       │
│ \[ Preview Contexto ] \[                  ] \[Enviar] │
└───────────────────────────────────────────────────────┘

```

---

## UX Chave da Tela de Chat
- **Simples, minimalista**: sem poluição visual.  
- **Foco no conteúdo**: mensagens centralizadas, fundo escuro, contraste claro.  
- **Preview antes de enviar**: reforça transparência → usuário vê o *contexto completo* que vai para a IA.  
- **Feedback de estado**: digitando..., erro, histórico ligado/desligado.  
