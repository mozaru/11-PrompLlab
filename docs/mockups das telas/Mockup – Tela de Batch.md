# Mockup – Tela de Batch (11 PromptLab)

---

## Estrutura Geral
- **Header**
  - Logo: **11 PromptLab**
  - Botão voltar ao **Chat**

- **Área principal (card centralizado)**
  - Título: **Execução em Lote (Batch)**
  - Texto explicativo:  
    > “Selecione arquivos ou diretórios de entrada e configure a saída.  
    > O Prompt será aplicado a cada arquivo usando as Regex & Defaults configuradas.”

---

## Layout da Tela

### 📂 Seleção de Entrada
- Opção 1 (quando FSA disponível):  
  - Botão **Selecionar Diretório de Entrada**
- Opção 2 (fallback universal):  
  - Botão **Selecionar Arquivos** (upload múltiplo)
- Campo de status: “3 arquivos selecionados” ou “Diretório: `/docs/input/`”

### 📁 Seleção de Saída
- Opção 1 (FSA):  
  - Botão **Selecionar Diretório de Saída**
- Opção 2 (fallback):  
  - Saída será gerada em **ZIP** para download
- Campo de status: “Diretório: `/docs/output/`” ou “Saída: ZIP download”

### ⚙️ Configurações de Execução
- **Concorrência**: campo numérico (default 2)  
- **Sobrescrever arquivos existentes**: checkbox  
- **Fail on error**: checkbox (parar no primeiro erro)  
- **Dry-run**: checkbox (executa regex + template sem chamar IA)

### ▶️ Execução
- Botão **Iniciar Batch** (primário, cor de acento)
- Botão **Cancelar** (secundário, cinza) → disponível apenas durante execução

---

## 📊 Área de Progresso
- Barra de progresso geral (0–100%) em cor de acento  
- Lista de arquivos processados:
  - Nome do arquivo  
  - Status: ✔ Sucesso / ❌ Erro / ⏳ Processando  
  - Link para abrir resultado (quando sucesso) ou `.error.txt` (quando falha)

---

## Footer
- Botão **Exportar Log (ZIP)** (secundário)  
- Botão **Fechar** (volta para Chat)

---

## Estados Visuais

- **Durante execução**
  - Progresso animado, cada arquivo atualizado em tempo real
  - Botão Cancelar ativo
- **Erro em arquivo**
  - Linha em vermelho `#F44336`, link para `.error.txt`
- **Sucesso**
  - Linha em verde `#4CAF50`, link para output
- **Dry-run**
  - Mensagem amarela no topo: “Execução em Dry-run – Nenhuma chamada à IA foi feita”

---

## Exemplo Visual (ASCII)

```

┌─────────────────────────────────────────────────────────┐
│ 11 PromptLab                          ⬅️ Voltar         │
│─────────────────────────────────────────────────────────│
│ Execução em Lote (Batch)                                │
│ Selecione arquivos ou diretórios para processar.        │
│                                                         │
│ 📂 Entrada:   \[ Selecionar Arquivos ] (3 arquivos)     │
│ 📁 Saída:     \[ Selecionar Diretório ] (/docs/output)  │
│                                                         │
│ ⚙️ Configurações                                        │
│ Concorrência: \[ 2 ]                                    │
│ \[✔] Sobrescrever arquivos existentes                   │
│ \[ ] Fail on error                                      │
│ \[ ] Dry-run (regex+template sem IA)                    │
│                                                         │
│ \[ Cancelar ]                        \[ Iniciar Batch ] │
│                                                         │
│ 📊 Progresso: \[██████------] 60%                       │
│ ─────────────────────────────────────────────────────── │
│ doc1.txt   ✔ Sucesso   \[Abrir resultado]               │
│ doc2.txt   ❌ Erro      \[Ver erro.txt]                 │
│ doc3.txt   ⏳ Processando...                            │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ \[ Exportar Log (ZIP) ]                 \[ Fechar ]     │
└─────────────────────────────────────────────────────────┘

```

---

## UX Chave da Tela de Batch
- **Clareza de input/output**: usuário sempre sabe de onde vêm os arquivos e para onde vão.  
- **Dry-run**: evita sustos, permite testar placeholders antes de gastar tokens.  
- **Transparência no progresso**: lista de arquivos deixa claro sucesso/erro em cada item.  
- **Fallback automático**: se não houver FSA → tudo funciona via ZIP.  
