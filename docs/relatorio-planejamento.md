# Relatório de Planejamento — Meu Controle Financeiro

> **Revisão 3 — 08/11/2026**
>
> **Status:** planejamento em revisão. A arquitetura geral está aprovada **como proposta**, mas **nenhuma implementação foi autorizada**. Nesta revisão não foram criados aplicativo, planilha de produção, migração ou implantação. As planilhas originais foram apenas lidas; nenhum arquivo original foi modificado.
>
> Esta revisão corrige erros factuais da revisão 2, reforça os sete pontos da segunda revisão e acrescenta as decisões D18–D23. A autorização final depende da aprovação das decisões listadas na seção 11 e detalhadas em [`decisoes-pendentes.md`](decisoes-pendentes.md).

## Parecer da terceira revisão

A revisão 2 já havia incorporado os sete pontos. A revisão 3 **não muda o escopo**: corrige o inventário e fecha lacunas que ainda permitiam interpretação ambígua.

### Os sete pontos, como ficam nesta revisão

1. **Orçamento planejado × realizado:** estrutura própria (`Orcamentos` + `OrcamentoItens`), separada de meta de faturamento e de previsão. A revisão 3 acrescenta regras explícitas de granularidade e alocação (seção 5.9) para impedir soma dupla.
2. **Planilhas de referência:** `Controle_de_Ganhos_Mensais.xlsx` **não existe** no ambiente. Todos os candidatos foram lidos em modo somente leitura, com nome, abas, campos, células e hash registrados. A revisão 3 corrige faixas de células e acrescenta a segunda variante da meta diária. Nenhum arquivo foi presumido como correto.
3. **Segurança:** `Session.getActiveUser().getEmail()` **não é garantia suficiente** em “executar como proprietário”. O controle primário é a configuração de acesso da implantação (`MYSELF`); o código é defesa em profundidade. A revisão 3 deixa explícito que o código **não lê** o campo `access` em tempo de execução e que a comprovação exige verificação manual do deploy + testes.
4. **Categorias e subcategorias:** ciclo de vida com criação, edição, desativação e preservação histórica; separação explícita entre categorias originais (`MIGRADA`), conjunto mínimo de sistema (`INICIAL`), sugestões (`SUGERIDA`) e itens do proprietário (`PERSONALIZADA`).
5. **Backup:** backup diário, janela real do acionador, exclusão lógica, retenção e teste de restauração. A revisão 3 acrescenta o limite de 6 minutos por execução, a política “somente lixeira na v1” e a definição de keeper mensal.
6. **Saldos e contas:** saldo inicial como fotografia na data de corte; saldo por conta; transferências, reservas e cartão sem duplicidade. A revisão 3 acrescenta regras para conta desativada com saldo, saldo negativo e reservas sem vínculo.
7. **Desenvolvimento:** etapas pequenas, planilha de teste separada da futura produção e escopo enxuto da v1. Nenhuma etapa foi iniciada.

### Correções factuais da revisão 3

| Onde | Revisão 2 dizia | Correto (verificado no arquivo) |
|---|---|---|
| Faixa das tabelas do `Resumo` | `B20:F44` e `H20:L44` | **`B24:F44`** e **`H24:L44`** (título na linha 24, cabeçalho na 25, totais na 26) |
| Linhas de categoria/receita | 27–44 | Despesas **28–35**; receitas **28–33**; 36–44 vazias |
| Células de diferença por linha | Fórmulas em `F27:F44` e `L27:L44` | Apenas `F27`, `F44`, `L27` e `L44` têm fórmula; **`F28:F35` e `L28:L33` são valores gravados** |
| Rótulo `Resumo!I16` | Fórmula correta | Fórmula referencia **`J15`** por engano; deveria referenciar `I15` |
| `Tabela dinâmica 2` | “6 linhas” | Aba sem **nenhuma célula preenchida**; não há resumo utilizável |
| Categorias importadas | Ora `INICIAL`, ora `MIGRADA` | Importadas = **`MIGRADA`**; conjunto mínimo criado pelo sistema = `INICIAL` |
| Meta diária | Uma variante | Existem **duas variantes** do arquivo `Outubro-Meta diária Uber Flash` |
| Manifesto de backup | Contagens no manifesto diário | Manifesto diário **leve**; contagens e totais ficam no relatório semanal de integridade |

### Correções relevantes em relação à revisão 1

- A revisão 1 tratava a segurança como se a existência de uma função `assertAutorizado()` bastasse. **Não basta.** A proteção real vem da configuração de acesso da implantação Google; o código apenas reforça.
- A revisão 1 não previa orçamento, apenas metas. **Orçamento e meta são conceitos diferentes** e agora têm estruturas separadas.
- A revisão 1 mencionava o arquivo `Controle_de_Ganhos_Mensais.xlsx`, que não foi encontrado. O relatório agora trabalha com **candidatos verificados**, sem escolher um deles por conta própria.
- A revisão 1 permitia “cartão” como tipo de conta. Isso distorce saldo e resultado; a recomendação agora é tratar cartão como **forma de pagamento**, não como conta.
- A revisão 1 dizia backup às 03:00 sem explicar a janela real dos acionadores. O horário agora é tratado como **janela de 03:00–04:00**, com idempotência e exclusão lógica.
- A revisão 1 previa categorias sem detalhar o que é inicial, o que é sugestão e como desativar sem perder histórico. Isso foi detalhado.

---

## 1. Escopo, premissas e decisões já definidas

### 1.1 Decisões já definidas pelo proprietário

Estas decisões **não estão em discussão** nesta revisão:

| Tema | Decisão |
|---|---|
| Moeda | Real brasileiro (BRL) |
| Fuso horário | `America/Sao_Paulo` |
| Acesso | Exclusivamente pela conta Google do proprietário, sem login próprio |
| Armazenamento | Nova planilha Google Sheets, preservando a planilha original |
| Hospedagem | Google Apps Script, sem VPS ou hospedagem externa |
| Interface | Aplicação web própria, responsiva, com dashboards |
| Anexos | Inicialmente, apenas links do Google Drive |
| Uso normal | Não editar diretamente as abas de dados; lançamentos pela interface |
| Repositório | Privado no GitHub |

### 1.2 Premissas técnicas

- Uso individual, sem multiusuário e sem multiempresa.
- Valores monetários armazenados em **centavos inteiros**; entrada e saída convertidas com regra de arredondamento explícita.
- Datas e horas no fuso `America/Sao_Paulo`; a planilha e o projeto do Apps Script devem usar o mesmo fuso.
- Interface em HTML/CSS/JavaScript puro, dentro do Google Apps Script, sem framework pesado e sem CDN externo.
- O termo “SaaS” neste projeto significa aparência e organização de produto profissional, não uma plataforma multiusuário.
- O sistema novo começa em uma planilha nova; a planilha original permanece intacta e somente leitura.

### 1.3 Fora de escopo da primeira versão

- Multiusuário, multiempresa e permissões granulares.
- Integração bancária automática, Open Finance ou conciliação automática de extrato.
- Leitura automática de comprovantes por OCR.
- Emissão de nota fiscal ou contabilidade fiscal completa.
- Aplicativo nativo, funcionamento offline e sincronização complexa.
- Controle de estoque.
- Recorrências complexas, metas avançadas e rentabilidade por projeto — candidatos à versão 1.1, não à primeira versão.
- Preenchimento automático de dados a partir da planilha antiga sem revisão humana.

---

## 2. Arquitetura recomendada

### 2.1 Visão geral

```text
Celular / Computador
   HTML + CSS + JavaScript (interface responsiva)
            |
            | google.script.run (chamadas assíncronas)
            v
Google Apps Script (projeto standalone)
   - doGet e camada de API
   - Segurança e verificação do proprietário
   - Regras de negócio, orçamento e cálculos
   - Validação, idempotência e auditoria
   - Rotinas automáticas (backup, recorrências futuras)
            |
            +--> Google Sheets (planilha nova)
            |      - cadastros
            |      - orçamento
            |      - lançamentos e liquidações
            |      - transferências e reservas
            |      - configurações e logs
            |
            +--> Google Drive
                   - pasta de backup
                   - links de comprovantes (sem upload pela aplicação)
```

### 2.2 Decisões técnicas recomendadas

| Item | Recomendação | Motivo |
|---|---|---|
| Tipo de projeto | Apps Script **standalone** | Separa código de dados e permite alternar entre planilha de teste e produção |
| Interface | HTML/CSS/JS puro, organizado em módulos | Menos dependências e maior estabilidade |
| Comunicação | `google.script.run` | Canal nativo entre a tela e o Apps Script |
| Acesso a dados | Camada de repositórios | Centraliza leitura/escrita e evita código repetido |
| Regras | Camada de serviços de domínio | Concentra cálculos e validações testáveis |
| Concorrência | `LockService` em todas as gravações | Evita gravações simultâneas |
| Desempenho | Leitura em lote, `CacheService` e paginação | Evita leitura célula por célula |
| Configuração | `PropertiesService` + aba `Configuracoes` | Guarda IDs e parâmetros sem fixar no código |
| Automações | Acionadores diários | Executam backup e rotinas futuras sem ação manual |
| Gráficos | Chart.js fixado localmente no projeto | Não depende de CDN e mantém versão controlada |
| Testes | Planilha de teste + funções puras testáveis | Evita testar rotinas destrutivas na base real |

### 2.3 Princípios que continuam valendo

1. **Previsão não é receita realizada.** Status e datas diferentes.
2. **Orçamento não é meta.** O orçamento é um plano aprovado; a meta é um objetivo aspiracional.
3. **Nunca apagar histórico.** Cancelamentos, correções e desativações são registrados.
4. **IDs únicos em todos os registros.** Nunca depender do número da linha.
5. **Liquidações e auditoria são append-only.** Correção = estorno auditado + novo registro.
6. **Validação no servidor.** A validação na tela é conveniência.
7. **Uma única fonte da verdade.** O dashboard é calculado, não redigitado.
8. **Nenhuma rotina destrutiva roda sem dry-run, confirmação e backup.**

---

## 3. Planilhas de referência: o que realmente existe

### 3.1 Método de verificação

Em 07 e 08/11/2026 foram verificados, em modo somente leitura:

