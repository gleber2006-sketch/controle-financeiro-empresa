# Decisões Pendentes de Aprovação

> **Revisão 3 — 08/11/2026**
>
> Documento de apoio ao [Relatório de Planejamento](relatorio-planejamento.md), seção 11.
>
> **Status:** todas as decisões abaixo estão **PENDENTES**. Nenhuma foi aprovada tacitamente. Nenhuma implementação foi autorizada.
>
> **Revisão 3:** acrescenta D18–D23 (procedência de categorias, granularidade do orçamento, exclusão de backups, casos de conta/saldo/reserva, pagamento de fatura e escopos OAuth).

## 1. Como usar este documento

Cada decisão tem:

- **Pergunta:** o que precisa ser decidido.
- **Contexto:** por que importa.
- **Opções:** caminhos possíveis.
- **Recomendação:** o que a análise técnica sugere.
- **Impacto de não decidir:** o que fica bloqueado.
- **O que o proprietário precisa informar:** dado ou confirmação necessária.
- **Status:** `PENDENTE`, `APROVADA` ou `DISPENSADA`.

### 1.1 Regra de aprovação

- A aprovação é **explícita**, por decisão ou em bloco.
- Aprovar o planejamento **não** autoriza implementação.
- A implementação começa somente após a aprovação formal de D01–D23 e da Etapa 1.
- Decisão aprovada pode ser revista; a revisão deve ser registrada com data e motivo.

### 1.2 Modelo de registro

```text
Dxx — [título]
Decisão: [opção escolhida]
Data: AAAA-MM-DD
Observações: [texto]
Autorizado por: [nome]
```

## 2. Resumo das decisões

| ID | Tema | Recomendação | Bloqueia / impacta | Status |
|---|---|---|---|---|
| D01 | Arquivo de referência oficial | Confirmar `10_2025` ou indicar outro; não presumir | Etapa 0 e migração | PENDENTE |
| D02 | Versão viva × cópia; data de corte e histórico | Tratar como somente leitura; saldo inicial na data de corte | Etapa 0 e migração | PENDENTE |
| D03 | Taxonomia de receita | Plataformas viram atividades; natureza vira categoria | Modelo de dados e orçamento | PENDENTE |
| D04 | Base do orçamento | Caixa na v1; competência como relatório separado | Orçamento | PENDENTE |
| D05 | Ciclo de aprovação do orçamento | Rascunho → Aprovado → Encerrado; nova versão substitui | Orçamento | PENDENTE |
| D06 | Cartão de crédito | Forma de pagamento, não conta | Saldos e resultado | PENDENTE |
| D07 | Reservas | Virtuais, com vínculo opcional a conta | Saldos e disponibilidade | PENDENTE |
| D08 | Contas no disponível e vínculo de reservas | Definir por conta; validar saldo | Saldos | PENDENTE |
| D09 | Saldo inicial e diferenças | Data de corte única; ajuste auditado | Entrada em produção | PENDENTE |
| D10 | Política de backup | 30 diários + 12 mensais; lixeira 7 dias; dry-run | Backup | PENDENTE |
| D11 | Pasta e escopo de backup | Pasta dedicada; menor escopo viável | Backup | PENDENTE |
| D12 | Modelo de segurança | `MYSELF` + `getEffectiveUser()` + fail-closed | Segurança | PENDENTE |
| D13 | Tipo de conta Google e 2FA | Confirmar; 2FA obrigatório | Segurança | PENDENTE |
| D14 | Escopo da v1 | Adiar metas, recorrências, projetos e lote | Cronograma | PENDENTE |
| D15 | Anexos | Somente links restritos do Drive | Lançamentos | PENDENTE |
| D16 | Repositório e tooling | Privado; `clasp`; Node/Vitest | Desenvolvimento | PENDENTE |
| D17 | Privacidade e retenção | Minimizar dados; documentar retenção | Conformidade | PENDENTE |
| D18 | Procedência e ciclo de vida de categorias | `MIGRADA`/`INICIAL`/`SUGERIDA`/`PERSONALIZADA`; sem exclusão | Categorias e migração | PENDENTE |
| D19 | Granularidade e alocação do orçamento | Dimensões obrigatórias; sem sobreposição; rateio explícito | Orçamento | PENDENTE |
| D20 | Exclusão de backups | v1 somente lixeira; purga manual; keeper mensal | Backup | PENDENTE |
| D21 | Conta desativada, saldo negativo e reserva sem vínculo | Bloqueios e confirmações explícitas | Saldos | PENDENTE |
| D22 | Pagamento de fatura de cartão na v1 | Liquidar compras; proibir despesa genérica | Cartão e resultado | PENDENTE |
| D23 | Escopos OAuth e compartilhamento do projeto | Menor escopo; projeto somente do proprietário | Segurança | PENDENTE |

