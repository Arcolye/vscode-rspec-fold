import * as vscode from 'vscode';
import { detectItBlocks, detectDescribeBlocks } from './blockDetector';

export class AutoFolder {
    private pendingFolds: Map<string, NodeJS.Timeout> = new Map();

    /**
     * Schedule auto-folding with a delay to handle VS Code timing issues
     */
    scheduleAutoFold(editor: vscode.TextEditor): void {
        const config = vscode.workspace.getConfiguration('rspecFold');
        const autoFoldEnabled = config.get<boolean>('autoFoldOnOpen', true);

        if (!autoFoldEnabled) {
            return;
        }

        const delay = config.get<number>('foldDelay', 250);
        const uri = editor.document.uri.toString();

        // Cancel any pending fold for this file
        if (this.pendingFolds.has(uri)) {
            clearTimeout(this.pendingFolds.get(uri)!);
        }

        // Schedule the fold
        const timeout = setTimeout(async () => {
            this.pendingFolds.delete(uri);

            // Verify the editor is still active
            if (vscode.window.activeTextEditor?.document.uri.toString() === uri) {
                await this.foldItBlocks(vscode.window.activeTextEditor);
            }
        }, delay);

        this.pendingFolds.set(uri, timeout);
    }

    /**
     * Fold all 'it' blocks in the given editor
     */
    async foldItBlocks(editor: vscode.TextEditor): Promise<void> {
        const blocks = detectItBlocks(editor.document);

        if (blocks.length === 0) {
            return;
        }

        // Get the start lines of all blocks (0-based)
        const selectionLines = blocks.map(block => block.startLine);

        try {
            // First unfold at these lines to ensure we're targeting the 'it' blocks,
            // not their parent describe/context blocks (which would get folded if
            // the 'it' blocks are already folded)
            await vscode.commands.executeCommand('editor.unfold', {
                selectionLines: selectionLines,
                levels: 1
            });

            // Now fold the 'it' blocks
            await vscode.commands.executeCommand('editor.fold', {
                selectionLines: selectionLines,
                levels: 1
            });
        } catch (error) {
            console.warn('RSpec Fold: Failed to fold blocks', error);
        }
    }

    /**
     * Unfold all 'it' blocks in the given editor
     */
    async unfoldItBlocks(editor: vscode.TextEditor): Promise<void> {
        const blocks = detectItBlocks(editor.document);

        if (blocks.length === 0) {
            return;
        }

        const selectionLines = blocks.map(block => block.startLine);

        try {
            await vscode.commands.executeCommand('editor.unfold', {
                selectionLines: selectionLines
            });
        } catch (error) {
            console.warn('RSpec Fold: Failed to unfold blocks', error);
        }
    }

    /**
     * Fold all non-root 'describe' and 'context' blocks in the given editor
     */
    async foldDescribeBlocks(editor: vscode.TextEditor): Promise<void> {
        const blocks = detectDescribeBlocks(editor.document);

        if (blocks.length === 0) {
            return;
        }

        const selectionLines = blocks.map(block => block.startLine);

        try {
            await vscode.commands.executeCommand('editor.unfold', {
                selectionLines: selectionLines,
                levels: 1
            });

            await vscode.commands.executeCommand('editor.fold', {
                selectionLines: selectionLines,
                levels: 1
            });
        } catch (error) {
            console.warn('RSpec Fold: Failed to fold describe blocks', error);
        }
    }

    /**
     * Unfold all non-root 'describe' and 'context' blocks in the given editor
     */
    async unfoldDescribeBlocks(editor: vscode.TextEditor): Promise<void> {
        const blocks = detectDescribeBlocks(editor.document);

        if (blocks.length === 0) {
            return;
        }

        const selectionLines = blocks.map(block => block.startLine);

        try {
            await vscode.commands.executeCommand('editor.unfold', {
                selectionLines: selectionLines
            });
        } catch (error) {
            console.warn('RSpec Fold: Failed to unfold describe blocks', error);
        }
    }

    /**
     * Clean up pending timeouts
     */
    dispose(): void {
        for (const timeout of this.pendingFolds.values()) {
            clearTimeout(timeout);
        }
        this.pendingFolds.clear();
    }
}