- a pasta do projeto;
- `C:\Users\USER\Documents`;
- `C:\Users\USER\Downloads`;
- `C:\Users\USER\Desktop`;
- `C:\Users\USER\OneDrive`;
- `D:\` (incluindo `D:\Users\Gleber\Downloads`).

Foram procurados arquivos `.xlsx`, `.xls`, `.xlsm`, `.xlsb`, `.csv`, `.ods` e atalhos `.gsheet`. Também foram calculados hashes SHA-256 e extraídos nomes de abas e campos, sem abrir os arquivos para edição.

### 3.2 Resultado principal

**O arquivo `Controle_de_Ganhos_Mensais.xlsx` não foi encontrado em nenhum local pesquisado.** Portanto, a revisão 1 partia de um nome que não corresponde ao que existe no ambiente.

Também **não há unidade do Google Drive montada nem atalhos `.gsheet`** no ambiente. A futura planilha Google Sheets de produção ainda não existe.

### 3.3 Planilhas candidatas localizadas

| Arquivo | Local | Tamanho | Última modificação | Abas | Classificação |
|---|---|---:|---|---|---|
| `Orçamento mensal Empresa 10_2025.xlsx` | `C:\Users\USER\Downloads` | 20.091 bytes | 07/11/2026 03:57 | `Resumo`, `Transações`, `Tabela dinâmica 2` | **Candidato principal** a referência empresarial; não confirmado |
| `Orçamento mensal Empresa 09_2025.xlsx` | `D:\Users\Gleber\Downloads` | 13.258 bytes | 26/09/2025 10:16 | `Resumo`, `Transações` | Versão anterior do mesmo modelo; candidato secundário |
| `Orçamento Pessoal 03_2026.xlsx` | `C:\Users\USER\Downloads` | 13.610 bytes | 23/03/2026 17:58 | `Resumo`, `Transações` | Orçamento **pessoal**; não é referência empresarial |
| `Outubro-Meta diária Uber Flash.xlsx` | `D:\Users\Gleber\Downloads` | 17.463 bytes | 04/10/2025 00:51 | `Página1` | **Meta de faturamento**, não orçamento |
| `Outubro-Meta diária Uber Flash (1).xlsx` | `D:\Users\Gleber\Downloads` | 19.711 bytes | 04/10/2025 01:43 | `Página1` | Segunda variante da mesma meta; também não é orçamento |
| `1ZICa6l3hW4Iwi-V.xlsx` | `C:\Users\USER\Downloads` | 19.782 bytes | 09/04/2026 | `Clientes` | Lista de clientes de outro sistema; sem relação com o controle financeiro |

Hashes SHA-256 e detalhes completos estão em [`levantamento-planilhas-referencia.md`](levantamento-planilhas-referencia.md).

### 3.4 Estrutura do candidato principal (`Orçamento mensal Empresa 10_2025.xlsx`)

#### Aba `Resumo`

- Título e instruções nas linhas 2–5.
- `L8`: saldo inicial (0,00 no arquivo).
- `B24:F44`: tabela de **despesas** — título na linha 24, cabeçalho na 25 (`Planejado`, `Real`, `Diferença`), totais na 26, categorias em `B28:B35`.
- `H24:L44`: tabela de **receitas** — título na linha 24, cabeçalho na 25, totais na 26, labels em `H28:H33`.
- Totais: `D26` e `J26` são fórmulas `SUM`; `E26`, `F26`, `K26` e `L26` estão **gravados como valores**, não como fórmulas.
- Diferenças por linha: apenas `F27`, `F44`, `L27` e `L44` têm fórmula. **`F28:F35` e `L28:L33` são valores gravados**, o que pode deixar a diferença exibida desatualizada em relação a planejado e real.
- `I16` contém a fórmula `if(J15<0, ...)`; ela deveria referenciar `I15`. É um **defeito de fórmula** no arquivo original.
- Sparklines geradas pelo Google Sheets aparecem como `__xludf.DUMMYFUNCTION("SPARKLINE(...)")` no XLSX; não são fórmulas portáveis para o Excel.
- **Não há campo de mês/ano na aba.** O período está apenas no nome do arquivo.
- **Não há versão do orçamento, status de aprovação nem histórico.**

#### Aba `Transações`

- Despesas em `B4:E`: `Data`, `Valor`, `Descrição`, `Categoria`.
- Receitas em `G4:J`: `Data`, `Valor`, `Descrição`, `Categoria`.
- No arquivo 10/2025: 6 linhas de despesa e 6 de receita.
- No arquivo 09/2025: 11 linhas de despesa e 15 de receita.
- **Não há** ID, status, conta, forma de pagamento, vencimento, competência, projeto, comprovante nem auditoria.
- Datas são números de série do Excel/Sheets; valores são decimais.

#### Aba `Tabela dinâmica 2`

- Vazia. Não contém dados nem campos utilizáveis.

### 3.5 Categorias originais encontradas no candidato principal

**Despesas (aba `Resumo`, linhas 28–35):**

| Categoria original | Valor planejado (R$) |
|---|---:|
| Combustível | 950,00 |
| Canva | 24,90 |
| Alimentação | 200,00 |
| Internet+Celular | 185,00 |
| MEI | 82,00 |
| Next Go Saúde | 19,90 |
| Plataforma Next Go Card | 100,00 |
| Outros | 50,00 |
| **Total planejado** | **1.611,80** |

**Receitas (aba `Resumo`, linhas 28–33):**

| Categoria original | Valor planejado (R$) |
|---|---:|
| Lalamove | 100,00 |
| Uber Flash | 3.500,00 |
| Loggi | 100,00 |
| Mercado Envios Extra | 120,00 |
| Space-G | 1.000,00 |
| Outros | 0,00 |
| **Total planejado** | **4.820,00** |

### 3.6 Totais e inconsistências encontrados

No arquivo 10/2025:

- Despesas: planejado **1.611,80**; real **617,53**; diferença **994,27**.
- Receitas: planejado **4.820,00**; real **1.749,24**; diferença **−3.070,76**.

Inconsistências que o novo sistema deve corrigir:

1. **Sinal da diferença inconsistente:** nas despesas, a fórmula é `planejado − real`; nas receitas, é `real − planejado`. O novo modelo usará `realizado − planejado` para ambos, com rótulos claros.
2. **Totais reais gravados como valor:** `E26`, `F26`, `K26` e `L26` não são fórmulas; podem ficar desatualizados.
3. **Diferenças por linha parcialmente gravadas:** `F28:F35` e `L28:L33` são valores fixos, não fórmulas; só `F27`, `F44`, `L27` e `L44` calculam. O arquivo pode exibir diferença incoerente com planejado e real.
4. **Fórmula de rótulo com referência errada:** `I16` testa `J15` em vez de `I15`; o rótulo “Economia do mês”/“Despesa do mês” pode não corresponder ao valor exibido.
5. **Categoria usada para duas coisas:** “Uber Flash”, “Loggi” e “Space-G” são fontes de receita (atividades), não naturezas de receita. O novo modelo separa **atividade** de **categoria**.
6. **Sem identificadores:** não há ID de lançamento, conta ou categoria; qualquer reordenação de linhas quebra a rastreabilidade.
7. **Sem status:** não há distinção entre previsto, confirmado e realizado.
8. **Sem conta e forma de pagamento:** não é possível calcular saldo por conta.
9. **Sem vencimento nem competência:** não há contas a receber/pagar nem relatório de atraso.
10. **Um arquivo por mês:** o padrão `09_2025`, `10_2025` fragmenta o histórico e impede uma visão consolidada.
11. **Fórmulas não portáveis:** sparklines exportadas como `__xludf.DUMMYFUNCTION` não funcionam fora do Google Sheets.
12. **Aba de tabela dinâmica vazia:** não há nenhuma célula preenchida; não há resumo confiável ali.

### 3.7 Conclusão sobre o arquivo de referência

Não é possível afirmar qual arquivo é o correto. O `Orçamento mensal Empresa 10_2025.xlsx` é o **candidato mais recente** e o mais próximo de uma referência empresarial, mas:

- foi modificado em 07/11/2026 e pode ser uma cópia exportada, um rascunho ou um arquivo parcial;
- o `09_2025` tem mais transações e saldo inicial de R$ 1.000,00, enquanto o `10_2025` tem saldo inicial zero;
- o arquivo pessoal usa o mesmo modelo, mas não deve ser misturado com a empresa;
- o arquivo de meta diária é uma meta de faturamento, não um orçamento.

**Decisão necessária (D01):** o proprietário deve confirmar qual arquivo é a referência oficial e se ele é a versão viva ou uma cópia. Até essa confirmação, a Etapa 0 permanece bloqueada e nenhuma migração será feita.

---

## 4. Modelo de dados proposto

> Todos os nomes de abas e campos são propostas. O dicionário de dados definitivo só será fechado após a confirmação da planilha de referência.

### 4.1 Visão das abas

| Grupo | Abas |
|---|---|
| Configuração | `Configuracoes`, `VersaoEsquema` |
| Cadastros | `Categorias`, `Atividades`, `Contas`, `FormasPagamento`, `Cartoes`, `Projetos` (opcional), `Metas` (v1.1), `Reservas` |
| Orçamento | `Orcamentos`, `OrcamentoItens` |
| Movimento | `Lancamentos`, `Liquidacoes`, `Transferencias`, `MovimentosReserva`, `AjustesSaldo`, `ReconciliacoesSaldo` |
| Controle | `LogAuditoria`, `MigracaoMapa`, `BackupLog` |

### 4.2 Configuração

**`Configuracoes`**: `chave`, `valor`, `descricao`, `atualizado_em`, `atualizado_por`.

Parâmetros previstos:

- `MOEDA` = `BRL`
- `TIMEZONE` = `America/Sao_Paulo`
- `OWNER_EMAIL`
- `SPREADSHEET_ID`
- `BACKUP_FOLDER_ID`
- `BACKUP_RETENTION_DIAS`
- `BACKUP_RETENTION_MESES`
- `BACKUP_RETENTION_DRY_RUN`
- `DATA_CORTE`
- `VERSAO_ESQUEMA`
- `MODO_MANUTENCAO`

**`VersaoEsquema`**: `versao`, `aplicada_em`, `descricao`, `migracao_lote`, `hash_estrutura`.

### 4.3 Cadastros

#### `Categorias`

| Campo | Função |
|---|---|
| `id_categoria` | UUID |
| `tipo` | `RECEITA` ou `DESPESA` |
| `nome` | Nome exibido |
| `categoria_pai_id` | Vazio para categoria principal; preenchido para subcategoria |
| `nivel` | 1 ou 2 (máximo dois níveis) |
| `ativo` | `SIM`/`NAO`; desativar em vez de excluir |
| `origem` | `INICIAL`, `MIGRADA`, `SUGERIDA` ou `PERSONALIZADA` |
| `ordem` | Ordem de exibição |
| `cor` | Cor para gráficos |
| `criado_em` / `criado_por` | Auditoria |
| `atualizado_em` / `atualizado_por` | Auditoria |
| `desativado_em` / `desativado_por` | Auditoria da desativação |
| `motivo_desativacao` | Obrigatório ao desativar |
| `chave_normalizada` | Nome sem acentos/espaços, para impedir duplicidade entre irmãos |

#### `Atividades`

| Campo | Função |
|---|---|
| `id_atividade` | UUID |
| `nome` | Ex.: Uber Flash, Lalamove, Loggi, Space-G, Projeto Site X |
| `grupo` | Ex.: Transporte e entregas, Serviços digitais, Vendas online, Outros |
| `ativo` | Desativa sem apagar |
| `meta_mensal_centavos` | **Meta** opcional; não é orçamento |
| `cor` | Cor para gráficos |
| `observacao` | Campo livre |
| `criado_em` / `atualizado_em` | Auditoria |

#### `Contas`

| Campo | Função |
|---|---|
| `id_conta` | UUID |
| `nome` | Ex.: Conta principal, Carteira, Poupança, Dinheiro |
| `tipo` | `CONTA_CORRENTE`, `POUPANCA`, `CARTEIRA_DIGITAL`, `DINHEIRO`, `INVESTIMENTO`, `OUTRO` |
| `instituicao` | Nome da instituição, sem dados sensíveis |
| `saldo_inicial_centavos` | Saldo na data de corte |
| `data_saldo_inicial` | Data de referência do saldo |
| `incluir_no_disponivel` | Se entra no saldo disponível operacional |
| `ativa` | Desativa sem apagar |
| `ordem` / `cor` | Organização visual |
| `observacao` | Campo livre |
| `criado_em` / `atualizado_em` | Auditoria |

**Cartão de crédito não é conta nesta proposta.** Ver seção 7.5.

#### `FormasPagamento`

`id_forma`, `nome` (Pix, dinheiro, cartão de crédito, cartão de débito, transferência, boleto), `tipo`, `ativo`, `ordem`.

#### `Cartoes`

`id_cartao`, `nome`, `bandeira`, `limite_centavos`, `dia_fechamento`, `dia_vencimento`, `conta_pagamento_padrao_id`, `ativo`, `observacao`.

Não armazenar número completo do cartão, CVV ou senha.

#### `Projetos` (opcional na v1)

`id_projeto`, `nome`, `atividade_id`, `cliente`, `data_inicio`, `data_fim`, `orcamento_centavos`, `status`, `ativo`.

Projetos podem ser adiados para a v1.1 se não forem necessários ao orçamento por atividade/categoria. O campo `projeto_id` em lançamentos e itens de orçamento pode existir como opcional.

#### `Metas` (v1.1)

`id_meta`, `ano_mes`, `escopo` (`GERAL`, `ATIVIDADE`, `CATEGORIA`, `PROJETO`), `referencia_id`, `valor_meta_centavos`, `observacao`.

**Metas não alimentam o comparativo de orçamento.** Elas são um controle separado, aspiracional.

#### `Reservas`

`id_reserva`, `nome`, `objetivo`, `valor_meta_centavos`, `conta_vinculada_id` (opcional), `ativa`, `cor`.

### 4.4 Orçamento

#### `Orcamentos` — cabeçalho mensal

| Campo | Função |
|---|---|
| `id_orcamento` | UUID |
| `ano_mes` | `AAAA-MM` |
| `versao` | 1, 2, 3… |
| `status` | `RASCUNHO`, `APROVADO`, `SUBSTITUIDO`, `ENCERRADO` |
| `base_calculo` | `CAIXA` (recomendado) ou `COMPETENCIA` |
| `origem` | `WEB`, `COPIA_MES_ANTERIOR`, `MIGRACAO` |
| `descricao` | Texto livre |
| `criado_em` / `criado_por` | Auditoria |
| `aprovado_em` / `aprovado_por` | Auditoria |
| `observacoes` | Campo livre |
| `chave_idempotencia` | Evita duplicidade de versão |

Regra: **no máximo um orçamento `APROVADO` por `ano_mes` e `base_calculo`**. Aprovar uma nova versão marca a anterior como `SUBSTITUIDO`, preservando-a.

#### `OrcamentoItens` — linhas planejadas

| Campo | Função |
|---|---|
| `id_item_orcamento` | UUID |
| `id_orcamento` | Cabeçalho |
| `tipo` | `RECEITA` ou `DESPESA` |
| `atividade_id` | Obrigatório em receita; opcional em despesa (centro de custo) |
| `categoria_id` | Categoria principal |
| `subcategoria_id` | Opcional; se preenchida, deve pertencer à categoria |
| `projeto_id` | Opcional |
| `valor_planejado_centavos` | Valor planejado |
| `observacao` | Justificativa ou memória de cálculo |
| `ordem` | Ordenação |

Regras de integridade:

- O item deve usar as mesmas dimensões usadas nos lançamentos: tipo, atividade, categoria, subcategoria e projeto.
- Não pode haver **duas linhas sobrepostas** para o mesmo mês/tipo/atividade (por exemplo, orçar “Alimentação” e também “Alimentação > Mercado” para o mesmo período). Ou se orça a categoria, ou as subcategorias, nunca as duas somadas.
- O realizado **não é gravado** em `OrcamentoItens`; é calculado a partir das liquidações.
- O orçamento aprovado é imutável. Alterações exigem nova versão.

### 4.5 Movimento

#### `Lancamentos`

Campos principais:

`id_lancamento`, `tipo` (`RECEITA`/`DESPESA`), `data_competencia`, `data_vencimento`, `data_registro`, `atividade_id`, `categoria_id`, `subcategoria_id`, `projeto_id`, `descricao`, `cliente_plataforma`, `valor_previsto_centavos`, `status` (`PREVISTO`, `CONFIRMADO`, `CANCELADO`), `forma_pagamento_id`, `cartao_id`, `recorrencia_id`, `grupo_id`, `chave_idempotencia`, `comprovante_url`, `observacoes`, `motivo_cancelamento`, `categoria_nome_snapshot`, `atividade_nome_snapshot`, `criado_por`, `criado_em`, `atualizado_por`, `atualizado_em`.

Situação calculada (não digitada): `ABERTO`, `PARCIAL`, `QUITADO`, `VENCIDO`, `CANCELADO`.

#### `Liquidacoes`

`id_liquidacao`, `lancamento_id`, `data_liquidacao`, `valor_centavos`, `conta_id`, `forma_pagamento_id`, `comprovante_url`, `observacao`, `chave_idempotencia`, `criado_por`, `criado_em`.

Cada liquidação é imutável. Correção = estorno auditado + nova liquidação.

#### `Transferencias`

`id_transferencia`, `data`, `conta_origem_id`, `conta_destino_id`, `valor_centavos`, `observacao`, `chave_idempotencia`, `criado_por`, `criado_em`.

Transferência não é receita nem despesa; não entra no orçamento realizado.

#### `MovimentosReserva`

`id_movimento_reserva`, `reserva_id`, `data`, `tipo` (`APORTE`/`RESGATE`), `valor_centavos`, `conta_id` (opcional; obrigatória se a reserva tiver conta vinculada), `observacao`, `chave_idempotencia`, `criado_por`, `criado_em`.

Reserva é **separação virtual de dinheiro próprio**, não despesa e não movimentação de caixa.

#### `AjustesSaldo`

`id_ajuste`, `conta_id`, `data`, `valor_centavos` (positivo ou negativo), `motivo`, `reconciliacao_id`, `criado_por`, `criado_em`.

Ajuste de saldo entra no saldo da conta, mas **não** entra em receita, despesa, resultado ou orçamento realizado.

#### `ReconciliacoesSaldo`

`id_reconciliacao`, `conta_id`, `data`, `saldo_informado_centavos`, `saldo_calculado_centavos`, `diferenca_centavos`, `ajuste_id`, `observacao`, `criado_por`, `criado_em`.

### 4.6 Controle e auditoria

#### `LogAuditoria`

`id_log`, `data_hora`, `usuario`, `acao`, `entidade`, `id_registro`, `dados_antes_json`, `dados_depois_json`, `origem` (`WEB`, `AUTOMACAO`, `MIGRACAO`), `resultado` (`SUCESSO`/`NEGADO`/`ERRO`), `detalhe`.

#### `MigracaoMapa`

`id`, `arquivo_origem`, `aba_origem`, `linha_origem`, `id_destino`, `lote`, `data`, `observacao`.

#### `BackupLog`

`id_backup`, `data_hora`, `tipo` (`DIARIO`, `MENSAL`, `MANUAL`, `PRE_MIGRACAO`), `arquivo_id`, `nome_arquivo`, `tamanho_bytes`, `status` (`SUCESSO`/`FALHA`/`IGNORADO`), `mensagem`, `duracao_ms`, `versao_esquema`, `contagens_json`.

---

## 5. Orçamento planejado × realizado

### 5.1 Separação conceitual obrigatória

| Conceito | O que é | Entra no comparativo de orçamento? | Entra no resultado realizado? |
|---|---|---|---|
| **Orçamento** | Plano financeiro mensal aprovado, por atividade e categoria | É a base do comparativo | Não |
| **Meta de faturamento** | Objetivo aspiracional de vendas/faturamento | **Não** | Não |
| **Previsão** | Expectativa de caixa ainda não confirmada | Não; exibida separadamente | Não |
| **Confirmado em aberto** | Valor já certo, ainda não liquidado | Não; exibido como compromisso | Não |
| **Realizado** | Dinheiro efetivamente recebido ou pago (liquidações) | Sim, como realizado | Sim |
| **Reservado** | Dinheiro próprio separado por objetivo | Não | Não é despesa |
| **Transferência** | Movimentação entre contas | Não | Não é receita nem despesa |

> **Regra central:** orçamento é plano; meta é objetivo; previsão é expectativa; realizado é dinheiro liquidado. Nunca somar categorias diferentes no mesmo indicador.

### 5.2 Estrutura do orçamento

O orçamento mensal é composto por:

- **Cabeçalho** (`Orcamentos`): mês, versão, status, base de cálculo e aprovação.
- **Itens** (`OrcamentoItens`): uma linha por combinação de tipo, atividade, categoria, subcategoria e projeto.
- **Realizado calculado**: soma das liquidações do mês, nas mesmas dimensões.
- **Fora do orçamento**: lançamentos sem item correspondente; aparecem em seção própria, nunca são ignorados.

### 5.3 Base de cálculo recomendada: caixa

Para a primeira versão, recomenda-se **base de caixa**:

- O realizado do orçamento é a soma das **liquidações** cuja `data_liquidacao` cai no mês.
- A data de competência continua existindo para relatórios gerenciais, mas não é misturada no comparativo de caixa.
- Uma visão por competência pode ser adicionada depois, como relatório separado, sem alterar os valores da base de caixa.

Motivo: o arquivo original registra transações quando o dinheiro efetivamente entra ou sai; a base de caixa é a mais próxima do uso atual e evita misturar compras de cartão, boletos e recebimentos de meses diferentes.

### 5.4 Fórmulas de comparação

Para cada linha de orçamento:

- `valor_planejado` = soma dos itens de orçamento.
- `valor_realizado` = soma das liquidações correspondentes no mês.
- `variacao = valor_realizado − valor_planejado`.
- `variacao_percentual = valor_realizado / valor_planejado − 1` (quando o planejado for maior que zero).
- `consumo = valor_realizado / valor_planejado`.

Leitura:

- **Despesa:** variação positiva = gastou acima do planejado; negativa = economizou.
- **Receita:** variação positiva = recebeu acima do planejado; negativa = ficou abaixo.
- **Sem orçamento:** planejado = 0 e realizado > 0; exibir como “fora do orçamento”, sem divisão por zero.

Faixas de alerta sugeridas (configuráveis):

| Situação | Despesa | Receita |
|---|---|---|
| Dentro | consumo ≤ 90% | realizado ≥ 90% do planejado |
| Atenção | 90% < consumo ≤ 100% | 80% ≤ realizado < 90% |
| Estourado/Abaixo | consumo > 100% | realizado < 80% |

As faixas são apenas sinalização visual; o valor e o rótulo textual sempre aparecem.

### 5.5 Relatórios e telas de orçamento

- **Orçamento do mês:** planejado, realizado, variação e consumo por tipo.
- **Por atividade:** receita planejada × recebida; opcionalmente despesa por centro de custo.
- **Por categoria e subcategoria:** despesa planejada × paga; receita por natureza.
- **Fora do orçamento:** lançamentos sem linha planejada.
- **Evolução mensal:** planejado × realizado ao longo dos meses.
- **Drill-down:** clicar em uma linha e ver os lançamentos/liquidações que compõem o realizado.
- **Exportação CSV** e impressão/PDF pelo navegador.

No dashboard, o card principal passa a ser **“Orçamento do mês”** (planejado × realizado). O card “Meta do mês” é separado, opcional e pertence à v1.1; nunca é rotulado como orçamento.

### 5.6 Ciclo de vida do orçamento

1. **Criar rascunho:** em branco ou copiando o mês anterior.
2. **Revisar:** ajustar atividades, categorias e valores.
3. **Aprovar:** somente o proprietário; versão aprovada fica imutável.
4. **Acompanhar:** realizado recalculado a cada liquidação; sem digitação de realizado.
5. **Encerrar:** após o fechamento do mês; novas alterações exigem reabertura auditada ou nova versão.
6. **Substituir:** nova versão aprovada marca a anterior como `SUBSTITUIDO`, sem apagar.

### 5.7 Exemplo numérico

Orçamento de novembro:

| Tipo | Atividade | Categoria | Planejado | Realizado | Variação | Leitura |
|---|---|---|---:|---:|---:|---|
| Receita | Uber Flash | Entregas | 3.500,00 | 2.900,00 | −600,00 | Abaixo do plano |
| Receita | Space-G | Serviços digitais | 1.000,00 | 1.250,00 | +250,00 | Acima do plano |
| Despesa | Operação | Combustível | 900,00 | 1.020,00 | +120,00 | Estouro |
| Despesa | Administrativo | Internet+Celular | 185,00 | 185,00 | 0,00 | Dentro |

Resultado planejado: 4.500,00 − 1.085,00 = **3.415,00**.
Resultado realizado: 4.150,00 − 1.205,00 = **2.945,00**.
Isso é comparativo de orçamento; **não** é meta de faturamento.

### 5.8 O que não fazer

- Não lançar “meta” dentro de `OrcamentoItens`.
- Não gravar “realizado” como valor fixo no orçamento.
- Não comparar receita prevista com despesa planejada como se fosse resultado realizado.
- Não usar a data de competência para o realizado de caixa sem deixar claro.
- Não criar orçamento por projeto se o projeto não tiver a mesma dimensão nos lançamentos.

### 5.9 Granularidade e alocação do orçamento

O orçamento precisa ser comparável ao realizado **sem soma dupla**. Regras propostas:

**Receita**

- `atividade_id` é **obrigatório**: toda receita planejada pertence a uma atividade/fonte (Uber Flash, Lalamove, Loggi, Space-G etc.).
- `categoria_id` é **obrigatório** e representa a natureza da receita (Entregas, Serviços digitais, Vendas de produtos, Outros).
- `subcategoria_id` é opcional. Se usada, a linha representa a subcategoria, não a categoria-mãe.
- Uma linha de receita é a combinação única de `ano_mes + atividade + categoria + subcategoria + projeto (se houver)`.

**Despesa**

- `categoria_id` é **obrigatório**.
- `atividade_id` é opcional e funciona como **centro de custo** (ex.: operação, administrativo).
- `subcategoria_id` e `projeto_id` são opcionais.
- Uma linha de despesa é a combinação única de `ano_mes + atividade (se houver) + categoria + subcategoria + projeto (se houver)`.

**Regras contra soma dupla**

1. Para o mesmo mês, tipo, atividade e projeto, o orçamento usa **ou a categoria, ou as subcategorias**, nunca as duas somadas.
2. Se uma despesa é compartilhada entre atividades, o proprietário escolhe **uma** das opções:
   - lançar tudo em uma atividade/centro de custo; ou
   - dividir explicitamente em linhas por atividade, com percentuais que somem **100%** do valor original.
3. A soma das linhas de um orçamento deve fechar com o total planejado do mês; divergência bloqueia a aprovação.
4. O realizado segue exatamente as mesmas dimensões do item de orçamento. Lançamento sem dimensão correspondente aparece em “fora do orçamento”, não é rateado silenciosamente.
5. Rateio automático por percentual fixo fica **fora da v1**; na v1, a divisão é explícita e revisada pelo proprietário.

**O que não é orçamento**

- Meta de faturamento (`Metas`, v1.1) não cria `OrcamentoItens` e não entra no comparativo.
- Previsão de caixa não é orçamento; aparece em bloco separado.
- Valor “reservado” não é despesa planejada; é etiqueta sobre saldo.

---

## 6. Categorias e subcategorias

### 6.1 Estrutura escolhida

- **Dois níveis no máximo:** categoria principal e subcategoria.
- **Tipo obrigatório:** `RECEITA` ou `DESPESA`.
- **Subcategoria herda o tipo do pai.** Não é permitido misturar receita e despesa na mesma árvore.
- **Categorias e subcategorias nunca são excluídas.** São desativadas.
- **Histórico preservado:** lançamentos guardam o `id` e também um snapshot do nome da categoria/atividade no momento do registro.

**Origem e precedência dos itens de cadastro:**

| Origem | Quem cria | Quando existe | Pode editar? | Pode desativar? | Pode excluir? |
|---|---|---|---|---|---|
| `MIGRADA` | Rotina de migração, após D01/D02 | Só se houver importação aprovada | Sim | Sim | Não |
| `INICIAL` | Sistema, na criação da estrutura | Sempre; conjunto mínimo para operar | Sim | Sim | Não |
| `SUGERIDA` | Catálogo de sugestões, não aplicado automaticamente | Aparece como sugestão até o proprietário aceitar | Aceitar/renomear/ignorar | Não se aplica antes de aceitar | Não se aplica |
| `PERSONALIZADA` | Proprietário, pela interface | Quando ele cria ou aceita uma sugestão | Sim | Sim | Não |

Regras:

- A origem é **informativa e imutável**; aceitar uma sugestão cria um item `PERSONALIZADA` (ou marca a sugestão como aceita), sem reescrever o histórico.
- Nenhuma origem concede permissão especial: todas seguem as mesmas regras de desativação e preservação.
- Uma categoria `MIGRADA` renomeada continua `MIGRADA`; o nome original fica em `MigracaoMapa` e na auditoria.
- O conjunto `INICIAL` não substitui as categorias importadas; ele garante que o sistema funcione mesmo se D01/D02 resultarem em “nenhum arquivo de referência”.

### 6.2 Cadastro, edição e desativação

**Cadastrar**

- Nome obrigatório, único entre irmãos do mesmo tipo (comparação sem acentos e sem diferença de maiúsculas/minúsculas).
- Categoria pai opcional; se informada, deve ser do mesmo tipo, estar ativa e ser de nível 1.
- Ordem e cor opcionais.
- Origem registrada: `INICIAL`, `MIGRADA`, `SUGERIDA` ou `PERSONALIZADA`.

**Editar**

- Renomear é permitido; o histórico de nomes fica na auditoria.
- Mudar o tipo é bloqueado se a categoria já tiver lançamentos ou itens de orçamento.
- Mudar o pai é bloqueado se criar ciclo, se a categoria tiver filhos ou se já tiver lançamentos.
- Reordenar e alterar cor são permitidos.
- Toda edição gera registro em `LogAuditoria`.

**Desativar**

- Preencher `ativo = NAO`, `desativado_em`, `desativado_por` e `motivo_desativacao`.
- Não é permitido desativar uma categoria que ainda tenha subcategorias ativas sem antes tratar os filhos.
- A categoria desativada:
  - desaparece das listas de **novos** lançamentos e novos itens de orçamento;
  - continua aparecendo em relatórios históricos, com a marca “(inativa)”;
  - pode ser reativada pelo proprietário;
  - nunca é apagada.
- Lançamentos antigos continuam válidos e somando nos relatórios.

### 6.3 Categorias importadas (origem: `MIGRADA`)

Estas categorias vêm do candidato principal `Orçamento mensal Empresa 10_2025.xlsx` e, após a confirmação do arquivo, devem ser semeadas como **`MIGRADA`** — nunca como `INICIAL`. `INICIAL` é reservado ao conjunto mínimo que o próprio sistema cria para operar (por exemplo, “Outros”), mesmo sem arquivo de referência.

| Tipo | Categoria inicial | Pode renomear? | Pode desativar? | Pode excluir? |
|---|---|---|---|---|
| DESPESA | Combustível | Sim | Sim | Não |
| DESPESA | Canva | Sim | Sim | Não |
| DESPESA | Alimentação | Sim | Sim | Não |
| DESPESA | Internet+Celular | Sim | Sim | Não |
| DESPESA | MEI | Sim | Sim | Não |
| DESPESA | Next Go Saúde | Sim | Sim | Não |
| DESPESA | Plataforma Next Go Card | Sim | Sim | Não |
| DESPESA | Outros | Sim | Sim | Não |

As labels de receita do arquivo original — **Lalamove, Uber Flash, Loggi, Mercado Envios Extra, Space-G, Outros** — são, na prática, **atividades/fontes de receita**, não naturezas de receita. A recomendação é:

- migrá-las como **atividades** (`origem = MIGRADA`);
- criar categorias de receita iniciais mínimas: **Entregas**, **Serviços digitais**, **Vendas de produtos**, **Outros**;
- mapear cada atividade para uma categoria de receita.

Essa reclassificação **requer aprovação** (D03). A alternativa conservadora é manter as labels originais também como categorias de receita, mas isso perpetua a mistura entre atividade e natureza e prejudica os relatórios.

### 6.4 Sugestões já discutidas (origem: `SUGERIDA`)

Estas sugestões **não são criadas automaticamente**. Ficam disponíveis para o proprietário aceitar, renomear ou ignorar:

**Grupos de atividade**

- Transporte e entregas
- Cliente oculto
- Vendas online
- Space-G / Space Grid
- Criação de sites e projetos digitais
- Automações e outros serviços
- Outros

**Atividades sugeridas**

- Uber Flash
- Lalamove
- Loggi
- Mercado Envios Extra
- iFood
- On You
- Shopee
- Space-G
- Projetos de sites
- Automações
- Outros

**Subcategorias sugeridas (opcionais)**

| Categoria | Subcategorias sugeridas |
|---|---|
| Combustível | Posto, Manutenção, Lavagem |
| Alimentação | Refeições, Mercado |
| Internet+Celular | Internet, Celular |
| MEI | DAS, Taxas |
| Canva | Assinatura |
| Next Go Saúde | Plano |
| Plataforma Next Go Card | Taxa, Assinatura |
| Entregas | — (usar atividades: Uber Flash, Lalamove, Loggi, Mercado Envios) |
| Serviços digitais | Sites, Automações, Artes, Manutenção |
| Vendas de produtos | Produtos físicos, Produtos digitais |

**O que é personalizável:** todas as categorias, subcategorias e atividades podem ser criadas, renomeadas, reordenadas e desativadas pelo proprietário. O que não pode é excluir, mudar o tipo de uma categoria em uso ou apagar o histórico.

### 6.5 Migração das categorias originais

Regras:

1. Normalizar nome (trim, acentos, espaços duplicados).
2. Criar categorias de despesa com o mesmo nome e `origem = MIGRADA`.
3. Criar atividades para Lalamove, Uber Flash, Loggi, Mercado Envios Extra, Space-G e Outros; mapear para as categorias de receita aprovadas.
4. Categoria desconhecida ou ambígua vai para **Outros** com uma marcação `revisar = SIM` no mapa de migração; nunca descartar em silêncio.
5. Preservar o texto original em `MigracaoMapa`, mesmo quando o nome for renomeado.
6. O proprietário revisa o mapa antes de qualquer importação.

### 6.6 Interface de cadastro

- Abas “Receitas” e “Despesas”.
- Árvore com categoria principal e subcategorias.
- Ações: criar, editar, reordenar, desativar, reativar.
- Contagem de uso (“12 lançamentos, 2 orçamentos”) antes de desativar.
- Mensagem clara de que desativar não apaga.
- Filtro “mostrar inativas” nos relatórios.
- Nenhum botão de exclusão definitiva.

---

## 7. Saldos, contas, transferências e reservas

### 7.1 Cadastro do saldo inicial

O saldo inicial é uma **foto do dinheiro em uma data de corte**, não uma receita.

Procedimento:

1. Definir `DATA_CORTE` (por exemplo, o primeiro dia do mês de entrada em produção).
2. Para cada conta, o proprietário informa o saldo real na data de corte, conferido no banco/carteira.
3. Registrar `saldo_inicial_centavos` e `data_saldo_inicial`.
4. Registrar uma `ReconciliacoesSaldo` com o saldo informado e o saldo calculado.
5. Se houver diferença, criar um `AjusteSaldo` com motivo; **não editar o saldo inicial**.
6. Lançamentos anteriores à data de corte **não** são migrados como movimento; já estão refletidos no saldo inicial.

Alternativa: importar o histórico completo e definir saldo inicial na data mais antiga. Isso só deve ser feito se o proprietário quiser relatórios históricos e se os dados antigos estiverem completos. Caso contrário, o histórico fica na planilha original, somente leitura.

### 7.2 Fórmula do saldo de cada conta

```text
saldo_conta(c, t) =
    saldo_inicial(c)
  + liquidações de receita na conta c até t
  - liquidações de despesa na conta c até t
  + transferências recebidas na conta c até t
  - transferências enviadas da conta c até t
  + ajustes de saldo na conta c até t