## 3. Decisões de referência e migração

### D01 — Qual é o arquivo de referência oficial?

**Pergunta:** qual planilha existente deve ser tratada como referência empresarial?

**Contexto:** o arquivo `Controle_de_Ganhos_Mensais.xlsx` citado na revisão 1 **não existe** no ambiente. Foram encontrados candidatos, mas nenhum foi confirmado. Ver [levantamento das planilhas](levantamento-planilhas-referencia.md).

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | `Orçamento mensal Empresa 10_2025.xlsx` é a referência | Usar como base de campos e categorias; validar se é versão viva |
| B | `Orçamento mensal Empresa 09_2025.xlsx` é a referência | Usar como base; tem saldo inicial R$ 1.000,00 e mais transações |
| C | Outro arquivo | Proprietário deve indicar/localizar o arquivo |
| D | Nenhum arquivo é referência | Começar do zero com data de corte; histórico fica somente leitura |

**Recomendação:** **D** se houver qualquer dúvida; caso contrário, **A** com validação explícita. Não presumir que o arquivo mais recente é o oficial.

**Impacto de não decidir:** Etapa 0 bloqueada; dicionário de dados e migração não podem ser fechados.

**O que o proprietário precisa informar:** nome e caminho do arquivo, ou confirmação de que nenhum será usado como referência.

**Status:** PENDENTE.

---

### D02 — O arquivo é a versão viva ou uma cópia? Qual a política de histórico?

**Pergunta:** o arquivo de referência é editado continuamente ou é um export? O histórico será importado ou preservado apenas no arquivo antigo?

**Contexto:** o candidato principal foi modificado em 07/11/2026 e pode ser cópia, rascunho ou export. O candidato secundário tem saldo inicial diferente. Não há versionamento nem auditoria.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Somente leitura + saldo inicial na data de corte | Mais simples e seguro; sem histórico anterior no sistema novo |
| B | Importar todo o histórico | Mais complexo; exige dados completos e revisão humana |
| C | Importar apenas o mês corrente | Meio-termo; exige critério claro de corte |

**Recomendação:** **A**. Definir `DATA_CORTE` (por exemplo, primeiro dia do mês de entrada em produção), informar saldo real por conta, não migrar movimentos anteriores. O histórico antigo permanece na planilha original, somente leitura.

**Impacto de não decidir:** não é possível definir saldo inicial, escopo da migração nem critério de aceite da Etapa 0.

**O que o proprietário precisa informar:** data de corte, se o arquivo é vivo ou cópia, e se o histórico deve ser importado.

**Status:** PENDENTE.

---

### D03 — Taxonomia: como separar atividade de categoria de receita?

**Pergunta:** as labels de receita do arquivo original (Lalamove, Uber Flash, Loggi, Mercado Envios Extra, Space-G, Outros) devem virar **atividades**, **categorias** ou ambas?

**Contexto:** no arquivo, essas labels são usadas como “categoria” da receita, mas representam fontes/plataformas. Isso mistura **de onde veio** (atividade) com **que natureza tem** (categoria). O novo modelo precisa das duas dimensões para relatórios confiáveis.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Plataformas viram atividades; categorias de receita novas | Relatórios melhores; exige mapeamento e aprovação |
| B | Manter as labels também como categorias | Menor esforço de migração; perpetua a mistura |
| C | Híbrido: plataformas como atividade e categoria “Outros” | Simples, mas perde granularidade de natureza |

**Recomendação:** **A**.

- Atividades: Uber Flash, Lalamove, Loggi, Mercado Envios Extra, Space-G, Outros.
- Categorias de receita iniciais: **Entregas**, **Serviços digitais**, **Vendas de produtos**, **Outros**.
- Mapear cada atividade para uma categoria.
- Permitir que o proprietário ajuste o mapeamento antes da migração.

**Impacto de não decidir:** `OrcamentoItens`, `Lancamentos` e relatórios por atividade/categoria ficam indefinidos.

**O que o proprietário precisa informar:** aprovar o mapeamento ou indicar outro.

**Status:** PENDENTE.

---

### D18 — Procedência e ciclo de vida das categorias

**Pergunta:** como distinguir categorias importadas, categorias mínimas do sistema, sugestões e itens criados pelo proprietário, sem perder histórico?

