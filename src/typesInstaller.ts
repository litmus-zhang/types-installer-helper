import * as vscode from 'vscode';

export class TypesInstaller implements vscode.CodeActionProvider
{ 
    constructor(context: vscode.ExtensionContext)
    {
        const command = vscode.commands.registerCommand('extension.typesInstaller', () => {0
    }
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]>
    {
        return context.diagnostics
            .filter(diagnostic => diagnostic.code === 'no-types-detected')
        .map(diagnostic => this.createCommandCodeAction(diagnostic));
    }

    private creatCommandCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction
    {
        const text = vscode.window.activeTextEditor.document.getText(diagnostic.range);
        const action = new vscode.CodeAction(`Install @types/${text} module...`, vscode.CodeActionKind.QuickFix);
        action.isPreferred = true;
        action.command = {
            command: 'types-installer.installTypesModule',
            title: `Learn more about @types/${text} module...`,
            tooltip: `This will install @types/${text} module in your workspace`,
            arguments: [diagnostic.range]
        }
        return action;
   }
}