```

**Não entram nessa fórmula:**

- movimentos de reserva (aportes/resgates);
- lançamentos previstos ou confirmados ainda não liquidados;
- compras de cartão ainda não pagas;
- metas e orçamento.

### 7.3 Saldos agregados

- `saldo_total_contas` = soma do saldo de todas as contas ativas.
- `saldo_disponivel` = soma das contas com `incluir_no_disponivel = SIM`.
- `reservado` = soma dos saldos das reservas ativas (aportes − resgates).
- `reservado_em_contas_disponiveis` = reservas vinculadas a contas com `incluir_no_disponivel = SIM` **mais** as reservas sem vínculo (a v1 presume que saem do dinheiro disponível).
- `disponivel_livre` = `saldo_disponivel` − `reservado_em_contas_disponiveis`.
- `projetado` = `saldo_total_contas` + contas a receber confirmadas − contas a pagar confirmadas, até a data escolhida.

Reserva vinculada a conta **não disponível** (investimento, poupança) não reduz o `disponivel_livre`; ela reduz apenas o saldo daquela conta. Reserva sem vínculo reduz o disponível por padrão, para não inflar o dinheiro livre. O proprietário pode indicar a conta de origem ao criar a reserva; se não indicar, o sistema trata como disponível e registra essa premissa.

O dashboard deve mostrar separadamente:

- saldo por conta;
- total em contas;
- reservado (com indicação de vinculadas e não vinculadas);
- disponível livre;
- a receber e a pagar;
- projeção (claramente rotulada).

**Conta desativada com saldo**

- Desativar conta **não apaga** e não zera o saldo.
- A desativação é bloqueada se o saldo calculado for diferente de zero, a menos que o proprietário:
  - transfira o saldo para outra conta; ou
  - registre um `AjusteSaldo` de encerramento com motivo; ou
  - confirme explicitamente “manter saldo residual” (a conta sai das listas de novos lançamentos, mas continua nos relatórios históricos e no total enquanto tiver saldo).
- Contas desativadas com saldo residual aparecem em seção própria do dashboard, nunca somem silenciosamente.
- Reativar é permitido; o histórico é preservado.

**Saldo negativo**

- A v1 bloqueia por padrão liquidação que deixe a conta negativa.
- O proprietário pode liberar a operação com confirmação explícita e motivo; o evento vai para `LogAuditoria` e o dashboard exibe alerta.
- Saldo negativo **não** é receita, não é reserva e não corrige saldo inicial. Se a causa for saldo inicial incompleto, a correção é `ReconciliacoesSaldo` + `AjusteSaldo`.
- Transferências e pagamentos de fatura seguem a mesma regra; não há exceção silenciosa.

### 7.4 Transferências

- Uma linha em `Transferencias` com origem e destino.
- Efeito: diminui a origem, aumenta o destino; **o total geral não muda**.
- Não tem categoria, não entra em receita/despesa, não entra no orçamento realizado.
- Validações: contas diferentes, valor > 0, saldo suficiente na origem (bloquear por padrão), idempotência.
- Transferência não é pagamento de despesa. Se for pagamento de fatura de cartão, o tratamento é o da seção 7.5.

### 7.5 Cartão de crédito

**Recomendação:** cartão é **forma de pagamento**, não conta.

Fluxo:

1. Compra no cartão → `Lancamento` de despesa com `forma_pagamento = CARTAO`, `cartao_id`, `data_competencia` e `data_vencimento` (vencimento da fatura). Status `CONFIRMADO`.
2. Enquanto não paga, a compra aparece em “a pagar” e no saldo em aberto do cartão.
3. Pagamento da fatura → uma ou mais `Liquidacoes` de despesa, saindo da conta bancária.
4. O saldo da conta bancária cai no pagamento; o resultado realizado (caixa) reconhece a despesa no pagamento.
5. O cartão não tem “saldo” próprio; o valor em aberto é calculado pela soma das compras confirmadas e não liquidadas.

Por que não modelar cartão como conta:

- compra no cartão não é transferência de dinheiro;
- pagar a fatura não é nova despesa;
- modelar como conta com saldo negativo distorce o saldo total e pode duplicar a despesa.

**Pagamento da fatura na v1**

- O pagamento da fatura é representado por **liquidações das compras de cartão**, não por uma despesa nova.
- É proibido lançar uma despesa genérica “pagamento de cartão” ou “fatura do cartão”: isso duplicaria a despesa já registrada na compra.
- Na v1, o proprietário seleciona as compras em aberto (filtro “cartão + vencimento”) e liquida uma a uma ou em seleção múltipla assistida. O valor total debitado da conta deve ser igual à soma das liquidações; diferença vira pendência explícita, não arredondamento silencioso.
- Pagamento parcial de fatura é permitido: cada compra pode ser liquidada total ou parcialmente, e o saldo em aberto do cartão é recalculado.
- Pagamento em lote com conciliação automática de fatura fica para a v1.1.
- A data da liquidação é a data de saída do dinheiro da conta; a data de competência da compra continua sendo a data da compra.
- O cartão não recebe `AjusteSaldo` como se fosse conta. Se houver divergência de fatura, ela é tratada como compra faltante/duplicada ou ajuste auditado na compra correspondente.

### 7.6 Reservas sem duplicidade

Reserva é uma **etiqueta virtual** sobre dinheiro que continua na conta.

- **Aporte:** aumenta `reservado`, diminui `disponivel_livre`; **não altera o saldo da conta**.
- **Resgate:** diminui `reservado`, aumenta `disponivel_livre`; **não altera o saldo da conta**.
- **Transferência física:** se o dinheiro for movido para outra conta, registrar uma `Transferencia` separada. A reserva continua sendo uma etiqueta; não registrar outro aporte.
- **Gastar dinheiro reservado:** operação atômica de `RESGATE` + `Liquidacao` da despesa. Assim, a reserva diminui e o caixa diminui; o disponível livre fica coerente.
- **Validação:** resgate não pode deixar a reserva negativa; aporte não pode ultrapassar o disponível livre (bloquear por padrão, com opção de alerta configurável).
- **Reserva vinculada a conta:** validar que o saldo reservado não ultrapassa o saldo disponível daquela conta.

Exemplo:

| Evento | Saldo contas | Reservado | Disponível livre |
|---|---:|---:|---:|
| Saldo inicial: conta A 1.000, conta B 500 | 1.500 | 0 | 1.500 |
| Aporte de 300 na reserva (conta A) | 1.500 | 300 | 1.200 |
| Transferência de 200 de A para B | 1.500 | 300 | 1.200 |
| Despesa de 100 paga da conta A | 1.400 | 300 | 1.100 |
| Despesa de 100 usando dinheiro reservado (resgate + pagamento) | 1.300 | 200 | 1.100 |

Observe: a transferência não altera o total nem o disponível livre; gastar reserva reduz caixa e reserva na mesma medida, mantendo o disponível livre.

### 7.7 Reconciliação

- Toda conta deve ter uma reconciliação na data de corte e, depois, pelo menos mensalmente.
- Comparar saldo calculado com saldo informado (extrato/conferência).
- Diferença → `AjusteSaldo` com motivo, nunca edição silenciosa.
- Relatório de contas com divergência, última reconciliação e diferença.
- Se a soma dos saldos das contas não fechar com o razão, o dashboard exibe alerta; não esconde a diferença.

---

## 8. Segurança e acesso

> A validação técnica completa, com matriz de testes e riscos residuais, está em [`seguranca-e-acesso.md`](seguranca-e-acesso.md).

### 8.1 Configuração de implantação

No Google Apps Script:

- **Executar como:** “Eu” (proprietário) → `executeAs = USER_DEPLOYING`.
- **Quem tem acesso:** “Somente eu” → `access = MYSELF`.
- **Nunca** usar `ANYONE` ou `ANYONE_ANONYMOUS`.

Manifesto esperado:

```json
{
  "timeZone": "America/Sao_Paulo",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "MYSELF"
  }
}
```

A configuração `MYSELF` é o **controle primário**: o Google bloqueia o acesso de qualquer conta que não seja a do proprietário antes de executar `doGet`. O link pode vazar; ainda assim, outra conta não entra.

### 8.2 O que a documentação oficial diz sobre `Session.getActiveUser().getEmail()`

A documentação oficial do Apps Script informa que:

- o método exige o escopo `https://www.googleapis.com/auth/userinfo.email`;
- o e-mail pode vir **vazio** quando a política de segurança não permite acessar a identidade;
- o e-mail **não está disponível** em contextos que executam sem a autorização do usuário, incluindo um **web app implantado como “executar como eu”** (autorizado pelo desenvolvedor, não pelo usuário);
- essas restrições **geralmente não se aplicam** quando o próprio desenvolvedor executa o script ou quando ele pertence ao mesmo domínio Google Workspace do usuário.

