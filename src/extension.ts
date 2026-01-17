import * as vscode from 'vscode';
import { RSpecFoldingRangeProvider } from './rspecFoldingProvider';
import { AutoFolder } from './autoFolder';
import { isRSpecFile } from './utils';

let autoFolder: AutoFolder;

export function activate(context: vscode.ExtensionContext) {
    console.log('RSpec Fold extension activated');

    // Register the FoldingRangeProvider for Ruby files
    const foldingProvider = new RSpecFoldingRangeProvider();
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(
            { language: 'ruby', scheme: 'file' },
            foldingProvider
        )
    );

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

    // Register manual fold command
    context.subscriptions.push(
        vscode.commands.registerCommand('rspecFold.foldItBlocks', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && isRSpecFile(editor.document)) {
                await autoFolder.foldItBlocks(editor);
            } else {
                vscode.window.showInformationMessage(
                    'RSpec Fold: Current file is not an RSpec file'
                );
            }
        })
    );

    // Register manual unfold command
    context.subscriptions.push(
        vscode.commands.registerCommand('rspecFold.unfoldItBlocks', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && isRSpecFile(editor.document)) {
                await autoFolder.unfoldItBlocks(editor);
            }
        })
    );

    // Register fold describe blocks command
    context.subscriptions.push(
        vscode.commands.registerCommand('rspecFold.foldDescribeBlocks', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && isRSpecFile(editor.document)) {
                await autoFolder.foldDescribeBlocks(editor);
            } else {
                vscode.window.showInformationMessage(
                    'RSpec Fold: Current file is not an RSpec file'
                );
            }
        })
    );

    // Register unfold describe blocks command
    context.subscriptions.push(
        vscode.commands.registerCommand('rspecFold.unfoldDescribeBlocks', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && isRSpecFile(editor.document)) {
                await autoFolder.unfoldDescribeBlocks(editor);
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
