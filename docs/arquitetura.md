# Arquitetura Detalhada do Sistema — Meu Controle Financeiro

> **Versão:** 1.0 (Especificação Técnica de Engenharia)  
> **Data:** 08/11/2026  
> **Status:** Documento de Planejamento Consolidado — Sujeito à aprovação formal  
> **Plataforma:** Google Apps Script (Standalone) + Google Sheets (Storage) + HTML5/CSS3/Vanilla JS (Web App)  

---

## 1. Visão Geral da Arquitetura

O sistema é concebido como uma aplicação web moderna baseada na infraestrutura do Google Workspace, operando em regime monousuário exclusivo para o proprietário da conta, sem dependência de infraestruturas pagas, VPS, bancos de dados externos ou frameworks pesados.

```text
+-----------------------------------------------------------------------------------+
|                        NAVEGADOR DO USUÁRIO (Mobile / Desktop)                   |
|  +-----------------------------------------------------------------------------+  |
|  | Interface Web (HTML5 / CSS3 / JavaScript Vanilla)                           |  |
|  | - Módulos: Dashboard, Lançamentos, Liquidações, Orçamento, Cadastros        |  |
|  | - Componentes: Modais, Tabelas Reativas, Cards de Saldo, Gráficos (Chart.js)|  |
|  | - Validação de Entrada, Máscaras Monetárias (Centavos), Gestão de Estado    |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------|----------------------------------------+
                                           | google.script.run (Assíncrono)
                                           v
+-----------------------------------------------------------------------------------+
|              GOOGLE APPS SCRIPT (Backend Standalone - Execução "Me")              |
|                                                                                   |
|  [Camada de Entrada & Segurança]                                                  |
|  - doGet(): Renderização da UI via HtmlService (XFrameOptionsMode.ALLOWALL)      |
|  - SecurityGuard: Validação MYSELF + getEffectiveUser() + LogAuditoria             |
|                                                                                   |
|  [Camada de Controle e API (Controllers / Handlers)]                              |
|  - LancamentoController, OrcamentoController, SaldoController, BackupController   |
|  - Tratamento de Exceções, Serialização JSON Segura, Resposta Padronizada          |
|                                                                                   |
|  [Camada de Domínio e Regras de Negócio (Services)]                               |
|  - SaldoService: Fórmulas de Saldo Real, Reservado e Disponível Livre             |
|  - OrcamentoService: Comparativo Planejado x Realizado, Validação Anti-Soma Dupla |
|  - LiquidacaoService: Gestão Append-Only, Estornos Auditados sem Valores Negativos|
|  - ConcurrencyControl: LockService.getUserLock() em todas as operações de escrita  |
|                                                                                   |
|  [Camada de Acesso a Dados (Repositories)]                                        |
|  - SheetRepositoryBase: Leitura/Escrita em Lote (getDataRange, setValues)          |
|  - CacheService: Cache temporário de listas (Categorias, Atividades, Contas)       |
|  - Indexadores em Memória (Maps por UUID para junções relacionais ultrarrápidas)   |
+------------------------------------------|----------------------------------------+
                                           | Google Sheets API / DriveApp API
                                           v
+-----------------------------------------------------------------------------------+
|                           GOOGLE DRIVE & GOOGLE SHEETS                            |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Planilha Google Sheets de Produção (Banco de Dados Relacional em Abas)      |  |
|  | - Abas: Lancamentos, Liquidacoes, Orcamentos, OrcamentoItens, Categorias... |  |
|  | - Permissão: "Restrito - Somente Você" (Sem link público)                   |  |
|  +-----------------------------------------------------------------------------+  |
|  | Pasta Dedicada de Backups no Google Drive                                   |  |
|  | - Cópias diárias automáticas (CF_BKP_YYYYMMDD_HHMMSS)                       |  |
|  | - Rotina de retenção: 30 diários, 12 keepers mensais, lixeira de 30 dias    |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Princípios de Engenharia e Padrões de Projeto

1. **Separação Rígida de Responsabilidades (Layered Architecture):**
   * **UI / Frontend:** Apenas coleta entradas do usuário, aplica máscaras, exibe dados e delega todas as validações e cálculos pesados ao servidor.
   * **Controllers:** Recebem chamadas do `google.script.run`, abrem travas de concorrência (`LockService`), interceptam erros e retornam objetos uniformes (`{ sucesso: boolean, dados?: any, erro?: string }`).
   * **Services:** Contêm 100% das regras contábeis, cálculos de juros/estornos, validações de integridade e regras anti-duplicidade. Não acessam diretamente a API de planilhas.
   * **Repositories:** A única camada autorizada a invocar `SpreadsheetApp`. Lê e grava dados em blocos bidimensionais (`getValues()` / `setValues()`), nunca célula por célula.

2. **Integridade Append-Only e Imutabilidade Contábil:**
   * Movimentações financeiras e liquidações são definitivas. Não há `UPDATE` direto em valores de liquidações passadas nem `DELETE` físico de registros contábeis.
   * Retificações são processadas como **Estornos Auditados**, preservando o histórico original intacto.

3. **Valores Monetários Inteiros (Centavos):**
   * Nenhum valor financeiro transita ou é armazenado como número decimal de ponto flutuante (`Float`). Todos os valores são inteiros representando centavos (`INTEGER`).
   * R$ 1.500,50 é estritamente tratado como `150050`. As conversões visuais ocorrem apenas na renderização da interface e na digitação do usuário.

4. **Tratamento de Concorrência e Idempotência:**
   * Toda rotina que grava dados adquire um lock exclusivo via `LockService.getUserLock()`, aguardando até 10 segundos.
   * Toda chamada de escrita no frontend gera uma `chave_idempotencia` única (UUID ou hash SHA-256 do payload + timestamp). Se o usuário der duplo clique no botão "Salvar", a segunda chamada é rejeitada pelo backend sem duplicar o lançamento.

---

## 3. Modelo de Camadas do Backend (Google Apps Script)

### 3.1 Camada de Segurança e Gatekeeper (`SecurityGuard.gs`)

Garante que nenhuma chamada execute fora do contexto da conta Google proprietária:

```javascript
/**
 * Validador estrito de permissão e auditoria de chamadas.
 */