### 8.3 O que isso significa neste projeto

- No cenário proposto — o proprietário executa o próprio app, com acesso “Somente eu” — é **provável** que `getActiveUser().getEmail()` retorne o e-mail do proprietário.
- Isso **não é uma garantia contratual**. Precisa ser comprovado na implantação real, com teste.
- Portanto, a segurança **não pode** depender apenas de `assertAutorizado()`.
- O controle primário é a configuração `MYSELF`; o código é defesa em profundidade.
- Se o e-mail ativo vier vazio, **não** se deve abrir a aplicação para “qualquer pessoa” como compensação. A decisão é:
  - manter `MYSELF` como controle primário e usar `getEffectiveUser().getEmail()` para confirmar que o script roda sob a conta do proprietário; ou
  - exigir uma conta Google Workspace para ter identificação de e-mail mais confiável; ou
  - aceitar formalmente o risco residual, documentado.

### 8.4 Defesa em profundidade no código

1. `getEffectiveUser().getEmail()` deve ser igual ao `OWNER_EMAIL`. Em “executar como eu”, o usuário efetivo é o proprietário; isso confirma que a implantação está correta.
2. `getActiveUser().getEmail()`:
   - se preenchido, deve ser igual ao `OWNER_EMAIL`; caso contrário, negar;
   - se vazio, registrar o evento e aplicar a política aprovada (não permitir acesso anônimo).
