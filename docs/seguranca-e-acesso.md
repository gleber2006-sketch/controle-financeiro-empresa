# Segurança e Acesso

> **Revisão 3 — 08/11/2026**
>
> Documento de apoio ao [Relatório de Planejamento](relatorio-planejamento.md), seção 8.
>
> **Status:** análise técnica concluída; **nada foi implantado**. Não existe aplicativo, implantação, planilha de produção nem login próprio nesta data.
>
> **Revisão 3:** deixa explícito que o código **não consegue ler** o campo `access` da implantação; separa “compartilhar a planilha” de “compartilhar o projeto do Apps Script”; acrescenta testes de verificação manual do deploy, do manifesto e do compartilhamento do projeto; inclui D23 (escopos OAuth).

## 1. Objetivo

Definir e justificar tecnicamente como o sistema será acessível **exclusivamente pela conta Google do proprietário**, sem login próprio, e explicar por que uma verificação de e-mail no código **não é, sozinha, um controle de segurança suficiente**.

Este documento responde a quatro perguntas:

1. O que `Session.getActiveUser().getEmail()` realmente garante?
2. Qual é o controle primário de acesso?
3. Como impedir que outra conta Google use o aplicativo ou leia os dados?
4. Como testar e comprovar isso antes de considerar a segurança concluída?

## 2. Premissas já decididas

| Tema | Decisão |
|---|---|
| Identidade | Conta Google do proprietário |
| Login próprio | **Não haverá** |
| Senha no sistema | **Não haverá** |
| Multiusuário | Fora de escopo |
| Domínio | Conta pessoal (Gmail) ou Google Workspace, a confirmar em D13 |
| Hospedagem | Google Apps Script |
| Dados | Google Sheets privado |
| Anexos | Apenas links do Google Drive, sem upload pela aplicação |

## 3. Modelo de ameaças

### 3.1 Ativos a proteger

- dados financeiros da empresa;
- saldos, lançamentos, orçamento e reservas;
- links de comprovantes no Drive;
- planilha de produção;
- pasta de backup;
- código-fonte e eventuais credenciais de desenvolvimento;
- logs de auditoria.

### 3.2 Ameaças consideradas

| # | Ameaça | Exemplo |
|---|---|---|
| 1 | Acesso por outra conta Google | Pessoa com o link tenta abrir o app |
| 2 | Vazamento do link da implantação | Link enviado por engano ou exposto em histórico |
| 3 | Planilha compartilhada por engano | Link “qualquer pessoa com o link” ativado no Sheets |
| 4 | Sessão do proprietário comprometida | Senha reutilizada, dispositivo desbloqueado |
| 5 | Extensão maliciosa no navegador | Extensão lê a página ou o cookie de sessão |
| 6 | XSS na interface | Texto de lançamento interpretado como HTML |
| 7 | Escopos OAuth excessivos | Aplicativo pede acesso além do necessário |
| 8 | Pasta de backup exposta | Backup compartilhado publicamente |
| 9 | Repositório com dados reais | Planilha ou exportação commitada no GitHub |
| 10 | Implantação mal configurada | `access = ANYONE` por engano |
| 11 | Recuperação de conta fraca | E-mail de recuperação antigo, sem 2FA |
| 12 | Mudança de propriedade da implantação | Conta ou unidade compartilhada altera o dono |

### 3.3 Fora do modelo de ameaças

- ataque physical ao dispositivo do proprietário;
- administrador do Google Workspace, se houver, que tecnicamente pode ter poderes administrativos;
- comprometimento global da infraestrutura do Google;
- roubo de sessão por malware com privilégios totais no sistema operacional.

Esses riscos existem, mas não são resolvidos por código de aplicação. São tratados por higiene de conta e dispositivo.

## 4. O que a documentação oficial diz

### 4.1 `Session.getActiveUser().getEmail()`

A documentação oficial do Apps Script afirma:

- o método retorna informações sobre o **usuário atual**;
- se as políticas de segurança não permitirem acesso à identidade, `getEmail()` retorna **string vazia**;
- o e-mail **não está disponível** em contextos que permitem o script rodar sem a autorização desse usuário, como:
  - acionadores simples `onOpen(e)` ou `onEdit(e)`;
  - funções personalizadas no Google Sheets;
  - **web app implantado como “executar como eu”** (autorizado pelo desenvolvedor, não pelo usuário);
