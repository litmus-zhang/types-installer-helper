// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


async function shouldMark(nodeModulesPath: vscode.Uri, mainPackageJson: PackageJson, targetPackage: string): Promise<boolean>
{
	const possibleTypeNames = `@types/${targetPackage}`;
	if (mainPackageJson.devDependencies?.[possibleTypeNames])
	{
		return false;
	}
	const nodeModulesPackageJson: PackageJson = require(nodeModulesPath.fsPath) 
	if (nodeModulesPackageJson.types)
	{
		return false;
	}
	const files = await vscode.workspace.findFiles(`node_modules/${targetPackage}/**/*.d.ts`);
	return !files.length;

}
async function getDiagnostics(doc: vscode.TextDocument): Promise<vscode.Diagnostic[]>
{
	const text = doc.getText();
	const diagnostics = new Array<vscode.Diagnostic>();

	let packageJson: PackageJson;
	try
	{
		packageJson = JSON.parse(text);
	}
	catch (e)
	{
		return diagnostics;
	}
	const textArr: string[] = text.split(/\r\n|\n/);
	const indexOfFirstDep = textArr.findIndex((value: string) => new RegExp(`\s*"dependencies"`).test(value) ) + 1;

	if (indexOfFirstDep !== -1)
	{
		let i = indexOfFirstDep + 1;
		while (textArr.length > i && !/\s*}/.test(textArr[i])){
		const arr = /\s*"(.*)"\s*:/.exec(textArr[i]);
		if (!arr)
		{
			i++
			continue;
		}
		const key = arr[1]
			const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
			const nodeModulesPath = vscode.Uri.joinPath(folder!.uri, 'node_modules', key);

			const typesPackageName = `'@types/${key}'`;
			if (await shouldMark(nodeModulesPath, packageJson, key))
			{
				const start = textArr[i].indexOf(key);
				const end = start + key.length
				diagnostics.push({
					severity: vscode.DiagnosticSeverity.Information,
					message: `No "types" property detected in package.json, You may need to add ${typesPackageName} to dependencies`,
					code: 'no-types-detected',
					source: 'Types Installer Helper',
					range: new vscode.Range(i, start, i, end)
				})

			}
			i++;


		}
	}
	return diagnostics;

};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('types-install ');

	const handler =async (doc:vscode.TextDocument) => {
		if (!doc.fileName.endsWith('package.json')) {
			return;
		}
		const diagnostics = await getDiagnostics(doc);
		diagnosticCollection.set(doc.uri, diagnostics);
	}

	const didOpen = vscode.workspace.onDidOpenTextDocument(doc => handler(doc));
	const didChange = vscode.workspace.onDidChangeTextDocument(e => handler(e.document));
	const codeActionProvider = vscode.languages.registerCodeActionsProvider('json', new Types);

	if(vscode.window.activeTextEditor) {
		handler(vscode.window.activeTextEditor.document);
	}
	context.subscriptions.push(diagnosticCollection);
}

// this method is called when your extension is deactivated
export function deactivate() {}
