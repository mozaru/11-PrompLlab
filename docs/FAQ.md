# FAQ – 11-PromptLab

Este documento reúne as perguntas mais frequentes sobre o **11-PromptLab**.

---

## 🧑‍💻 Uso Geral

### O que é o 11-PromptLab?
É uma aplicação que permite configurar de forma detalhada como você interage com modelos de linguagem (LLMs), como o ChatGPT.  
Você pode definir system prompt, user prompt com placeholders dinâmicos, controlar o histórico da conversa e processar arquivos em lote (batch).

### Preciso de internet para usar?
Sim. Todo o processamento roda localmente, mas a resposta da IA vem da **API da OpenAI**, então é necessário estar conectado.

### O software é gratuito?
Sim, o uso do software é livre.  
Mas o **código-fonte é proprietário**, de autoria de **Mozar Baptista da Silva e 11tech**.

---

## ⚙️ Configuração

### Onde a chave da API é armazenada?
- **Desktop (Tauri):** pode usar secure storage do sistema (quando suportado).  
- **Web/PWA:** `localStorage` (se você optar) ou apenas em memória (mais seguro).  

### Posso usar diferentes modelos da OpenAI?
Sim. Basta selecionar o modelo desejado na tela de configurações globais ou no projeto.

### Como salvo minhas configurações?
- **Configuração Global**: salva automaticamente no dispositivo.  
- **Projeto**: exportado como arquivo `.json`, que você pode guardar onde quiser.

---

## 📂 Batch

### Como funciona o processamento em lote?
Você seleciona arquivos (ou diretórios, quando disponível), o sistema extrai placeholders com regex, monta o prompt e chama a IA para cada arquivo.  
Os resultados são salvos em novos arquivos ou em um ZIP.

### E se um arquivo der erro?
- No modo diretórios: será gerado um `.error.txt` ao lado do arquivo de saída.  
- No modo ZIP: o arquivo de erro estará dentro do pacote final.

### O que é Dry-run?
É um modo de teste que processa placeholders e gera os prompts, mas **não chama a IA**.  
Recomendado antes de rodar um lote grande.

### Safari/iOS não deixa escolher diretórios. O que acontece?
Nestes casos, o sistema usa sempre o **modo ZIP**: você seleciona arquivos de entrada e faz download de um ZIP com os resultados.

---

## 🔐 Segurança

### O sistema envia meus arquivos para algum servidor?
Não. Toda a lógica roda no seu dispositivo.  
A única chamada externa é para a **API da OpenAI**.

### É seguro salvar a API key?
- Mais seguro: usar a opção **não salvar** (a chave fica apenas em memória).  
- Conveniente: salvar no dispositivo (`localStorage` no web, secure storage no desktop).  

### O software coleta telemetria?
Não. Nenhum dado de uso é coletado.

---

## 📜 Licença

### Posso modificar o código?
Não. O código é **proprietário da 11tech**.  
O software pode ser usado livremente, mas não é permitido copiar, modificar ou redistribuir o código-fonte.

### Posso usar o software em ambiente corporativo?
Sim, desde que respeitados os termos da [Licença de Uso](LICENSE).  
O software pode ser usado tanto pessoalmente quanto profissionalmente.

---

## 🛠 Problemas comuns

### A resposta da IA está demorando. É normal?
Sim. O foco do software é **qualidade**, não velocidade.  
Mesmo respostas lentas são aceitas como válidas.

### Regex travou a interface. E agora?
Todas as regex rodam em **Web Workers**, para evitar travas no UI.  
Se travar, revise a regex (pode estar muito gananciosa ou mal definida).

### O batch parou após várias tentativas. O que fazer?
O sistema tenta até **10 vezes** com backoff exponencial.  
Se mesmo assim falhar, um arquivo `.error.txt` é gerado.  
Verifique se sua chave da OpenAI ainda é válida e se não houve limite de uso.

---

## 📩 Suporte

- Autor: **Mozar Baptista da Silva**  
- Empresa: **11tech – Desenvolvimento de Software**  
- Website: [www.11tech.com.br](http://www.11tech.com.br)  
- E-mail: [mozar.silva@gmail.com](mailto:mozar.silva@gmail.com)  

---
