/**
 * ==============================================================================
 * SecurityGuard.gs — Meu Controle Financeiro
 * Módulo de Validação de Identidade, Autorização e Auditoria de Chamadas
 * ==============================================================================
 */

/**
 * Obtém o e-mail do proprietário configurado explicitamente nas propriedades do script.
 * Não realiza autodefinição implícita para evitar que qualquer executor assuma a posse.
 * 
 * @return {string} E-mail do proprietário em minúsculas ou string vazia se não configurado.
 */
function getOwnerEmailConfigurado() {
  var props = PropertiesService.getScriptProperties();
  var ownerEmail = props.getProperty('OWNER_EMAIL');
  return ownerEmail ? ownerEmail.trim().toLowerCase() : '';
}

/**
 * Função administrativa para configurar ou atualizar o e-mail do proprietário de forma explícita.
 * Deve ser executada manualmente pelo proprietário no console do Apps Script ou
 * definida manualmente em "Configurações do Projeto" > "Propriedades do Script".
 * 
 * @param {string} email Endereço de e-mail da conta Google proprietária.
 * @return {string} Mensagem de confirmação.
 */
function definirOwnerEmail(email) {
  if (!email || typeof email !== 'string' || email.indexOf('@') === -1) {
    throw new Error('Forneça um endereço de e-mail válido para a propriedade OWNER_EMAIL.');
  }
  
  var emailNormalizado = email.trim().toLowerCase();
  PropertiesService.getScriptProperties().setProperty('OWNER_EMAIL', emailNormalizado);
  Logger.log('[SEGURANÇA] OWNER_EMAIL configurado explicitamente para: ' + emailNormalizado);
  return 'Proprietário configurado com sucesso: ' + emailNormalizado;
}

/**
 * Validador estrito de permissão para invocações backend.
 * Garante que a requisição está sendo processada no contexto autorizado.
 * 
 * @param {string} acaoNome Nome da operação executada.
 * @return {boolean} Retorna true se autorizado; dispara exceção se negado.
 */
function assertAutorizado(acaoNome) {
  var ownerEmail = getOwnerEmailConfigurado();

  // 1. Bloqueio preventivo: exige que o proprietário tenha sido configurado explicitamente
  if (!ownerEmail) {
    Logger.log('[SEGURANÇA] Bloqueio crítico: OWNER_EMAIL não configurado nas propriedades do projeto.');
    throw new Error('Acesso bloqueado: o e-mail do proprietário (OWNER_EMAIL) não foi configurado nas Propriedades do Script.');
  }

  var effectiveEmail = Session.getEffectiveUser().getEmail();
  var activeEmail = Session.getActiveUser().getEmail();

  // 2. O script deve estar sendo executado com a autoridade da conta proprietária
  if (!effectiveEmail || effectiveEmail.toLowerCase() !== ownerEmail) {
    Logger.log('[SEGURANÇA] Bloqueio crítico: contexto de execução inválido (' + effectiveEmail + '). Esperado: ' + ownerEmail);
    throw new Error('Acesso negado: contexto de execução não autorizado.');
  }

  // 3. Se activeEmail estiver disponível pelo Google, valida que é rigorosamente a conta proprietária
  if (activeEmail && activeEmail.toLowerCase() !== ownerEmail) {
    Logger.log('[SEGURANÇA] Tentativa de acesso bloqueada para usuário ativo: ' + activeEmail);
    throw new Error('Acesso negado: a conta ativa não é o proprietário desta aplicação.');
  }

  return true;
}

/**
 * Executa um autodiagnóstico de segurança e retorna o relatório de conformidade.
 * Pode ser executada diretamente no editor do Apps Script para validação.
 * 
 * @return {Object} Status do diagnóstico de segurança.
 */
function executarDiagnosticoSeguranca() {
  var ownerConfigurado = getOwnerEmailConfigurado();
  var effectiveUser = Session.getEffectiveUser().getEmail();
  var activeUser = Session.getActiveUser().getEmail();
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

  // Se o proprietário ainda não foi configurado, reporta o status pendente com orientações
  if (!ownerConfigurado) {
    return {
      sucesso: false,
      statusGeral: 'PENDENTE_CONFIGURACAO_OWNER',
      mensagem: 'O e-mail do proprietário não está configurado. Defina a propriedade OWNER_EMAIL em "Configurações do Projeto > Propriedades do Script" ou execute definirOwnerEmail("seu-email@gmail.com").',
      contextoExecucao: effectiveUser,
      usuarioAtivo: activeUser || '(Oculto pelo gateway do Google — Protegido por MYSELF)',
      fusoHorario: Session.getScriptTimeZone()
    };
  }

  // Executa validação estrita de segurança
  assertAutorizado('DIAGNOSTICO_SEGURANCA');
  
  return {
    sucesso: true,
    dados: {
      statusGeral: 'SEGURO',
      contextoExecucao: effectiveUser,
      usuarioAtivo: activeUser || '(Oculto pelo gateway do Google — Protegido por MYSELF)',
      proprietarioConfigurado: ownerConfigurado,
      spreadsheetConectada: spreadsheetId ? 'SIM' : 'PENDENTE_ETAPA_2',
      fusoHorario: Session.getScriptTimeZone(),
      dataVerificacao: new Date().toISOString()
    }
  };
}
