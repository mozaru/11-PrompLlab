# Mockup – Tela de Prompts (11 PromptLab)

---

## Estrutura Geral
- **Header**
  - Logo: **11 PromptLab**
  - Botão voltar ao **Chat**

- **Área principal (dois cards empilhados)**

### 📌 System Prompt
- Card grafite `#1E1E1E`
- Título: **System Prompt**
- Textarea grande, fonte monoespaçada (JetBrains Mono), fundo escuro `#181818`
- Texto explicativo:  
  > “Define o comportamento da IA em todas as respostas.  
  > Exemplo: *Você é um assistente técnico que explica de forma objetiva*.”

### 👤 User Prompt Template
- Card grafite `#1E1E1E`
- Título: **User Prompt Template**
- Textarea grande, fonte monoespaçada
- Placeholder: `Escreva aqui seu template...`
- Texto explicativo:  
  > “Você pode usar placeholders com `{{variavel}}`,  
  > que serão preenchidos automaticamente com regex.”  
- Botão secundário: **Gerenciar Placeholders** → abre tela de Regex & Defaults  

---

## Footer
- Botão **Salvar** (primário, cor de acento, texto branco)  
- Botão **Restaurar Padrão** (secundário, grafite, texto claro)  

---

## Estados Visuais
- **Placeholder detectado mas sem regex configurada**  
  - Alerta amarelo no User Prompt Template:  
    > “Placeholder `{{email}}` não configurado. Defina-o na tela de Regex & Defaults.”  
- **System Prompt vazio**  
  - Mensagem em vermelho: “O System Prompt não pode estar vazio.”  

---

## Exemplo Visual (ASCII)

```

┌─────────────────────────────────────────────────────────┐
│ 11 PromptLab                           ⬅️ Voltar        │
│─────────────────────────────────────────────────────────│
│ 📌 System Prompt                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Você é um assistente técnico que explica de forma   │ │
│ │ objetiva e clara, sem rodeios.                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 👤 User Prompt Template                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Resuma o texto abaixo em 3 pontos:                  │ │
│ │ {{texto}}                                           │ │
│ └─────────────────────────────────────────────────────┘ │
│ ⚠ Placeholder {{texto}} não possui regex configurada.   │
│                                                         │
│ \[ Gerenciar Placeholders ]                             │
│                                                         │
│ \[ Restaurar Padrão ]                   \[ Salvar ]     │
└─────────────────────────────────────────────────────────┘

```

---

## UX Chave da Tela de Prompts
- **Separação clara**: System Prompt (regras globais) vs User Prompt Template (entrada dinâmica).  
- **Placeholders explícitos**: alertas ajudam o usuário a não esquecer regex.  
- **Integração com Regex & Defaults**: fluxo natural de edição.  
- **Feedback direto**: erros ou avisos aparecem logo abaixo dos campos.  
