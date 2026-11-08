# Levantamento das Planilhas de Referência

> **Revisão 3 — 08/11/2026**
>
> Documento de apoio ao [Relatório de Planejamento](relatorio-planejamento.md).
>
> **Natureza:** inventário técnico em modo somente leitura. Nenhuma planilha original foi aberta para edição, renomeada, movida ou alterada. Os hashes abaixo permitem verificar que os arquivos analisados são exatamente os mesmos.
>
> **Revisão 3:** corrige faixas de células (tabelas em `B24:F44`/`H24:L44`; categorias em 28–35 e receitas em 28–33), registra que `F28:F35` e `L28:L33` são valores gravados, documenta o defeito de fórmula em `I16`, corrige a descrição da aba `Tabela dinâmica 2` e acrescenta a segunda variante da meta diária.

## 1. Objetivo

Responder, com evidência, à pergunta: **qual planilha existente no ambiente pode servir de referência para o novo sistema?**

O levantamento foi feito porque a revisão 1 do planejamento citava o arquivo `Controle_de_Ganhos_Mensais.xlsx`, mas esse nome **não foi encontrado**. Em vez de presumir que o arquivo correto era outro, esta revisão registra:

- o que existe;
- onde está;
- quais abas e campos tem;
- quais totais apresenta;
- quais problemas de qualidade de dados apresenta;
- o que ainda precisa ser confirmado pelo proprietário.

## 2. Método

### 2.1 Locais pesquisados

Em 07 e 08/11/2026 foram verificados, em modo somente leitura:

