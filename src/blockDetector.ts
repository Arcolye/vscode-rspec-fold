import * as vscode from 'vscode';

export interface RSpecBlock {
    startLine: number;  // 0-based line number of the block start
    endLine: number;    // 0-based line number of the matching 'end'
}

/**
 * Detects all 'it' and 'specify' blocks in an RSpec file
 */
export function detectItBlocks(document: vscode.TextDocument): RSpecBlock[] {
    const blocks: RSpecBlock[] = [];
    const lineCount = document.lineCount;

    const blockStartPattern = new RegExp(`^(\\s*)(it|specify|scenario)\\s+`);

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

/**
 * Detects all 'describe' blocks in an RSpec file,
 * excluding root-level blocks (those with no indentation).
 */
export function detectDescribeBlocks(document: vscode.TextDocument): RSpecBlock[] {
    const blocks: RSpecBlock[] = [];
    const lineCount = document.lineCount;

    // Pattern for 'describe' and 'feature' blocks
    const blockStartPattern = /^(\s+)(describe|feature)\s+/;

    for (let i = 0; i < lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text;

        // Check if this line starts a 'describe' block
        // The pattern requires at least some indentation (excludes root level)
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
