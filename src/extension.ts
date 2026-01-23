import * as vscode from 'vscode';
import { AutoFolder } from './autoFolder';
import { isRSpecFile } from './utils';

let autoFolder: AutoFolder;

export function activate(context: vscode.ExtensionContext) {
    console.log('RSpec Fold extension activated');

    // Initialize auto-folder
    autoFolder = new AutoFolder();

    // Listen for active editor changes (handles file opens)
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && isRSpecFile(editor.document)) {
                autoFolder.scheduleAutoFold(editor);
            }
        })
    );

    // Register 3-way toggle command
    context.subscriptions.push(
        vscode.commands.registerCommand('rspecFold.toggleFolding', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && isRSpecFile(editor.document)) {
                await autoFolder.toggleFolding(editor);
            }
        })
    );

    // Fold if an RSpec file is already open when extension activates
    const currentEditor = vscode.window.activeTextEditor;
    if (currentEditor && isRSpecFile(currentEditor.document)) {
        autoFolder.scheduleAutoFold(currentEditor);
    }
}

export function deactivate() {
    if (autoFolder) {
        autoFolder.dispose();
    }
}
