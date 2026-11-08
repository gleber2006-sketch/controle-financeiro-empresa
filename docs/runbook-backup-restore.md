# Runbook de Backup e Restauração

> **Revisão 3 — 08/11/2026**
>
> Documento de apoio ao [Relatório de Planejamento](relatorio-planejamento.md), seção 9.
>
> **Status:** procedimento especificado; **não implementado**. Não existe rotina de backup, pasta de backup, planilha de produção nem implantação nesta data.
>
> **Revisão 3:** acrescenta o limite de 6 minutos por execução e as quotas de acionador; muda a v1 para **somente lixeira, sem purga automática**; define keeper mensal; alinha o manifesto diário leve ao relatório semanal de integridade; inclui D20.

## 1. Objetivo

Definir como o sistema será protegido contra perda de dados, como o backup será executado, retido e verificado, e como uma restauração será testada sem risco para a produção.

Este runbook cobre:

- janela real de execução dos acionadores;
- rotina diária e manual;
- nomenclatura, metadados e idempotência;
- política de retenção e exclusão lógica;
- prevenção de exclusão acidental;
- teste de restauração;
- recuperação de desastre;
- critérios de aceite.

## 2. Premissas

| Item | Premissa |
|---|---|
| Armazenamento | Google Drive do proprietário |
| Planilha | Google Sheets de produção, identificada por `SPREADSHEET_ID` |
| Automação | Google Apps Script, acionador baseado em tempo |
| Fuso | `America/Sao_Paulo` |
| Acesso | Somente o proprietário |
| Backup | Cópia nativa do arquivo inteiro + manifesto |
| Retenção | 30 diários + 12 mensais + manuais imunes |
| RPO | Até ~24 horas |
| RTO | Algumas horas |

## 3. Janela real dos acionadores

A documentação oficial do Apps Script informa que acionadores baseados em tempo podem ter o horário **levemente randomizado**:

> “The time might be slightly randomized—for example, if you create a recurring 9 AM trigger, Apps Script chooses a time between 9 AM and 10 AM, then keeps that timing consistent from day to day so that 24 hours elapse before the trigger fires again.”

