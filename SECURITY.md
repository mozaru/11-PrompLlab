# Política de Segurança – IA Chat Configurator

Este documento define as práticas de segurança a serem seguidas no desenvolvimento, uso e manutenção do **IA Chat Configurator**, de propriedade de **Mozar Baptista da Silva e 11tech**.

---

## 1. Escopo de Segurança

- Toda a execução do software ocorre **localmente no dispositivo do usuário**.  
- A **única comunicação externa** permitida é com a **API da OpenAI** (`https://api.openai.com`).  
- O projeto **não coleta telemetria** e **não envia dados para terceiros**.  
- O código é **proprietário**, não sendo permitido compartilhamento sem autorização da 11tech.  

---

## 2. Proteção da API Key

- A chave da API da OpenAI é **pessoal e sensível**.  
- Opções de armazenamento:
  - **Memória apenas** (não salva após fechar a aplicação).  
  - **LocalStorage** (web/PWA) – somente se o usuário optar.  
  - **Secure Storage do SO** (desktop via Tauri, quando configurado).  
- Nunca incluir a chave em commits, issues ou documentação.  
- Recomenda-se usar `.env.example` como referência, nunca `.env` real.  

---

## 3. Boas Práticas de Desenvolvimento

- **CSP (Content Security Policy):** restringir `connect-src` apenas a `https://api.openai.com`.  
- **Sem dependências suspeitas:** revisar bibliotecas externas; nenhuma dependência pode enviar dados para terceiros sem aprovação.  
- **Regex em Workers:** toda execução de regex/batch deve ocorrer em **Web Workers** para evitar travas ou riscos no thread principal.  
- **Fallback seguro:** quando FSA não estiver disponível, o fallback deve ser sempre **ZIP local**, nunca upload para servidores externos.  
- **Controle de erros:** outputs de erro (`.error.txt`) não devem incluir dados sensíveis, apenas mensagens técnicas.  

---

## 4. Vulnerabilidades

- Caso um colaborador interno identifique uma falha de segurança, deve reportar **imediatamente** a:
  - **Mozar Baptista da Silva** – [mozar.silva@gmail.com](mailto:mozar.silva@gmail.com)  
  - **11tech – Desenvolvimento de Software** – [www.11tech.com.br](http://www.11tech.com.br)  

- O reporte deve incluir:
  - Descrição do problema.  
  - Passos para reproduzir.  
  - Impacto potencial.  
  - Sugestão de correção (se possível).  

---

## 5. Política de Divulgação

- Vulnerabilidades **não devem ser divulgadas publicamente** sem correção prévia e sem autorização da 11tech.  
- Todo o tratamento de falhas será feito de forma **interna e confidencial**.  

---

## 6. Garantias e Limitações

- O software é fornecido "no estado em que se encontra".  
- A 11tech não garante ausência total de falhas ou vulnerabilidades.  
- O usuário assume os riscos decorrentes do uso do software.  

---

## 7. Atualizações

- Este documento poderá ser atualizado conforme evolução do projeto.  
- A versão mais recente deve sempre estar disponível no repositório em `/SECURITY.md`.  

---
