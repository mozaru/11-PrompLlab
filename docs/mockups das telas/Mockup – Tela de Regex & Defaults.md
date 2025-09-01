# Mockup – Tela de Regex & Defaults (11 PromptLab)

---

## Estrutura Geral
- **Header**
  - Logo: **11 PromptLab**
  - Ícone para voltar ao **Chat**

- **Área principal**
  - Título: **Placeholders e Regex**
  - Texto explicativo:  
    > “Cada variável do User Prompt pode ser preenchida com dados extraídos de arquivos de entrada usando regex.  
    > Se não houver correspondência, será usado o valor default.”

---

## Layout da Tela

### 📝 Tabela de Placeholders
- Cabeçalho:
  - Variável | Regex | Flags | Default | Testar
- Linhas (uma por placeholder definido no User Prompt Template):
  - **Variável**: `{{nome}}`
  - **Regex**: input de texto (`#1E1E1E`, borda `#2C2C2C`)
  - **Flags**: checkboxes ( `i` ignorecase, `m` multiline, `s` dotall)
  - **Default**: input de texto
  - **Botão Testar**: secundário (grafite, texto claro)

### 📄 Área de Teste
- Caixa de texto grande (textarea) para colar o **conteúdo de um arquivo de exemplo**
- Fundo `#1E1E1E`, borda `#2C2C2C`, fonte monoespaçada (JetBrains Mono)

### 🔍 Resultados de Teste
- Ao clicar em **Testar**:
  - Popup com título: “Resultado da Regex – {{variavel}}”
  - Mostra:
    - Status: “match encontrado”, “match vazio” ou “sem match → default usado”
    - Valor capturado (scroll se for longo)
- Botão de fechar (✖)

---

## Footer
- Botão **Salvar Configurações** (primário, cor de acento)
- Botão **Resetar Regex** (secundário, grafite)

---

## Estados Visuais

- **Regex inválida**
  - Mensagem em vermelho abaixo do campo: “Expressão inválida”
- **Default em uso**
  - Mensagem amarela (`#FFC107`) no popup: “Sem match → default aplicado”
- **Match vazio**
  - Valor exibido entre aspas vazias `""` (status = matched_empty)

---

## Exemplo Visual (ASCII)

```

┌──────────────────────────────────────────────────────┐
│ 11 PromptLab                        ⬅️ Voltar       │
│──────────────────────────────────────────────────────│
│ Placeholders e Regex                                  │
│ Cada variável do User Prompt pode usar regex.         │
│ Se não houver match → valor default.                  │
│                                                      │
│ Variável   | Regex         | Flags | Default | Testar │
│------------|---------------|-------|---------|--------│
│ {{nome}}   | ^Nome:(.*)\$   | \[i]   | Anônimo | \[▶]    │
│ {{email}}  | ^Email:(.*)\$  | \[i,m] | vazio   | \[▶]    │
│ {{texto}}  | (?s).\*        | \[s]   | ""      | \[▶]    │
│                                                      │
│ Arquivo de Exemplo:                                   │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Nome: João da Silva                              │ │
│ │ Email: [joao@email.com](mailto:joao@email.com)                            │ │
│ │ Texto: Lorem ipsum dolor sit amet...             │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ \[ Resetar Regex ]                     \[ Salvar ]     │
└──────────────────────────────────────────────────────┘

```

---

## UX Chave da Tela de Regex
- **Tabela clara**: cada variável tem sua linha → fácil mapear.  
- **Área de teste**: permite validar regexes antes do batch.  
- **Popup de resultado**: mostra retorno sem cortar, mesmo para textos longos.  
- **Feedback imediato**: regex inválida, default em uso, match vazio.  
