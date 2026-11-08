# Dicionário de Dados — Meu Controle Financeiro

> **Versão:** 1.1 (Revisão Técnica de Engenharia)  
> **Data:** 08/11/2026 (Horário Local: 15:58:40 -03:00)  
> **Status:** Documento de Planejamento Consolidado — Sujeito à aprovação final de D01–D23  
> **Armazenamento Físico:** Planilha Google Sheets (cada entidade corresponde a uma aba/folha)  
> **Convenções Técnicas:**  
> - **Valores Monetários:** Armazenados estritamente em **centavos inteiros** (`INTEGER`). Exemplo: R$ 1.250,80 = `125080`. Nunca são aceitos valores negativos nos campos nominais de movimentação; estornos são registrados por tipo de evento dedicado.  
> - **Datas:** Padrão ISO 8601 formato civil (`AAAA-MM-DD`).  
> - **Timestamps de Auditoria:** Padrão ISO 8601 com timezone fixado em São Paulo (`AAAA-MM-DDTHH:mm:ss-03:00`).  
> - **Identificadores Únicos (PKs/FKs):** UUID v4 canônico em caixa baixa (`STRING(36)`).  

---

## 1. Visão Geral das Abas e Faseamento (v1.0 vs v1.1+)

Para assegurar uma entrega ágil, estável e livre de complexidades excessivas, as entidades estão categorizadas entre a **Primeira Versão (v1.0)** e as **Etapas Futuras (v1.1+)**:

| Grupo | Aba | Fase | Finalidade Operacional | Volume Estimado |
|---|---|:---:|---|---|
| **Configuração** | `Configuracoes` | **v1.0** | Parâmetros operacionais e chaves globais do sistema | ~20 linhas |
| | `VersaoEsquema` | **v1.0** | Histórico e hashes de migração da estrutura da planilha | ~10 linhas |
| **Cadastros** | `Categorias` | **v1.0** | Categorias e subcategorias com ciclo de vida e soft delete | 30 a 80 linhas |
| | `Atividades` | **v1.0** | Fontes de receita / canais de negócio / centros de custo | 5 a 20 linhas |
| | `Contas` | **v1.0** | Contas correntes bancárias, carteiras físicas e investimentos | 3 a 10 linhas |
| | `FormasPagamento` | **v1.0** | Meios de liquidação (Pix, dinheiro, boleto, cartão de crédito/débito) | 5 a 10 linhas |
| | `Projetos` | **v1.0** | Acompanhamento de receitas, despesas e margem por projeto | 5 a 30 linhas |
| | `Reservas` | **v1.0** | Cofrinhos e alocações de patrimônio (virtuais ou bancárias) | 3 a 10 linhas |
| | `Cartoes` | *v1.1* | Parâmetros de cartões, limites e dias de corte/fatura | 1 a 5 linhas |
| | `Metas` | *v1.1* | Metas operacionais/comerciais aspiracionais de faturamento/km | 12 a 50 linhas |
| **Orçamento** | `Orcamentos` | **v1.0** | Cabeçalho mensal do orçamento aprovado (plano financeiro) | 12 linhas/ano |
| | `OrcamentoItens` | **v1.0** | Linhas planejadas por atividade, categoria, subcategoria e projeto | 200 a 400 linhas/ano |
| **Movimento** | `Lancamentos` | **v1.0** | Contas a pagar/receber e provisões (competência e vencimento) | 500 a 2.500 linhas/ano |
| | `Liquidacoes` | **v1.0** | Movimentações efetivas de caixa (liquidações e estornos auditados) | 500 a 3.000 linhas/ano |
| | `Transferencias` | **v1.0** | Transferências entre contas bancárias internas próprias | 50 a 200 linhas/ano |
| | `MovimentosReserva` | **v1.0** | Aportes e resgates conceituais em reservas financeiras | 20 a 100 linhas/ano |
| | `AjustesSaldo` | **v1.0** | Ajustes auditados decorrentes de conciliação de extrato | Eventual |
| | `ReconciliacoesSaldo` | **v1.0** | Histórico periódico de conferência e fechamento de saldos | Mensal por conta |
| **Controle & Auditoria**| `LogAuditoria` | **v1.0** | Trilha append-only de segurança e alterações no sistema | Contínuo |
| | `BackupLog` | **v1.0** | Registro das cópias automáticas/manuais no Google Drive | 365 linhas/ano |
| | `MigracaoMapa` | **v1.0** | Rastreio documental de-para de dados importados da base antiga | Fixo |

---

## 2. Detalhamento das Abas (v1.0)

### 2.1 Grupo: Configuração

