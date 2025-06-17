import * as vscode from 'vscode';

/**
 * Activate the RCL extension in web environment
 * Provides basic language support without full language server features
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log('RCL extension activating in web environment');
    
    try {
        // In web environment, we provide basic language support
        // Syntax highlighting is provided by the grammar file (works in web)
        // Advanced features like full validation and completion require the desktop version
        
        const selector = { scheme: '*', language: 'rcl' };
        
        // Register a simple completion provider for basic RCL keywords
        const completionProvider = vscode.languages.registerCompletionItemProvider(
            selector,
            {
                provideCompletionItems: (document, position, token, context) => {
                    // Provide basic keyword completions
                    const keywords = [
                        'agent', 'Config', 'messages', 'message', 'flow',
                        'text', 'richCard', 'suggestions', 'fileName',
                        'authentication message', 'transaction message', 
                        'promotion message', 'servicerequest message', 'acknowledge message'
                    ];
                    
                    return keywords.map(keyword => {
                        const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                        item.documentation = new vscode.MarkdownString(`RCL keyword: \`${keyword}\``);
                        return item;
                    });
                }
            }
        );
        context.subscriptions.push(completionProvider);
        
        // Register a simple diagnostic provider for basic syntax validation
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('rcl');
        context.subscriptions.push(diagnosticCollection);
        
        const validateDocument = (document: vscode.TextDocument) => {
            if (document.languageId === 'rcl') {
                const diagnostics: vscode.Diagnostic[] = [];
                const text = document.getText();
                const lines = text.split('\n');
                
                // Basic validation - check for common syntax issues
                lines.forEach((line, lineNumber) => {
                    const trimmedLine = line.trim();
                    
                    // Check for unmatched quotes
                    const quotes = (line.match(/"/g) || []).length;
                    if (quotes % 2 !== 0) {
                        const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
                        const diagnostic = new vscode.Diagnostic(
                            range,
                            'Unmatched quotes detected',
                            vscode.DiagnosticSeverity.Warning
                        );
                        diagnostics.push(diagnostic);
                    }
                    
                    // Check for missing colons after section headers
                    if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.includes(':') && 
                        !trimmedLine.includes('=') && !trimmedLine.includes('"') && trimmedLine.length > 1) {
                        const sectionPattern = /^[A-Za-z][A-Za-z0-9\s-]*$/;
                        if (sectionPattern.test(trimmedLine)) {
                            const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
                            const diagnostic = new vscode.Diagnostic(
                                range,
                                'Section header may be missing colon (:)',
                                vscode.DiagnosticSeverity.Information
                            );
                            diagnostics.push(diagnostic);
                        }
                    }
                });
                
                diagnosticCollection.set(document.uri, diagnostics);
            }
        };
        
        // Listen for document changes
        context.subscriptions.push(
            vscode.workspace.onDidOpenTextDocument(validateDocument),
            vscode.workspace.onDidChangeTextDocument(e => validateDocument(e.document)),
            vscode.workspace.onDidSaveTextDocument(validateDocument)
        );
        
        // Validate already open documents
        vscode.workspace.textDocuments.forEach(validateDocument);
        
        // Show a helpful message about web limitations
        const showWebInfo = vscode.workspace.getConfiguration('rcl').get('showWebInfo', true);
        if (showWebInfo) {
            const message = 'RCL extension is running in web mode with basic features. For full language support including advanced validation and completion, use VS Code desktop.';
            vscode.window.showInformationMessage(message, 'Don\'t show again').then(selection => {
                if (selection === 'Don\'t show again') {
                    vscode.workspace.getConfiguration('rcl').update('showWebInfo', false, vscode.ConfigurationTarget.Global);
                }
            });
        }
        
        console.log('RCL extension activated successfully in web environment');
        
    } catch (error) {
        console.error('Failed to activate RCL extension in web environment:', error);
        vscode.window.showErrorMessage('Failed to activate RCL language support in web environment');
    }
}

/**
 * Deactivate the RCL extension
 */
export function deactivate(): void {
    console.log('RCL extension deactivated in web environment');
} 