- a pasta do projeto (`C:\Users\USER\Documents\Controle financeiro empresa`);
- `C:\Users\USER\Documents`;
- `C:\Users\USER\Downloads`;
- `C:\Users\USER\Desktop`;
- `C:\Users\USER\OneDrive`;
- `D:\` (incluindo `D:\Users\Gleber\Downloads`).

### 2.2 Extensões procuradas

`.xlsx`, `.xls`, `.xlsm`, `.xlsb`, `.csv`, `.ods` e atalhos `.gsheet`.

### 2.3 Procedimento

1. Listagem de arquivos, tamanho e data de modificação.
2. Cálculo de SHA-256 de cada candidato.
3. Leitura do pacote XLSX (ZIP/XML) para extrair nomes de abas, dimensões, células, fórmulas e valores.
4. Conversão apenas de leitura dos números de série de data para conferência.
5. Nenhuma gravação, recálculo ou salvamento foi feito nos arquivos.

### 2.4 Limitações

- O ambiente **não tem unidade do Google Drive montada** nem atalhos `.gsheet`. Portanto, arquivos que existam apenas no Drive, sem cópia local, não aparecem neste levantamento.
- A futura planilha Google Sheets de produção **ainda não existe**.
- O levantamento não substitui a confirmação do proprietário sobre qual arquivo é a versão viva.
- Sparklines exportadas do Google Sheets aparecem no XLSX como `__xludf.DUMMYFUNCTION(...)`; isso não é uma fórmula portável e não foi tratado como dado.

## 3. Resultado principal

**O arquivo `Controle_de_Ganhos_Mensais.xlsx` não foi encontrado em nenhum dos locais pesquisados.**

Também não foram encontrados:

- atalhos `.gsheet`;
- pasta sincronizada do Google Drive;
- planilha de produção do novo sistema;
- histórico consolidado de todos os meses em um único arquivo.

Os arquivos localizados são **candidatos**, não uma referência confirmada.

## 4. Inventário dos candidatos

| # | Arquivo | Local | Tamanho | Última modificação | Abas | Classificação |
|---|---|---|---:|---|---|---|
| 1 | `Orçamento mensal Empresa 10_2025.xlsx` | `C:\Users\USER\Downloads` | 20.091 bytes | 2026-11-07 03:57:39 | `Resumo`, `Transações`, `Tabela dinâmica 2` | **Candidato principal** a referência empresarial; não confirmado |
| 2 | `Orçamento mensal Empresa 09_2025.xlsx` | `D:\Users\Gleber\Downloads` | 13.258 bytes | 2025-09-26 10:16:53 | `Resumo`, `Transações` | Versão anterior do mesmo modelo; candidato secundário |
| 3 | `Orçamento Pessoal 03_2026.xlsx` | `C:\Users\USER\Downloads` | 13.610 bytes | 2026-03-23 17:58:34 | `Resumo`, `Transações` | Orçamento **pessoal**; não é referência empresarial |
| 4 | `Outubro-Meta diária Uber Flash.xlsx` | `D:\Users\Gleber\Downloads` | 17.463 bytes | 2025-10-04 00:51:04 | `Página1` | **Meta de faturamento**, não orçamento |
| 5 | `Outubro-Meta diária Uber Flash (1).xlsx` | `D:\Users\Gleber\Downloads` | 19.711 bytes | 2025-10-04 01:43:26 | `Página1` | Segunda variante da mesma meta; também não é orçamento |
| 6 | `1ZICa6l3hW4Iwi-V.xlsx` | `C:\Users\USER\Downloads` | 19.782 bytes | 2026-04-09 00:38:29 | `Clientes` | Lista de clientes de outro sistema; sem relação com o controle financeiro |

### 4.1 Hashes SHA-256

| Arquivo | SHA-256 |
|---|---|
| `Orçamento mensal Empresa 10_2025.xlsx` | `48e51f34a4b173291070328f8e67c361cbe79beee8b82fccbc7e3f3306928ebf` |
| `Orçamento mensal Empresa 09_2025.xlsx` | `4d48846f0b638ca25068feee41b23e7a2ec0efafd3d53c0619c5c9c5f81ab551` |
| `Orçamento Pessoal 03_2026.xlsx` | `7f74831e4590f92c9bc309e855b70b157fc4fe62cbdb7a7854c00646da0ed049` |
| `Outubro-Meta diária Uber Flash.xlsx` | `7a13f5e7291c42a8d0c1cd391f1dc1fba5e2e316b5e0873e248f760500f19407` |
| `Outubro-Meta diária Uber Flash (1).xlsx` | `b7160e3e9cb60622dc72f5d54af8a2dca30da622340e080c32af1605ad2b99a8` |
| `1ZICa6l3hW4Iwi-V.xlsx` | `504443680ed7a4b42c19e127fc9e3d76ff847bbc4ce96c50b3e3c4267c1ffde1` |

## 5. Candidato principal — `Orçamento mensal Empresa 10_2025.xlsx`

### 5.1 Visão geral

- **Abas:** `Resumo`, `Transações`, `Tabela dinâmica 2`.
- **Período:** outubro de 2025, inferido apenas do nome do arquivo.
- **Saldo inicial:** `Resumo!L8` = `0,00`.
- **Natureza:** modelo de orçamento mensal com tabelas de despesas e receitas e uma aba de transações.

### 5.2 Aba `Resumo`

Estrutura relevante:

| Célula / faixa | Conteúdo |
|---|---|
| `B2:H2` | Título “PRIMEIROS PASSOS” (mesclado) |
| `I2:L2` | Título “OBSERVAÇÃO” (mesclado) |
| `B3:G4` | Instrução para definir saldo inicial em `L8` e personalizar categorias |
| `I3:L3` | “Só edite as células destacadas.” |
| `I4:M5` | “Tente não alterar as células que contêm uma fórmula.” |
| `B5:G6` | Instrução sobre a aba `Transações` atualizar o resumo |
| `B8` | “Orçamento mensal” |
| `J8` | “Saldo inicial:” |
| `L8` | Saldo inicial = `0,00` |
| `D17` | `=IF(ISBLANK(L8),0,L8)` → `0,00` |
| `E17` | `=D17+(I22-C22)` → `1.131,71` (saldo final) |
| `B20:F20` | Título “Despesas” (bloco superior) |
| `H20:L20` | Título “Renda” (bloco superior) |
| `B21:C22` | Cards “Planejado” e “Real” de despesas |
| `H21:I22` | Cards “Planejado” e “Real” de receita |
| `B24:F25` | Título e cabeçalho da tabela de despesas |
| `H24:L25` | Título e cabeçalho da tabela de receitas |
| `B26:F26` | Linha de totais de despesas |
| `H26:L26` | Linha de totais de receitas |
| `B28:C35` | Categorias de despesa (8 linhas preenchidas; 36–44 vazias) |
| `H28:I33` | Labels de receita (6 linhas preenchidas; 34–44 vazias) |
| `D28:D35` | Despesa planejada |
| `E28:E35` | Despesa real, via `SUMIF` na aba `Transações` |
| `F28:F35` | Diferença de despesa — **valores gravados, não fórmulas** |
| `J28:J33` | Receita planejada |
| `K28:K33` | Receita real, via `SUMIF` na aba `Transações` |
| `L28:L33` | Diferença de receita — **valores gravados, não fórmulas** |

Fórmulas e valores observados:

- `D26` = `=SUM(D27:D44)` → `1.611,80`.
- `J26` = `=SUM(J27:J44)` → `4.820,00`.
- `E26` = `617,53` **gravado como valor**, não como fórmula.
- `F26` = `994,27` **gravado como valor**.
- `K26` = `1.749,24` **gravado como valor**.
- `L26` = `-3.070,76` **gravado como valor**.
- `C21` = `=D26`; `C22` = `=E26`; `I21` = `=J26`; `I22` = `=K26`.
- `E28:E35` e `K28:K33` usam `SUMIF` contra `Transações!E:E/C:C` e `Transações!J:J/H:H`.
- `F27` e `F44` usam `D−E`; `L27` e `L44` usam `K−J`. **Os sinais das diferenças são opostos entre despesas e receitas.**
- **`F28:F35` e `L28:L33` são valores gravados**, não fórmulas. O arquivo pode exibir diferença desatualizada em relação a planejado e real.
- `I16` contém `if(J15<0, "Despesa do mês", "Economia do mês")`; deveria testar `I15`. **Defeito de fórmula confirmado.**
- As sparklines em `D12`, `E12`, `D21`, `D22`, `J21`, `J22` aparecem como `__xludf.DUMMYFUNCTION("SPARKLINE(...)")`.

### 5.3 Categorias de despesa do `Resumo`

| Linha | Categoria | Planejado (R$) | Real (R$) | Diferença exibida (R$) |
|---:|---|---:|---:|---:|
| 28 | Combustível | 950,00 | 438,53 | 511,47 |
| 29 | Canva | 24,90 | 0,00 | 24,90 |
| 30 | Alimentação | 200,00 | 154,00 | 46,00 |
| 31 | Internet+Celular | 185,00 | 0,00 | 185,00 |
| 32 | MEI | 82,00 | 0,00 | 82,00 |
| 33 | Next Go Saúde | 19,90 | 0,00 | 19,90 |
| 34 | Plataforma Next Go Card | 100,00 | 0,00 | 100,00 |
| 35 | Outros | 50,00 | 25,00 | 25,00 |
| 36–44 | (vazias) | — | — | — |
| **26** | **Totais** | **1.611,80** | **617,53** | **994,27** |

### 5.4 Labels de receita do `Resumo`

| Linha | Label | Planejado (R$) | Real (R$) | Diferença exibida (R$) |
|---:|---|---:|---:|---:|
| 28 | Lalamove | 100,00 | 0,00 | −100,00 |
| 29 | Uber Flash | 3.500,00 | 1.296,57 | −2.203,43 |
| 30 | Loggi | 100,00 | 39,90 | −60,10 |
| 31 | Mercado Envios Extra | 120,00 | 0,00 | −120,00 |
| 32 | Space-G | 1.000,00 | 412,77 | −587,23 |
| 33 | Outros | 0,00 | 0,00 | 0,00 |
| 34–44 | (vazias) | — | — | — |
| **26** | **Totais** | **4.820,00** | **1.749,24** | **−3.070,76** |

> As labels de receita são, na prática, **fontes/atividades** (Lalamove, Uber Flash, Loggi, Mercado Envios Extra, Space-G), não naturezas de receita. A reclassificação exige aprovação (D03).

### 5.5 Aba `Transações`

Cabeçalhos:

- Despesas em `B4:E`: `Data`, `Valor`, `Descrição`, `Categoria`.
- Receitas em `G4:J`: `Data`, `Valor`, `Descrição`, `Categoria`.

Transações de despesa (6 linhas):

| Data | Valor (R$) | Descrição | Categoria |
|---|---:|---|---|
| 2025-10-04 | 100,00 | Posto Madureira Votorantim | Combustível |
| 2025-10-05 | 124,05 | Posto Wanel Ville | Combustível |
| 2025-10-06 | 25,00 | Lavagem do veículo | Outros |
| 2025-10-10 | 80,00 | Posto Votorantim | Combustível |
| 2025-10-13 | 134,48 | Posto Ipiranga | Combustível |
| 2025-10-17 | 154,00 | Conta marmitex almoço careca | Alimentação |
| **Total** | **617,53** | | |

Transações de receita (6 linhas):

| Data | Valor (R$) | Descrição | Label |
|---|---:|---|---|
| 2025-10-03 | 39,90 | Entregas mes de setembro | Loggi |
| 2025-10-06 | 877,91 | Pagto Semanal Uber | Uber Flash |
| 2025-10-07 | 41,13 | Sist Agend Leal | Space-G |
| 2025-10-13 | 418,66 | Pagto Semanal Uber | Uber Flash |
| 2025-10-17 | 305,00 | Artes Careca Restaurante | Space-G |
| 2025-10-19 | 66,64 | Sist Agend Nerd Barbeiro | Space-G |
| **Total** | **1.749,24** | | |

### 5.6 Aba `Tabela dinâmica 2`

- A aba existe, mas **não tem nenhuma célula preenchida**. Não há sequer cabeçalho ou campo de tabela dinâmica.
- A versão anterior deste levantamento falava em “6 linhas”; isso não se sustenta na leitura do XML. O correto é: **0 células com conteúdo**.
- Não há campos, tabela dinâmica ou resumo utilizável.
- **Não deve ser migrada.**

### 5.7 Totais de conferência

| Indicador | Valor |
|---|---:|
| Saldo inicial | R$ 0,00 |
| Despesas planejadas | R$ 1.611,80 |
| Despesas realizadas | R$ 617,53 |
| Receitas planejadas | R$ 4.820,00 |
| Receitas realizadas | R$ 1.749,24 |
| Saldo final calculado pela planilha | R$ 1.131,71 |
| Resultado realizado (receitas − despesas) | R$ 1.131,71 |

O saldo final da planilha coincide com `0 + 1.749,24 − 617,53`. Isso mostra que o modelo trata **tudo como caixa**, sem separar previsão, competência ou contas.

## 6. Candidato secundário — `Orçamento mensal Empresa 09_2025.xlsx`

### 6.1 Visão geral

- **Abas:** `Resumo`, `Transações`.
- **Período:** setembro de 2025, inferido do nome.
- **Saldo inicial:** `Resumo!L8` = `1.000,00`.
- **Mesmo modelo visual** do candidato principal, com valores e transações diferentes.

### 6.2 Diferenças relevantes

| Item | 09/2025 | 10/2025 |
|---|---:|---:|
| Saldo inicial | R$ 1.000,00 | R$ 0,00 |
| Despesas planejadas | R$ 1.366,90 | R$ 1.611,80 |
| Despesas realizadas | R$ 1.065,78 | R$ 617,53 |
| Receitas planejadas | R$ 4.354,00 | R$ 4.820,00 |
| Receitas realizadas | R$ 2.961,10 | R$ 1.749,24 |
| Linhas de despesa | 11 | 6 |
| Linhas de receita | 15 | 6 |
| Saldo final calculado | R$ 2.895,32 | R$ 1.131,71 |

### 6.3 Categorias de despesa

| Categoria | Planejado (R$) | Real (R$) |
|---|---:|---:|
| Combustível | 800,00 | 658,48 |
| Canva | 30,00 | 24,90 |
| Alimentação | 100,00 | 100,00 |
| Internet+Celular | 185,00 | 185,00 |
| MEI | 82,00 | 82,40 |
| Next Go Saúde | 19,90 | 0,00 |
| Plataforma Next Go Card | 100,00 | 0,00 |
| Outros | 50,00 | 15,00 |
| **Total** | **1.366,90** | **1.065,78** |

Observação: `MEI` realizado (`82,40`) é **maior** que o planejado (`82,00`) e a diferença aparece como `−0,40` por causa da fórmula `D−E`; é um exemplo de sinal que pode confundir.

### 6.4 Labels de receita

| Label | Planejado (R$) | Real (R$) |
|---|---:|---:|
| Lalamove | 600,00 | 357,48 |
| Uber Flash | 2.000,00 | 1.574,82 |
| Loggi | 634,00 | 633,66 |
| Mercado Envios Extra | 120,00 | 0,00 |
| Space-G | 1.000,00 | 395,14 |
| Outros | 0,00 | 0,00 |
| **Total** | **4.354,00** | **2.961,10** |

### 6.5 Aba `Transações`

- 11 linhas de despesa e 15 linhas de receita.
- Datas entre 2025-09-01 e 2025-09-26.
- Há descrições que indicam competência de outro mês, por exemplo “ref ao mes 08/2025” em uma receita de Loggi. Isso mostra que **data de caixa e competência já se misturam** no modelo atual.
- Há receitas registradas como “Pagamento semanal”, “Pix corrida”, “Dinheiro Edilberto”, “2ª Parcela mini site Dom Perroni” etc., sem ID, conta, forma de pagamento ou status.

### 6.6 Conclusão sobre o candidato secundário

É o **mesmo modelo** do candidato principal, com mais linhas e saldo inicial não zero. Serve para:

- confirmar que o modelo é recorrente;
- comparar meses;
- identificar que o histórico está fragmentado em um arquivo por mês;
- mostrar que o saldo inicial é digitado manualmente e muda entre arquivos.

Não há evidência de que seja “a versão oficial”. Pode ser uma cópia antiga, um arquivo de trabalho ou um histórico parcial.

## 7. `Orçamento Pessoal 03_2026.xlsx`

- **Mesmo template** de `Resumo` e `Transações`.
- **Natureza pessoal**, com categorias como financiamento do apartamento, escola, supermercado, academia, IPTU, condomínio, energia e água.
- Não deve ser usado como referência empresarial.
- Serve apenas como evidência de que o template é reutilizado para finanças pessoais.
- **Não misturar** dados pessoais com dados da empresa no novo sistema.

## 8. `Outubro-Meta diária Uber Flash.xlsx`

- **Não é orçamento.** É uma planilha de **meta diária de faturamento**.
- Aba única: `Página1`.
- Cabeçalhos: `Dia semana`, `Dia do Mês`, `Meta Diária (R$)`, `Valor por km rodado estimado (R$/km)`, `Valor Real`, `KM total do percurso`, `Fator R$/Km`.
- 31 dias de outubro.
- `C32` = `=SUM(C2:C31)` → meta total de **R$ 5.467,27**.
- `E32` = `=SUM(E2:E31)` → realizado de **R$ 403,00**.
- `G` calcula `E/F` e exibe `#DIV/0!` quando não há KM.
- Isso confirma a necessidade de separar **meta** de **orçamento** no novo sistema. O arquivo pode inspirar o módulo de metas da v1.1, mas não deve alimentar `OrcamentoItens`.

