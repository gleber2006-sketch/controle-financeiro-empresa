# Guia de Implantação da Etapa 1 no Google Apps Script

> **Objetivo:** Conectar o código-fonte desenvolvido na pasta `src/` ao Google Apps Script do proprietário para testes.

---

## Opção 1: Vinculação via Script ID (Recomendada — Menos de 2 minutos)

1. Acesse: **[script.google.com](https://script.google.com)**
2. Clique no botão azul **"Novo projeto"** no canto superior esquerdo.
3. No topo, clique em "Projeto sem título" e renomeie para: **`CF_App_Testes`**
4. No menu lateral esquerdo, clique no ícone de engrenagem ⚙️ (**Configurações do projeto**).
5. Na seção **IDs**, localize o **ID do script** (exemplo: `1B7PJhx8mQ...` — uma sequência longa de letras e números).
6. Copie esse ID e **envie aqui no chat**.

> **O que faremos a seguir:**  
> Configuraremos o arquivo de conexão `.clasp.json` com o seu ID e realizaremos a subida dos arquivos para o seu projeto no Google Apps Script.

---

## Opção 2: Autenticação via Linha de Comando (clasp login)

Se você preferir autenticar o utilitário oficial do Google pela linha de comando no seu computador:

1. Abra um terminal (PowerShell ou Prompt de Comando) na pasta do projeto:
   ```powershell
   cd "c:\Users\USER\Documents\Controle financeiro empresa"
   ```
2. Execute o comando:
   ```powershell
   npx clasp login
   ```
3. Uma aba do navegador se abrirá solicitando login na sua conta Google. Selecione a sua conta e autorize o acesso.
4. Ao concluir, avise aqui para realizarmos a criação e o deploy automáticos.

---

## Arquivos Prontos para Subida

Os seguintes arquivos em [`src/`](../src) serão enviados para o seu Google Apps Script:

* `appsscript.json` — Manifesto com timezone de São Paulo e trava estrita `access: "MYSELF"`.
* `Code.gs` — Controlador HTTP (`doGet`) e endpoint RPC.
* `SecurityGuard.gs` — Validação de permissões da conta proprietária.
* `Index.html` — Shell principal responsivo da aplicação web.
* `CssGlobal.html` — Estilos visuais profissionais.
* `JsCore.html` — Motor de promessas e máscaras de valores em centavos.

