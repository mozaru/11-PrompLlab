# Mockup – Tela de Histórico (11 PromptLab)

---

## Estrutura Geral
- **Header**
  - Logo: **11 PromptLab**
  - Botão voltar ao **Chat**

- **Área principal**
  - Título: **Histórico da Conversa**
  - Texto explicativo:  
    > “Gerencie o histórico de mensagens desta sessão.  
    > Você pode habilitar/desabilitar o histórico globalmente ou escolher mensagens específicas.”

---

## Layout da Tela

### 🔄 Controle Global
- Switch (toggle) → **Usar histórico nesta conversa**  
  - Ativado = todas as mensagens entram no contexto (salvo se desmarcadas manualmente)  
  - Desativado = nenhuma mensagem é enviada, só o prompt atual

### 📜 Lista de Mensagens
- Apresentadas em ordem cronológica, estilo tabela ou lista
- Cada linha contém:
  - Checkbox (incluir/excluir do contexto)  
  - Papel: **Usuário** / **IA** / **System**  
  - Preview da mensagem (primeiras 100–150 chars)  
  - Timestamp pequeno (14px, cinza médio)  
  - Botão “Ver Detalhes” (abre popup com mensagem completa)

### 🔍 Popup Detalhes
- Exibe conteúdo completo da mensagem em card grafite
- Botão “Excluir do Histórico” (se for mensagem de usuário/IA)
- Botão “Fechar”

---

## Footer
- Botão **Salvar Alterações** (primário, cor de acento)  
- Botão **Limpar Histórico** (secundário, vermelho `#F44336`)  
- Botão **Fechar**  

---

## Estados Visuais

- **Histórico global desativado**
  - Banner discreto no topo (amarelo `#FFC107`):  
    > “Histórico desativado – apenas a mensagem atual será enviada.”  

- **Nenhuma mensagem no histórico**
  - Texto central: “Ainda não há mensagens nesta sessão.”  

- **Mensagem excluída**
  - Linha riscada em cinza, sumirá após salvar alterações  

---

## Exemplo Visual (ASCII)

```

┌──────────────────────────────────────────────────────────┐
│ 11 PromptLab                           ⬅️ Voltar         │
│──────────────────────────────────────────────────────────│
│ Histórico da Conversa                                    │
│ Gerencie quais mensagens entram no contexto.             │
│                                                          │
│ Usar histórico nesta conversa: \[✔]                      │
│                                                          │
│ \[✔] Usuário (10:15) - "Como você resumiria esse texto?" │
│ \[✔] IA      (10:15) - "Aqui está um resumo em 3 pontos…"│
│ \[ ] Usuário (10:16) - "Agora gere um título criativo."  │
│ \[✔] IA      (10:16) - "O Futuro em Poucas Palavras"     │
│                                                          │
│ \[ Ver Detalhes ]                                        │
│                                                          │
│ \[ Limpar Histórico ]  \[ Salvar Alterações ] \[Fechar]  │
└──────────────────────────────────────────────────────────┘

```

---

## UX Chave da Tela de Histórico
- **Transparência total**: usuário vê exatamente o que entra no contexto.  
- **Controle granular**: pode excluir mensagens específicas sem apagar o histórico inteiro.  
- **Segurança**: botão “Limpar Histórico” destacado em vermelho, para evitar cliques acidentais.  
- **Feedback imediato**: banner deixa claro quando o histórico global está desativado.  