#### Aba `Configuracoes`
Armazena parâmetros de infraestrutura e negócio lidos em lote pelo backend.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `chave` | STRING(50) | NÃO | PK. Ex.: `MOEDA`, `TIMEZONE`, `OWNER_EMAIL`. |
| B | `valor` | STRING(255) | NÃO | Valor correspondente. Ex.: `BRL`, `America/Sao_Paulo`. |
| C | `descricao` | STRING(255) | SIM | Descrição da utilidade do parâmetro. |
| D | `atualizado_em` | TIMESTAMP | NÃO | Data/hora da última alteração. |
| E | `atualizado_por` | STRING(100) | NÃO | E-mail do proprietário que registrou a chave. |

---

#### Aba `VersaoEsquema`
Garante integridade referencial e validação estrutural contra corrupção de colunas.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `versao` | INTEGER | NÃO | Versão sequencial do schema (ex.: `1`). |
| B | `aplicada_em` | TIMESTAMP | NÃO | Data/hora de execução da migração. |
| C | `descricao` | STRING(255) | NÃO | Resumo das modificações introduzidas. |
| D | `hash_estrutura` | STRING(64) | NÃO | Hash SHA-256 do schema para validação no teste de restauração. |

---

### 2.2 Grupo: Cadastros

#### Aba `Categorias`
Estrutura hierárquica em dois níveis com suporte a desativação lógica (*soft delete*) e rastreamento de procedência.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_categoria` | UUID | NÃO | PK única. |
| B | `tipo` | ENUM | NÃO | `RECEITA` ou `DESPESA`. |
| C | `nome` | STRING(60) | NÃO | Rótulo exibido na interface. Ex.: `Combustível`. |
| D | `categoria_pai_id` | UUID | SIM | FK para `Categorias.id_categoria`. Nulo para nível 1. |
| E | `nivel` | INTEGER | NÃO | `1` (Macro) ou `2` (Subcategoria detalhada). |
| F | `ativo` | ENUM | NÃO | `SIM` ou `NAO`. Se `NAO`, oculta em novos registros mas mantém relatórios históricos. |
| G | `origem` | ENUM | NÃO | `MIGRADA`, `INICIAL`, `SUGERIDA` ou `PERSONALIZADA`. |
| H | `ordem` | INTEGER | NÃO | Ordem numérica de apresentação nos seletores (default 100). |
| I | `cor` | STRING(7) | SIM | Cor hexadecimal (ex.: `#2563EB`) para gráficos. |
| J | `chave_normalizada` | STRING(60) | NÃO | Nome em minúsculo e sem acentos (impede duplicidade entre irmãs). |
| K | `criado_em` | TIMESTAMP | NÃO | Auditoria de criação. |
| L | `criado_por` | STRING(100) | NÃO | E-mail do criador. |
| M | `atualizado_em` | TIMESTAMP | NÃO | Data da última alteração. |
| N | `desativado_em` | TIMESTAMP | SIM | Data em que foi arquivada. |
| O | `motivo_desativacao`| STRING(255) | SIM | Justificativa documental da inativação. |

---

#### Aba `Atividades`
Fontes de receita, plataformas operacionais e centros de atividade empresarial.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_atividade` | UUID | NÃO | PK única. |
| B | `nome` | STRING(60) | NÃO | Ex.: `Uber Flash`, `Lalamove`, `Loggi`, `Space-G`. |
| C | `grupo` | STRING(50) | SIM | Agrupamento: `Entregas e Logística`, `Serviços Digitais`, etc. |
| D | `ativo` | ENUM | NÃO | `SIM` ou `NAO`. |
| E | `cor` | STRING(7) | SIM | Cor de destaque nos relatórios e gráficos. |
| F | `observacao` | STRING(255) | SIM | Notas operacionais. |
| G | `criado_em` | TIMESTAMP | NÃO | Auditoria. |
| H | `atualizado_em` | TIMESTAMP | NÃO | Auditoria. |

---

#### Aba `Contas`
Contas bancárias, carteiras físicas e investimentos onde o dinheiro repousa.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_conta` | UUID | NÃO | PK única. |
| B | `nome` | STRING(50) | NÃO | Ex.: `Banco Inter PJ`, `Nubank PJ`, `Caixa Físico`. |
| C | `tipo` | ENUM | NÃO | `CONTA_CORRENTE`, `POUPANCA`, `CARTEIRA_DIGITAL`, `DINHEIRO`, `INVESTIMENTO`. |
| D | `instituicao` | STRING(50) | SIM | Nome do banco/instituição financeira (sem dados sensíveis). |
| E | `saldo_inicial_centavos`| INTEGER | NÃO | Saldo do extrato bancário na data de corte da implantação. |
| F | `data_saldo_inicial` | DATE | NÃO | Data de referência do saldo inicial (`AAAA-MM-DD`). |
| G | `incluir_no_disponivel`| ENUM | NÃO | `SIM` ou `NAO`. Define se o saldo compõe o Disponível Operacional. |
| H | `ativa` | ENUM | NÃO | `SIM` ou `NAO`. Bloqueia inativação se o saldo for diferente de zero. |
| I | `ordem` | INTEGER | NÃO | Ordem nos seletores de conta. |
| J | `cor` | STRING(7) | SIM | Cor visual do card de saldo. |
| K | `criado_em` | TIMESTAMP | NÃO | Auditoria. |
| L | `atualizado_em` | TIMESTAMP | NÃO | Auditoria. |