**Segunda variante — `Outubro-Meta diária Uber Flash (1).xlsx`**

- Mesma aba `Página1`, mesmos cabeçalhos, mesmos totais de meta (**R$ 5.467,27**) e realizado (**R$ 403,00**).
- Diferenças: a coluna `G` usa `IFERROR(E/F,"")` em vez de `E/F` e não exibe `#DIV/0!`; a linha 32 também calcula médias em `D32` e `G32`.
- É provavelmente uma versão posterior/ajustada do mesmo arquivo, não um mês diferente.
- Também **não é orçamento** e não deve ser migrada para `OrcamentoItens`.

## 9. `1ZICa6l3hW4Iwi-V.xlsx`

- Aba única `Clientes`.
- Campos: nome, e-mail, telefone, agendamentos, datas de criação/atualização/visita, data de nascimento e não compareceu/cancelados.
- Contém **dados pessoais de clientes** de outro sistema.
- **Não tem relação** com o controle financeiro empresarial.
- Por privacidade, este documento **não reproduz** nomes, e-mails ou telefones.
- **Não deve ser migrado** para o novo sistema.

## 10. Problemas de qualidade de dados encontrados

Os problemas abaixo se repetem nos arquivos de orçamento e justificam o novo modelo:

1. **Um arquivo por mês.** O histórico é fragmentado e não há visão consolidada.
2. **Sem ID de lançamento, categoria ou conta.** Qualquer reordenação quebra a rastreabilidade.
3. **Sem status.** Não há distinção entre previsto, confirmado e realizado.
4. **Sem conta nem forma de pagamento.** Não é possível calcular saldo por conta.
5. **Sem vencimento nem competência explícita.** Não há contas a receber/pagar nem aging.
6. **Sem comprovante.** Não há vínculo com o documento que suporta o lançamento.
7. **Sem auditoria.** Não se sabe quem alterou, quando ou o que mudou.
8. **Sem versão de orçamento.** O planejado é editado no lugar; não há histórico de aprovação.
9. **Totais e diferenças gravados como valor.** `E26`, `F26`, `K26`, `L26`, `F28:F35` e `L28:L33` podem ficar desatualizados.
10. **Sinais de diferença inconsistentes.** Despesa usa `planejado − real`; receita usa `real − planejado`.
11. **Fórmula de rótulo com referência errada.** `I16` testa `J15` em vez de `I15`.
12. **Categoria usada para duas coisas.** Plataformas de receita são tratadas como categoria, misturando atividade e natureza.
13. **Saldo inicial manual e sem data de corte.** O valor muda entre arquivos e não tem trilha de conferência.
14. **Sem separação entre caixa e competência.** Uma receita de setembro pode ser registrada em outubro.
15. **Sparklines não portáveis.** `__xludf.DUMMYFUNCTION` só funciona no ecossistema Google.
16. **Aba de tabela dinâmica vazia.** Não há resumo confiável.
17. **Nomes de arquivo como único período.** Se o arquivo for renomeado, o mês se perde.
18. **Dados pessoais e empresariais no mesmo template.** Risco de mistura e de privacidade.

