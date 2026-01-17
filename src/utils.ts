import * as vscode from 'vscode';
import { minimatch } from 'minimatch';
import * as path from 'path';

/**
 * Check if a document matches the RSpec file pattern
 */
export function isRSpecFile(document: vscode.TextDocument): boolean {
    // Must be a Ruby file
    if (document.languageId !== 'ruby') {
        return false;
    }

    // Must be a file (not untitled)
    if (document.uri.scheme !== 'file') {
        return false;
    }

    const config = vscode.workspace.getConfiguration('rspecFold');
    const pattern = config.get<string>('filePattern', '**/spec/**/*_spec.rb');

    // Get relative path from workspace root
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    let filePath: string;

    if (workspaceFolder) {
        filePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
    } else {
        filePath = document.uri.fsPath;
    }

    // Normalize path separators for cross-platform compatibility
    filePath = filePath.replace(/\\/g, '/');

    return minimatch(filePath, pattern, { matchBase: true });
}
