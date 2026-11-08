# Parecer Técnico e Documento Consolidado da Segunda Revisão do Planejamento

> **Sistema:** Meu Controle Financeiro  
> **Data:** 08/11/2026 (Horário Local: 15:36:39 -03:00)  
> **Status:** Planejamento em Revisão — **Aguardando Aprovação Formal**  
> **Arquivos Originais:** Inalterados e preservados em modo somente leitura  
> **Ambiente de Produção / Código:** Nenhuma planilha criada, nenhum deploy configurado e nenhuma linha de código executada

---

## 1. Resumo Executivo e Decisões Já Definidas (Premissas Imutáveis)

As seguintes diretrizes e decisões já estão formalmente definidas e estabelecem as restrições arquiteturais para todas as fases do projeto:

* **Moeda Oficial:** Real brasileiro (`BRL`). Todos os valores monetários são internamente calculados e armazenados em **centavos inteiros** (`INTEGER`), eliminando imprecisões de arredondamento de ponto flutuante em JavaScript e planilhas.
* **Fuso Horário:** `America/Sao_Paulo`, unificado na planilha Google Sheets, nas rotinas do Google Apps Script e na interface web.
* **Autenticação e Acesso:** Exclusivamente pela conta Google do proprietário via infraestrutura nativa do Google. **Sem tela de login próprio, sem senhas locais e sem gestão de credenciais.**
* **Armazenamento de Dados:** Nova planilha Google Sheets criada a partir do zero, mantendo as planilhas históricas existentes intactas e preservadas.
* **Hospedagem e Backend:** Google Apps Script em projeto *standalone*, dispensando servidores externos, VPS, serviços em nuvem pagos ou Docker.
* **Interface do Usuário:** Aplicação web própria (*Web App* do Apps Script) desenvolvida em HTML5, CSS3 e JavaScript puro (Vanilla), totalmente responsiva para desktop e dispositivos móveis, com dashboards analíticos operacionais.
* **Anexos e Comprovantes:** Inicialmente, apenas links de arquivos previamente armazenados no Google Drive privado do proprietário, sem upload direto de binários pesados pela interface.
* **Regra Operacional de Uso:** Usuário nunca edita diretamente as abas da planilha; todos os lançamentos, edições e liquidações ocorrem exclusivamente pela interface web. As abas do Google Sheets atuam estritamente como banco de dados de retaguarda.
* **Controle de Versão:** Repositório privado no GitHub, controlado via Git e `clasp`.

---

## 2. Tratamento Detalhado dos 7 Pontos de Ajuste

### Ponto 1: Orçamento Planejado × Realizado

O orçamento mensal de receitas e despesas conta com uma modelagem dedicada e apartada, evitando qualquer confusão com previsões financeiras ou metas comerciais:

1. **Separação Conceitual Obrigatória:**
   * **Orçamento (Budget):** É o plano orçamentário aprovado para o mês civil, discriminado por atividade e categoria. Estabelece a régua oficial de teto de gastos e de previsão de ingressos.
   * **Meta de Faturamento (Comercial / Operacional):** É um objetivo aspiracional de vendas (ex.: faturar R$ 5.000,00 no mês com Uber Flash ou atingir 15 corridas/dia). Fica isolada na tabela `Metas` (v1.1) e **não** interfere no cálculo orçamentário financeiro.
   * **Previsão de Caixa:** É a expectativa de fluxo de caixa baseada em lançamentos em aberto (`PREVISTO` ou `CONFIRMADO`). Representa liquidez esperada, mas não dinheiro em caixa.
   * **Realizado:** É o montante financeiro efetivamente liquidado (`Liquidacoes`) dentro do período em regime de caixa (ou competência, conforme configuração).
2. **Estrutura de Tabelas:**
   * **`Orcamentos` (Cabeçalho Mensal):** `id_orcamento`, `ano_mes` (`AAAA-MM`), `versao`, `status` (`RASCUNHO`, `APROVADO`, `SUBSTITUIDO`, `ENCERRADO`), `base_calculo` (`CAIXA` na v1), `origem`, `aprovado_em`, `aprovado_por`.
     * *Regra de Integridade:* Apenas **um** orçamento com status `APROVADO` por mês e base de cálculo. Revisões orçamentárias geram uma nova versão que marca a anterior como `SUBSTITUIDO`, mantendo histórico auditável.
   * **`OrcamentoItens` (Linhas de Planejamento):** `id_item_orcamento`, `id_orcamento`, `tipo` (`RECEITA` / `DESPESA`), `atividade_id`, `categoria_id`, `subcategoria_id`, `valor_planejado_centavos`, `observacao`.