**Contexto:** a revisão 2 usava `INICIAL` e `MIGRADA` de forma inconsistente. Também não estava explícito se uma sugestão vira categoria automaticamente. Sem essa separação, não se sabe o que veio do arquivo antigo, o que o sistema criou e o que o proprietário personalizou.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Quatro origens explícitas: `MIGRADA`, `INICIAL`, `SUGERIDA`, `PERSONALIZADA`; sugestões não são aplicadas automaticamente | Rastreável; exige uma tela de sugestões |
| B | Só `INICIAL` e `PERSONALIZADA` | Simples; perde a distinção entre importado e mínimo |
| C | Criar todas as sugestões automaticamente | Polui o cadastro; dificulta saber o que é real |

**Recomendação:** **A**.

- `MIGRADA`: veio do arquivo de referência aprovado (D01/D02).
- `INICIAL`: conjunto mínimo criado pelo sistema para operar, mesmo sem arquivo de referência.
- `SUGERIDA`: catálogo disponível; só existe como sugestão até o proprietário aceitar, renomear ou ignorar.
- `PERSONALIZADA`: criada pelo proprietário ou resultante de uma sugestão aceita.
- Nenhuma origem permite exclusão; desativar preserva histórico.
- Renomear não muda a origem; o nome original fica em `MigracaoMapa`/auditoria.

**Impacto de não decidir:** o cadastro de categorias e a migração ficam ambíguos; não é possível provar de onde cada categoria veio.

**O que o proprietário precisa informar:** aprovar as quatro origens e a regra de que sugestão não é criada sozinha.

**Status:** PENDENTE.

## 4. Decisões de orçamento

### D04 — Base do orçamento: caixa ou competência?

**Pergunta:** o “realizado” do orçamento deve ser apurado por **caixa** (data da liquidação) ou por **competência** (mês do fato)?

**Contexto:** o arquivo original registra transações quando o dinheiro entra ou sai, mas há descrições que indicam competência de outro mês. Misturar as duas bases distorce o comparativo.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Caixa na v1 | Mais próximo do uso atual; simples; evita misturar cartão, boleto e recebimento |
| B | Competência na v1 | Mais “contábil”; exige vencimento, competência e regras de corte |
| C | As duas desde o início | Mais completo; mais complexo e mais lento |

**Recomendação:** **A** na v1. A visão por competência entra depois como **relatório separado**, sem alterar os valores da base de caixa.

**Impacto de não decidir:** o comparativo planejado × realizado não pode ser calculado de forma consistente.

**O que o proprietário precisa informar:** confirmar caixa na v1.

**Status:** PENDENTE.

---

### D05 — Ciclo de aprovação do orçamento

**Pergunta:** como o orçamento é criado, aprovado, alterado e encerrado?

**Contexto:** o arquivo original não tem versão, status nem histórico. O planejado é editado no lugar. Isso impede saber o que foi aprovado e comparar com o realizado.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Rascunho → Aprovado → Encerrado; nova versão substitui | Histórico preservado; uma versão aprovada por mês |
| B | Sem aprovação formal; edição livre | Simples, mas sem trilha de auditoria |
| C | Aprovação por item | Mais controle; mais burocrático |

**Recomendação:** **A**.

- No máximo um orçamento `APROVADO` por `ano_mes` e `base_calculo`.
- Aprovar nova versão marca a anterior como `SUBSTITUIDO`, sem apagar.
- Orçamento aprovado é imutável; alteração exige nova versão.
- Encerramento após o fechamento do mês; reabertura auditada.

**Impacto de não decidir:** não há regra de imutabilidade nem de comparação histórica.

**O que o proprietário precisa informar:** confirmar o fluxo e quem aprova (o próprio proprietário).

**Status:** PENDENTE.

---

### D19 — Granularidade e alocação do orçamento

**Pergunta:** em que nível o orçamento é lançado e como evitar que a mesma despesa/receita seja contada duas vezes?

**Contexto:** o orçamento precisa ser comparável ao realizado por atividade e categoria. Se o proprietário orçar “Alimentação” e também “Alimentação > Mercado”, ou ratear a mesma despesa em duas atividades sem critério, o total infla e o comparativo perde sentido.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Receita exige atividade + categoria; despesa exige categoria; sem sobreposição; rateio explícito somando 100% | Comparável e auditável; exige disciplina no cadastro |
| B | Orçar só por categoria, sem atividade | Simples; perde o comparativo por fonte de receita |
| C | Rateio automático por percentual fixo | Conveniente; opaco e arriscado na v1 |

**Recomendação:** **A**.

- Receita: `atividade_id` e `categoria_id` obrigatórios; subcategoria opcional.
- Despesa: `categoria_id` obrigatório; atividade como centro de custo opcional.
- Para o mesmo mês/tipo/atividade/projeto, usar **ou** a categoria **ou** as subcategorias, nunca as duas.
- Rateio de despesa compartilhada é explícito, em linhas separadas, somando 100% do valor.
- Rateio automático fica fora da v1.
- A soma das linhas deve fechar com o total planejado; divergência bloqueia a aprovação.
- Realizado sem linha correspondente aparece em “fora do orçamento”.