3. Negar acesso por padrão (`fail closed`) quando a identidade não puder ser confirmada.
4. Registrar tentativas negadas em `LogAuditoria`, com data/hora, origem e resultado.
5. Nunca usar `getEffectiveUser()` para identificar o visitante; ele identifica o dono da execução.
6. Nunca confiar apenas na validação do navegador.
7. O código **não consegue ler** o campo `access` da implantação em tempo de execução; a configuração `MYSELF` é verificada no deploy, no manifesto e na matriz de testes. O código apenas observa os e-mails ativo e efetivo.

### 8.5 Matriz de testes obrigatória antes de considerar a segurança concluída

| # | Cenário | Resultado esperado | Evidência |
|---|---|---|---|
| 1 | Proprietário, navegador normal | App abre; e-mail ativo e efetivo registrados | Log de execução + `LogAuditoria` |
| 2 | Proprietário, janela anônima desconectada | Google pede login; app não abre | Captura + ausência de log de `doGet` |
| 3 | Segunda conta Google, janela anônima | Google nega; app não abre | Captura + ausência de log |
| 4 | Segunda conta com URL copiada | Google nega | Captura |
| 5 | URL `/dev` com segunda conta | Google nega | Captura |
| 6 | Após novo deploy, repetir 1–5 | Configuração preservada | Checklist + manifesto |
| 7 | Teste controlado com acesso “Anyone” em implantação de teste | Código nega; nenhum dado é exibido | Log de negação |
| 8 | Verificação de escopos OAuth | Somente escopos necessários | Tela de autorização + manifesto |
| 9 | Segunda conta com permissão de **edição no projeto** do Apps Script | Não abre o app `/exec` por `MYSELF`; porém **pode editar o código e criar outra implantação** — o projeto não deve ser compartilhado | Captura + revisão de compartilhamento do projeto |
| 10 | Verificação manual de “Implantar > Gerenciar implantações” | `executar como = Eu`, `quem tem acesso = Somente eu` | Captura de tela + checklist assinado |
| 11 | Conferência do `appsscript.json` versionado × manifesto do editor | Campo `webapp` idêntico ao implantado | Diff ou captura |