---

#### Aba `FormasPagamento`
Instrumentos de liquidação financeira.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_forma` | UUID | NÃO | PK única. |
| B | `nome` | STRING(40) | NÃO | Ex.: `Pix`, `Dinheiro`, `Cartão de Débito`, `Cartão de Crédito`, `Boleto`. |
| C | `tipo` | ENUM | NÃO | `A_VISTA`, `A_PRAZO`, `CARTAO_CREDITO`. |
| D | `ativo` | ENUM | NÃO | `SIM` ou `NAO`. |
| E | `ordem` | INTEGER | NÃO | Ordem nos formulários. |

---

#### Aba `Projetos` *(Recuperada para a v1.0)*
Permite acompanhar receitas, recebimentos, despesas, custos diretos e apurar a margem de contribuição por projeto.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_projeto` | UUID | NÃO | PK única. |
| B | `nome` | STRING(80) | NÃO | Nome do projeto ou contrato. Ex.: `Desenvolvimento App Cliente X`. |
| C | `cliente` | STRING(100) | SIM | Nome do cliente, contratante ou tomador. |
| D | `atividade_id` | UUID | SIM | FK para `Atividades.id_atividade` (vincula o projeto a uma linha de negócio). |
| E | `status` | ENUM | NÃO | `PLANEJADO`, `EM_ANDAMENTO`, `CONCLUIDO`, `CANCELADO`, `CONGELADO`. |
| F | `data_inicio` | DATE | SIM | Data de início prevista ou real. |
| G | `data_fim_prevista` | DATE | SIM | Previsão de entrega/fechamento. |
| H | `data_fim_real` | DATE | SIM | Conclusão efetiva. |
| I | `orcamento_receita_centavos`| INTEGER | SIM | Receita total esperada do projeto em centavos. |
| J | `orcamento_despesa_centavos`| INTEGER | SIM | Teto de despesas autorizadas para o projeto em centavos. |
| K | `ativo` | ENUM | NÃO | `SIM` ou `NAO`. |
| L | `observacao` | STRING(255) | SIM | Escopo ou notas contratuais. |
| M | `criado_em` | TIMESTAMP | NÃO | Auditoria de criação. |
| N | `criado_por` | STRING(100) | NÃO | E-mail do criador. |
| O | `atualizado_em` | TIMESTAMP | NÃO | Auditoria de atualização. |

---

#### Aba `Reservas`
Objetivos financeiros e caixinhas de alocação de patrimônio.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_reserva` | UUID | NÃO | PK única. |
| B | `nome` | STRING(50) | NÃO | Ex.: `Reserva de Emergência`, `IPVA e Seguro`, `Manutenção Moto`. |
| C | `objetivo` | STRING(255) | SIM | Descrição da destinação dos recursos. |
| D | `valor_meta_centavos` | INTEGER | SIM | Meta pretendida na caixinha (em centavos). |
| E | `conta_vinculada_id` | UUID | SIM | FK para `Contas.id_conta`. Se preenchida, amarra a reserva a uma conta física específica. |
| F | `ativa` | ENUM | NÃO | `SIM` ou `NAO`. |
| G | `cor` | STRING(7) | SIM | Cor de identificação visual. |

---

### 2.3 Grupo: Orçamento

#### Aba `Orcamentos`
Cabeçalho do orçamento mensal formalmente aprovado (plano financeiro).

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_orcamento` | UUID | NÃO | PK única. |
| B | `ano_mes` | STRING(7) | NÃO | Formato `AAAA-MM`. Ex.: `2026-11`. |
| C | `versao` | INTEGER | NÃO | Versão sequencial do mês (1, 2, ...). |
| D | `status` | ENUM | NÃO | `RASCUNHO`, `APROVADO`, `SUBSTITUIDO`, `ENCERRADO`. |
| E | `base_calculo` | ENUM | NÃO | `CAIXA` (padrão v1.0) ou `COMPETENCIA`. |
| F | `origem` | ENUM | NÃO | `WEB`, `COPIA_MES_ANTERIOR`, `MIGRACAO`. |
| G | `descricao` | STRING(255) | SIM | Descrição ou justificativa da versão orçamentária. |
| H | `criado_em` | TIMESTAMP | NÃO | Auditoria. |
| I | `criado_por` | STRING(100) | NÃO | Auditoria. |
| J | `aprovado_em` | TIMESTAMP | SIM | Data/hora do congelamento do orçamento. |
| K | `aprovado_por` | STRING(100) | SIM | E-mail do proprietário que aprovou. |