**Impacto de não decidir:** o comparativo planejado × realizado pode inflar ou omitir valores.

**O que o proprietário precisa informar:** aprovar as dimensões obrigatórias e a regra de rateio explícito.

**Status:** PENDENTE.

## 5. Decisões de contas, cartão, reservas e saldos

### D06 — Cartão de crédito: conta ou forma de pagamento?

**Pergunta:** o cartão de crédito deve ser modelado como conta ou como forma de pagamento?

**Contexto:** modelar cartão como conta com saldo negativo distorce o saldo total e pode duplicar a despesa no pagamento da fatura.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Forma de pagamento + cadastro de cartão | Compra vira despesa confirmada; pagamento da fatura liquida a despesa |
| B | Conta com saldo negativo | Simples de visualizar; distorce saldo e resultado |
| C | Conta separada com transferência | Também distorce; pagamento pode virar nova despesa |

**Recomendação:** **A**. O cartão não tem saldo próprio; o valor em aberto é calculado pelas compras confirmadas e não liquidadas. Pagamento da fatura é liquidação da despesa, não nova despesa.

**Impacto de não decidir:** saldos, resultado e orçamento realizado ficam sujeitos a duplicidade.

**O que o proprietário precisa informar:** confirmar o modelo.

**Status:** PENDENTE.

---

### D07 — Reservas: virtuais ou conta separada?

**Pergunta:** uma reserva de dinheiro deve ser uma **etiqueta virtual** sobre o saldo da conta ou uma **conta separada**?

**Contexto:** reservar dinheiro não é despesa nem movimentação de caixa. Se a reserva for modelada como conta, o total pode ser contado duas vezes.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Reserva virtual, com vínculo opcional a conta | Não altera saldo da conta; controle claro de disponível livre |
| B | Conta separada | Exige transferência física; pode duplicar saldo |
| C | Híbrido: reserva virtual + transferência quando houver movimento real | Mais flexível; exige disciplina |

**Recomendação:** **A**, com **C** para o caso de movimento físico real: a transferência é registrada separadamente; a reserva continua sendo etiqueta.

**Impacto de não decidir:** o cálculo de “disponível livre” e “reservado” fica indefinido.

**O que o proprietário precisa informar:** confirmar o modelo e se haverá reservas vinculadas a contas.

**Status:** PENDENTE.

---

### D08 — Quais contas entram no disponível? Reservas podem ser vinculadas?

**Pergunta:** todas as contas contam no “disponível”? Reservas podem ser vinculadas a uma conta específica?

**Contexto:** conta de investimento ou poupança pode não ser disponível para operação. Reserva vinculada precisa validar que o saldo da conta cobre o valor reservado.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Campo `incluir_no_disponivel` por conta; reserva com vínculo opcional | Flexível e explícito |
| B | Todas as contas contam | Simples, mas pode inflar o disponível |
| C | Nenhuma reserva vinculada | Mais simples, mas menos controle |

**Recomendação:** **A**. Validar que o saldo reservado não ultrapassa o saldo disponível da conta vinculada. Aporte que ultrapasse o disponível livre é bloqueado por padrão (com alerta configurável).

**Impacto de não decidir:** dashboard e regras de reserva ficam ambíguos.

**O que o proprietário precisa informar:** quais contas existem e quais entram no disponível.

**Status:** PENDENTE.

---

### D09 — Saldo inicial: data de corte e tratamento de diferenças

**Pergunta:** qual é a data de corte e o que fazer quando o saldo informado divergir do calculado?

**Contexto:** o arquivo original tem saldo inicial digitado (0,00 em 10/2025; 1.000,00 em 09/2025), sem conta nem conferência. O novo sistema precisa de uma fotografia confiável.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Data de corte única; saldo por conta; diferença via ajuste auditado | Rastreável e seguro |
| B | Editar o saldo inicial até fechar | Simples, mas apaga a história da diferença |
| C | Ignorar saldo inicial e começar do zero | Pode parecer correto, mas perde dinheiro existente |

**Recomendação:** **A**.

1. Definir `DATA_CORTE`.
2. Informar saldo real por conta na data.
3. Registrar `ReconciliacoesSaldo`.
4. Diferença → `AjusteSaldo` com motivo.
5. Nunca editar o saldo inicial para “fazer fechar”.

**Impacto de não decidir:** não é possível entrar em produção com saldos confiáveis.

**O que o proprietário precisa informar:** data de corte e saldos reais por conta.

**Status:** PENDENTE.

---

### D21 — Conta desativada, saldo negativo e reserva sem vínculo

