/**
 * ==============================================================================
 * SecurityGuard.gs — Meu Controle Financeiro
 * Módulo de Validação de Identidade, Autorização e Auditoria de Chamadas
 * ==============================================================================
 */

/**
 * Obtém o e-mail do proprietário configurado nas propriedades do script.
 * @return {string} E-mail do proprietário.
 */
function getOwnerEmailConfigurado() {
  var props = PropertiesService.getScriptProperties();
  var ownerEmail = props.getProperty('OWNER_EMAIL');
  
  // Se ainda não estiver configurado nas propriedades, utiliza o e-mail que implantou o script
  if (!ownerEmail) {
    ownerEmail = Session.getEffectiveUser().getEmail();
    if (ownerEmail) {
      props.setProperty('OWNER_EMAIL', ownerEmail);
    }
  }
  return ownerEmail || '';
}

/**
 * Validador estrito de permissão para invocações backend.
 * Garante que a requisição está sendo processada no contexto autorizado.
 * 
 * @param {string} acaoNome Nome da operação executada.
 * @return {boolean} Retorna true se autorizado; dispara exceção se negado.
 */
function assertAutorizado(acaoNome) {
  var effectiveEmail = Session.getEffectiveUser().getEmail();
  var activeEmail = Session.getActiveUser().getEmail();
  var ownerEmail = getOwnerEmailConfigurado();

  // 1. O script sempre executa com a autoridade da conta proprietária
  if (!effectiveEmail || (ownerEmail && effectiveEmail.toLowerCase() !== ownerEmail.toLowerCase())) {
    Logger.log('[SEGURANÇA] Bloqueio crítico: contexto de execução inválido (' + effectiveEmail + ')');
    throw new Error('Acesso negado: contexto de execução não autorizado.');
  }

  // 2. Se activeEmail estiver disponível (preenchido pelo Google), valida contra o proprietário
  if (activeEmail && ownerEmail && activeEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
    Logger.log('[SEGURANÇA] Tentativa de acesso bloqueada para: ' + activeEmail);
    throw new Error('Acesso negado: a conta ativa não é o proprietário desta aplicação.');
  }

  return true;
}

/**
 * Executa um autodiagnóstico de segurança e retorna o relatório de conformidade.
 * @return {Object} Status do diagnóstico.
 */
function executarDiagnosticoSeguranca() {
  assertAutorizado('DIAGNOSTICO_SEGURANCA');
  
  var effectiveUser = Session.getEffectiveUser().getEmail();
  var activeUser = Session.getActiveUser().getEmail();
  var ownerConfigurado = getOwnerEmailConfigurado();
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  
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