A segurança só é considerada concluída quando **todos** os testes passarem e a configuração de implantação for verificada. A existência de uma função de verificação no código, sozinha, não conclui a segurança.

**Ponto crítico:** compartilhar o **projeto** do Apps Script com outra conta é diferente de compartilhar a planilha. Quem tem edição no projeto pode alterar o código, criar uma implantação própria e contornar a verificação. O projeto deve ser acessível **somente** ao proprietário; o teste 9 existe para tornar esse risco visível.

### 8.6 Riscos residuais e mitigações

| Risco | Mitigação |
|---|---|
| Sessão do proprietário comprometida | Verificação em duas etapas/passkey, bloqueio de tela, sair da conta em dispositivos compartilhados |
| Link da implantação vazado | `MYSELF` bloqueia outras contas; se necessário, criar nova implantação e arquivar a antiga |
| Planilha compartilhada por engano | Compartilhar somente com o proprietário; desativar link; revisar permissões |
| Pasta de backup exposta | Pasta exclusiva do proprietário; sem link público |
| Repositório com dados reais | Repositório privado; `.gitignore`; nunca versionar planilhas/exportações |
| XSS na interface | Sanitizar textos; não usar `innerHTML` com dados do usuário; `XFrameOptionsMode.DENY` |
| Escopos excessivos | Menor conjunto possível; revisar `appsscript.json` |
| Extensões maliciosas no navegador | Manter navegador atualizado; evitar extensões desconhecidas |
| Recuperação da conta | E-mail/telefone de recuperação atualizados; 2FA |

### 8.7 Anexos e links do Drive

- A aplicação armazena apenas a URL do link; não faz upload nem download do arquivo.
- O arquivo deve permanecer com acesso restrito ao proprietário; não usar “qualquer pessoa com o link”.
- Validar que a URL é do Google Drive; não executar conteúdo externo.
- Se o link for revogado, o lançamento continua existindo; o anexo apenas fica indisponível.

### 8.8 Escopos OAuth

Escopos previstos, sujeitos à implementação e à revisão antes de cada deploy:

| Escopo | Uso | Observação |
|---|---|---|
| `spreadsheets` | Ler/escrever a planilha de produção | Necessário |
| `drive.file` **ou** `drive` | Criar cópias de backup e acessar arquivos criados pelo app | Preferir `drive.file`; `drive` só se a limitação operacional for comprovada (D11) |
| `userinfo.email` | `getActiveUser()` / `getEffectiveUser()` | Necessário para a verificação |
| `script.scriptapp` | Criar/gerenciar acionadores | Necessário para o backup diário |
| `script.send_mail` | Alerta de falha de backup | Avaliar alternativa; se não houver e-mail, não pedir |
| `script.external_request` | Chamadas externas | **Não usar na v1** |

Regras:

- Não pedir escopo que não seja usado.
- Revisar o manifesto e a tela de autorização antes de cada deploy.
- Não transmitir token OAuth ao navegador.
- A escolha entre `drive` e `drive.file` é a decisão **D11**; o código deve declarar apenas o escopo aprovado.

---

## 9. Backup e restauração

> O procedimento operacional detalhado está em [`runbook-backup-restore.md`](runbook-backup-restore.md).

### 9.1 Janela real dos acionadores

A documentação oficial informa que acionadores baseados em tempo podem ter o horário **levemente randomizado**: um acionador das 03:00 pode executar entre **03:00 e 04:00**, e o horário tende a se manter consistente nos dias seguintes.

Portanto:

- O backup diário será agendado para **03:00**, com execução esperada entre **03:00 e 04:00**.
- O nome do arquivo usará a **hora real da execução**, não a hora teórica.
- A idempotência será por **data no fuso `America/Sao_Paulo`**: se o backup do dia já existir com sucesso, uma segunda execução não cria duplicata.
- Se a execução falhar, o log registra a falha e o proprietário recebe alerta; uma execução manual pode ser feita pela interface.
- O backup não deve depender de estar “exatamente à meia-noite” nem de virar o dia.

**Limites de execução e quotas**

- Cada execução do Apps Script tem limite de **6 minutos**. A rotina diária (copiar o arquivo + gravar manifesto + registrar log) deve terminar bem abaixo disso; se passar de ~4 minutos, tratar como alerta de degradação.
- A conta consumidora tem limite diário de tempo de acionador (da ordem de **90 minutos/dia**) e o projeto tem limite de **20 acionadores por usuário**. A v1 usa **um** acionador diário e, no máximo, um semanal para integridade.
- A rotina diária **não** varre abas nem recalcula totais; isso estouraria o tempo e duplicaria trabalho. Contagens e somas ficam no relatório semanal/teste de restauração.
- Se a cópia nativa for grande ou lenta, medir a duração e registrar em `BackupLog.duracao_ms`; não aumentar a frequência sem rever o limite.
- Falha por timeout deve ser registrada como `FALHA`, não como sucesso parcial; o arquivo incompleto não conta como backup do dia.