3. **Comparação por Atividade e Categoria:**
   * **Receitas:** Planejadas e confrontadas obrigatoriamente por **Atividade** (ex.: Uber Flash, Lalamove, Space-G) e **Categoria** (ex.: Entregas Urbanas, Serviços Digitais).
   * **Despesas:** Planejadas e confrontadas por **Categoria/Subcategoria** (ex.: Combustível, Alimentação, MEI) e opcionalmente por centro de custo/atividade.
   * **Realizado Dinâmico:** O valor realizado **não é preenchido manualmente** na tabela de orçamento; o sistema calcula dinamicamente somando as `Liquidacoes` registradas no mês com os mesmos IDs de atividade e categoria.
4. **Regra de Granularidade e Bloqueio de Soma Dupla (D19):**
   * É terminantemente proibido planejar simultaneamente uma categoria agregadora e suas subcategorias no mesmo orçamento (ex.: orçar R$ 1.000,00 em "Combustível" e R$ 400,00 em "Combustível > Gasolina"). O sistema bloqueia a duplicidade: ou o orçamento é feito na categoria-mãe ou discriminado nas subcategorias filhas.

---

### Ponto 2: Planilhas de Referência e Diagnóstico do Ambiente

Realizou-se a checagem no ambiente local para esclarecer a divergência de nomenclatura da versão anterior:

1. **Arquivo Inexistente:**
   * O arquivo `Controle_de_Ganhos_Mensais.xlsx` citado no primeiro relatório **não existe** em nenhuma unidade ou pasta do computador.
2. **Arquivos Reais Localizados e Catalogados (Modo Somente Leitura):**
   * `Orçamento mensal Empresa 10_2025.xlsx` (`Downloads` — 20.091 bytes, modificado em 07/11/2026): **Candidato principal** a modelo empresarial.
   * `Orçamento mensal Empresa 09_2025.xlsx` (`D:\Users\Gleber\Downloads` — 13.258 bytes, modificado em 26/09/2025): Candidato secundário (possui saldo inicial de R$ 1.000,00 e volume maior de transações: 11 despesas e 15 receitas).
   * `Orçamento Pessoal 03_2026.xlsx` (13.610 bytes): Controle estritamente **pessoal**, que não deve ser misturado com a pessoa jurídica.
   * `Outubro-Meta diária Uber Flash.xlsx` e `Outubro-Meta diária Uber Flash (1).xlsx`: Planilhas operacionais de **metas diárias de corridas** (km, faturamento diário, tempo online), não constituindo orçamento contábil.
   * `1ZICa6l3hW4Iwi-V.xlsx`: Cadastro de clientes/contatos externos.
3. **Estrutura, Abas e Inconsistências do Candidato Principal (`10_2025`):**
   * **Aba `Resumo`:**
     * Saldo inicial na célula `L8` = `0,00`.
     * Tabela de despesas na faixa `B24:F44` (linha 25: cabeçalho; categorias nas linhas 28–35; linha 26: totais).
     * Tabela de receitas na faixa `H24:L44` (linha 25: cabeçalho; fontes de receita nas linhas 28–33; linha 26: totais).
     * *Defeito Crítico de Fórmula:* As células de diferença `F28:F35` (despesas) e `L28:L33` (receitas) **são valores estáticos digitados**, e não fórmulas automáticas. Apenas as linhas 27 e 44 possuíam fórmulas. A célula `I16` testa incorretamente a célula `J15` em vez de `I15`.
     * *Inconsistência de Sinal:* Despesas usam `planejado - real`; receitas usam `real - planejado`. O novo sistema padroniza com lógica matemática limpa.
   * **Aba `Transações`:**
     * Despesas (`B4:E`) e Receitas (`G4:J`) possuem apenas quatro colunas: `Data`, `Valor`, `Descrição` e `Categoria`.
     * Não existem identificadores únicos, contas bancárias, meios de pagamento, datas de competência/vencimento, status ou links de comprovantes.
   * **Aba `Tabela dinâmica 2`:** Encontra-se completamente em branco.