*Regra de Integridade:* Permite-se apenas **um** orçamento com `status = APROVADO` para a mesma combinação de `ano_mes` e `base_calculo`.

---

#### Aba `OrcamentoItens`
Linhas detalhadas do plano de receitas e despesas por atividade, categoria e projeto.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_item_orcamento`| UUID | NÃO | PK única. |
| B | `id_orcamento` | UUID | NÃO | FK para `Orcamentos.id_orcamento`. |
| C | `tipo` | ENUM | NÃO | `RECEITA` ou `DESPESA`. |
| D | `atividade_id` | UUID | SIM | FK para `Atividades`. Obrigatório em receitas; opcional em despesas diretas. |
| E | `categoria_id` | UUID | NÃO | FK para `Categorias.id_categoria` (nível 1). |
| F | `subcategoria_id`| UUID | SIM | FK para `Categorias.id_categoria` (nível 2). |
| G | `projeto_id` | UUID | SIM | FK para `Projetos.id_projeto`. Permite orçar linha destinada a projeto específico. |
| H | `valor_planejado_centavos`| INTEGER | NÃO | Valor planejado em centavos ($\ge 0$). |
| I | `observacao` | STRING(255) | SIM | Premissa de cálculo do valor orçado. |
| J | `ordem` | INTEGER | NÃO | Sequência de apresentação. |

*Regra Anti-Soma Dupla (D19):* Bloqueia-se orçar uma categoria agregada e simultaneamente criar itens com subcategorias dela no mesmo orçamento.

---

### 2.4 Grupo: Movimento

#### Aba `Lancamentos`
Títulos, faturas, provisões e contas a pagar/receber (regime de competência e vencimento).

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_lancamento` | UUID | NÃO | PK única. |
| B | `tipo` | ENUM | NÃO | `RECEITA` ou `DESPESA`. |
| C | `data_competencia` | DATE | NÃO | Mês a que o fato econômico pertence (`AAAA-MM-DD`). |
| D | `data_vencimento` | DATE | NÃO | Prazo para quitação financeira. |
| E | `data_registro` | DATE | NÃO | Data em que foi incluído no sistema. |
| F | `atividade_id` | UUID | SIM | FK para `Atividades`. Obrigatório em receitas; **permitido em despesas diretas** (custos de atividade) e nulo para despesas gerais da empresa. |
| G | `categoria_id` | UUID | NÃO | FK para `Categorias.id_categoria` (nível 1). |
| H | `subcategoria_id`| UUID | SIM | FK para subcategoria (nível 2). |
| I | `projeto_id` | UUID | SIM | FK para `Projetos.id_projeto`. Associa receitas e despesas a projetos específicos. |
| J | `descricao` | STRING(120) | NÃO | Descrição objetiva da transação. |
| K | `cliente_plataforma`| STRING(100) | SIM | Nome do passageiro, cliente ou plataforma parceira. |
| L | `valor_previsto_centavos`| INTEGER | NÃO | Montante nominal em centavos ($\ge 1$). |
| M | `status` | ENUM | NÃO | `PREVISTO`, `CONFIRMADO`, `CANCELADO`. |
| N | `forma_pagamento_id`| UUID | SIM | FK para `FormasPagamento.id_forma` esperada. |
| O | `chave_idempotencia`| STRING(64) | NÃO | Hash para impedir duplicatas decorrentes de duplo clique. |
| P | `comprovante_url` | STRING(255) | SIM | Link do Google Drive contendo o documento comprobatório. |
| Q | `observacoes` | STRING(255) | SIM | Notas gerais. |
| R | `motivo_cancelamento`| STRING(255) | SIM | Obrigatório caso o status seja `CANCELADO`. |
| S | `categoria_nome_snapshot`| STRING(60) | NÃO | Snapshot do nome da categoria congelado na data do lançamento. |
| T | `atividade_nome_snapshot`| STRING(60) | SIM | Snapshot do nome da atividade congelado na data do lançamento. |
| U | `projeto_nome_snapshot` | STRING(80) | SIM | Snapshot do nome do projeto congelado na data do lançamento. |
| V | `criado_em` | TIMESTAMP | NÃO | Auditoria de criação. |
| W | `criado_por` | STRING(100) | NÃO | E-mail do criador. |
| X | `atualizado_em` | TIMESTAMP | NÃO | Auditoria de atualização. |
| Y | `atualizado_por` | STRING(100) | NÃO | E-mail do atualizador. |

