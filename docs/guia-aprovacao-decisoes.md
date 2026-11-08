# Guia Executivo de Aprovação das Decisões Pendentes

> **Documento:** Formulário de Validação e Aceite  
> **Data:** 08/11/2026  
> **Objetivo:** Fornecer um formato rápido, claro e estruturado para que o proprietário aprove as decisões técnicas necessárias para liberar a implementação da **Etapa 1**.

---

## 1. Como Aprovar

O proprietário pode responder de duas maneiras práticas:

1. **Aprovação em Bloco (Recomendada):** Responder informando:  
   > *"Aprovo o planejamento e as recomendações técnicas de D01 a D23 conforme o Guia de Aprovação, autorizando o início da Etapa 1 em ambiente de testes."*
2. **Aprovação Personalizada com Ajustes Pontuais:** Responder informando as opções desejadas para as decisões que preferir alterar, por exemplo:  
   > *"Aprovo com o seguinte ajuste: em D01 escolho a Opção D (começar limpo do zero), e em D04 escolho Opção A (Caixa). As demais sigo as recomendações."*

---

## 2. Gabarito de Decisões e Recomendações Técnicas

### 2.1 Bloco 1: Decisões Bloqueantes para o Início da Implementação

| ID | Tema | Opções Disponíveis | Opção Recomendada | Justificativa Técnica |
|:---:|---|---|:---:|---|
| **D01** | **Arquivo de referência oficial** | **A:** `Orçamento mensal Empresa 10_2025.xlsx`<br>**B:** `Orçamento mensal Empresa 09_2025.xlsx`<br>**C:** Outro arquivo<br>**D:** Nenhum (iniciar limpo na data de corte) | **Opção D** *(se houver dúvidas)*<br>ou **Opção A** *(se confirmado)* | Impede a importação de dados corrompidos ou versões rascunho de 2025. |
| **D02** | **Política de histórico e migração** | **A:** Importar histórico antigo para a base nova<br>**B:** Congelar histórico na planilha antiga e iniciar na data de corte | **Opção B** | Garante que a base nova nasça 100% íntegra, mantendo o histórico anterior intocado para consulta. |
| **D03** | **Taxonomia das receitas** | **A:** Manter nomes originais como categorias<br>**B:** Separar: plataformas viram `Atividades` e naturezas viram `Categorias` | **Opção B** | Permite cruzar receita por canal operacional (Uber Flash, etc.) e tipo de receita contábil. |
| **D04** | **Regime base do orçamento** | **A:** Regime de Caixa (pelas liquidações reais)<br>**B:** Regime de Competência (pelo mês do lançamento) | **Opção A (Caixa)** | Alinhado com a realidade financeira de microempresa na v1.0. |
| **D06** | **Cartão de crédito na v1.0** | **A:** Tratar cartão como conta bancária<br>**B:** Tratar como meio de pagamento vinculado a limite | **Opção B** | Elimina risco de duplicar a despesa na compra e no pagamento da fatura bancária. |
| **D07** | **Tratamento de reservas financeiras** | **A:** Criar contas bancárias físicas separadas<br>**B:** Reservas virtuais que deduzem do disponível livre | **Opção B** | Permite separar dinheiro por objetivo ("caixinhas") sem burocracia bancária. |
| **D09** | **Saldo inicial e conciliação** | **A:** Digitar e recalcular retroativo<br>**B:** Fotografia do extrato na data de corte; ajustes em `AjustesSaldo` | **Opção B** | Dá consistência contábil e auditoria limpa contra alterações indevidas. |
| **D12** | **Modelo de segurança Apps Script** | **A:** Deploy aberto com checagem de e-mail via JS<br>**B:** Deploy estrito `access: "MYSELF"` + defesa em profundidade | **Opção B** | Única modalidade que impede bypass de e-mail anônimo no Google Apps Script. |
| **D14** | **Escopo da versão 1.0** | **A:** Incluir OCR, Open Finance e recorrências agora<br>**B:** Escopo enxuto estrito ao núcleo financeiro; secundários na v1.1 | **Opção B** | Entrega rápida, estável e livre de bugs complexos. |
| **D19** | **Granularidade do orçamento** | **A:** Permitir orçar mãe e filhas somadas livremente<br>**B:** Bloquear sobreposições: ou orça a macro ou as subcategorias | **Opção B** | Elimina soma dupla nos totais orçados. |

---

### 2.2 Bloco 2: Decisões Operacionais e de Governança

| ID | Tema | Opção Recomendada | Impacto Operacional |
|:---:|---|:---:|---|
| **D05** | **Ciclo do orçamento** | **Opção B:** Rascunho ➔ Aprovado ➔ Encerrado | Orçamento aprovado é imutável; revisões geram nova versão auditada. |
| **D08** | **Contas no disponível livre** | **Opção B:** Flag `incluir_no_disponivel` por conta | Permite isolar investimentos ou contas de reserva do caixa do dia a dia. |
| **D10** | **Política de retenção de backup** | **Opção B:** 30 diários + 12 keepers mensais | Segurança contra corrupção silenciosa ou tardia de dados. |
| **D11** | **Pasta de backup no Drive** | **Opção B:** Pasta dedicada exclusiva no Drive | Organização e controle de acesso restrito. |
| **D13** | **Segurança da conta Google** | **Opção B:** 2FA / Passkey mandatório | Protege o acesso na raiz da autenticação. |
| **D15** | **Armazenamento de anexos** | **Opção B:** Exclusivamente links do Google Drive | Não consome cotas de upload do Apps Script e mantém arquivos privados. |
| **D16** | **Tooling e versionamento** | **Opção B:** GitHub Privado + `clasp` + Vitest | Código-fonte versionado profissionalmente fora da nuvem. |
| **D17** | **Privacidade e LGPD** | **Opção B:** Minimização de dados pessoais | Não armazena dados bancários sensíveis (senhas, CVV) nem CPFs desnecessários. |
| **D18** | **Procedência de categorias** | **Opção B:** Soft delete com tags de procedência | Preserva 100% dos relatórios passados mesmo com categorias inativadas. |
| **D20** | **Exclusão de backups expirados** | **Opção B:** Apenas mover para a Lixeira do Drive na v1 | Margem de 30 dias para recuperação humana antes da exclusão física. |
| **D21** | **Casos extremos de contas** | **Opção B:** Bloquear inativação de conta com saldo | Garante que dinheiro da empresa nunca fique oculto no sistema. |
| **D22** | **Pagamento de fatura de cartão** | **Opção B:** Liquidar as compras vinculadas à fatura | Mantém a despesa categorizada na origem (Combustível, Alimentação, etc.). |
| **D23** | **Escopos de permissão OAuth** | **Opção B:** Menor escopo viável (`drive.file`) | Garante que o script só acesse arquivos criados por ele mesmo. |

---

## 3. Termo de Autorização para a Etapa 1

Ao confirmar as decisões acima, o proprietário concede autorização para a realização da seguinte entrega técnica:

* **Etapa 1:** Criação da planilha de testes isolada (`CF_Testes`), configuração do repositório Git privado, implantação do esqueleto standalone do Google Apps Script com configuração restrita `access: "MYSELF"`, renderização da casca da interface e execução da bateria de testes de intrusão e autenticação.
* **Garantia:** A futura planilha de produção permanecerá não criada até a conclusão das etapas de homologação. As planilhas antigas permanecerão intocadas em modo somente leitura.

