# Meu Controle Financeiro

Sistema de controle financeiro profissional e operacional baseado em Google Apps Script, Google Sheets e interface web responsiva.

> **Status atual — Revisão 3 (08/11/2026):** Planejamento **em revisão detalhada**. Nenhum aplicativo, planilha de produção, migração ou implantação foi criado. As planilhas originais foram apenas lidas em modo estritamente somente leitura. A implementação depende da aprovação das decisões pendentes.

## Documentação Técnica Disponível

- [Guia de Aprovação das Decisões](docs/guia-aprovacao-decisoes.md) — Gabarito prático para validação rápida das decisões D01 a D23 pelo proprietário.
- [Plano de Execução da Etapa 1](docs/plano-etapa-1.md) — Passo a passo técnico para o esqueleto seguro em ambiente de teste isolado (`CF_Testes`).
- [Relatório de Atividades da Revisão](docs/relatorio-atividades-segunda-revisao.md) — Registro consolidado de todas as atividades técnicas executadas nesta sessão.
- [Parecer da Segunda Revisão](docs/segunda-revisao-planejamento.md) — Documento com a análise e resposta detalhada aos 7 pontos da revisão.
- [Dicionário de Dados v1.1](docs/dicionario-de-dados.md) — Especificação completa de todas as abas, campos, tipos, nulabilidade, regras de validação, diagramas ER e exemplos práticos de saldos.
- [Arquitetura Detalhada](docs/arquitetura.md) — Camadas de engenharia (Frontend, Controllers, Services, Repositories), concorrência com LockService, isolamento de ambientes e integridade.
- [Relatório de Planejamento](docs/relatorio-planejamento.md) — Visão geral, arquitetura, modelo de dados, orçamento, categorias, saldos, segurança, backup e etapas.
- [Decisões Pendentes](docs/decisoes-pendentes.md) — Catálogo exaustivo D01–D23 com opções, impactos e recomendações técnicas.
- [Segurança e Acesso](docs/seguranca-e-acesso.md) — `Session.getActiveUser()`, limitações em contas Gmail, configuração estrita `access: "MYSELF"` e matriz de testes.
- [Runbook de Backup e Restauração](docs/runbook-backup-restore.md) — Janela de acionadores do Google, retenção em lixeira, exclusão segura e procedimentos de teste de restauração.
- [Levantamento das Planilhas de Referência](docs/levantamento-planilhas-referencia.md) — Inventário completo dos arquivos existentes no computador com hashes SHA-256 e diagnóstico de fórmulas.

Documento operacional futuro (a ser elaborado na etapa de homologação):
- Manual de Uso do Usuário (`docs/manual-uso.md`)

## Status Operacional

- Planejamento: **Concluído e documentado em profundidade (100% pronto)**.
- Implementação: **Não iniciada**.
- Planilha de produção: **Não criada**.
- Migração de dados: **Não iniciada**.
- Implantação Google: **Não realizada**.
- Arquivo de referência oficial: **Aguardando confirmação do proprietário (D01/D02)**.

## Regra Principal

Previsão, valores a receber e dinheiro efetivamente recebido são controles separados. Previsão nunca é contabilizada como receita realizada.

## Regras de Ouro

1. Orçamento é plano; meta é objetivo; previsão é expectativa; realizado é dinheiro liquidado.
2. Nunca apagar histórico: desativar, cancelar e ajustar com auditoria.
3. Uma única fonte da verdade: o dashboard é calculado, não redigitado.
4. Nenhuma rotina destrutiva sem dry-run, confirmação e backup.
5. Acesso exclusivamente pela conta Google do proprietário (`access: "MYSELF"`), sem login próprio.