4. **Garantia de Preservação:**
   * Nenhuma planilha original foi aberta para edição, modificada ou renomeada. A escolha formal da referência depende da aprovação da **Decisão D01/D02**.

---

### Ponto 3: Segurança e Validação Técnica do Acesso

Validação aprofundada dos mecanismos do Google Apps Script ao ser implantado como Web App:

1. **A Limitação Técnica de `Session.getActiveUser().getEmail()`:**
   * Se o Web App for publicado com configuração `"Execute as: Me"` e `"Who has access: Anyone"` (ou `"Anyone with Google Account"`):
     * Em contas do tipo `@gmail.com` (contas de consumidor), `Session.getActiveUser().getEmail()` **retorna uma string vazia `""`** por restrições nativas de privacidade da Google.
     * Portanto, **a segurança NÃO pode ser considerada resolvida por uma verificação em código do tipo `if (email == '...')`**, pois ela não funciona como barreira efetiva nesse cenário.
2. **A Garantia Primária: Camada de Infraestrutura Google (`access: "MYSELF"`):**
   * A proteção mandatória e inviolável é a configuração da implantação do Apps Script:
     * **`Execute as:`** `Me` (proprietário do script).
     * **`Who has access:`** **`Only myself` (Apenas eu)**.
   * Sob essa modalidade, a camada de Identity & Access Management (IAM) dos servidores do Google intercepta todas as requisições antes que o script seja chamado.
   * Se qualquer navegador ou usuário tentar acessar a URL sem estar autenticado exatamente na conta Google do proprietário, o Google bloqueia a requisição no gateway com erro HTTP 401/403.
3. **Defesa em Profundidade (Camadas Secundárias):**
   * **Camada de Script:** Verificação de `Session.getEffectiveUser().getEmail()`, que sempre identifica com segurança o proprietário da execução. Se `getActiveUser().getEmail()` for retornado, compara com o e-mail cadastrado em `Configuracoes`. Se vazio, registra no `LogAuditoria` e confia no gateway Google `MYSELF`.
   * **Isolamento da Planilha de Dados:** A nova planilha de dados Google Sheets permanecerá com compartilhamento configurado como **"Restrito — Somente você"**. Nenhum link público de planilha será criado.
   * **Proteção do Projeto Apps Script:** O projeto do Apps Script é mantido como privado na conta do proprietário, sem colaboradores.
   * **Autenticação em Dois Fatores (2FA):** Recomendação mandatória de 2FA ativado na conta Google do proprietário.

---

### Ponto 4: Estrutura de Categorias e Subcategorias

Ciclo de vida modelado para permitir evolução contínua sem quebrar relatórios históricos:

1. **Estrutura da Tabela `Categorias`:**
   * `id_categoria` (UUID v4).
   * `tipo` (`RECEITA` ou `DESPESA`).
   * `nome` (rótulo visível).
   * `categoria_pai_id` (vazio para nível 1; preenchido com o UUID do pai para subcategoria — máximo 2 níveis).
   * `nivel` (`1` = Principal, `2` = Subcategoria).
   * `ativo` (`SIM` / `NAO`).
   * `origem` (`MIGRADA`, `INICIAL`, `SUGERIDA`, `PERSONALIZADA`).
   * `cor`, `ordem`, `chave_normalizada` (sem acentos/espaços para evitar duplicações).
   * Auditoria: `criado_em`, `criado_por`, `desativado_em`, `motivo_desativacao`.
2. **Preservação Histórica e Desativação Lógica (*Soft Delete*):**
   * Categorias **nunca são excluídas fisicamente** do banco de dados se tiverem lançamentos ou itens de orçamento associados.
   * Quando uma categoria é desativada (`ativo = NAO`):
     * Fica oculta nos menus de seleção e formulários de novos lançamentos.
     * Permanece totalmente visível e calculável em todos os relatórios históricos, gráficos e orçamentos anteriores.
   * Além disso, a tabela `Lancamentos` armazena um snapshot (`categoria_nome_snapshot`), garantindo que se uma categoria for renomeada no futuro, o registro histórico documental original permaneça imutável.