**Pergunta:** o que acontece ao desativar uma conta com saldo, ao tentar deixar uma conta negativa e ao criar uma reserva sem indicar a conta de origem?

**Contexto:** a revisão 2 não fechava esses casos. Sem regra, o saldo pode sumir, ficar negativo sem explicação ou o “disponível livre” pode ser inflado por reservas sem vínculo.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Desativação com saldo bloqueada salvo transferência/ajuste/confirmação; saldo negativo bloqueado por padrão; reserva sem vínculo reduz o disponível | Seguro e explícito; exige algumas confirmações |
| B | Permitir desativar e ignorar saldo | Simples; saldo desaparece do dashboard |
| C | Permitir saldo negativo livremente e reserva sem vínculo não reduzir o disponível | Infla o disponível e esconde problemas |

**Recomendação:** **A**.

- Conta desativada com saldo ≠ 0: bloquear, salvo transferência do saldo, `AjusteSaldo` de encerramento com motivo ou confirmação explícita de “manter saldo residual”.
- Conta desativada com saldo residual continua nos relatórios históricos e em seção própria do dashboard; não some.
- Saldo negativo: bloqueado por padrão; liberação exige confirmação, motivo e registro em auditoria; dashboard alerta.
- Saldo negativo não é receita, reserva nem correção de saldo inicial; se a causa for saldo inicial incompleto, usar `ReconciliacoesSaldo` + `AjusteSaldo`.
- Reserva sem vínculo: reduz `disponivel_livre` por padrão (presunção de que sai do dinheiro disponível); o proprietário pode indicar a conta de origem.
- Reserva vinculada a conta não disponível não reduz o `disponivel_livre`.

**Impacto de não decidir:** dashboard e saldos podem ficar ambíguos ou inflados.

**O que o proprietário precisa informar:** aprovar os bloqueios e a presunção da reserva sem vínculo.

**Status:** PENDENTE.

---

### D22 — Pagamento de fatura de cartão na v1

**Pergunta:** como registrar o pagamento da fatura sem duplicar a despesa?

**Contexto:** a compra no cartão já é uma despesa confirmada. Se o pagamento da fatura for lançado como nova despesa “cartão”, o resultado e o orçamento realizado contam duas vezes. A revisão 2 deixava o pagamento em lote para a v1.1, mas não proibia explicitamente a despesa genérica.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Pagamento liquida as compras subjacentes; proibir despesa genérica; parcial permitido; lote na v1.1 | Sem duplicidade; exige selecionar compras |
| B | Lançar uma despesa “pagamento de cartão” e ignorar as compras | Duplica ou esconde a despesa original |
| C | Tratar cartão como conta e transferir | Distorce saldo e resultado |

**Recomendação:** **A**.

- Compra no cartão: despesa confirmada com `cartao_id` e vencimento.
- Pagamento: liquidação das compras, saindo da conta bancária.
- Proibido lançar “pagamento de cartão”/“fatura” como despesa genérica.
- Pagamento parcial é permitido; saldo em aberto é recalculado.
- Seleção múltipla assistida na v1; conciliação automática de fatura na v1.1.
- Divergência de fatura é tratada como compra faltante/duplicada ou ajuste auditado na compra, nunca como saldo de conta.

**Impacto de não decidir:** risco de duplicidade no resultado e no orçamento.

**O que o proprietário precisa informar:** aprovar o fluxo e a proibição da despesa genérica.

**Status:** PENDENTE.

## 6. Decisões de backup

### D10 — Política de retenção e exclusão

**Pergunta:** qual é a política de retenção, lixeira e dry-run?

**Contexto:** backup diário sem retenção cresce indefinidamente; retenção agressiva pode apagar o que não deve. A limpeza precisa ser conservadora.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | 30 diários + 12 mensais; manter 7 recentes; lixeira 7 dias; dry-run; limpeza semanal | Equilíbrio entre custo e segurança |
| B | Nunca apagar | Máxima segurança; custo crescente |
| C | 7 diários + 3 mensais | Menor custo; menor proteção |

**Recomendação:** **A**.

- Nunca apagar `MANUAL` ou `PRE_MIGRACAO`.
- Exclusão lógica primeiro; definitiva só após 7 dias.
- Dry-run obrigatório na primeira configuração.
- Limpeza no máximo uma vez por semana.
- Só considerar arquivos com prefixo e metadados do sistema.

**Impacto de não decidir:** a rotina de backup não pode ser ativada com segurança.

**O que o proprietário precisa informar:** aprovar a política.

**Status:** PENDENTE.

---

### D11 — Pasta e escopo de backup

**Pergunta:** onde o backup será gravado e qual escopo OAuth usar?

