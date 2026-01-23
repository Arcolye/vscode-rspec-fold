import * as vscode from 'vscode';

/**
 * Check if a document is an RSpec file
 */
export function isRSpecFile(document: vscode.TextDocument): boolean {
    if (document.languageId !== 'ruby') {
        return false;
    }

    if (document.uri.scheme !== 'file') {
        return false;
    }

    const filePath = document.uri.fsPath.replace(/\\/g, '/');
    return filePath.includes('/spec/') && filePath.endsWith('_spec.rb');
}