3. **Classificação e Procedência:**
   * **`MIGRADA` (Categorias originais extraídas do arquivo existente):**
     * *Despesas:* `Combustível`, `Alimentação`, `Internet+Celular`, `MEI`, `Canva`, `Next Go Saúde`, `Plataforma Next Go Card`, `Outros`.
     * *Fontes de Receita originais:* `Uber Flash`, `Lalamove`, `Loggi`, `Mercado Envios Extra`, `Space-G`, `Outros`.
   * **`INICIAL` (Conjunto essencial provisionado no sistema):**
     * Categorias estruturais: `Receitas Operacionais`, `Despesas Operacionais`, `Tributos/MEI`, `Manutenção e Veículo`, `Tecnologia e Softwares`, `Taxas Bancárias`.
   * **`SUGERIDA` (Discutidas para expansão, inativas por padrão):**
     * Sugestões de boas práticas (ex.: subcategorias de veículo: *Troca de Óleo*, *Pneus*; custos administrativos: *Tarifas Pix*, *Contabilidade*). O proprietário decide se ativa.
   * **`PERSONALIZADA`:**
     * Qualquer nova categoria ou subcategoria livremente cadastrada pelo proprietário na interface web.

---

### Ponto 5: Backup Diário, Janela de Acionadores e Teste de Restauração

1. **Comportamento Real dos Acionadores do Google Apps Script:**
   * Acionadores orientados a tempo (`Time-driven Triggers`) no Google Apps Script **não disparam com precisão ao segundo**. Um agendamento configurado para as 03:00 executa dentro de uma janela probabilística entre **03:00 e 04:00**.
   * *Mitigação por Idempotência:* A rotina de backup gera uma chave baseada na data civil (`CF_BACKUP_AAAA-MM-DD`). Ao rodar, verifica na aba `BackupLog` se a cópia diária daquela data já foi realizada com sucesso. Redisparos da infraestrutura do Google não geram duplicatas.
   * *Tempo Limite de 6 Minutos:* A clonagem da planilha via método nativo do Google Drive (`DriveApp.getFileById().makeCopy()`) ocorre no nível do sistema de arquivos da nuvem e consome menos de 5 segundos, muito abaixo do teto de 6 minutos de runtime contínuo por execução em contas Google gratuitas.
2. **Prevenção contra Exclusão Acidental de Cópias:**
   * **Classificação por Rótulos de Retenção:**
     * `DIARIO`: Retido por 30 dias.
     * `MENSAL` (Keeper): A primeira cópia realizada em cada mês civil é rotulada como "cópia mensal definitiva" e retida por 12 meses (ou retenção permanente).
     * `PRE_MIGRACAO` ou `MANUAL`: Backups disparados antes de mudanças estruturais são **imunes a qualquer rotina de exclusão automática**.
   * **Exclusão em Duas Etapas (Apenas Lixeira na v1):**
     * A rotina automática de limpeza **não purga** arquivos definitivamente. Ela apenas move os arquivos expirados para a Lixeira do Google Drive (`file.setTrashed(true)`). O proprietário tem 30 dias de tolerância para recuperar qualquer arquivo caso necessário.
3. **Procedimento de Teste de Restauração (Runbook):**
   * O teste é executado exclusivamente em uma planilha temporária de teste (`CF_Restore_Test`), **sem qualquer interferência na planilha de produção**:
     1. Clona o backup mais recente para a planilha temporária de teste.
     2. Roda validação estrutural automática: confere todas as abas, cabeçalhos de colunas e calcula o hash SHA-256 do schema.
     3. Roda conferência matemática de saldos: reconstrói o saldo de todas as contas somando liquidações e transferências e compara com o saldo registrado das contas bancárias.
     4. Grava o relatório de conformidade no `LogAuditoria`.

---

### Ponto 6: Saldos, Contas, Transferências e Reservas sem Distorção

Engenharia de dados desenhada para impedir distorções de liquidez ou duplicidade de movimentações:

1. **Cadastro dos Saldos Iniciais:**
   * Registrado na tabela `Contas` na data de corte da implantação (`saldo_inicial_centavos`, `data_saldo_inicial`).
   * **Não é contabilizado como receita nem faturamento**, não afetando o DRE nem o orçamento do mês.
   * Eventuais divergências apuradas em conciliações futuras são ajustadas via tabela `AjustesSaldo` (com motivo e auditoria), preservando o saldo inicial histórico intacto.
2. **Fórmula Matemática do Saldo Bancário por Conta:**
   $$\text{Saldo Real da Conta } (C) = \text{Saldo Inicial}(C) + \sum \text{Receitas Liquidadas}(C) - \sum \text{Despesas Liquidadas}(C) + \sum \text{Transf. Entradas}(C) - \sum \text{Transf. Saídas}(C) + \sum \text{Ajustes}(C)$$
3. **Transferências entre Contas (Impacto Zero no Caixa Global):**
   * Registradas na tabela dedicada `Transferencias` com `conta_origem_id` e `conta_destino_id`.
   * A conta de origem é debitada e a conta de destino é creditada simultaneamente.
   * No consolidado da empresa, o impacto contábil é nulo ($+V - V = 0$).
   * Transferências **não geram registros em `Lancamentos`** e não impactam o orçamento de receitas e despesas.
4. **Reservas Financeiras (Separação Virtual de Patrimônio / "Cofrinhos"):**
   * Reservas são alocações conceituais de patrimônio para objetivos pré-definidos (ex.: Reserva de Emergência, IPVA/Manutenção, Capital de Giro).
   * A reserva **não movimenta dinheiro no banco**: o saldo bancário da conta continua idêntico.
   * O impacto ocorre exclusivamente no **Saldo Disponível Operacional**:
     $$\text{Saldo Disponível Total} = \sum \text{Saldo Real das Contas Operacionais} - \sum \text{Saldo Alocado em Reservas Ativas}$$
   * Movimentações de reservas (`MovimentosReserva`) registram aportes e resgates conceituais, sem gerar saídas de caixa fictícias.
5. **Tratamento do Cartão de Crédito:**
   * O cartão é classificado como **Forma de Pagamento / Meio**, e não como conta corrente bancária.
   * Compras no cartão registram a competência da despesa na categoria real (ex.: "Combustível") e comprometem o limite do cartão. O desembolso financeiro de caixa só ocorre quando a fatura é liquidada pela conta corrente, impedindo que o mesmo gasto seja computado duas vezes.

---

### Ponto 7: Desenvolvimento em Etapas Pequenas com Base de Teste Isolada

1. **Isolamento Completo entre Ambientes:**
   * Todo o desenvolvimento e validação ocorrerão em uma planilha de teste separada (`CF_Testes`).
   * A futura planilha de produção só será criada na fase final de homologação.
   * A planilha original de 2025 nunca será vinculada a nenhum script em modo de escrita.
2. **Escopo Estrito da Versão 1.0 (Zero Funcionalidades Supérfluas):**
   * **Incluído na v1.0:** Cadastros essenciais (Categorias, Atividades, Contas, Cartões, Formas de Pagamento), Saldos Iniciais e Conciliação, Lançamentos e Liquidações, Transferências e Reservas, Orçamento mensal planejado × realizado, Dashboard operacional responsivo, Rotina automática de backup diário e Trilha de auditoria e segurança.
   * **Postergado para a v1.1+:** Leitura de notas e comprovantes por OCR, conciliação automática bancária via Open Finance, emissão de nota fiscal, multiusuário, regras complexas de rateio e pagamento de faturas em lote.