function assertAutorizado(acaoNome) {
  var effectiveEmail = Session.getEffectiveUser().getEmail();
  var activeEmail = Session.getActiveUser().getEmail();
  var ownerEmail = getOwnerEmailConfigurado();
  
  // 1. O script sempre executa com a autoridade do proprietário
  if (effectiveEmail !== ownerEmail) {
    Logger.log('ALERTA DE SEGURANÇA: Execução não autorizada por ' + effectiveEmail);
    throw new Error('Acesso negado: contexto de execução inválido.');
  }
  
  // 2. Se activeEmail estiver disponível, valida coincidência
  if (activeEmail && activeEmail !== ownerEmail) {
    registrarLogAuditoria(activeEmail, acaoNome, 'SEGURANCA', null, 'NEGADO', 'Usuário ativo diferente do proprietário');
    throw new Error('Acesso negado: conta não autorizada.');
  }
  
  return true;
}
```

---

### 3.2 Camada de Repositório (`SheetRepositoryBase.gs`)

Otimização de leitura e escrita em lote (*batch processing*) para garantir alta performance e evitar quotas de runtime:

1. **Leitura Otimizada em Lote:**
   * O repositório carrega a folha inteira em memória com uma única chamada `sheet.getDataRange().getValues()`.
   * Monta um mapa indexador por ID (`Map<UUID, Object>`) em tempo de execução O(n).
   * O tempo de leitura de uma aba com 5.000 linhas fica abaixo de 300 ms.
2. **Gravação em Bloco (Append Batch):**
   * Novos registros são agrupados em matriz e inseridos de uma única vez via `sheet.getRange(lastRow + 1, 1, rows.length, cols.length).setValues(rows)`.
3. **Gerenciamento de Cache (`CacheService`):**
   * Tabelas cadastrais estáticas (Categorias, Atividades, Contas, Formas de Pagamento) são cacheadas em memória pelo `CacheService.getUserCache()` por até 6 horas, sendo invalidadas automaticamente quando ocorre inclusão, edição ou desativação.

---

### 3.3 Camada de Serviços de Domínio (`DomainServices`)

#### 1. `SaldoService.gs`
Implementa o motor matemático de saldos da empresa:
* **Saldo Real da Conta:**
  $$\text{Saldo Inicial} + \sum \text{Receitas Liquidadas} - \sum \text{Despesas Liquidadas} - \sum \text{Estornos Receita} + \sum \text{Estornos Despesa} + \Delta\text{Transferências} + \Delta\text{Ajustes}$$
* **Saldo Reservado:** Soma dos aportes ativos menos resgates ativos na aba `MovimentosReserva`.
* **Saldo Disponível Operacional Livre:** Soma das contas com `incluir_no_disponivel = SIM` menos o Saldo Reservado.

#### 2. `OrcamentoService.gs`
* Processa a consolidação mensal de `OrcamentoItens` (planejado).
* Agrega as `Liquidacoes` do período por `atividade_id` e `categoria_id` (realizado).
* Aplica a validação estrita anti-soma dupla (D19): rejeita orçamentos que tentem planejar a categoria agregadora e simultaneamente suas subcategorias filhas no mesmo mês.

#### 3. `LiquidacaoService.gs`
* Gerencia o ciclo de liquidações totais e parciais.
* Executa estornos de forma consistente: cria um registro com `tipo_evento = ESTORNO` e `liquidacao_estornada_id = <ID_ORIGINAL>`, validando que o estorno não ultrapasse o saldo remanescente da liquidação original.

---

## 4. Camada de Frontend (Single Page Application - SPA)

A aplicação cliente é entregue como uma SPA fluida e leve via `HtmlService.createHtmlOutputFromFile('Index')`:

1. **Modularização de Arquivos HTML:**
   * `Index.html`: Estrutura base, shell visual, sidebar/bottom bar de navegação e containers de visualização.
   * `CssGlobal.html`: Folha de estilos responsiva, temas de contraste, tipografia e design de cards.
   * `JsCore.html`: Gerenciador de estado, chamadas remotas assíncronas com promessas (`promisify(google.script.run)`), notificações (*toasts*) e formatação monetária/datas.
   * `ViewDashboard.html`: Cards de indicadores chave de desempenho (KPIs), gráfico de evolução de saldo e comparativo de orçamento.
   * `ViewLancamentos.html`: Tabela de transações com filtros dinâmicos, busca rápida, paginação e modal de novo lançamento.
   * `ViewOrcamento.html`: Matriz orçamentária mensal com barras de progresso visual de planejado x realizado.
   * `ViewCadastros.html`: Gestão de categorias, contas, atividades e projetos.

2. **Fluxo de Comunicação Assíncrono com Promessas:**
   Para eliminar o formato legado de callbacks do Apps Script, a comunicação é envelopada em Promises nativas:
   ```javascript
   function apiCall(controllerMethod, payload) {
     return new Promise((resolve, reject) => {
       google.script.run
         .withSuccessHandler(response => {
           if (response && response.sucesso) {
             resolve(response.dados);
           } else {
             reject(new Error(response ? response.erro : 'Erro desconhecido no servidor'));
           }
         })
         .withFailureHandler(err => reject(err))[controllerMethod](payload);
     });
   }
   ```

---

## 5. Estratégia de Deploy e Isolamento de Ambientes

Para garantir risco zero de corrupção da futura base de produção e preservar os arquivos legados:

```text
Ambiente Local (VS Code / Git)
      |
      | clasp push / clasp deploy
      v
