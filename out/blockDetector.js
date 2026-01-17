"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectItBlocks = detectItBlocks;
exports.detectDescribeBlocks = detectDescribeBlocks;
/**
 * Detects all 'it' and 'specify' blocks in an RSpec file
 */
function detectItBlocks(document) {
    const blocks = [];
    const lineCount = document.lineCount;
    const blockStartPattern = new RegExp(`^(\\s*)(it|specify)\\s+`);
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
function findMatchingEnd(document, startLine, startIndent) {
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
function detectDescribeBlocks(document) {
    const blocks = [];
    const lineCount = document.lineCount;
    // Pattern for 'describe' and 'context' blocks
    const blockStartPattern = /^(\s+)(describe)\s+/;
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
//# sourceMappingURL=blockDetector.js.map