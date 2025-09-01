# Glossário – IA Chat Configurator

Este glossário reúne os principais termos técnicos usados no projeto, servindo como referência para usuários e colaboradores.

---

## 🧠 Termos de IA

### LLM (Large Language Model)
Modelo de linguagem de grande escala (ex.: GPT-4), capaz de gerar texto a partir de prompts.

### Prompt
Texto de entrada fornecido ao modelo para orientar sua resposta.  
Pode ser dividido em:
- **System Prompt**: define o comportamento e estilo da IA (ex.: “você é um assistente técnico”).  
- **User Prompt**: mensagem enviada pelo usuário, podendo conter variáveis dinâmicas.  

### Contexto
Conjunto de mensagens enviadas para o modelo em uma conversa.  
Inclui system prompt, histórico de mensagens anteriores e o prompt atual.

### Histórico
Armazena as interações anteriores em uma sessão de chat.  
Pode ser habilitado/desabilitado globalmente ou por mensagem.

### Parâmetros da IA
Configurações que influenciam a geração de texto:
- **temperature**: controla a criatividade (0 = determinístico, >0 = mais criativo).  
- **top_p**: alternativa ao temperature, controla a diversidade.  
- **max_tokens**: número máximo de tokens na resposta.  
- **seed**: número que força repetibilidade das respostas (quando suportado).  
- **response_format**: formato esperado da saída (texto livre, JSON, etc.).  

---

## 📝 Termos de Configuração

### Projeto
Conjunto de configurações salvas em um arquivo `.json` que inclui:
- System Prompt  
- User Prompt Template  
- Placeholders/Regex  
- Parâmetros de IA  
- Histórico (se aplicável)  
- Configurações de batch  

### Configuração Global
Preferências do usuário, independentes de projetos:
- API key  
- Modelo default  
- Locale (pt-BR)  

### Exportar/Importar
Ação de salvar um projeto em `.json` (exportar) ou carregar um existente (importar).

---

## 🔎 Placeholders e Regex

### Placeholder
Variável usada no User Prompt (`{{variavel}}`), preenchida automaticamente com dados extraídos de arquivos de entrada.

### Regex (Expressão Regular)
Padrão de busca usado para identificar trechos de texto em arquivos.  
Exemplo: `(?s)BEGIN(.*?)END` → captura tudo entre “BEGIN” e “END”.

### Valor Default
Valor usado para um placeholder caso a regex não encontre nenhum match.

### Flags de Regex
Opções que alteram o comportamento da busca:
- `i` → ignore case  
- `m` → multiline  
- `s` → dotall (permite `.` capturar quebras de linha)  

---

## 📂 Termos de Batch

### Batch
Execução em lote: processamento de múltiplos arquivos de entrada, aplicando regex, montando prompts e chamando a IA para cada um.

### Dry-run
Execução de teste do batch sem chamar a IA.  
Processa apenas regex + renderização de templates.

### Input Dir / Output Dir
- **Input Dir**: diretório (ou arquivos) de entrada.  
- **Output Dir**: diretório (ou ZIP) de saída.

### ZIP
Arquivo compactado usado como fallback quando não há suporte a File System Access API (FSA).  
Inclui outputs normais e `.error.txt` para falhas.

### `.error.txt`
Arquivo gerado quando um processamento falha.  
Contém o motivo do erro (ex.: timeout, problema na chamada da API).

---

## ⚙️ Termos Técnicos da Arquitetura

### FSA (File System Access API)
API dos navegadores que permite acessar diretórios e arquivos locais.  
Nem todos os navegadores suportam (ex.: Safari/iOS → não suporta).

### Fallback ZIP
Alternativa ao FSA: usuário envia múltiplos arquivos e recebe um ZIP com os resultados.

### Worker / Web Worker
Thread paralela no navegador (ou desktop) usada para executar regex e batch sem travar a interface.

### Adapter
Abstração que separa a interface do serviço da implementação real.  
Exemplo: `IFileSystem` → pode ser implementado com FSA (web) ou APIs do SO (desktop).

### Retry com Backoff
Mecanismo de repetição automática em caso de erro:  
- até 10 tentativas  
- intervalo crescente (exponencial)  
- com jitter (aleatoriedade) para evitar congestionamento.

---

## 📜 Termos de Governança

### Licença Proprietária 11tech
Modelo de licença onde:
- O **uso do software é gratuito**.  
- O **código-fonte é fechado** e pertence a Mozar Baptista da Silva + 11tech.  

### Contribuição Interna
Fluxo de contribuição controlado pela equipe 11tech.  
Definido em [`CONTRIBUTING.md`](CONTRIBUTING.md).  

---