## 11. Mapa de migração proposto

> A migração **não será executada** antes da confirmação de D01/D02 e da aprovação do mapa pelo proprietário.

| Origem (`Orçamento mensal Empresa 10_2025.xlsx`) | Destino no novo modelo | Regra |
|---|---|---|
| `Resumo!L8` — saldo inicial | `Contas.saldo_inicial_centavos` | Informar conta e data de corte; não é receita |
| `Resumo!B28:B35` — categorias de despesa | `Categorias` (tipo `DESPESA`) | Mesmo nome, `origem = MIGRADA`; revisar duplicidades |
| `Resumo!H28:H33` — labels de receita | `Atividades` + `Categorias` (tipo `RECEITA`) | Plataformas viram atividades; natureza vira categoria (D03) |
| `Resumo!D28:D35` — planejado despesa | `OrcamentoItens` (`DESPESA`) | Importar como orçamento histórico, se aprovado |
| `Resumo!J28:J33` — planejado receita | `OrcamentoItens` (`RECEITA`) | Importar como orçamento histórico, se aprovado |
| `Resumo!E26/F26/K26/L26` — totais reais | Não migrar como valores | Recalcular a partir das transações; conferir divergências |
| `Resumo!F28:F35` e `L28:L33` — diferenças por linha | Não migrar | Valores gravados, não fórmulas; recalcular |
| `Resumo!I16` — rótulo com fórmula errada | Não migrar | Referencia `J15` em vez de `I15` |
| `Transações!B5:E` — despesas | `Lancamentos` + `Liquidacoes` | Status quitado; conta/forma a definir na migração |
| `Transações!G5:J` — receitas | `Lancamentos` + `Liquidacoes` | Status quitado; conta/forma a definir na migração |
| `Transações!D/I` — descrição | `Lancamentos.descricao` | Preservar texto original |
| `Transações!B/G` — data | `data_competencia` e `data_liquidacao` | Converter serial para data no fuso `America/Sao_Paulo` |
| `Tabela dinâmica 2` | Ignorar | Aba vazia |
| `Outubro-Meta diária Uber Flash.xlsx` | `Metas` (v1.1) | Não é orçamento; não migrar na v1 |
| `Orçamento Pessoal 03_2026.xlsx` | Não migrar | Natureza pessoal, fora do escopo |
| `1ZICa6l3hW4Iwi-V.xlsx` | Não migrar | Dados pessoais de outro sistema |