### 9.2 Rotina diária

1. Abrir a planilha de produção pelo ID configurado.
2. Copiar o arquivo inteiro para a pasta de backup (cópia nativa do Drive).
3. Nomear `Controle_Financeiro_AAAA-MM-DD_HHmm` com a hora real.
4. Gravar um **manifesto leve** (data/hora real, versão do esquema, `SPREADSHEET_ID`, versão do código e tamanho). Contagens e totais-chave ficam para a verificação semanal ou o teste de restauração.
5. Registrar `BackupLog` com status, duração e IDs.
6. Em caso de falha, registrar e enviar e-mail ao proprietário.

A rotina deve ser **leve**: uma cópia de arquivo + um registro. Não ler todas as abas na rotina diária; verificações pesadas ficam para o teste de restauração ou uma rotina semanal.

### 9.3 Retenção

Proposta:

- **30 backups diários**;
- **12 keepers mensais**;
- **manter sempre os 7 mais recentes**;
- **nunca apagar** backups marcados como `MANUAL` ou `PRE_MIGRACAO`;
- **exclusão lógica**: mover para uma subpasta `_Lixeira_Backup`;
- **v1 sem exclusão definitiva automática**: nenhuma rotina apaga permanentemente; a purga da lixeira é manual, auditada e só após **7 dias**;
- **dry-run** obrigatório na primeira configuração: registrar o que seria excluído, sem excluir;
- executar a limpeza no máximo **uma vez por semana**, não a cada backup.

**Definição de keeper mensal**

- Keeper é o **primeiro backup `DIARIO` com sucesso de cada mês** (a data mais antiga do mês com status `SUCESSO`).
- Se o primeiro backup do mês falhou, o keeper é o primeiro backup com sucesso seguinte daquele mês.
- O keeper é mantido por **12 meses** e é imune à limpeza enquanto estiver na janela.
- Nunca apagar o último keeper de um mês, mesmo que a contagem de 12 seja ultrapassada; primeiro o proprietário decide, depois a limpeza.
- Se um mês não tiver nenhum backup com sucesso, isso é uma falha operacional registrada, não um mês “sem keeper” silencioso.

Regras de segurança da limpeza:

- Usar o `BACKUP_FOLDER_ID` configurado; nunca procurar pasta por nome.
- Só considerar arquivos que comecem com o prefixo exato `Controle_Financeiro_` e tenham metadados/manifesto do sistema.
- Nunca apagar arquivo que não tenha sido criado pela rotina.
- Nunca apagar o backup mais recente, o backup do dia ou o keeper mensal.
- Comparar a lista antes/depois e registrar em `BackupLog`.
- Se houver dúvida, não apagar.

### 9.4 O que o backup contém

- Cópia completa da planilha (todas as abas, inclusive configurações e logs).
- Manifesto leve com versão do esquema, data/hora, `SPREADSHEET_ID`, versão do código e tamanho.
- Relatório de integridade com contagens de linhas por aba e totais-chave, gerado na verificação semanal ou no teste de restauração.
- Código-fonte versionado no GitHub, com tag da versão implantada.
- Registro da versão do esquema e do mapa de migração.

O backup **não** substitui o GitHub nem o histórico de versões do Google Sheets; é uma camada adicional.

### 9.5 Teste de restauração

Frequência:

- **trimestral**;
- antes de mudança estrutural/migração;
- após incidente ou alteração relevante na rotina.

Procedimento:

1. Escolher um backup recente e um backup mensal antigo.
2. Copiar para uma pasta de teste `_Restauracao_Teste`; renomear `RESTORE_TEST_AAAA-MM-DD`.
3. **Não** abrir o backup original para edição.
4. Conferir:
   - nomes das abas e versão do esquema;
   - contagem de linhas por aba;
   - somas de liquidações de receita e despesa;
   - saldo das contas e reconciliações;
   - transferências (origem/destino);
   - reservas (aportes − resgates);
   - orçamento planejado e realizado;
   - unicidade de IDs e integridade referencial;
   - continuidade do `LogAuditoria`.
5. Comparar com o manifesto leve, com o relatório de integridade mais recente e com o `BackupLog`.
6. Apontar uma **implantação de teste** para a cópia restaurada e executar testes somente leitura.
7. Medir o tempo de restauração (RTO) e registrar no runbook.
8. Arquivar o resultado; descartar a cópia de teste após a revisão do proprietário.

Em desastre real:

- **não** restaurar por cima da produção;
- criar uma planilha nova, restaurar nela, validar, trocar o `SPREADSHEET_ID` e reimplantar;
- manter a produção antiga somente leitura por 30 dias.

### 9.6 Objetivos de recuperação

- **RPO:** perder no máximo cerca de 24 horas de dados.
- **RTO:** restaurar e voltar a operar em algumas horas.
- Revisar após o primeiro teste real.

### 9.7 Como evitar exclusão acidental

- Exclusão somente pela rotina de retenção, nunca por botão de “apagar” na interface.
- Exclusão lógica com carência de 7 dias.
- **Na v1, nenhuma purga definitiva automática:** a rotina só move para `_Lixeira_Backup`; apagar de vez é ação manual, auditada e confirmada.
- Dry-run e confirmação do proprietário antes de ativar a limpeza.
- Keeper mensal definido e imune; nunca apagar o último keeper de um mês.
- Pasta exclusiva, permissão somente do proprietário, 2FA.
- Prefixo e metadados obrigatórios; nada de exclusão por nome genérico.
- Backup manual antes de migrações, marcado e imune à retenção.
- Cópia externa mensal (XLSX/CSV) baixada e protegida por senha/criptografia.
- Histórico de versões do Google Sheets como camada extra, não como única proteção.

---

## 10. Desenvolvimento em etapas pequenas

### 10.1 Princípios

- Cada etapa entrega algo pequeno, testável e reversível.
- Testes sempre em **planilha separada** (`CF_Testes`) e **implantação de teste**, nunca na base de produção.
- Nenhuma etapa começa sem o aceite da anterior.
- Nenhuma rotina destrutiva é testada na base real.
- A planilha original permanece intocada durante todo o desenvolvimento.

### 10.2 Etapas propostas

| Etapa | Entrega | Teste principal | Gate |
|---|---|---|---|
| **0. Descoberta e referência** | Inventário das planilhas, dicionário de dados e mapa de migração | Conferir abas, campos, categorias e totais; owner confirma o arquivo oficial | **Bloqueada** até D01/D02 |
| **1. Esqueleto seguro** | Repositório privado, projeto Apps Script, página inicial, verificação de proprietário, implantação de teste | Matriz de segurança da seção 8.5 | Owner aprova configuração `MYSELF` e testes |
| **2. Estrutura de dados** | Criação idempotente das abas, campos, listas e configurações na planilha de teste | Rodar duas vezes sem duplicar; original intacta; validações corretas | Nenhum erro de schema |
| **3. Cadastros** | Categorias, subcategorias, atividades, contas, formas de pagamento, cartões e projetos (se aprovado) | Criar, editar, desativar, reativar; tipo/pai inválidos bloqueados; auditoria | Histórico preservado |
| **4. Saldos iniciais** | Cadastro de saldo inicial, data de corte, reconciliação e ajuste | Conferir saldo informado × calculado; ajuste não vira receita/despesa | Owner confirma saldos |
| **5. Lançamentos e liquidações** | Lançamento rápido/detalhado, edição, cancelamento, parciais, aging, anexo por link, idempotência | Cenário 1.000 + 400 + 600; duplo clique não duplica; cancelamento com liquidação bloqueado | Totais conferem |
| **6. Transferências e reservas** | Transferências, aportes, resgates, gasto de reserva atômico | Transferência não altera resultado; reserva não altera saldo da conta; sem duplicidade | Exemplos da seção 7 conferem |
| **7. Orçamento** | Cabeçalho, itens, versões, aprovação, comparativo planejado × realizado | Orçamento aprovado imutável; realizado recalculado; sem sobreposição de categoria/subcategoria | Relatório confere com lançamentos |
| **8. Dashboard e relatórios** | Cards, gráficos, filtros, drill-down, exportação CSV | Números do dashboard conferem com relatórios; previsão não aparece como realizado | Performance aceitável |
| **9. Backup e restauração** | Backup diário, retenção, log, runbook e teste de restauração | Backup manual, restauração em cópia, integridade, alerta de falha | Teste de restauração aprovado |
| **10. Endurecimento e mobile** | Revisão de segurança, desempenho, responsividade, mensagens e documentação | Checklist em celular/desktop; segunda conta; carga realista | Sem blockers |
| **11. Homologação e entrada** | Migração final, saldos validados, treinamento curto, congelamento da planilha antiga | Aceite do proprietário; backup imediatamente anterior; observação de 2 semanas | Autorização final |

### 10.3 Escopo da primeira versão

**Incluído:**

- Cadastros essenciais (categorias, atividades, contas, formas de pagamento, cartões).
- Saldos iniciais e reconciliação.
- Lançamentos, liquidações totais/parciais, contas a receber/pagar e aging.
- Transferências e reservas.
- Orçamento mensal planejado × realizado.
- Dashboard, relatórios essenciais e exportação CSV.
- Backup diário e restauração.
- Segurança e auditoria.

**Adiado para v1.1 (não implementar agora):**

- Metas de faturamento e comparativo de metas.
- Recorrências automáticas.
- Rentabilidade por projeto.
- Pagamento em lote de fatura de cartão.
- OCR, integração bancária, nota fiscal.
- Multiusuário, aplicativo nativo, offline.
- Previsões sofisticadas e cenários.

### 10.4 Estratégia de testes

- **Funções puras** (cálculos de saldo, orçamento, variação, reservas) testadas localmente com Node/Vitest, sem depender do Google.
- **Integração** testada na planilha `CF_Testes`, com dados anonimizados.
- **Testes de segurança** na implantação de teste, conforme matriz da seção 8.5.
- **Teste de restauração** trimestral.
- **Nenhum dado real** no repositório ou nos testes.
- IDs de planilha sempre em `PropertiesService`, nunca no código.

### 10.5 Repositório e versionamento

