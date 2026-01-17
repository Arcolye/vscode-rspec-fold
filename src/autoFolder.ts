import * as vscode from 'vscode';
import { detectItBlocks, detectDescribeBlocks } from './blockDetector';

// Fold states: 0 = it folded, 1 = neither folded, 2 = describe folded
type FoldState = 0 | 1 | 2;

export class AutoFolder {
    private pendingFolds: Map<string, NodeJS.Timeout> = new Map();
    private foldState: Map<string, FoldState> = new Map();

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

        const uri = editor.document.uri.toString();
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

            this.foldState.set(uri, 0);
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
     * Fold all non-root 'describe' blocks in the given editor
     */
    async foldDescribeBlocks(editor: vscode.TextEditor): Promise<void> {
        const blocks = detectDescribeBlocks(editor.document);

        if (blocks.length === 0) {
            return;
        }

        const uri = editor.document.uri.toString();
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

            this.foldState.set(uri, 2);
        } catch (error) {
            console.warn('RSpec Fold: Failed to fold describe blocks', error);
        }
    }

    /**
     * Unfold all non-root 'describe' blocks in the given editor
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
     * 3-way toggle: it folded → neither → describe folded → it folded → ...
     */
    async toggleFolding(editor: vscode.TextEditor): Promise<void> {
        const uri = editor.document.uri.toString();
        const currentState = this.foldState.get(uri) ?? 0; // Default to 0 (it folded) since auto-fold on open

        if (currentState === 0) {
            // it folded → neither
            await this.unfoldItBlocks(editor);
            this.foldState.set(uri, 1);
        } else if (currentState === 1) {
            // neither → describe folded
            await this.foldDescribeBlocks(editor);
        } else {
            // describe folded → it folded
            await this.unfoldDescribeBlocks(editor);
            await this.foldItBlocks(editor);
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
        this.foldState.clear();
    }
}