3. **Roteiro Modular de Etapas (0 a 11):**
   * **Etapa 0:** Descoberta e validação da referência (aguardando aprovação de D01/D02).
   * **Etapa 1:** Esqueleto seguro (deploy `MYSELF`, bloqueio de acesso e tela inicial).
   * **Etapa 2:** Criação estruturada e idempotente das tabelas na planilha de teste.
   * **Etapa 3:** Módulo de cadastros (Categorias, Contas, Atividades) com preservação histórica.
   * **Etapa 4:** Saldos iniciais e conciliação.
   * **Etapa 5:** Lançamentos, liquidações e anexos por link do Google Drive.
   * **Etapa 6:** Transferências e Reservas financeiras virtuais.
   * **Etapa 7:** Orçamento mensal planejado × realizado por atividade e categoria.
   * **Etapa 8:** Dashboards operacionais e relatórios gerenciais.
   * **Etapa 9:** Automação de backup diário e teste de restauração.
   * **Etapa 10:** Homologação mobile e auditoria de segurança.
   * **Etapa 11:** Entrada em produção e congelamento da planilha antiga.

---

## 3. Matriz de Decisões Técnicas que Precisam de Aprovação

A tabela a seguir consolida as decisões técnicas catalogadas em [`docs/decisoes-pendentes.md`](file:///c:/Users/USER/Documents/Controle%20financeiro%20empresa/docs/decisoes-pendentes.md). O desenvolvimento da Etapa 1 permanece bloqueado até o posicionamento do proprietário:

| ID | Tema | Opções Principais | Recomendação Técnica | Bloqueia Início? |
|---|---|---|---|:---:|
| **D01** | **Arquivo de referência oficial** | A) `Orçamento mensal Empresa 10_2025.xlsx`<br>B) `Orçamento mensal Empresa 09_2025.xlsx`<br>C) Outro arquivo<br>D) Nenhum (iniciar limpo com data de corte) | **Opção D** se houver dúvidas sobre integridade; caso contrário, **Opção A** com validação explícita. | **SIM** |
| **D02** | **Versão viva × cópia e política de histórico** | A) Tratar como somente leitura, importar histórico antigo<br>B) Tratar como somente leitura e manter histórico na planilha antiga, iniciando na data de corte | **Opção B:** Saldo inicial na data de corte; histórico antigo intocado na planilha antiga. | **SIM** |
| **D03** | **Taxonomia das receitas originais** | A) Manter nomes como categorias de receita<br>B) Separar: plataformas viram `Atividades` (Uber Flash, etc.) e naturezas viram `Categorias` | **Opção B:** Permite cruzar orçamento de vendas por canal com a natureza do faturamento. | **SIM** |
| **D04** | **Base do orçamento** | A) Caixa (pelas liquidações)<br>B) Competência (pelo vencimento/fato) | **Opção A (Caixa)** para a v1.0, mais fiel à realidade financeira. | **SIM** |
| **D05** | **Ciclo de aprovação do orçamento** | A) Uma versão aberta e editável a qualquer hora<br>B) Rascunho → Aprovado → Encerrado (alteração exige nova versão auditada) | **Opção B:** Garante imutabilidade e rastreabilidade orçamentária. | SIM |
| **D06** | **Cartão de crédito** | A) Tratar como conta de banco<br>B) Tratar como forma de pagamento vinculada a limite | **Opção B:** Não distorce saldos disponíveis nem duplica despesas. | **SIM** |
| **D07** | **Tratamento de reservas** | A) Contas bancárias físicas separadas<br>B) Reservas virtuais que deduzem do saldo disponível | **Opção B:** Permite criar reservas por objetivo sem abrir dezenas de contas bancárias. | **SIM** |
| **D08** | **Contas no saldo disponível** | A) Todas as contas entram no disponível<br>B) Definir flag `incluir_no_disponivel` por conta | **Opção B:** Permite isolar investimentos de longo prazo ou dinheiro em trânsito. | SIM |
| **D09** | **Saldo inicial e data de corte** | A) Digitar e recalcular histórico retroativo<br>B) Data de corte única; divergências ajustadas via tabela de ajuste auditada | **Opção B:** Dá consistência contábil e auditoria limpa. | **SIM** |
| **D10** | **Política de retenção de backup** | A) Guardar 7 dias<br>B) 30 diários + 12 mensais (keepers) + lixeira de segurança | **Opção B:** Cobertura contra corrupção tardia de dados. | SIM |
| **D11** | **Pasta de backup no Drive** | A) Raiz do Drive<br>B) Pasta dedicada exclusiva no Google Drive do proprietário | **Opção B:** Segurança e facilidade de governança. | SIM |
| **D12** | **Modelo de segurança Apps Script** | A) Implantação `Anyone` com checagem de e-mail via JS<br>B) Implantação estrita `access: "MYSELF"` + defesa em profundidade | **Opção B:** Única imune a bypass em contas Gmail. | **SIM** |
| **D13** | **Tipo da conta Google e autenticação** | A) Conta comum sem 2FA<br>B) Conta Gmail/Workspace com 2FA / Passkey mandatório | **Opção B:** Elimina risco de invasão por credenciais vazadas. | SIM |
| **D14** | **Escopo da versão 1.0** | A) Incluir OCR, Open Finance e recorrências agora<br>B) Escopo enxuto estrito ao núcleo financeiro; adiar secundários para v1.1 | **Opção B:** Entrega rápida, estável e livre de bugs complexos. | **SIM** |
| **D15** | **Armazenamento de anexos** | A) Upload de arquivos direto na interface<br>B) Exclusivamente links de arquivos já salvos no Google Drive | **Opção B:** Evita cotas de payload do Apps Script e mantém arquivos privados. | SIM |
| **D18** | **Ciclo de vida e procedência de categorias** | A) Exclusão física permitida<br>B) Sem exclusão física: soft delete com tags `MIGRADA`, `INICIAL`, `SUGERIDA`, `PERSONALIZADA` | **Opção B:** Preserva 100% dos relatórios passados. | SIM |
| **D19** | **Granularidade orçamentária** | A) Permitir orçar mãe e filhas somadas livremente<br>B) Bloquear sobreposições: ou orça a categoria macro ou as subcategorias | **Opção B:** Elimina soma dupla nos totais orçados. | **SIM** |
| **D20** | **Eliminação de backups antigos** | A) Exclusão definitiva imediata por script<br>B) Envio para a Lixeira do Drive na v1, mantendo recuperação de 30 dias | **Opção B:** Previne acidentes operacionais. | SIM |
| **D21** | **Casos extremos de saldo e conta** | A) Permitir desativar conta com saldo positivo<br>B) Bloquear desativação de conta com saldo até que haja transferência ou ajuste | **Opção B:** Garante que dinheiro não fique oculto no sistema. | SIM |
| **D22** | **Pagamento de fatura de cartão na v1** | A) Criar uma despesa avulsa genérica "Fatura Cartão"<br>B) Liquidar as despesas individuais vinculadas à fatura | **Opção B:** Mantém a classificação real dos gastos (Combustível, Alimentação etc.). | **SIM** |

