# Guia de Uso – 11-PromptLab

Este documento explica como utilizar o **11-PromptLab**, desde a configuração inicial até a execução em lote de arquivos.

---

## 1. Primeira execução

1. Abra o aplicativo (versão **desktop** via Tauri ou versão **Web/PWA** no navegador).  
2. Acesse a tela de **Configuração Global**.  
3. Insira sua **API Key da OpenAI**.  
   - Você pode escolher:
     - **Não salvar** (a chave fica só em memória, mais seguro).  
     - **Salvar localmente** (`localStorage` no web, secure storage no desktop).  
4. Defina o **modelo padrão** (ex.: `gpt-4o-mini`).  
5. Salve as configurações.  

> ⚠️ Sua chave da API é pessoal e deve ser protegida. Nunca compartilhe este dado.

---

## 2. Criando um Projeto

1. Vá até a tela **Novo Projeto**.  
2. Preencha os campos básicos:
   - **Título do Projeto**.  
   - **System Prompt** (define comportamento e estilo da IA).  
   - **User Prompt Template** (texto enviado em cada mensagem, com placeholders se necessário).  
3. Configure os parâmetros da IA:
   - **temperature**, **top_p**, **max_tokens**, **seed**, **response_format**.  
4. Salve o projeto (gera um `.json`).  

> Você pode exportar e importar projetos sempre que quiser, para reutilização ou compartilhamento.

---

## 3. Conversa no Chat

1. Acesse a tela **Chat**.  
2. Edite os prompts conforme necessário:
   - System Prompt.  
   - User Prompt Template.  
3. Digite sua mensagem e clique em **Enviar**.  
4. A resposta será exibida no chat.  
5. Histórico:
   - Ative ou desative o histórico globalmente.  
   - Selecione mensagens específicas para incluir/excluir no contexto.  
6. Antes de enviar, você pode visualizar o **preview do contexto final**.

---

## 4. Configurando Placeholders e Regex

1. Abra o modal **Regex & Defaults**.  
2. Para cada variável do user prompt (`{{variavel}}`):
   - Informe a **regex**.  
   - Defina o **valor default** (caso não haja match).  
   - Selecione **flags** (multiline, ignorecase, dotall etc.).  
3. Área de teste:
   - Cole um **texto de exemplo**.  
   - Clique em **Testar todos** para ver os resultados em tabela.  
   - Clique em **Testar** por variável para abrir popup com valor completo.  
4. Valores podem ser:
   - **Match não vazio** → usado diretamente.  
   - **Match vazio** → válido (valor `""`).  
   - **Sem match** → default ou `""`.  

---

## 5. Execução em Batch

### 5.1 Modo Diretórios (quando FSA disponível – desktop e navegadores compatíveis)
1. Selecione o **diretório de entrada** (arquivos a processar).  
2. Selecione o **diretório de saída** (onde os resultados serão salvos).  
3. Configure opções:
   - Sobrescrever arquivos existentes ou não.  
   - Concorrência (quantos arquivos processar ao mesmo tempo).  
   - Fail on error (parar no primeiro erro ou continuar).  
4. (Opcional) Execute um **Dry-run**: apenas regex + renderização de template, sem chamar a IA.  
5. Clique em **Executar** → cada arquivo gera um output correspondente.  
   - Se falhar → gera `.error.txt` no diretório de saída.

### 5.2 Modo Arquivos + ZIP (fallback universal)
1. Clique em **Selecionar arquivos** e escolha múltiplos arquivos de entrada.  
2. Configure as opções de execução.  
3. (Opcional) Execute um **Dry-run**.  
4. Clique em **Executar**.  
5. No final será oferecido um **download de um arquivo ZIP** com:
   - Arquivos de saída.  
   - Arquivos `.error.txt` para falhas.  

---

## 6. Exportar e Importar Projetos

- **Exportar**: salva um arquivo `.json` com todas as configurações do projeto (prompts, placeholders, parâmetros, batch).  
- **Importar**: abre um arquivo `.json` previamente salvo para continuar o trabalho.  

---

## 7. Dicas de Uso

- Sempre faça **Dry-run** antes de rodar um batch grande.  
- Prefira regexes específicas para evitar capturas indesejadas.  
- Se usar o modo ZIP, mantenha os arquivos organizados em uma pasta antes de importar.  
- No desktop, use **secure storage** para guardar a API key quando disponível.  
- No navegador, se possível, use a opção **não salvar API key**.  

---

## 8. Limitações Conhecidas

- Apenas chat textual (sem voz).  
- Arquivos muito grandes podem ser lentos para processar no navegador.  
- Safari/iOS não suporta FSA → sempre usa o modo ZIP.  
- Sem logs globais; apenas `.error.txt` por arquivo em caso de falha.  
- Sem manifest detalhado de batch.  

---

## 9. Suporte

- Autor: **Mozar Baptista da Silva**  
- Empresa: **11tech – Desenvolvimento de Software**  
- Website: [www.11tech.com.br](http://www.11tech.com.br)  
- E-mail: [mozar.silva@gmail.com](mailto:mozar.silva@gmail.com)  

---
