import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';

Promise.all([
  import('langium/node'),
  import('rcl-language'),
  import('langium/lsp')
]).then(([{ NodeFileSystem }, { createRclServices }, { startLanguageServer }]) => {
  // Create a connection to the client

  const connection = createConnection(ProposedFeatures.all);

  // Inject the shared services and language-specific services
  const { shared } = createRclServices({ connection, ...NodeFileSystem });

  // Start the language server with the shared services
  startLanguageServer(shared);
})