## 12. O que precisa ser confirmado pelo proprietário

### D01 — Qual é o arquivo de referência oficial?

Opções:

- **A)** `Orçamento mensal Empresa 10_2025.xlsx` é a referência.
- **B)** `Orçamento mensal Empresa 09_2025.xlsx` é a referência.
- **C)** Outro arquivo, que ainda precisa ser indicado ou disponibilizado.
- **D)** Nenhum dos arquivos é referência; o novo sistema começa do zero e o histórico fica apenas nos arquivos antigos.

**Recomendação:** não presumir. Se o proprietário não tiver certeza, a opção **D** é a mais segura para a v1: começar com saldo inicial na data de corte e manter os arquivos antigos somente leitura.

### D02 — O arquivo é a versão viva ou uma cópia?

Perguntas a responder:

- O arquivo é editado mensalmente ou é um export?
- Existe uma versão no Google Sheets que seja a “viva”?
- Qual é a data de corte para o saldo inicial?
- O histórico antigo deve ser importado ou apenas preservado?
- Quem mais tem acesso a esses arquivos?

**Recomendação:** tratar o arquivo como **somente leitura**; definir uma `DATA_CORTE`; não importar movimentos anteriores à data de corte; manter o histórico na planilha original.

## 13. Declaração de integridade

- Nenhum arquivo original foi modificado.
- Nenhum arquivo foi renomeado, movido ou excluído.
- Os hashes SHA-256 registrados permitem verificar a integridade.
- Este levantamento é documentação, não migração.
- A planilha de produção e o aplicativo **não existem** nesta data.

## 14. Referências internas

- [Relatório de Planejamento](relatorio-planejamento.md)
- [Segurança e Acesso](seguranca-e-acesso.md)
- [Decisões Pendentes](decisoes-pendentes.md)
- [Runbook de Backup e Restauração](runbook-backup-restore.md)

## 15. Histórico de revisões

| Versão | Data | Mudanças |
|---|---|---|
| 1 | 07/11/2026 | Levantamento inicial dos candidatos e hashes |
| 2 | 08/11/2026 | Inventário detalhado de abas, células, fórmulas, totais e problemas de qualidade |
| 3 | 08/11/2026 | Correção das faixas `B24:F44`/`H24:L44`, categorias 28–35 e receitas 28–33; `F28:F35`/`L28:L33` gravados; defeito `I16`; `Tabela dinâmica 2` sem células; segunda variante da meta diária; mapa de migração atualizado |