*Situação Dinâmica Calculada:*  
$$\text{Total Liquidado} = \sum \text{Liquidacoes}(L) - \sum \text{Estornos}(L)$$
- `ABERTO`: $\text{Total Liquidado} = 0$.
- `PARCIAL`: $0 < \text{Total Liquidado} < \text{Valor Previsto}$.
- `QUITADO`: $\text{Total Liquidado} \ge \text{Valor Previsto}$.
- `VENCIDO`: Não quitado e data atual > vencimento.
- `CANCELADO`: Status formal marcado como `CANCELADO`.

---

#### Aba `Liquidacoes` *(Estrutura Consistente de Estorno)*
Eventos reais de entrada e saída de caixa bancário. Preserva histórico auditável de forma append-only sem valores negativos.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_liquidacao` | UUID | NÃO | PK única. |
| B | `lancamento_id` | UUID | NÃO | FK para `Lancamentos.id_lancamento`. |
| C | `tipo_evento` | ENUM | NÃO | `LIQUIDACAO` (pagamento/recebimento normal) ou `ESTORNO` (reversão auditada). |
| D | `liquidacao_estornada_id`| UUID | SIM | FK para `Liquidacoes.id_liquidacao`. **Nulo se `LIQUIDACAO`; obrigatório se `ESTORNO`**. |
| E | `data_liquidacao` | DATE | NÃO | Data da efetivação no extrato bancário (`AAAA-MM-DD`). |
| F | `valor_centavos` | INTEGER | NÃO | Montante em centavos. **Sempre estritamente positivo ($\ge 1$)**. |
| G | `conta_id` | UUID | NÃO | FK para `Contas.id_conta` onde o recurso transitou. |
| F | `forma_pagamento_id`| UUID | NÃO | FK para `FormasPagamento.id_forma` efetiva. |
| I | `comprovante_url` | STRING(255) | SIM | Link do comprovante no Google Drive. |
| J | `observacao` | STRING(255) | SIM | Justificativa do pagamento ou motivo obrigatório do estorno. |
| K | `chave_idempotencia`| STRING(64) | NÃO | Hash de prevenção contra duplo processamento. |
| L | `criado_em` | TIMESTAMP | NÃO | Auditoria de criação. |
| M | `criado_por` | STRING(100) | NÃO | E-mail do operador. |

*Mecânica de Estorno Sem Contradição:*
1. Liquidações originais permanecem intactas (imutabilidade preservada).
2. O estorno é registrado como um novo evento com `tipo_evento = ESTORNO`, apontando para a liquidação original em `liquidacao_estornada_id` e com `valor_centavos` positivo.
3. As fórmulas de cálculo de saldo bancário e de total liquidado tratam o estorno subtraindo o valor correspondente.
4. Regra de validação: a soma de estornos vinculados a uma liquidação não pode ultrapassar o valor nominal da liquidação original.

---

#### Aba `Transferencias`
Movimentações entre contas bancárias internas da empresa (impacto zero no resultado global).

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_transferencia`| UUID | NÃO | PK única. |
| B | `data` | DATE | NÃO | Data do movimento (`AAAA-MM-DD`). |
| C | `conta_origem_id`| UUID | NÃO | FK para `Contas` (debita o saldo desta conta). |
| D | `conta_destino_id`| UUID | NÃO | FK para `Contas` (credita o saldo desta conta). |
| E | `valor_centavos` | INTEGER | NÃO | Montante transferido em centavos ($\ge 1$). |
| F | `observacao` | STRING(255) | SIM | Motivo da transferência. |
| G | `chave_idempotencia`| STRING(64) | NÃO | Previne transferências duplicadas. |
| H | `criado_em` | TIMESTAMP | NÃO | Auditoria. |
| I | `criado_por` | STRING(100) | NÃO | Auditoria. |

*Regra:* `conta_origem_id` e `conta_destino_id` devem ser obrigatoriamente distintas.

---

#### Aba `MovimentosReserva`
Aportes e resgates conceituais em reservas financeiras ("caixinhas").

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_movimento_reserva`| UUID | NÃO | PK única. |
| B | `reserva_id` | UUID | NÃO | FK para `Reservas.id_reserva`. |
| C | `data` | DATE | NÃO | Data do movimento (`AAAA-MM-DD`). |
| D | `tipo` | ENUM | NÃO | `APORTE` (reserva dinheiro) ou `RESGATE` (devolve ao disponível livre). |
| E | `valor_centavos` | INTEGER | NÃO | Valor em centavos ($\ge 1$). |
| F | `conta_id` | UUID | SIM | Conta de onde o recurso foi segregado (obrigatória se a reserva tiver conta vinculada). |
| G | `observacao` | STRING(255) | SIM | Finalidade do aporte/resgate. |
| H | `chave_idempotencia`| STRING(64) | NÃO | Previne duplo registro. |
| I | `criado_em` | TIMESTAMP | NÃO | Auditoria. |
| J | `criado_por` | STRING(100) | NÃO | Auditoria. |

---

#### Aba `AjustesSaldo`
Ajustes decorrentes de reconciliação de extrato com auditoria completa.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_ajuste` | UUID | NÃO | PK única. |
| B | `conta_id` | UUID | NÃO | FK para `Contas.id_conta`. |
| C | `data` | DATE | NÃO | Data do acerto (`AAAA-MM-DD`). |
| D | `valor_centavos` | INTEGER | NÃO | Montante em centavos (positivo para crédito, negativo para débito de ajuste). |
| E | `motivo` | STRING(255) | NÃO | Justificativa documental obrigatória da divergência. |
| F | `reconciliacao_id`| UUID | SIM | FK para `ReconciliacoesSaldo`. |
| G | `criado_em` | TIMESTAMP | NÃO | Auditoria. |
| H | `criado_por` | STRING(100) | NÃO | Auditoria. |

