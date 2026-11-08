/**
 * ==============================================================================
 * Code.gs — Ponto de Entrada Principal (Meu Controle Financeiro)
 * Camada de Roteamento Web e API Remota
 * ==============================================================================
 */

/**
 * Ponto de entrada HTTP GET para a Aplicação Web.
 * Renderiza a Single Page Application (SPA).
 * 
 * @param {Object} e Parâmetros da requisição HTTP.
 * @return {HtmlOutput} Página HTML processada e segura.
 */
function doGet(e) {
  assertAutorizado('DO_GET');
  
  var template = HtmlService.createTemplateFromFile('Index');
  
  // Parâmetros iniciais injetados no cliente de forma segura
  template.initialData = {
    versaoApp: 'v0.1.0 (Etapa 1 - Esqueleto Seguro)',
    ownerEmail: getOwnerEmailConfigurado(),
    fusoHorario: 'America/Sao_Paulo',
    ambiente: 'TESTES'
  };
  
  var htmlOutput = template.evaluate()
    .setTitle('Meu Controle Financeiro')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
  return htmlOutput;
}

/**
 * Utilitário para incluir partials HTML/CSS/JS nos templates do Apps Script.
 * 
 * @param {string} filename Nome do arquivo sem extensão.
 * @return {string} Conteúdo bruto do arquivo.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Endpoint de API: Obtém os dados de inicialização e status do sistema.
 * Invocado pelo frontend via google.script.run.
 * 
 * @return {Object} Status e configurações operacionais.
 */
function apiObterStatusSistema() {
  try {
    assertAutorizado('OBTER_STATUS_SISTEMA');
    
    var props = PropertiesService.getScriptProperties();
    return {
      sucesso: true,
      dados: {
        sistema: 'Meu Controle Financeiro',
        fase: 'Etapa 1: Esqueleto Seguro',
        ambiente: 'CF_Testes',
        owner: getOwnerEmailConfigurado(),
        moeda: 'BRL',
        timezone: 'America/Sao_Paulo',
        dataServidor: Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss')
      }
    };
  } catch (err) {
    Logger.log('[ERRO] Falha em apiObterStatusSistema: ' + err.message);
    return {
      sucesso: false,
      erro: err.message
    };
  }
}
