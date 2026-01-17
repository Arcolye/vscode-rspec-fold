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
exports.AutoFolder = void 0;
const vscode = __importStar(require("vscode"));
const blockDetector_1 = require("./blockDetector");
class AutoFolder {
    constructor() {
        this.pendingFolds = new Map();
        this.foldState = new Map();
    }
    /**
     * Schedule auto-folding with a delay to handle VS Code timing issues
     */
    scheduleAutoFold(editor) {
        const config = vscode.workspace.getConfiguration('rspecFold');
        const autoFoldEnabled = config.get('autoFoldOnOpen', true);
        if (!autoFoldEnabled) {
            return;
        }
        const delay = config.get('foldDelay', 250);
        const uri = editor.document.uri.toString();
        // Cancel any pending fold for this file
        if (this.pendingFolds.has(uri)) {
            clearTimeout(this.pendingFolds.get(uri));
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
    async foldItBlocks(editor) {
        const blocks = (0, blockDetector_1.detectItBlocks)(editor.document);
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
        }
        catch (error) {
            console.warn('RSpec Fold: Failed to fold blocks', error);
        }
    }
    /**
     * Unfold all 'it' blocks in the given editor
     */
    async unfoldItBlocks(editor) {
        const blocks = (0, blockDetector_1.detectItBlocks)(editor.document);
        if (blocks.length === 0) {
            return;
        }
        const selectionLines = blocks.map(block => block.startLine);
        try {
            await vscode.commands.executeCommand('editor.unfold', {
                selectionLines: selectionLines
            });
        }
        catch (error) {
            console.warn('RSpec Fold: Failed to unfold blocks', error);
        }
    }
    /**
     * Fold all non-root 'describe' blocks in the given editor
     */
    async foldDescribeBlocks(editor) {
        const blocks = (0, blockDetector_1.detectDescribeBlocks)(editor.document);
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
        }
        catch (error) {
            console.warn('RSpec Fold: Failed to fold describe blocks', error);
        }
    }
    /**
     * Unfold all non-root 'describe' blocks in the given editor
     */
    async unfoldDescribeBlocks(editor) {
        const blocks = (0, blockDetector_1.detectDescribeBlocks)(editor.document);
        if (blocks.length === 0) {
            return;
        }
        const selectionLines = blocks.map(block => block.startLine);
        try {
            await vscode.commands.executeCommand('editor.unfold', {
                selectionLines: selectionLines
            });
        }
        catch (error) {
            console.warn('RSpec Fold: Failed to unfold describe blocks', error);
        }
    }
    /**
     * 3-way toggle: it folded → neither → describe folded → it folded → ...
     */
    async toggleFolding(editor) {
        const uri = editor.document.uri.toString();
        const currentState = this.foldState.get(uri) ?? 0; // Default to 0 (it folded) since auto-fold on open
        if (currentState === 0) {
            // it folded → neither
            await this.unfoldItBlocks(editor);
            this.foldState.set(uri, 1);
        }
        else if (currentState === 1) {
            // neither → describe folded
            await this.foldDescribeBlocks(editor);
        }
        else {
            // describe folded → it folded
            await this.unfoldDescribeBlocks(editor);
            await this.foldItBlocks(editor);
        }
    }
    /**
     * Clean up pending timeouts
     */
    dispose() {
        for (const timeout of this.pendingFolds.values()) {
            clearTimeout(timeout);
        }
        this.pendingFolds.clear();
        this.foldState.clear();
    }
}
exports.AutoFolder = AutoFolder;
//# sourceMappingURL=autoFolder.js.map