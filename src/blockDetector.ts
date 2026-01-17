import * as vscode from 'vscode';

export interface ItBlock {
    startLine: number;  // 0-based line number of the 'it' or 'specify' line
    endLine: number;    // 0-based line number of the matching 'end'
}

/**
 * Detects all 'it' and 'specify' blocks in an RSpec file
 */
export function detectItBlocks(document: vscode.TextDocument): ItBlock[] {
    const config = vscode.workspace.getConfiguration('rspecFold');
    const includeSpecify = config.get<boolean>('includeSpecifyBlocks', true);

    const blocks: ItBlock[] = [];
    const lineCount = document.lineCount;

    // Pattern for 'it' and optionally 'specify' blocks
    const keywords = includeSpecify ? 'it|specify' : 'it';
    const blockStartPattern = new RegExp(`^(\\s*)(${keywords})\\s+`);

    for (let i = 0; i < lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text;

        // Check if this line starts an 'it' or 'specify' block
        const match = text.match(blockStartPattern);
        if (match && text.trimEnd().endsWith(' do')) {
            const indentLength = match[1].length;

            // Find matching 'end' by tracking indentation
            const endLine = findMatchingEnd(document, i, indentLength);

            if (endLine !== -1) {
                blocks.push({
                    startLine: i,
                    endLine: endLine
                });
            }
        }
    }

    return blocks;
}

/**
 * Find the matching 'end' for a block starting at the given line.
 * Uses indentation tracking to handle nested blocks.
 */
function findMatchingEnd(
    document: vscode.TextDocument,
    startLine: number,
    startIndent: number
): number {
    const lineCount = document.lineCount;

    for (let i = startLine + 1; i < lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text;
        const trimmed = text.trim();

        // Skip empty lines and comments
        if (trimmed === '' || trimmed.startsWith('#')) {
            continue;
        }

        // Check for 'end' at the same indentation level
        if (trimmed === 'end') {
            const currentIndent = text.search(/\S/);
            if (currentIndent === startIndent) {
                return i;
            }
        }
    }

    // No matching end found
    return -1;
}