---

#### Aba `ReconciliacoesSaldo`
Histórico de fechamentos e conferências periódicas de saldo bancário.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_reconciliacao`| UUID | NÃO | PK única. |
| B | `conta_id` | UUID | NÃO | FK para `Contas.id_conta`. |
| C | `data` | DATE | NÃO | Data da conciliação (`AAAA-MM-DD`). |
| D | `saldo_informado_centavos`| INTEGER | NÃO | Saldo do extrato bancário oficial informado pelo proprietário. |
| E | `saldo_calculado_centavos`| INTEGER | NÃO | Saldo apurado pelo sistema até a data. |
| F | `diferenca_centavos`| INTEGER | NÃO | `saldo_informado - saldo_calculado`. |
| G | `ajuste_id` | UUID | SIM | FK para `AjustesSaldo` gerado caso a diferença tenha sido equalizada. |
| H | `observacao` | STRING(255) | SIM | Notas da reconciliação. |
| I | `criado_em` | TIMESTAMP | NÃO | Auditoria. |
| J | `criado_por` | STRING(100) | NÃO | Auditoria. |

---

### 2.5 Grupo: Auditoria e Controle

#### Aba `LogAuditoria`
Trilha imutável append-only de segurança de todas as operações realizadas no sistema.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_log` | UUID | NÃO | PK única. |
| B | `data_hora` | TIMESTAMP | NÃO | Horário oficial com fuso de São Paulo. |
| C | `usuario` | STRING(100) | NÃO | E-mail do usuário autenticado no Google. |
| D | `acao` | STRING(50) | NÃO | Ex.: `CRIAR_LANCAMENTO`, `ESTORNAR_LIQUIDACAO`, `APROVAR_ORCAMENTO`. |
| E | `entidade` | STRING(40) | NÃO | Nome da tabela afetada. |
| F | `id_registro` | STRING(36) | SIM | ID do registro afetado. |
| G | `dados_antes_json`| TEXT | SIM | Estado anterior em edições/cancelamentos. |
| H | `dados_depois_json`| TEXT | SIM | Estado novo gravado. |
| I | `origem` | ENUM | NÃO | `WEB`, `AUTOMACAO`, `MIGRACAO`. |
| J | `resultado` | ENUM | NÃO | `SUCESSO`, `NEGADO`, `ERRO`. |
| K | `detalhe` | STRING(255) | SIM | Mensagens de validação ou exceções. |

---