---

## 4. Documentação de Suporte na Pasta `docs/`

Toda a especificação técnica foi estruturada em documentos dedicados dentro do projeto:

* [`docs/relatorio-planejamento.md`](file:///c:/Users/USER/Documents/Controle%20financeiro%20empresa/docs/relatorio-planejamento.md): Relatório mestre completo do sistema com modelagem conceitual e lógica.
* [`docs/dicionario-de-dados.md`](file:///c:/Users/USER/Documents/Controle%20financeiro%20empresa/docs/dicionario-de-dados.md): Dicionário de dados formal com todas as tabelas, colunas, tipos e restrições.
* [`docs/levantamento-planilhas-referencia.md`](file:///c:/Users/USER/Documents/Controle%20financeiro%20empresa/docs/levantamento-planilhas-referencia.md): Inventário minucioso dos arquivos existentes no computador com hashes SHA-256 e auditoria de células.
* [`docs/seguranca-e-acesso.md`](file:///c:/Users/USER/Documents/Controle%20financeiro%20empresa/docs/seguranca-e-acesso.md): Estudo técnico dos mecanismos de autenticação, gateway Google IAM e matriz de segurança.
* [`docs/runbook-backup-restore.md`](file:///c:/Users/USER/Documents/Controle%20financeiro%20empresa/docs/runbook-backup-restore.md): Manual operacional com rotinas de acionador diário, política de lixeira e testes de restauração.
* [`docs/decisoes-pendentes.md`](file:///c:/Users/USER/Documents/Controle%20financeiro%20empresa/docs/decisoes-pendentes.md): Detalhamento exaustivo de cada decisão pendente de aprovação formal.