Projeto Google Apps Script (Standalone)
      |
      +---> [Modo Teste / Desenvolvimento]
      |         |
      |         +--> Conecta exclusivamente na planilha "CF_Testes"
      |         +--> Base de dados fictícia e anonimizada
      |         +--> Execução de testes de integração e validação de schema
      |
      +---> [Modo Produção - Homologação Final]
                |
                +--> Conecta na planilha "CF_Producao"
                +--> Permissões restritas: access: "MYSELF"
                +--> Ativação do Acionador Diário de Backup
```

* **Troca de Ambientes:** Controlada via chave `SPREADSHEET_ID` armazenada em `PropertiesService.getScriptProperties()`, garantindo que o código-fonte seja 100% agnóstico de IDs físicos de arquivos.
* **Isolamento da Planilha Antiga:** Os arquivos originais (`Orçamento mensal Empresa 10_2025.xlsx` etc.) permanecem intocados em pastas locais, sem qualquer conexão em modo de gravação.

---

## 6. Procedimento de Teste de Integridade e Restauração Automatizada

O sistema possui uma rotina de auto-diagnóstico (`IntegrityService.gs`) que valida a consistência de toda a base:

1. **Checagem de Schema:** Compara os cabeçalhos de cada aba com o dicionário de dados v1.1.
2. **Checagem de Orfandade (Integridade Referencial):**
   * Verifica se há algum lançamento com `categoria_id`, `atividade_id` ou `projeto_id` inexistente.
   * Verifica se há alguma liquidação apontando para `lancamento_id` ou `conta_id` inválido.
   * Verifica se há estornos com `liquidacao_estornada_id` inexistente.
3. **Checagem Matemática:**
   * Recalcula os saldos de todas as contas do zero a partir do histórico de liquidações, transferências e ajustes, e compara com o saldo em cache.
   * Se houver qualquer divergência de 1 centavo, emite alerta preventivo no dashboard e gera registro crítico no `LogAuditoria`.

---

## 7. Rastreabilidade com os Requisitos Aprovados

| Requisito do Projeto | Componente Arquitetural Responsável |
|---|---|
| Moeda BRL e fuso de São Paulo | Padronização global em `Configuracoes`, com valores em centavos inteiros e ISO-8601 |
| Acesso restrito ao proprietário | Deploy `access: "MYSELF"` + `SecurityGuard.gs` + Drive Privado |
| Orçamento separado de Metas e Previsões | Tabelas `Orcamentos` / `OrcamentoItens` isoladas da tabela `Metas` e de `Lancamentos` |
| Preservação de Histórico de Categorias | Soft delete (`ativo = NAO`) + Snapshot de nomes em `Lancamentos` |
| Gestão sem duplicidades de saldos | Entidades separadas para `Transferencias` e `MovimentosReserva` |
| Estornos auditados e consistentes | Liquidações append-only com `tipo_evento = ESTORNO` e valores positivos |
| Backup diário confiável | Acionador diário com chave de idempotência civil e retenção em lixeira de 30 dias |
| Acompanhamento por Projeto | Tabela `Projetos` integrada a lançamentos, liquidações e itens de orçamento |