- Repositório privado no GitHub.
- `main` para produção, `develop` para testes, `feature/*` para etapas.
- `clasp` para sincronizar; nunca editar ao mesmo tempo no editor e no repositório.
- Tags `v0.1.0`, `v0.2.0` etc.; `CHANGELOG.md`.
- `.gitignore` com `.clasprc.json`, `node_modules/`, backups, `*.xlsx`, `*.csv`, `.env`, logs.
- Nenhum dado real, token ou senha no Git.

---

## 11. Decisões técnicas pendentes de aprovação

> A matriz completa, com opções e impactos, está em [`decisoes-pendentes.md`](decisoes-pendentes.md).

| ID | Decisão | Recomendação | Bloqueia? |
|---|---|---|---|
| **D01** | Qual arquivo é a referência oficial? | Confirmar `Orçamento mensal Empresa 10_2025.xlsx` **ou** indicar outro; não presumir | **Sim** |
| **D02** | O arquivo de referência é a versão viva ou uma cópia? Qual a data de corte e a política de histórico? | Tratar como somente leitura; saldo inicial na data de corte; histórico antigo fica na planilha original | **Sim** |
| **D03** | Taxonomia: labels de receita originais viram atividades + categorias novas? | Sim: atividades = plataformas; categorias = Entregas, Serviços digitais, Vendas, Outros | **Sim** |
| **D04** | Base do orçamento: caixa ou competência? | Caixa na v1; competência como relatório separado depois | **Sim** |
| **D05** | Fluxo de aprovação do orçamento | Rascunho → Aprovado → Encerrado; uma versão aprovada por mês; mudança = nova versão | Sim |
| **D06** | Cartão de crédito: conta ou forma de pagamento? | Forma de pagamento/cartão; não é conta | **Sim** |
| **D07** | Reservas: virtual ou conta separada? | Virtual, com vínculo opcional a conta; transferência física separada | **Sim** |
| **D08** | Quais contas entram no disponível? Reservas podem ser vinculadas? | Definir `incluir_no_disponivel` por conta; reserva vinculada valida saldo da conta | Sim |
| **D09** | Saldo inicial: data de corte e tratamento de diferenças | Data de corte única; ajuste auditado; não editar saldo inicial | **Sim** |
| **D10** | Política de backup: 30 diários + 12 mensais, lixeira de 7 dias, dry-run? | Sim; limpeza semanal; nunca apagar manual/pré-migração | Sim |
| **D11** | Pasta e escopo de backup: pasta dedicada; `drive` ou `drive.file`? | Pasta dedicada no Drive do proprietário; avaliar escopo mínimo viável | Sim |
| **D12** | Modelo de segurança: `MYSELF` é o controle primário; e se o e-mail ativo vier vazio? | `MYSELF` + `getEffectiveUser()`; testar `getActiveUser()`; se vazio, manter `MYSELF` e documentar risco ou exigir Workspace | **Sim** |
| **D13** | Tipo da conta Google do proprietário (Gmail/Workspace) e 2FA/passkey | Confirmar; 2FA obrigatório | Sim |
| **D14** | Escopo da v1: adiar metas, recorrências, projetos e pagamento em lote? | Sim; reduzir a v1 ao núcleo financeiro | **Sim** |
| **D15** | Anexos: somente links restritos do Drive? | Sim; sem upload; arquivo privado; app não busca conteúdo | Sim |
| **D16** | Repositório/tooling: nome, `clasp`, Node/Vitest | Confirmar; repositório privado; sem dados reais | Não |
| **D17** | Privacidade/LGPD: retenção de logs, nomes de clientes e descrições | Minimizar dados; documentar retenção; acesso somente do proprietário | Sim |
| **D18** | Procedência e ciclo de vida de categorias: `MIGRADA`, `INICIAL`, `SUGERIDA`, `PERSONALIZADA` | Aprovar a tabela de origem; sugestões não são criadas automaticamente; nada é excluído | Sim |
| **D19** | Granularidade e alocação do orçamento | Receita exige atividade e categoria; despesa exige categoria; sem sobreposição; rateio explícito somando 100%; sem rateio automático na v1 | **Sim** |
| **D20** | Exclusão de backups | v1 somente lixeira, sem purga automática; purga manual auditada após 7 dias; keeper = primeiro backup diário com sucesso do mês | Sim |
| **D21** | Conta desativada com saldo, saldo negativo e reserva sem vínculo | Bloquear desativação com saldo, salvo transferência/ajuste/confirmação; saldo negativo bloqueado por padrão; reserva sem vínculo reduz o disponível | Sim |
| **D22** | Pagamento de fatura de cartão na v1 | Liquidar as compras subjacentes; proibir despesa genérica “pagamento de cartão”; parcial permitido; lote na v1.1 | **Sim** |
| **D23** | Escopos OAuth e compartilhamento do projeto Apps Script | Menor escopo viável; `drive.file` preferido; projeto somente do proprietário; testes 9–11 da seção 8.5 | Sim |

**Nada será implementado antes da aprovação formal de D01–D23**, com prioridade para D01, D02, D03, D04, D06, D07, D09, D12, D14 e D19.

---

## 12. Critérios de aceite do planejamento

O planejamento será considerado aprovado quando:

- [ ] O proprietário confirmar o arquivo de referência oficial e a política de histórico (D01/D02).
- [ ] A taxonomia de categorias/atividades for aprovada (D03).
- [ ] A base e o ciclo do orçamento forem aprovados (D04/D05).
- [ ] O tratamento de cartão, reservas e saldos iniciais for aprovado (D06–D09).
- [ ] A política de backup e restauração for aprovada (D10/D11).
- [ ] O modelo de segurança e os testes forem aprovados (D12/D13).
- [ ] O escopo da v1 e os itens adiados forem aprovados (D14).
- [ ] As demais decisões (D15–D17) estiverem resolvidas.
- [ ] A procedência e o ciclo de vida das categorias forem aprovados (D18).
- [ ] A granularidade e as regras de alocação do orçamento forem aprovadas (D19).
- [ ] A política de exclusão de backups e o keeper mensal for aprovada (D20).
- [ ] As regras de conta desativada, saldo negativo e reserva sem vínculo forem aprovadas (D21).
- [ ] O tratamento do pagamento de fatura de cartão na v1 for aprovado (D22).
- [ ] Os escopos OAuth e a regra de não compartilhar o projeto forem aprovados (D23).
- [ ] O proprietário autorizar formalmente o início da Etapa 1.

Até lá, o status é **planejamento em revisão**, sem implementação.

---

## Anexo A — Mapa de migração proposto

| Origem (`Orçamento mensal Empresa 10_2025.xlsx`) | Destino no novo modelo | Regra |
|---|---|---|
| `Resumo!L8` — saldo inicial | `Contas.saldo_inicial_centavos` | Informar conta e data de corte; não é receita |
| `Resumo!B28:B35` — categorias de despesa | `Categorias` (tipo DESPESA) | Mesmo nome, `origem = MIGRADA`; revisar duplicidades |
| `Resumo!H28:H33` — labels de receita | `Atividades` + `Categorias` (tipo RECEITA) | Plataformas viram atividades; natureza vira categoria (D03) |
| `Resumo!D28:D35` — planejado despesa | `OrcamentoItens` (DESPESA) | Importar como orçamento histórico, se aprovado |
| `Resumo!J28:J33` — planejado receita | `OrcamentoItens` (RECEITA) | Importar como orçamento histórico, se aprovado |
| `Resumo!E26/F26/K26/L26` — totais reais | Não migrar como valores | Recalcular a partir das transações; conferir divergências |
| `Resumo!F28:F35` e `L28:L33` — diferenças por linha | Não migrar | São valores gravados, não fórmulas; recalcular no novo modelo |
| `Resumo!I16` — rótulo com fórmula errada | Não migrar | Referencia `J15` em vez de `I15`; não usar como regra |
| `Transações!B5:E` — despesas | `Lancamentos` + `Liquidacoes` | Status quitado; conta/forma a definir na migração |
| `Transações!G5:J` — receitas | `Lancamentos` + `Liquidacoes` | Status quitado; conta/forma a definir na migração |
| `Transações!D/I` — descrição | `Lancamentos.descricao` | Preservar texto original |
| `Transações!B/G` — data | `data_competencia` e `data_liquidacao` | Converter serial para data no fuso correto |
| `Tabela dinâmica 2` | Ignorar | Aba vazia |

**Totais de conferência do 10/2025:**

- Despesas realizadas: **R$ 617,53**.
- Receitas realizadas: **R$ 1.749,24**.
- Despesas planejadas: **R$ 1.611,80**.
- Receitas planejadas: **R$ 4.820,00**.

A migração só ocorre depois de o proprietário confirmar:
- qual arquivo é a referência;
- qual conta/forma usar para cada transação histórica;
- se o histórico será importado ou mantido apenas na planilha original.

---

## Anexo B — Glossário curto

| Termo | Significado |
|---|---|
| **Competência** | Mês a que o fato financeiro pertence |
| **Caixa** | Momento em que o dinheiro efetivamente entra ou sai |
| **Previsto** | Estimativa ainda não confirmada |
| **Confirmado** | Valor certo, ainda não liquidado |
| **Liquidado/realizado** | Dinheiro efetivamente recebido ou pago |
| **Orçamento** | Plano financeiro aprovado para o mês |
| **Meta** | Objetivo aspiracional; não é orçamento |
| **Reserva** | Separação virtual de dinheiro próprio por objetivo |
| **Transferência** | Movimentação entre contas; não é receita nem despesa |
| **Ajuste de saldo** | Correção de saldo por diferença de conferência; não é receita/despesa |

---

## Histórico de revisões

| Versão | Data | Mudanças |
|---|---|---|
| 1 | 07/11/2026 | Planejamento inicial; arquitetura, abas, telas, regras, segurança, backup e etapas |
| 2 | 08/11/2026 | Segunda revisão: orçamento planejado × realizado; inventário real das planilhas; validação técnica de `Session.getActiveUser()`; ciclo de categorias; backup com janela de acionadores e restauração; saldos/contas/transferências/reservas; escopo e etapas revisados; decisões pendentes; documentos de apoio criados (levantamento, segurança, decisões e runbook) |
| 3 | 08/11/2026 | Terceira revisão: correção das faixas `B24:F44`/`H24:L44`, das linhas 28–35/28–33, das células de diferença gravadas e do defeito `I16`; segunda variante da meta diária; procedência `MIGRADA` × `INICIAL`; regras de granularidade/alocação do orçamento; conta desativada, saldo negativo e reserva sem vínculo; pagamento de fatura na v1; escopos OAuth e compartilhamento do projeto; limite de 6 minutos, keeper mensal e v1 somente lixeira; decisões D18–D23 |
