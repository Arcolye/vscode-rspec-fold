"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectItBlocks = detectItBlocks;
exports.detectDescribeBlocks = detectDescribeBlocks;
const vscode = __importStar(require("vscode"));
/**
 * Detects all 'it' and 'specify' blocks in an RSpec file
 */
function detectItBlocks(document) {
    const config = vscode.workspace.getConfiguration('rspecFold');
    const includeSpecify = config.get('includeSpecifyBlocks', true);
    const blocks = [];
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
 * Detects all 'describe' and 'context' blocks in an RSpec file,
 * excluding root-level blocks (those with no indentation).
 */
function detectDescribeBlocks(document) {
    const blocks = [];
    const lineCount = document.lineCount;
    // Pattern for 'describe' and 'context' blocks
    const blockStartPattern = /^(\s+)(describe|context)\s+/;
    for (let i = 0; i < lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text;
        // Check if this line starts a 'describe' or 'context' block
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