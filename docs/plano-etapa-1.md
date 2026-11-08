# Plano de Execução — Etapa 1: Esqueleto Seguro em Ambiente de Teste Isolado

> **Status:** Pronto para execução — **Aguardando Autorização Formal**  
> **Escopo:** Configuração da infraestrutura de desenvolvimento, repositório privado, planilha de teste isolada e validação de segurança.  
> **Risco:** Zero para o ambiente produtivo (nenhuma planilha de produção será criada e as planilhas originais de 2025 permanecem intocadas).

---

## 1. Objetivos da Etapa 1

1. Configurar o repositório privado no GitHub com Git e `.gitignore` rigoroso.
2. Criar a planilha de testes isolada (`CF_Testes`) no Google Drive do proprietário.
3. Inicializar o projeto Google Apps Script standalone via `clasp`.
4. Configurar o manifesto `appsscript.json` com permissão estrita `access: "MYSELF"` e escopos OAuth mínimos.
5. Implementar a casca inicial da aplicação web responsiva (layout base, cabeçalho e menu de navegação).
6. Implementar e executar a matriz de validação de segurança (bloqueio de acesso não autorizado e conferência de `Session.getEffectiveUser()`).
7. Apresentar os resultados para validação do proprietário antes de avançar para a Etapa 2 (Estrutura de Dados).

---

## 2. Passo a Passo Técnico

### Passo 1.1: Inicialização do Controle de Versão (Git e clasp)
* Inicializar repositório local com Git.
* Criar `.gitignore` com:
  ```text
  .clasprc.json
  node_modules/
  .env
  *.xlsx
  *.csv
  backups/
  ```
* Configurar o arquivo `.clasp.json` apontando para o script de testes.

### Passo 1.2: Criação da Planilha de Testes Isolada (`CF_Testes`)
* Criar uma nova planilha limpa intitulada `CF_Testes` na conta Google do proprietário.
* Obter o `SPREADSHEET_ID` de teste e registrá-lo nas propriedades do script (`PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id)`).
* Assegurar que a planilha original permaneça em pasta local, sem vínculo com o script.

### Passo 1.3: Configuração do Manifesto de Segurança (`appsscript.json`)
* Configuração mandatória no manifesto do projeto:
  ```json
  {
    "timeZone": "America/Sao_Paulo",
    "dependencies": {},
    "webapp": {
      "access": "MYSELF",
      "executeAs": "USER_DEPLOYING"
    },
    "exceptionLogging": "STACKDRIVER",
    "oauthScopes": [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/script.external_request"
    ]
  }
  ```

### Passo 1.4: Implementação da Casca da Interface Web
* `Index.html`: Shell da SPA com menu lateral responsivo e container principal.
* `CssGlobal.html`: Folha de estilos limpa com layout moderno e suporte a dispositivos móveis.
* `JsCore.html`: Motor de promessas para chamadas assíncronas ao `google.script.run`.
* `SecurityGuard.gs`: Validação de identidade e registro de auditoria.

### Passo 1.5: Execução da Matriz de Testes de Segurança (Gate da Etapa 1)
* **Teste 1:** Acesso via navegador logado com a conta do proprietário ➔ Retorno esperado: `HTTP 200` e tela inicial carregada com sucesso.
* **Teste 2:** Acesso via aba anônima (sem login Google) ➔ Retorno esperado: Bloqueio nativo do Google (tela de login / `HTTP 401/403`).
* **Teste 3:** Acesso via outra conta Google (@gmail.com de terceiro) ➔ Retorno esperado: Bloqueio nativo do Google (`HTTP 403 - Acesso Negado`).
* **Teste 4:** Validação de `Session.getEffectiveUser().getEmail()` coincidindo rigorosamente com o e-mail do proprietário.

---

## 3. Critérios de Aceite para Liberação da Etapa 2

A Etapa 1 será dada como concluída e aprovada somente quando:
- [ ] O repositório privado no GitHub estiver configurado e sincronizado.
- [ ] A planilha `CF_Testes` estiver criada e conectada exclusivamente no ambiente de desenvolvimento.
- [ ] O Web App estiver implantado com status `access: "MYSELF"`.
- [ ] A matriz de testes de segurança for 100% aprovada pelo proprietário.
- [ ] A tela inicial carregar fluidamente em celulares e computadores.

