# Guia de Design – 11 PromptLab

Este documento define as diretrizes visuais e de UX para o **11 PromptLab**, garantindo consistência em todas as telas.

---

## 🎨 Paleta de Cores

### Base (dark theme)
- **Fundo principal:** `#121212` (preto quase puro)  
- **Painéis / Cards / Inputs:** `#1E1E1E` (grafite escuro, similar VS Code)  
- **Bordas / Separadores:** `#2C2C2C`  
- **Hover leve:** `#2E2E2E`

### Texto
- **Primário:** `#E0E0E0` (cinza claro, bom contraste sem ser branco puro)  
- **Secundário:** `#A0A0A0` (cinza médio)  
- **Desabilitado:** `#666666`

### Acento (destaques, botões principais)
> usar uma única cor de acento em toda a aplicação para consistência.  
- **Opção A (tecnológico):** Azul ciano → `#00BCD4`  
- **Opção B (experimental/lab):** Verde-água → `#26A69A`  

### Estados
- **Sucesso:** `#4CAF50`  
- **Aviso:** `#FFC107`  
- **Erro:** `#F44336`  
- **Info:** `#2196F3`

---

## ✍️ Tipografia

- **Fonte principal:** [Inter](https://fonts.google.com/specimen/Inter) – legibilidade em interfaces.  
- **Fonte monoespaçada (para regex, JSON, código):** JetBrains Mono ou Fira Code.  
- **Tamanhos base:**
  - Título H1: 24px, peso 600  
  - H2: 20px, peso 500  
  - Texto padrão: 16px, peso 400  
  - Texto pequeno / labels: 14px  

---

## 📐 Espaçamentos e Layout

- **Grid base:** múltiplos de 8px.  
- **Padding padrão:** 16px em containers principais.  
- **Gap entre componentes:** 8px (pequeno), 16px (padrão), 24px (grande).  
- **Cards / caixas:** borda arredondada 6px, sombra suave.  
- **Botões:** altura mínima 40px, padding horizontal 16px.  
- **Modais:** largura 600–800px, padding interno 24px.  

---

## 🧩 Componentes de UI

### Botões
- **Primário:** cor de acento (azul ciano ou verde-água), texto branco.  
- **Secundário:** fundo grafite, borda `#2C2C2C`, texto cinza claro.  
- **Destrutivo:** vermelho (`#F44336`).  
- Hover: clarear 10–15%.  
- Disabled: reduzir opacidade (`0.4`).  

### Inputs
- Fundo grafite (`#1E1E1E`), borda `#2C2C2C`.  
- Texto claro (`#E0E0E0`).  
- Placeholder em cinza médio (`#A0A0A0`).  
- Foco: borda cor de acento + leve brilho.  

### Cards
- Fundo `#1E1E1E`, borda sutil `#2C2C2C`.  
- Sombra leve para destacar em relação ao fundo.  
- Padding 16px.  

### Modais
- Fundo principal `#1E1E1E`.  
- Cabeçalho com título em cinza claro.  
- Botões de ação alinhados à direita.  
- Overlay preto semi-transparente (`rgba(0,0,0,0.6)`).  

### Tabelas (ex.: regex results)
- Cabeçalho em cinza claro, fundo `#1E1E1E`.  
- Linhas alternadas: `#1E1E1E` / `#181818`.  
- Hover: `#2E2E2E`.  

### Chat Bubbles
- **Usuário:** card grafite (`#1E1E1E`), borda acento.  
- **IA:** card `#181818`, borda `#2C2C2C`.  
- Texto: primário claro.  
- Timestamp pequeno (14px) em cinza médio.  

---

## 🔄 Interações e Feedback

- **Feedback de ação (ex.: salvar projeto):** snackbar no canto inferior direito, cor info (`#2196F3`).  
- **Erro (ex.: regex inválida):** mensagem em vermelho, clara e visível, próxima ao campo.  
- **Progresso batch:** barra de progresso em cor de acento; erros listados em tabela/área dedicada.  
- **Dry-run:** destaque visual em amarelo (`#FFC107`) para deixar claro que **não chamou a IA**.  

---

## 🖼 Iconografia

- Estilo minimalista, contornos simples (line icons).  
- Fonte sugerida: [Tabler Icons](https://tabler-icons.io/) (open source, combina com React).  
- Ícones principais:
  - Chat → `message-circle`  
  - Regex → `regex`  
  - Batch → `layers` ou `file-stack`  
  - Configurações → `settings`  
  - Exportar/Importar → `download` / `upload`  
  - Erro → `alert-triangle`  
  - Sucesso → `check`  

---

## 🧭 Navegação

- **Sidebar** (desktop) ou **menu no topo** (web/PWA mobile).  
- Itens principais:
  - Chat  
  - Prompts (System/User)  
  - Histórico  
  - Regex & Defaults  
  - Batch  
  - Configurações  

---

## 📌 Resumo

O design do **11 PromptLab** deve ser:
- **Escuro** (preto/grafite), minimalista e técnico.  
- **Consistente** (um único acento para ações principais).  
- **Focado no conteúdo** (texto é o protagonista).  
- **Ergonomia em primeiro lugar** (claro o que é batch, dry-run, erro ou sucesso).  

---