Fonte: [Installable triggers — Apps Script](https://developers.google.com/apps-script/guides/triggers/installable).

### 3.1 Consequências para este projeto

- O backup será agendado para **03:00**, com execução esperada entre **03:00 e 04:00**.
- O horário tende a se manter consistente nos dias seguintes, mas **não é garantido ao minuto**.
- O nome do arquivo usará a **hora real da execução**, não a hora teórica.
- A idempotência será por **data no fuso `America/Sao_Paulo`**: se já existir backup com sucesso para o dia, uma segunda execução não cria duplicata.
- O backup **não** depende de estar “exatamente à meia-noite” nem de virar o dia.
- Acionadores instaláveis rodam sob a conta de quem os criou; o acionador deve ser criado pelo proprietário.
- Falhas de acionador geram e-mail de notificação do Apps Script; além disso, a rotina deve registrar `BackupLog` e alertar o proprietário.

### 3.2 O que fazer se o backup não rodar

1. Verificar se o acionador está ativo em **Triggers** no projeto.
2. Verificar o `BackupLog` e os logs de execução.
3. Verificar se a conta do proprietário ainda tem acesso à pasta.
4. Executar backup manual pela interface ou por função administrativa.
5. Registrar o incidente e a causa.
6. Não considerar o dia coberto até existir um backup com sucesso.

### 3.3 Limite de execução e quotas

- Cada execução do Apps Script tem limite de **6 minutos**. A rotina diária precisa terminar bem abaixo disso; acima de ~4 minutos, registrar alerta de degradação.
- A conta consumidora tem limite diário de tempo de acionador (da ordem de **90 minutos/dia**).
- O projeto tem limite de **20 acionadores por usuário**. A v1 usa **um** acionador diário e, no máximo, um semanal.
- A rotina diária não varre abas nem recalcula totais. A cópia nativa + manifesto + log é o escopo mínimo.
- Timeout é `FALHA`, não sucesso parcial. Arquivo incompleto não conta como backup do dia.
- Se a cópia crescer e se aproximar do limite, dividir a verificação semanal em outra execução ou reduzir o escopo — nunca aumentar a frequência sem medir.

## 4. Arquitetura do backup

```text
Planilha de produção (SPREADSHEET_ID)
        |
        | cópia nativa do Drive
        v
Pasta de backup dedicada (BACKUP_FOLDER_ID)
   - Controle_Financeiro_AAAA-MM-DD_HHmm
   - manifesto JSON (obrigatório)
   - _Lixeira_Backup (exclusão lógica)
        |
        v
BackupLog na planilha de produção
```

### 4.1 Princípios

1. **Copiar o arquivo inteiro**, não apenas abas.
2. **Não ler todas as abas na rotina diária**; isso é pesado e desnecessário para uma cópia.
3. **Registrar metadados** para saber o que é backup do sistema.
4. **Nunca apagar** fora da rotina de retenção.
5. **Nunca restaurar por cima da produção**.
6. **Testar a restauração** periodicamente.

### 4.2 O que o backup contém

- cópia completa da planilha (todas as abas, inclusive configurações e logs);
- manifesto **leve** com:
  - versão do esquema;
  - data/hora real;
  - `SPREADSHEET_ID` de origem;
  - versão do código implantado;
  - tamanho do arquivo;
- registro em `BackupLog`.

> Contagens de linhas e totais-chave **não** são calculados na cópia diária, para manter a rotina leve. Eles são gerados na verificação semanal e no teste de restauração, e registrados em `BackupLog.contagens_json` ou em um relatório de integridade.

### 4.3 O que o backup não substitui

- o repositório Git com o código;
- o histórico de versões do Google Sheets;
- o controle de acesso;
- o teste de restauração.

## 5. Rotina diária

### 5.1 Passos automatizados

1. Adquirir `LockService` para evitar execução simultânea.
2. Ler `SPREADSHEET_ID` e `BACKUP_FOLDER_ID` de `PropertiesService`/`Configuracoes`.
3. Verificar se já existe backup com sucesso para a data atual no fuso `America/Sao_Paulo`.
4. Se existir, encerrar com status `IGNORADO` (idempotência).
5. Abrir a planilha de produção pelo ID.
6. Copiar o arquivo inteiro para a pasta de backup.
7. Renomear para `Controle_Financeiro_AAAA-MM-DD_HHmm` com a hora real.
8. Gravar o manifesto leve.
9. Registrar `BackupLog` com:
   - `id_backup`;
   - `data_hora`;
   - `tipo = DIARIO`;
   - `arquivo_id`;
   - `nome_arquivo`;
   - `tamanho_bytes`;
   - `status = SUCESSO`;
   - `duracao_ms`;
   - `versao_esquema`;
   - `contagens_json`.
10. Liberar o lock.

### 5.2 Verificação pós-execução

- O arquivo existe na pasta correta?
- O nome segue o padrão?
- O tamanho é compatível com o anterior?
- O `BackupLog` tem status `SUCESSO`?
- O backup abre sem erro?
- A data/hora corresponde à execução real?
- O manifesto foi gravado?

### 5.3 Falha

1. Registrar `BackupLog` com `status = FALHA` e a mensagem.
2. Não apagar o backup anterior.
3. Enviar alerta ao proprietário (e-mail ou aviso na interface).
4. Tentar novamente uma vez, se a falha for transitória.
5. Se persistir, executar backup manual e investigar.
6. Registrar o incidente.

### 5.4 Backup manual

- Disponível pela interface administrativa.
- Tipo `MANUAL`.
- **Imune à retenção.**
- Obrigatório antes de:
  - migração;
  - mudança de esquema;
  - restauração;
  - alteração relevante de código;
  - exclusão em massa.

### 5.5 Backup pré-migração

- Tipo `PRE_MIGRACAO`.
- **Imune à retenção.**
- Criado imediatamente antes de qualquer migração.
- Validado por abertura e conferência de contagens.
- Mantido mesmo depois da migração concluída.

## 6. Política de retenção

### 6.1 Proposta

| Categoria | Quantidade | Observação |
|---|---:|---|
| Diários | 30 | Um por dia com sucesso |
| Keepers mensais | 12 | Primeiro backup `DIARIO` com sucesso de cada mês |
| Recentes | 7 | Sempre mantidos, independentemente da categoria |
| Manuais | Ilimitados | Imunes à retenção |
| Pré-migração | Ilimitados | Imunes à retenção |

**Definição de keeper mensal**

- Keeper é o **primeiro backup `DIARIO` com sucesso de cada mês** (data mais antiga do mês com status `SUCESSO`).
- Se o primeiro backup do mês falhou, o keeper é o primeiro sucesso seguinte daquele mês.
- Keeper é mantido por **12 meses** e é imune à limpeza enquanto estiver na janela.
- Nunca apagar o último keeper de um mês, mesmo que a contagem de 12 seja ultrapassada.
- Mês sem nenhum backup com sucesso é falha operacional registrada, não “mês sem keeper” silencioso.

### 6.2 Regras

- A limpeza roda no máximo **uma vez por semana**.
- A limpeza **não** roda na mesma execução do backup diário.
- A limpeza **nunca** apaga:
  - o backup mais recente;
  - o backup do dia;
  - os 7 mais recentes;
  - o keeper mensal;
  - `MANUAL`;
  - `PRE_MIGRACAO`.
- **Na v1, a limpeza só move para `_Lixeira_Backup`; não apaga definitivamente.**
- Purga definitiva é **manual**, auditada, com lista conferida e confirmação do proprietário, somente após **7 dias** na lixeira.
- Dry-run obrigatório na primeira configuração.
- Comparar a lista antes/depois e registrar em `BackupLog`.

### 6.3 Exemplo de retenção

Se hoje é 08/11/2026 e existem backups diários desde 01/09/2026:

- manter os 30 diários mais recentes;
- manter um keeper por mês (setembro, outubro, novembro…);
- manter os 7 mais recentes mesmo que a conta de 30 seja reduzida;
- mover os excedentes para `_Lixeira_Backup`;
- após 7 dias, apagar definitivamente os excedentes que não sejam keeper.

## 7. Exclusão lógica e limpeza

### 7.1 Fluxo

1. Listar arquivos da pasta `BACKUP_FOLDER_ID`.
2. Filtrar somente arquivos com prefixo `Controle_Financeiro_` **e** metadados/manifesto do sistema.
3. Calcular quais seriam excluídos.
4. Se `BACKUP_RETENTION_DRY_RUN = SIM`, registrar a lista e **não mover nada**.
5. Se dry-run desligado, mover os escolhidos para `_Lixeira_Backup`.
6. Registrar em `BackupLog`:
   - lista de arquivos movidos;
   - motivo;
   - data/hora;
   - resultado.
7. **Na v1, parar aqui.** Não apagar definitivamente. A purga da lixeira é uma operação manual separada, executada somente depois de 7 dias, com lista conferida, confirmação do proprietário e registro em `BackupLog`.

### 7.2 Regras de segurança da limpeza

- Usar o `BACKUP_FOLDER_ID` configurado; **nunca** procurar pasta por nome.
- Nunca apagar arquivo que não tenha sido criado pela rotina.
- Nunca apagar arquivo sem prefixo e metadados.
- Nunca apagar o backup mais recente, o do dia ou o keeper mensal.
- Nunca apagar `MANUAL` ou `PRE_MIGRACAO`.
- Nunca apagar o último keeper de um mês.
- Na v1, a rotina **não apaga definitivamente**; só move para a lixeira.
- Purga definitiva é manual, auditada e confirmada.
- Se houver dúvida, **não apagar**.
- Registrar tudo.
- A limpeza deve ser idempotente.

## 8. Como evitar exclusão acidental

| Medida | Efeito |
|---|---|
| Nenhum botão de “apagar backup” na interface | Remove o risco de clique acidental |
| Exclusão somente pela rotina de retenção | Centraliza a regra |
| Exclusão lógica com carência de 7 dias | Permite recuperação |
| v1 sem purga automática | Elimina exclusão definitiva por código |
| Dry-run obrigatório | Mostra o que seria apagado |
| Prefixo + metadados | Evita apagar arquivo alheio |
| Pasta exclusiva | Evita confusão com outros arquivos |
| Permissão somente do proprietário | Evita exclusão por terceiros |
| 2FA/passkey | Protege a conta |
| Manter 7 recentes | Garante recuperação imediata |
| Manuais e pré-migração imunes | Protege marcos |
| Histórico de versões do Sheets | Camada extra |
| Cópia externa mensal | Protege contra falha do Drive/conta |

### 8.1 Cópia externa

- Uma vez por mês, baixar uma cópia XLSX/CSV e guardar em local protegido.
- Proteger por senha/criptografia, se possível.
- Não armazenar no repositório.
- Registrar a data e o local.
- Testar a abertura da cópia.

## 9. Teste de restauração

### 9.1 Frequência

- **trimestral**;
- antes de mudança estrutural ou migração;
- após incidente ou alteração relevante na rotina;
- após atualização do esquema.

### 9.2 Procedimento

1. Escolher um backup recente e um backup mensal antigo.
2. Copiar para a pasta de teste `_Restauracao_Teste`.
3. Renomear para `RESTORE_TEST_AAAA-MM-DD`.
4. **Não** abrir o backup original para edição.
5. Conferir:
   - nomes das abas;
   - versão do esquema;
   - contagem de linhas por aba;
   - somas de liquidações de receita e despesa;
   - saldo das contas e reconciliações;
   - transferências (origem/destino);
   - reservas (aportes − resgates);
   - orçamento planejado e realizado;
   - unicidade de IDs;
   - integridade referencial;
   - continuidade do `LogAuditoria`.
6. Comparar com o manifesto leve, com o relatório de integridade mais recente e com o `BackupLog`.
7. Apontar uma **implantação de teste** para a cópia restaurada.
8. Executar testes somente leitura.
9. Medir o tempo de restauração (RTO).
10. Registrar o resultado.
11. Após a revisão do proprietário, descartar a cópia de teste.

### 9.3 Critérios de aprovação

- Todas as abas esperadas presentes.
- Contagens conferem com o relatório de integridade mais recente.
- Somas conferem.
- Saldos conferem.
- Nenhum ID duplicado.
- Nenhuma referência órfã.
- `LogAuditoria` contínuo.
- Aplicação de teste abre e lê os dados.
- RTO registrado.
- Nenhum dado real exposto fora do ambiente do proprietário.

### 9.4 O que invalida o teste

- abrir o backup original para edição;
- restaurar por cima da produção;
- usar dados reais em ambiente público;
- não conferir somas/contagens;
- considerar “abriu” como suficiente;
- não registrar evidência.

## 10. Recuperação de desastre

### 10.1 Cenários

| Cenário | Ação |
|---|---|
| Planilha corrompida | Restaurar em planilha nova; validar; trocar `SPREADSHEET_ID` |
| Exclusão acidental de dados | Restaurar backup anterior; comparar; reaplicar o que faltar |
| Falha de código | Reverter para tag anterior; restaurar backup se necessário |
| Pasta de backup perdida | Usar cópia externa + histórico de versões |
| Conta comprometida | Revogar acessos, trocar senha, revisar dispositivos, criar novo deploy |
| Migração malsucedida | Usar backup `PRE_MIGRACAO`; manter produção antiga somente leitura |

### 10.2 Procedimento de desastre

1. **Não** restaurar por cima da produção.
2. Criar uma planilha nova.
3. Restaurar o backup nela.
4. Validar com o checklist da seção 9.
5. Trocar o `SPREADSHEET_ID` na configuração.
6. Reimplantar o web app, se necessário.
7. Manter a produção antiga **somente leitura por 30 dias**.
8. Registrar o incidente e as lições aprendidas.

### 10.3 RPO e RTO

- **RPO:** perder no máximo cerca de 24 horas de dados.
- **RTO:** restaurar e voltar a operar em algumas horas.
- Revisar após o primeiro teste real.
- Se o RPO de 24h não for suficiente, avaliar backup mais frequente ou histórico de versões.

## 11. Segurança do backup

- Pasta exclusiva do proprietário.
- Sem link público.
- Sem “qualquer pessoa com o link”.
- 2FA/passkey na conta.
- Revisar permissões após criar, copiar ou restaurar.
- Não armazenar backups no repositório.
- Não enviar backup por e-mail ou mensagem.
- Criptografar cópias externas.
- Registrar acesso e alterações.
- Se a conta for comprometida, considerar todos os backups potencialmente expostos.

## 12. Logs e auditoria

### 12.1 `BackupLog`

Campos:

`id_backup`, `data_hora`, `tipo`, `arquivo_id`, `nome_arquivo`, `tamanho_bytes`, `status`, `mensagem`, `duracao_ms`, `versao_esquema`, `contagens_json`.

### 12.2 Eventos a registrar

- backup diário iniciado/concluído/falho;
- backup manual;
- backup pré-migração;
- limpeza em dry-run;
- limpeza executada;
- arquivo movido para lixeira;
- arquivo apagado definitivamente;
- restauração de teste;
- restauração de desastre;
- falha de acesso à pasta;
- falha de cópia.

### 12.3 Retenção de logs

- Definir prazo (por exemplo, 12 meses).
- Não registrar senhas, tokens ou números completos de cartão.
- Não registrar conteúdo de anexos.

## 13. Checklist antes de ativar o backup

- [ ] `SPREADSHEET_ID` configurado e válido.
- [ ] `BACKUP_FOLDER_ID` configurado e válido.
- [ ] Pasta exclusiva, sem link público.
- [ ] Acionador criado pelo proprietário.
- [ ] Fuso do projeto e da planilha em `America/Sao_Paulo`.
- [ ] `BackupLog` criado.
- [ ] Prefixo e metadados definidos.
- [ ] Idempotência por data implementada.
- [ ] Dry-run da retenção executado.
- [ ] Backup manual de teste criado.
- [ ] Backup diário de teste executado.
- [ ] Restauração de teste executada.
- [ ] Alerta de falha configurado.
- [ ] Procedimento de exclusão revisado.
- [ ] Proprietário aprovou D10/D11.

## 14. Checklist periódico

### Diário

- [ ] Backup com status `SUCESSO`.
- [ ] Nenhum alerta de falha.

### Semanal

- [ ] Limpeza em dry-run ou execução controlada.
- [ ] Conferir lista de backups.
- [ ] Conferir espaço e permissões.

### Mensal

- [ ] Cópia externa.
- [ ] Revisar `BackupLog`.
- [ ] Revisar permissões da pasta.
- [ ] Revisar se manuais/pré-migração estão preservados.

### Trimestral

- [ ] Teste de restauração completo.
- [ ] Revisar RPO/RTO.
- [ ] Revisar runbook.
- [ ] Revisar política de retenção.

## 15. Decisões pendentes relacionadas

| ID | Decisão | Recomendação |
|---|---|---|
| **D10** | Política de retenção, lixeira e dry-run | 30 diários + 12 mensais; 7 recentes; lixeira 7 dias; dry-run; limpeza semanal |
| **D11** | Pasta e escopo de backup | Pasta dedicada; menor escopo viável; somente proprietário |

## 16. Critérios de aceite do backup

O backup será considerado aceito quando:

- [ ] A rotina diária rodar com sucesso por 7 dias consecutivos.
- [ ] A idempotência for comprovada (duas execuções no mesmo dia não duplicam).
- [ ] A retenção em dry-run listar corretamente o que seria excluído.
- [ ] A exclusão lógica for comprovada.
- [ ] Um backup manual for criado e preservado.
- [ ] Um backup pré-migração for criado e preservado.
- [ ] Um teste de restauração completo for aprovado.
- [ ] O RTO for medido e registrado.
- [ ] O proprietário aprovar D10/D11.

## 17. Declaração de estado

- Nenhuma rotina de backup foi implementada.
- Nenhuma pasta de backup foi criada.
- Nenhum acionador foi configurado.
- Nenhum teste de restauração foi executado.
- Este documento é **procedimento planejado**, não evidência de backup em operação.

## 18. Referências

- [Installable triggers — Apps Script](https://developers.google.com/apps-script/guides/triggers/installable)
- [Quotas — Apps Script](https://developers.google.com/apps-script/guides/services/quotas)
- [Drive service — Apps Script](https://developers.google.com/apps-script/reference/drive)
- [Relatório de Planejamento](relatorio-planejamento.md)
- [Segurança e Acesso](seguranca-e-acesso.md)
- [Decisões Pendentes](decisoes-pendentes.md)
- [Levantamento das Planilhas](levantamento-planilhas-referencia.md)