**Contexto:** usar `drive` dá acesso amplo; `drive.file` é mais restrito, mas pode limitar o acesso a arquivos não criados pelo app. A pasta precisa ser dedicada e privada.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Pasta dedicada no Drive do proprietário; avaliar `drive.file` | Mais seguro; pode exigir ajuste de fluxo |
| B | Qualquer pasta do Drive; escopo `drive` | Mais simples; acesso amplo |
| C | Export manual | Sem automação; não atende ao backup diário |

**Recomendação:** **A**. Pasta exclusiva, sem link público, somente proprietário. Começar com o menor escopo que funcione; documentar a escolha.

**Impacto de não decidir:** backup não pode ser implementado/testado.

**O que o proprietário precisa informar:** confirmar a pasta (ou autorizar a criação) e o escopo.

**Status:** PENDENTE.

---

### D20 — Exclusão de backups e keeper mensal

**Pergunta:** a rotina pode apagar backups definitivamente ou apenas mover para a lixeira? O que é um keeper mensal?

**Contexto:** a revisão 2 previa exclusão definitiva após 7 dias na lixeira. Isso ainda é uma ação destrutiva automática. O proprietário pediu proteção contra exclusão acidental de cópias importantes. Também era necessário definir exatamente qual backup mensal é preservado.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | v1 somente move para `_Lixeira_Backup`; purga definitiva é manual, auditada e após 7 dias; keeper = primeiro backup diário com sucesso do mês | Máxima proteção; exige ação manual periódica |
| B | Purga automática após 7 dias | Menos trabalho; risco de apagar cópia importante |
| C | Nunca apagar nada | Simples; crescimento indefinido |

**Recomendação:** **A**.

- Nenhuma rotina apaga permanentemente na v1.
- A lixeira é uma subpasta; o arquivo continua recuperável.
- Purga definitiva: manual, com lista conferida, confirmação do proprietário e registro em `BackupLog`.
- Keeper = primeiro backup `DIARIO` com sucesso de cada mês; se o primeiro falhou, o primeiro sucesso seguinte.
- Keeper é mantido por 12 meses e é imune à limpeza.
- Nunca apagar o último keeper de um mês, mesmo que a contagem ultrapasse 12.
- `MANUAL` e `PRE_MIGRACAO` são imunes.

**Impacto de não decidir:** a limpeza não pode ser ativada com segurança.

**O que o proprietário precisa informar:** aprovar “v1 somente lixeira” e a definição de keeper.

**Status:** PENDENTE.

## 7. Decisões de segurança

### D12 — Modelo de segurança e e-mail ativo vazio

**Pergunta:** qual é o controle primário e o que fazer se `getActiveUser().getEmail()` vier vazio?

**Contexto:** a documentação oficial confirma que o e-mail pode vir vazio em web app “executar como eu”. A verificação no código não pode ser o único controle.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | `access = MYSELF` como controle primário + `getEffectiveUser()` + fail-closed | Mais seguro; depende da configuração correta do deploy |
| B | `access = ANYONE` + verificação de e-mail | Inseguro se o e-mail vier vazio ou a verificação falhar |
| C | Exigir Google Workspace para identificação mais confiável | Mais controle; depende de conta Workspace |

**Recomendação:** **A**. Se o e-mail ativo vier vazio, **não liberar**; manter `MYSELF` e registrar o evento. Aceitar formalmente o risco residual ou migrar para Workspace (D13).