- essas restrições **geralmente não se aplicam** quando o próprio desenvolvedor executa o script ou quando ele pertence ao **mesmo domínio Google Workspace** do usuário;
- o método exige o escopo `https://www.googleapis.com/auth/userinfo.email`.

Fonte: [Session — Apps Script](https://developers.google.com/apps-script/reference/base/session).

**Consequência para este projeto:** no cenário “executar como eu”, `getActiveUser().getEmail()` pode vir vazio. Não se pode tratar essa chamada como garantia contratual de identidade.

### 4.2 `Session.getEffectiveUser().getEmail()`

A documentação oficial afirma:

- retorna o usuário **sob cuja autoridade** o script está rodando;
- em um web app “executar como eu”, retorna a conta do **desenvolvedor**;
- em um acionador instalável, retorna a conta de quem criou o acionador;
- na maioria dos outros cenários, retorna a mesma conta de `getActiveUser()`.

Fonte: [Session — Apps Script](https://developers.google.com/apps-script/reference/base/session).

**Consequência:** `getEffectiveUser()` confirma **sob qual conta o código está executando**, mas **não identifica o visitante**. Ele não deve ser usado como prova de quem abriu a página.

### 4.3 Configuração de implantação do web app

O manifesto permite:

| Campo | Valores | Efeito |
|---|---|---|
| `executeAs` | `USER_ACCESSING` | Executa como o usuário que acessa |
| `executeAs` | `USER_DEPLOYING` | Executa como o usuário que implantou |
| `access` | `MYSELF` | **Somente o usuário que implantou pode executar** |
| `access` | `DOMAIN` | Somente usuários do mesmo domínio do implantador |
| `access` | `ANYONE` | Qualquer usuário autenticado |
| `access` | `ANYONE_ANONYMOUS` | Qualquer usuário, mesmo sem login |

Fonte: [Manifest — Web app](https://developers.google.com/apps-script/manifest/web-app-api-executable).

A documentação de web apps também explica:

- “Execute the app as me”: o script sempre executa como o proprietário, **não importa quem acessa**;
- “Execute the app as user accessing”: o script roda sob a identidade do usuário ativo;
- o URL `/dev` só pode ser acessado por quem tem permissão de edição no script.

Fonte: [Web Apps — Apps Script](https://developers.google.com/apps-script/guides/web).

**Consequência:** `access = MYSELF` é o único controle que impede o Google de entregar a página a outra conta. É o controle primário.

## 5. Decisão de arquitetura de segurança

### 5.1 Configuração recomendada

```json
{
  "timeZone": "America/Sao_Paulo",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "MYSELF"
  }
}
```

- **Executar como:** “Eu” (`USER_DEPLOYING`).
- **Quem tem acesso:** “Somente eu” (`MYSELF`).
- **Nunca** usar `ANYONE` ou `ANYONE_ANONYMOUS` em produção.
- **Nunca** usar `DOMAIN` sem confirmar que o domínio inteiro é confiável.
- O URL `/dev` é apenas para teste e exige permissão de edição no projeto.

### 5.2 Por que `MYSELF` é o controle primário

Com `access = MYSELF`, o Google verifica a conta autenticada **antes de executar `doGet`**:

- se a conta não for a do implantador, o Google nega;
- o link pode vazar, mas outra conta não abre o app;
- a planilha e a pasta de backup não são alcançáveis pela aplicação por outra conta;
- não depende de o código lembrar de verificar nada.

Isso é mais forte do que uma função `assertAutorizado()` no início do `doGet`, porque a barreira está na plataforma, não no código.

### 5.3 Por que a verificação no código ainda existe

Defesa em profundidade. A configuração pode ser alterada por engano em um novo deploy, por um colaborador, por uma migração de propriedade ou por um teste. O código deve:

1. **Negar por padrão** (`fail closed`) quando não conseguir confirmar a identidade.
2. Usar `getEffectiveUser().getEmail()` para confirmar que a execução está sob a conta do proprietário.
3. Usar `getActiveUser().getEmail()` como sinal adicional:
   - se preenchido e diferente do proprietário → negar;
   - se vazio → **não** liberar automaticamente; aplicar a política aprovada.
4. Registrar a tentativa negada em `LogAuditoria`.
5. Nunca confiar apenas na validação do navegador.
6. Nunca usar `getEffectiveUser()` como identificação do visitante.

### 5.4 Regra de decisão quando o e-mail ativo vier vazio

> **Nota técnica importante:** o Apps Script **não expõe ao código** uma API que leia em tempo de execução o campo `access` da implantação. A coluna “configuração verificada” desta matriz representa o que foi conferido no deploy e no manifesto, **não um valor que o script consiga introspecionar**. O código observa apenas os e-mails ativo e efetivo. Portanto, a decisão sobre e-mail vazio é **operacional**, não uma leitura dinâmica de configuração.

| Configuração verificada | Sinal observado | Ação |
|---|---|---|
| `access = MYSELF` | `getEffectiveUser()` = proprietário; e-mail ativo vazio | Prosseguir; registrar o evento e a verificação de deploy |
| `access = MYSELF` | `getEffectiveUser()` ≠ proprietário | Negar e alertar |
| `access` diferente de `MYSELF` | e-mail ativo vazio | **Negar**; não abrir exceção |
| `access` diferente de `MYSELF` | e-mail ativo ≠ proprietário | **Negar** |
| `access` diferente de `MYSELF` | e-mail ativo = proprietário | Prosseguir, mas registrar configuração incorreta e corrigir o deploy |

A opção “se o e-mail vier vazio, liberar” **não é aceitável**. Ela transforma uma falha de identificação em acesso aberto.

Se o proprietário exigir **fail-closed absoluto** mesmo com `MYSELF`, o e-mail vazio bloqueará o próprio proprietário. Nesse caso, as alternativas são:

1. aceitar formalmente o risco residual documentado, confiando no `MYSELF` verificado; ou
2. exigir uma conta Google Workspace, em que a identificação tende a ser mais confiável; ou
3. manter o bloqueio e usar um processo manual de contingência.

A escolha faz parte de D12.

### 5.5 Alternativas e por que não são a primeira escolha

| Alternativa | Problema |
|---|---|
| Login próprio com senha | Cria mais uma senha, mais um vetor de ataque e mais um segredo para guardar; contraria a decisão de não ter login próprio |
| `access = DOMAIN` | Depende de o domínio inteiro ser confiável; em Gmail pessoal não se aplica |
| `access = ANYONE` + verificação de e-mail | Se a verificação falhar ou o e-mail vier vazio, o app fica exposto; o Google já entregou a página |
| Apenas `getActiveUser()` | Pode vir vazio em “executar como eu”; não é garantia |
| Apenas `getEffectiveUser()` | Identifica o dono da execução, não o visitante |
| Ocultar o URL | Segurança por obscuridade; o link pode vazar |

### 5.6 Planilha, pasta e **projeto** são permissões diferentes

| Recurso | Compartilhar com outra conta permite | Efeito no controle de acesso |
|---|---|---|
| Planilha de produção | Ler/editar dados conforme o papel | Outra conta vê os dados **sem passar pelo app**; nunca compartilhar |
| Pasta de backup | Ler/baixar/apagar cópias | Compromete a recuperação; nunca compartilhar |
| Projeto do Apps Script | **Editar o código e criar uma nova implantação** | Pode contornar a verificação e publicar um app próprio; nunca compartilhar |
| Implantação `/exec` | Abrir o app conforme `access` | `MYSELF` bloqueia contas diferentes da do implantador |

**Consequência:** `access = MYSELF` protege a **execução** do web app, mas não impede que um editor do projeto altere o código. A regra é: o projeto do Apps Script, a planilha e a pasta de backup pertencem **somente** ao proprietário. Compartilhar o projeto é um risco tão sério quanto compartilhar a planilha.

## 6. Como o acesso do proprietário funciona na prática

1. O proprietário implanta o web app com `access = MYSELF`.
2. O proprietário abre o URL `/exec` autenticado na própria conta Google.
3. O Google verifica a conta e executa `doGet`.
4. O código confirma `getEffectiveUser().getEmail() = OWNER_EMAIL`.
5. Se `getActiveUser().getEmail()` vier preenchido, o código confirma que é o proprietário.
6. Se vier vazio, o código registra o evento e segue apenas porque `MYSELF` já bloqueou outras contas.
7. Qualquer outra conta recebe negação do Google antes do código.

### 6.1 O que o proprietário precisa manter

- 2FA ou passkey na conta Google;
- e-mail e telefone de recuperação atualizados;
- revisão periódica de dispositivos conectados;
- sessão encerrada em dispositivos compartilhados;
- navegador atualizado;
- cuidado com extensões;
- planilha e pasta de backup compartilhadas **somente** com o proprietário;
- link do web app não publicado;
- revisão das implantações antigas após cada novo deploy;
- registro de qual conta é a proprietária (`OWNER_EMAIL`).

### 6.2 O que o sistema **não** faz

- não armazena senha;
- não cria usuários;
- não envia e-mail de recuperação;
- não gerencia sessão;
- não substitui o 2FA do Google;
- não impede alguém com a sessão desbloqueada do proprietário de usar o app.

## 7. Escopos OAuth e menor privilégio

Escopos previstos, sujeitos à implementação:

| Escopo | Uso | Observação |
|---|---|---|
| `https://www.googleapis.com/auth/spreadsheets` | Ler e escrever na planilha de produção | Necessário |
| `https://www.googleapis.com/auth/drive` ou `drive.file` | Backup e, se necessário, acesso a arquivos criados pelo app | Preferir o menor escopo viável (D11) |
| `https://www.googleapis.com/auth/userinfo.email` | Identificação do usuário | Necessário para `getActiveUser()` e `getEffectiveUser()` |
| `https://www.googleapis.com/auth/script.scriptapp` | Gerenciar acionadores, se necessário | Avaliar necessidade |
| `https://www.googleapis.com/auth/script.send_mail` | Alerta de falha de backup | Avaliar alternativa |
| `https://www.googleapis.com/auth/script.external_request` | Chamadas externas | **Não usar na v1** |

Regras:

- não pedir escopo que não seja usado;
- revisar `appsscript.json` antes de cada deploy;
- se um escopo for removido, testar novamente a autorização;
- não transmitir tokens OAuth para o cliente;
- não usar `ScriptApp.getOAuthToken()` no navegador.

## 8. Matriz de testes obrigatória

A segurança **não está concluída** enquanto todos os testes abaixo não passarem, com evidência registrada.

| # | Cenário | Resultado esperado | Evidência | Status |
|---|---|---|---|---|
| 1 | Proprietário, navegador normal, URL `/exec` | App abre; e-mail efetivo e ativo registrados | Log de execução + `LogAuditoria` | A executar |
| 2 | Proprietário, janela anônima desconectada | Google pede login; app não abre | Captura + ausência de log de `doGet` | A executar |
| 3 | Segunda conta Google, janela anônima | Google nega; app não abre | Captura + ausência de log | A executar |
| 4 | Segunda conta com URL copiada | Google nega | Captura | A executar |
| 5 | URL `/dev` com segunda conta | Google nega | Captura | A executar |
| 6 | Após novo deploy, repetir 1–5 | Configuração preservada | Checklist + manifesto | A executar |
| 7 | Implantação de teste com `access = ANYONE` | Código nega; nenhum dado é exibido | Log de negação | A executar |
| 8 | Verificação de escopos OAuth | Somente escopos necessários | Tela de autorização + manifesto | A executar |
| 9 | `getActiveUser()` vazio simulando política restritiva | Código não libera acesso; registra o evento | Log | A executar |
| 10 | Tentativa de abrir a planilha diretamente com segunda conta | Google nega | Captura | A executar |
| 11 | Tentativa de abrir a pasta de backup com segunda conta | Google nega | Captura | A executar |
| 12 | Requisição `google.script.run` sem sessão válida | Chamada falha; nenhum dado retorna | Log do servidor | A executar |
| 13 | Segunda conta com permissão de **edição no projeto** do Apps Script | Não abre `/exec` por `MYSELF`; porém pode alterar código/criar implantação — comprovar que **não há compartilhamento** | Captura da tela de compartilhamento + revisão de acessos | A executar |
| 14 | Verificação manual de “Implantar > Gerenciar implantações” | `executar como = Eu`; `quem tem acesso = Somente eu`; URL `/exec` correta | Captura + checklist assinado | A executar |
| 15 | Conferência do `appsscript.json` versionado × manifesto do editor | `webapp.access = MYSELF` e `executeAs = USER_DEPLOYING` idênticos | Diff ou captura | A executar |

### 8.1 Critérios de aprovação

- Testes 1–6, 10–11, 13–15 **obrigatoriamente** aprovados.
- Teste 7 aprovado antes de qualquer deploy de produção.
- Teste 9 define a política final de e-mail vazio.
- Teste 12 aprovado antes de expor qualquer função de API.
- Nenhum dado real em implantação de teste.
- A configuração `MYSELF`/`USER_DEPLOYING` é verificada **manualmente** na tela de implantação; o código não a lê em tempo de execução.

### 8.2 O que **não** conta como evidência suficiente

- “O código tem `if (email !== OWNER)`”.
- “O link é difícil de adivinhar”.
- “Só eu conheço o URL”.
- “A planilha não está pública” (sem verificar permissões).
- “Funcionou no meu navegador” (sem testar segunda conta e janela anônima).

## 9. Riscos residuais e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Sessão do proprietário comprometida | Média | Alto | 2FA/passkey, bloqueio de tela, revisão de dispositivos |
| Link da implantação vazado | Média | Baixo com `MYSELF` | `MYSELF` bloqueia outras contas; criar novo deploy se necessário |
| Planilha compartilhada por engano | Média | Alto | Compartilhar somente com o proprietário; desativar link; revisar permissões |
| Pasta de backup exposta | Baixa | Alto | Pasta exclusiva; sem link público; 2FA |
| Repositório com dados reais | Média | Alto | Repositório privado; `.gitignore`; nunca versionar planilhas/exportações |
| XSS na interface | Média | Alto | Sanitizar textos; não usar `innerHTML` com dados do usuário; `XFrameOptionsMode.DENY` |
| Escopos excessivos | Média | Médio | Menor conjunto possível; revisar `appsscript.json` |
| Extensões maliciosas no navegador | Média | Alto | Navegador atualizado; evitar extensões desconhecidas |
| Recuperação da conta fraca | Baixa | Alto | E-mail/telefone de recuperação atualizados; 2FA |
| Implantação antiga esquecida | Média | Alto | Arquivar/remover deploys antigos; revisar após cada deploy |
| Mudança de propriedade da implantação | Baixa | Alto | Não mover para unidade compartilhada; reimplantar se necessário |
| Projeto do Apps Script compartilhado | Média | Alto | Projeto somente do proprietário; teste 13; revisar compartilhamento antes de cada deploy |
| E-mail ativo vazio | Média | Médio | `MYSELF` como controle primário; teste 9; política fail-closed |
| Conta Google pessoal sem garantia de Workspace | Média | Médio | Aceitar risco documentado ou migrar para Workspace (D13) |

## 10. Segurança de anexos e links do Drive

- A aplicação armazena apenas a URL do link.
- Não faz upload, download ou leitura do conteúdo.
- O arquivo deve permanecer restrito ao proprietário; não usar “qualquer pessoa com o link”.
- Validar que a URL é do Google Drive.
- Não executar conteúdo externo.
- Se o link for revogado, o lançamento continua existindo; o anexo apenas fica indisponível.
- Não armazenar tokens de acesso a arquivos no navegador.

## 11. Segurança da planilha e do backup

- Planilha de produção: acesso somente do proprietário.
- Pasta de backup: acesso somente do proprietário; sem link público.
- Não usar “qualquer pessoa com o link” em nenhum dos dois.
- Revisar permissões após criar, copiar ou restaurar.
- Logs de auditoria não devem conter senhas, tokens ou números completos de cartão.
- Dados sensíveis em descrições devem ser minimizados (D17).
- Backup não substitui controle de acesso.

## 12. Segurança do repositório e do desenvolvimento

- Repositório **privado** no GitHub.
- `.gitignore` com `.clasprc.json`, `node_modules/`, backups, `*.xlsx`, `*.csv`, `.env`, logs.
- Nenhum dado real, token ou senha no Git.
- `clasp` configurado com cuidado; não versionar credenciais.
- Revisar commits antes de push.
- Tags de versão para correlacionar código e deploy.
- Ambiente de teste separado (`CF_Testes`) e implantação de teste.

## 13. Checklist operacional antes do primeiro uso real

- [ ] Conta Google do proprietário confirmada (D13).
- [ ] 2FA ou passkey ativado.
- [ ] E-mail e telefone de recuperação atualizados.
- [ ] Revisão de dispositivos conectados.
- [ ] Planilha de produção criada e compartilhada somente com o proprietário.
- [ ] Pasta de backup criada e compartilhada somente com o proprietário.
- [ ] Manifesto com `access = MYSELF` e `executeAs = USER_DEPLOYING`.
- [ ] `OWNER_EMAIL` configurado em `PropertiesService` ou `Configuracoes`.
- [ ] Código com verificação fail-closed.
- [ ] Testes 1–15 executados e registrados.
- [ ] Projeto do Apps Script **não compartilhado** com nenhuma outra conta.
- [ ] Deploys antigos revisados/arquivados.
- [ ] Nenhum dado real no repositório.
- [ ] Anexos restritos ao proprietário.
- [ ] Plano de resposta a incidente definido (revogar deploy, trocar ID, restaurar backup).

## 14. Decisões pendentes relacionadas

| ID | Decisão | Recomendação |
|---|---|---|
| **D12** | Modelo de segurança: `MYSELF` é o controle primário; o que fazer se o e-mail ativo vier vazio? | `MYSELF` + `getEffectiveUser()` + fail-closed; testar `getActiveUser()`; documentar risco |
| **D13** | Conta Google é Gmail pessoal ou Workspace? 2FA/passkey? | Confirmar; 2FA obrigatório; se Workspace, avaliar `DOMAIN` apenas se o domínio inteiro for confiável |
| **D15** | Anexos somente links restritos do Drive? | Sim; sem upload; arquivo privado; app não busca conteúdo |
| **D23** | Escopos OAuth e compartilhamento do projeto Apps Script | Menor escopo viável; `drive.file` preferido; projeto somente do proprietário; testes 13–15 |

## 15. Critérios de aceite da segurança

A segurança será considerada aceita quando:

- [ ] A configuração `MYSELF`/`USER_DEPLOYING` estiver comprovada no manifesto e na tela de implantação (testes 14–15).
- [ ] Os testes 1–6, 10–11 e 13–15 passarem com evidência.
- [ ] O teste 7 (deploy de teste com `ANYONE`) for aprovado.
- [ ] A política para e-mail ativo vazio estiver decidida e implementada.
- [ ] Os escopos OAuth estiverem revisados e aprovados (D23).
- [ ] Planilha, pasta de backup, projeto e repositório estiverem privados.
- [ ] O proprietário aprovar formalmente D12/D13/D23.

Até lá, a segurança permanece **em análise**, e nenhuma implantação de produção deve ser feita.

## 16. Referências oficiais

- [Session — Apps Script](https://developers.google.com/apps-script/reference/base/session)
- [Manifest — Web app](https://developers.google.com/apps-script/manifest/web-app-api-executable)
- [Web Apps — Apps Script](https://developers.google.com/apps-script/guides/web)
- [Scopes — Apps Script](https://developers.google.com/apps-script/concepts/scopes)
- [Authorization — Apps Script](https://developers.google.com/apps-script/guides/services/authorization)

## 17. Declaração de estado

- Nenhum aplicativo foi criado.
- Nenhuma implantação foi feita.
- Nenhum teste foi executado.
- Nenhuma planilha de produção foi criada.
- Este documento é **especificação e plano de teste**, não evidência de segurança implementada.

## 18. Histórico de revisões

| Versão | Data | Mudanças |
|---|---|---|
| 1 | 07/11/2026 | Análise inicial de acesso e verificação de e-mail |
| 2 | 08/11/2026 | Validação da documentação oficial, `MYSELF` como controle primário, matriz de testes e riscos |
| 3 | 08/11/2026 | Código não lê `access`; separação planilha/pasta/projeto; testes 13–15; D23 (escopos OAuth e compartilhamento do projeto) |