#### Aba `BackupLog`
Histórico de cópias automáticas e manuais no Google Drive.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id_backup` | UUID | NÃO | PK única. |
| B | `data_hora` | TIMESTAMP | NÃO | Disparo da rotina. |
| C | `tipo` | ENUM | NÃO | `DIARIO`, `MENSAL`, `MANUAL`, `PRE_MIGRACAO`. |
| D | `arquivo_id` | STRING(60) | SIM | ID do arquivo de backup no Google Drive. |
| E | `nome_arquivo` | STRING(120) | NÃO | Ex.: `CF_BKP_20261108_031200.xlsx`. |
| F | `tamanho_bytes` | INTEGER | SIM | Tamanho físico do backup. |
| G | `status` | ENUM | NÃO | `SUCESSO`, `FALHA`, `IGNORADO`. |
| H | `mensagem` | STRING(255) | SIM | Mensagem de retorno da rotina. |
| I | `duracao_ms` | INTEGER | SIM | Tempo total de processamento em milissegundos. |
| J | `versao_esquema`| INTEGER | NÃO | Versão do schema gravada no backup. |
| K | `contagens_json` | TEXT | SIM | Snapshot de linhas de cada aba para conferência de integridade. |

---

#### Aba `MigracaoMapa`
Mapeamento de de-para para conferência contábil caso transações legadas venham a ser importadas.

| Coluna | Campo | Tipo | Nulo? | Regra / Descrição |
|:---:|---|---|:---:|---|
| A | `id` | UUID | NÃO | PK única. |
| B | `arquivo_origem`| STRING(100) | NÃO | Nome da planilha legada. |
| C | `aba_origem` | STRING(40) | NÃO | Ex.: `Transações` ou `Resumo`. |
| D | `linha_origem` | INTEGER | NÃO | Número da linha original. |
| E | `id_destino` | UUID | NÃO | ID gerado no novo sistema. |
| F | `lote` | STRING(30) | NÃO | Identificador do lote migrado. |
| G | `data` | TIMESTAMP | NÃO | Data da importação. |
| H | `observacao` | STRING(255) | SIM | Ajustes efetuados. |

---

## 3. Entidades Reservadas para Etapas Futuras (v1.1+)

As entidades abaixo estão concebidas arquiteturalmente, mas **não serão ativadas na primeira entrega**:

### Aba `Cartoes` *(v1.1)*
Gestão avançada de ciclo de cartões corporativos, cálculo automático de fatura, compras parceladas e fechamento mensal. Na v1.0, pagamentos com cartão são operados via `FormasPagamento` e liquidados contra a conta corrente no pagamento da fatura, sem risco de duplicidade.

### Aba `Metas` *(v1.1)*
Metas comerciais e operacionais diárias/semanais (faturamento bruto aspiracional, km rodados, corridas por dia, tempo online). Mantidas fora do orçamento financeiro para não distorcer o teto de gastos contábil.

---

## 4. Engenharia de Saldos e Reservas: Exemplos Práticos

A relação entre Saldo Real, Saldo Reservado e Saldo Disponível Operacional elimina duplicidades e distorções:

### Fórmulas Matemáticas:
1. **Saldo Real de uma Conta $(C)$:**
   $$\text{Saldo Real}(C) = \text{Saldo Inicial}(C) + \sum \text{Receitas Liquidadas}(C) - \sum \text{Despesas Liquidadas}(C) - \sum \text{Estornos Receita}(C) + \sum \text{Estornos Despesa}(C) + \sum \text{Transf. Entradas}(C) - \sum \text{Transf. Saídas}(C) + \sum \text{Ajustes}(C)$$
2. **Saldo Reservado Total:**
   $$\text{Saldo Reservado} = \sum \text{Aportes Ativos em Reservas} - \sum \text{Resgates Ativos de Reservas}$$
3. **Saldo Disponível Operacional Livre:**
   $$\text{Disponível Livre} = \sum \text{Saldo Real das Contas Operacionais (incluir\_no\_disponivel = SIM)} - \text{Saldo Reservado}$$

---

### Exemplo 1: Reserva Virtual (Sem Transferência Física de Banco)
*O dinheiro permanece na mesma conta bancária, mas parte dele é carimbada para uma finalidade.*

* **Situação Inicial:**
  * Conta *Banco Inter PJ* com Saldo Real = **R$ 6.000,00**.
  * Nenhuma reserva criada.
  * **Saldo Total da Empresa:** R$ 6.000,00.
  * **Saldo Reservado:** R$ 0,00.
  * **Disponível Operacional Livre:** R$ 6.000,00.
* **Operação:** O proprietário cria a reserva virtual *"Reserva de Emergência"* e registra um aporte virtual de **R$ 2.000,00** vinculado à conta *Banco Inter PJ*.
* **Resultado:**
  * Saldo Real no extrato do *Banco Inter PJ*: **R$ 6.000,00** (o extrato bancário não muda!).
  * Saldo Alocado em Reservas: **R$ 2.000,00**.
  * **Saldo Disponível Operacional Livre:** R$ 6.000,00 − R$ 2.000,00 = **R$ 4.000,00**.
  * *Conclusão:* O sistema impede que o proprietário gaste os R$ 2.000,00 nas operações cotidianas, embora o dinheiro continue no mesmo banco. Não houve movimentação de caixa nem saída contábil.

---

### Exemplo 2: Reserva com Transferência Física para Conta Poupança/Investimento
*O dinheiro é efetivamente transferido para outra conta bancária dedicada.*

* **Situação Inicial:**
  * Conta *Banco Inter PJ* (Operacional, `incluir_no_disponivel = SIM`): Saldo Real = **R$ 6.000,00**.
  * Conta *Nubank Poupança* (Investimento/Reserva, `incluir_no_disponivel = NAO`): Saldo Real = **R$ 0,00**.
  * **Disponível Livre Inicial:** R$ 6.000,00.
* **Operação:**
  1. O proprietário transfere **R$ 2.000,00** do *Banco Inter PJ* para o *Nubank Poupança* (registrado na aba `Transferencias`).
* **Resultado:**
  * Saldo Real no *Banco Inter PJ*: R$ 6.000,00 − R$ 2.000,00 = **R$ 4.000,00**.
  * Saldo Real no *Nubank Poupança*: R$ 0,00 + R$ 2.000,00 = **R$ 2.000,00**.
  * **Saldo Total Bruto da Empresa:** R$ 4.000,00 + R$ 2.000,00 = **R$ 6.000,00** (conservação de valor).
  * **Disponível Operacional Livre:** R$ 4.000,00 (apenas as contas com `incluir_no_disponivel = SIM` entram no cálculo livre).
  * *Conclusão:* Não há duplicidade. A transferência interna não gerou despesa nem afetou o resultado contábil da empresa.

---

## 5. Árvore Inicial de Categorias, Subcategorias e Atividades

Identificação clara entre o que é pré-cadastrado no sistema e o que é personalizável pelo proprietário:

### 5.1 Atividades (Fontes de Receita / Canais Operacionais)
* **Pré-cadastradas no sistema (`origem = MIGRADA`):**
  * `Uber Flash` (Transporte e entregas urbanas)
  * `Lalamove` (Entregas corporativas e fretes)
  * `Loggi` (Logística e entregas expressas)
  * `Mercado Envios Extra` (Logística de e-commerce)
  * `Space-G` (Serviços e projetos digitais)
* **Personalizáveis (`origem = PERSONALIZADA`):**
  * O proprietário poderá cadastrar livremente novas plataformas, clientes diretos ou novas fontes de receita na interface.

---

### 5.2 Categorias de Receita
* **Pré-cadastradas (`origem = INICIAL`):**
  * **Entregas e Fretes**
    * *Subcategorias:* Corridas por App, Entregas Expressas, Fretes Dedicados.
  * **Serviços Digitais**
    * *Subcategorias:* Criação e Manutenção de Sites, Consultoria Técnica, Tráfego Pago.
  * **Vendas e Produtos**
    * *Subcategorias:* Vendas Online, Comissões.
  * **Outras Receitas Operacionais**
    * *Subcategorias:* Reembolsos e Estornos, Rendimentos de Aplicações.
* **Personalizáveis:** Qualquer nova categoria ou subcategoria de receita.

---

### 5.3 Categorias de Despesa
* **Pré-cadastradas (`origem = MIGRADA` — Originais da Planilha Antiga):**
  * **Combustível** *(personalizável com subcategorias: Gasolina, Etanol)*
  * **Alimentação** *(personalizável com subcategorias: Almoço Operacional, Lanches)*
  * **Internet e Celular** *(telefonia móvel, plano de dados)*
  * **Tributos e MEI** *(guia DAS-MEI, taxas municipais)*
  * **Softwares e Assinaturas** *(Canva, Next Go Saúde, Plataforma Next Go Card)*
  * **Outras Despesas**
* **Sugeridas e Pré-cadastradas para Expansão (`origem = INICIAL`):**
  * **Manutenção do Veículo**
    * *Subcategorias:* Troca de Óleo, Pneus e Borracharia, Mecânica Preventiva, Lavagem.
  * **Custos Bancários e Administrativos**
    * *Subcategorias:* Tarifas Pix, Taxas de Boleto, Certificado Digital.
* **Personalizáveis (`origem = PERSONALIZADA`):**
  * Novas categorias e subcategorias criadas livremente pelo usuário via interface.

---

## 6. Integridade Referencial e Diagrama ER

```text
       [Atividades] <-------------------+
            ^                           |
            | (opcional em receita      | (opcional p/ despesa direta;
            |  e despesa direta)        |  obrigatorio p/ receita)
            |                           |
     [OrcamentoItens]              [Lancamentos] <----+
       |          |                 |         |       |
       |          +----[Projetos]<--+         |       | (1:N)
       v                                      |       v
  [Categorias] <------------------------------+   [Liquidacoes] <---+
       ^                                              |             | (estorno aponta p/
       | (categoria_pai_id)                           v             |  liquidacao_estornada_id)
       +----------------                          [Contas] ---------+
                                                      ^
                                                      |
                                     [Transferencias]-+ (origem/destino)
                                                      |
                                     [AjustesSaldo]---+
```

1. **Validação de Chaves Estrangeiras:**
   * Todo `Lancamentos.categoria_id` deve existir e estar ativo em `Categorias`.
   * Se `subcategoria_id` for preenchido, deve pertencer obrigatoriamente à `categoria_id`.
   * `Lancamentos.projeto_id` e `OrcamentoItens.projeto_id` devem apontar para um registro válido em `Projetos`.
   * `Liquidacoes.lancamento_id` deve existir; `Liquidacoes.conta_id` deve ser de conta ativa.
2. **Consistência de Estorno:**
   * Se `Liquidacoes.tipo_evento = ESTORNO`, `liquidacao_estornada_id` torna-se campo **obrigatório**, e a soma de estornos não pode superar o valor nominal original.
3. **Snapshots Imutáveis:**
   * `categoria_nome_snapshot`, `atividade_nome_snapshot` e `projeto_nome_snapshot` em `Lancamentos` garantem imutabilidade contábil mesmo se cadastros forem editados posteriormente.