**Nota técnica:** o código não lê o campo `access` da implantação em tempo de execução; `MYSELF` é verificado no deploy e no manifesto. A política para e-mail vazio é operacional e precisa ser testada (teste 9 da [matriz de segurança](seguranca-e-acesso.md#8-matriz-de-testes-obrigatória)).

**Impacto de não decidir:** não há modelo de segurança aprovado; nenhum deploy de produção deve ocorrer.

**O que o proprietário precisa informar:** aprovar o modelo e a política de e-mail vazio.

**Status:** PENDENTE.

---

### D13 — Tipo de conta Google e 2FA

**Pergunta:** a conta do proprietário é Gmail pessoal ou Google Workspace? O 2FA/passkey está ativo?

**Contexto:** a disponibilidade do e-mail ativo e o comportamento de `DOMAIN` dependem do tipo de conta. A segurança da conta é a base de tudo.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Gmail pessoal com 2FA/passkey | Simples; e-mail ativo pode variar; risco residual documentado |
| B | Google Workspace com 2FA | Identificação mais confiável; custo administrativo |
| C | Sem 2FA | **Não aceitável** |

**Recomendação:** **A** ou **B**, sempre com 2FA/passkey. Se Workspace, avaliar `DOMAIN` apenas se o domínio inteiro for confiável.

**Impacto de não decidir:** não é possível concluir a matriz de testes de segurança.

**O que o proprietário precisa informar:** tipo de conta, domínio (se houver) e confirmação de 2FA.

**Status:** PENDENTE.

---

### D23 — Escopos OAuth e compartilhamento do projeto Apps Script

**Pergunta:** quais escopos OAuth serão pedidos e quem pode acessar o projeto do Apps Script?

**Contexto:** `MYSELF` protege a execução do web app, mas não impede que outra conta com edição no projeto altere o código e crie uma implantação própria. Além disso, `drive` dá acesso amplo; `drive.file` é mais restrito. O código não lê o campo `access` em tempo de execução.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Menor escopo viável (`drive.file` preferido); projeto somente do proprietário; verificação manual do deploy | Mais seguro; pode exigir ajuste no fluxo de backup |
| B | `drive` amplo e projeto compartilhado com editor | Mais simples; aumenta muito a superfície de ataque |
| C | Não usar Apps Script | Contraria a decisão de hospedagem |

**Recomendação:** **A**.

- Escopos: `spreadsheets`, `userinfo.email`, `script.scriptapp`; `drive.file` preferido; `script.send_mail` só se o alerta por e-mail for aprovado; `script.external_request` não usar na v1.
- Projeto do Apps Script **não compartilhado** com nenhuma outra conta.
- Verificação manual da tela de implantação e do `appsscript.json` antes de cada deploy.
- Testes 13–15 da [matriz de segurança](seguranca-e-acesso.md#8-matriz-de-testes-obrigatória).
- O código não consegue ler `access`; a comprovação é manual + testes.

**Impacto de não decidir:** a segurança da implantação e o menor privilégio ficam indefinidos.

**O que o proprietário precisa informar:** aprovar os escopos e a regra de não compartilhar o projeto.

**Status:** PENDENTE.

## 8. Decisões de escopo e anexos

### D14 — Escopo da primeira versão

**Pergunta:** quais funcionalidades entram na v1 e quais ficam para a v1.1?

**Contexto:** o risco do projeto é tentar entregar tudo de uma vez. O núcleo financeiro já é grande.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Núcleo: cadastros, saldos, lançamentos, liquidações, transferências, reservas, orçamento, dashboard, backup | Entregável e testável |
| B | Núcleo + metas + recorrências + projetos + lote de cartão | Mais completo; mais lento e arriscado |
| C | Apenas lançamentos e dashboard | Muito rápido; deixa lacunas |

**Recomendação:** **A**. Adiar para v1.1: metas de faturamento, recorrências automáticas, rentabilidade por projeto, pagamento em lote de fatura, OCR, integração bancária, nota fiscal, multiusuário, app nativo, offline e previsões sofisticadas.

**Impacto de não decidir:** cronograma e critérios de aceite ficam indefinidos.

**O que o proprietário precisa informar:** aprovar o corte.

**Status:** PENDENTE.

---

### D15 — Anexos: somente links do Drive?

**Pergunta:** os comprovantes serão armazenados como links restritos do Google Drive, sem upload pela aplicação?

**Contexto:** upload exige armazenamento, validação, antivírus, limites e mais superfície de ataque. Links reduzem escopo.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Somente link do Drive, arquivo privado | Simples e seguro; depende do proprietário organizar o arquivo |
| B | Upload pela aplicação | Mais conveniente; mais complexo e arriscado |
| C | Sem anexos na v1 | Mais simples; perde rastreabilidade documental |

**Recomendação:** **A**. A aplicação armazena apenas a URL; não faz upload, download ou leitura. Validar que é URL do Drive. Se o link for revogado, o lançamento continua existindo.

**Impacto de não decidir:** modelo de `Lancamentos` e `Liquidacoes` fica indefinido.

**O que o proprietário precisa informar:** confirmar o modelo.

**Status:** PENDENTE.

## 9. Decisões de repositório e privacidade

### D16 — Repositório e tooling

**Pergunta:** qual repositório, nome, fluxo de branches e ferramentas?

**Contexto:** o código precisa ser versionado, mas sem dados reais nem credenciais.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Repositório privado no GitHub; `clasp`; Node/Vitest; `main`/`develop`/`feature/*` | Padrão e testável |
| B | Somente editor do Apps Script | Sem versionamento adequado |
| C | Repositório público | **Não aceitável** com dados/configurações |

**Recomendação:** **A**. `.gitignore` com `.clasprc.json`, `node_modules/`, backups, `*.xlsx`, `*.csv`, `.env`, logs. Nenhum dado real, token ou senha. Tags `v0.1.0` etc. e `CHANGELOG.md`.

**Impacto de não decidir:** não é possível iniciar a Etapa 1 com segurança.

**O que o proprietário precisa informar:** confirmar nome do repositório e ferramentas.

**Status:** PENDENTE.

---

### D17 — Privacidade, LGPD e retenção de logs

**Pergunta:** quais dados pessoais serão armazenados e por quanto tempo?

**Contexto:** descrições de lançamentos podem conter nomes de clientes, telefones ou outros dados. Logs de auditoria também podem conter dados sensíveis. É preciso minimizar e documentar.

**Opções:**

| Opção | Descrição | Consequência |
|---|---|---|
| A | Minimizar dados; mascarar o que não for necessário; documentar retenção | Mais conforme e seguro |
| B | Armazenar tudo sem critério | Risco de privacidade e de vazamento |
| C | Não registrar auditoria | Perde rastreabilidade |

**Recomendação:** **A**.

- Não armazenar número completo de cartão, CVV ou senha.
- Evitar dados pessoais desnecessários em descrições.
- Definir retenção de logs (por exemplo, 12 meses) e de backups (D10).
- Acesso somente do proprietário.
- Documentar a finalidade do tratamento.
- Excluir dados de teste ao final.

**Impacto de não decidir:** risco de conformidade e de exposição desnecessária.

**O que o proprietário precisa informar:** confirmar a política e o prazo de retenção.

**Status:** PENDENTE.

## 10. Ordem recomendada de aprovação

### 10.1 Para desbloquear a Etapa 0

1. **D01** — arquivo de referência.
2. **D02** — versão viva/cópia, data de corte e histórico.
3. **D03** — taxonomia de receita.
4. **D18** — procedência e ciclo de vida das categorias.

### 10.2 Para desbloquear a Etapa 1

5. **D12** — modelo de segurança.
6. **D13** — tipo de conta e 2FA.
7. **D16** — repositório e tooling.
8. **D23** — escopos OAuth e compartilhamento do projeto.

### 10.3 Para desbloquear o núcleo financeiro

9. **D04/D05/D19** — base, ciclo e granularidade do orçamento.
10. **D06/D07/D08/D09/D21/D22** — cartão, reservas, contas, saldos, conta desativada e fatura.
11. **D14/D15** — escopo e anexos.
12. **D10/D11/D20** — backup, retenção e exclusão.
13. **D17** — privacidade e retenção.

## 11. Registro de aprovações

| ID | Decisão escolhida | Data | Observações | Autorizado por |
|---|---|---|---|---|
| D01 | | | | |
| D02 | | | | |
| D03 | | | | |
| D04 | | | | |
| D05 | | | | |
| D06 | | | | |
| D07 | | | | |
| D08 | | | | |
| D09 | | | | |
| D10 | | | | |
| D11 | | | | |
| D12 | | | | |
| D13 | | | | |
| D14 | | | | |
| D15 | | | | |
| D16 | | | | |
| D17 | | | | |
| D18 | | | | |
| D19 | | | | |
| D20 | | | | |
| D21 | | | | |
| D22 | | | | |
| D23 | | | | |

## 12. Critérios para autorizar a implementação

A implementação só começa quando:

- [ ] D01–D23 estiverem aprovadas ou formalmente dispensadas.
- [ ] O arquivo de referência estiver confirmado (ou a opção “nenhum” estiver aprovada).
- [ ] A data de corte e os saldos iniciais estiverem definidos.
- [ ] A procedência e o ciclo de vida das categorias estiverem aprovados (D18).
- [ ] A granularidade e a alocação do orçamento estiverem aprovadas (D19).
- [ ] O modelo de segurança estiver aprovado, incluindo escopos e não compartilhamento do projeto (D12/D13/D23).
- [ ] A política de backup e exclusão estiver aprovada (D10/D11/D20).
- [ ] As regras de conta desativada, saldo negativo e fatura estiverem aprovadas (D21/D22).
- [ ] O escopo da v1 estiver aprovado.
- [ ] O repositório privado estiver definido.
- [ ] O proprietário autorizar formalmente a Etapa 1.

Até lá, o status permanece **planejamento em revisão**, sem implementação.

## 13. Referências internas

- [Relatório de Planejamento](relatorio-planejamento.md)
- [Levantamento das Planilhas](levantamento-planilhas-referencia.md)
- [Segurança e Acesso](seguranca-e-acesso.md)
- [Runbook de Backup e Restauração](runbook-backup-restore.md)

## 14. Histórico de revisões

| Versão | Data | Mudanças |
|---|---|---|
| 1 | 07/11/2026 | D01–D17 iniciais |
| 2 | 08/11/2026 | Matriz completa com opções, recomendações e impactos |
| 3 | 08/11/2026 | D18–D23; ordem de aprovação e critérios atualizados; registro ampliado |
