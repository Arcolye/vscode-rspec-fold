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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const rspecFoldingProvider_1 = require("./rspecFoldingProvider");
const autoFolder_1 = require("./autoFolder");
const utils_1 = require("./utils");
let autoFolder;
function activate(context) {
    console.log('RSpec Fold extension activated');
    // Register the FoldingRangeProvider for Ruby files
    const foldingProvider = new rspecFoldingProvider_1.RSpecFoldingRangeProvider();
    context.subscriptions.push(vscode.languages.registerFoldingRangeProvider({ language: 'ruby', scheme: 'file' }, foldingProvider));
    // Initialize auto-folder
    autoFolder = new autoFolder_1.AutoFolder();
    // Listen for active editor changes (handles file opens)
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && (0, utils_1.isRSpecFile)(editor.document)) {
            autoFolder.scheduleAutoFold(editor);
        }
    }));
    // Register manual fold command
    context.subscriptions.push(vscode.commands.registerCommand('rspecFold.foldItBlocks', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && (0, utils_1.isRSpecFile)(editor.document)) {
            await autoFolder.foldItBlocks(editor);
        }
        else {
            vscode.window.showInformationMessage('RSpec Fold: Current file is not an RSpec file');
        }
    }));
    // Register manual unfold command
    context.subscriptions.push(vscode.commands.registerCommand('rspecFold.unfoldItBlocks', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && (0, utils_1.isRSpecFile)(editor.document)) {
            await autoFolder.unfoldItBlocks(editor);
        }
    }));
    // Register fold describe blocks command
    context.subscriptions.push(vscode.commands.registerCommand('rspecFold.foldDescribeBlocks', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && (0, utils_1.isRSpecFile)(editor.document)) {
            await autoFolder.foldDescribeBlocks(editor);
        }
        else {
            vscode.window.showInformationMessage('RSpec Fold: Current file is not an RSpec file');
        }
    }));
    // Register unfold describe blocks command
    context.subscriptions.push(vscode.commands.registerCommand('rspecFold.unfoldDescribeBlocks', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && (0, utils_1.isRSpecFile)(editor.document)) {
            await autoFolder.unfoldDescribeBlocks(editor);
        }
    }));
    // Register 3-way toggle command
    context.subscriptions.push(vscode.commands.registerCommand('rspecFold.toggleFolding', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && (0, utils_1.isRSpecFile)(editor.document)) {
            await autoFolder.toggleFolding(editor);
        }
    }));
    // Fold if an RSpec file is already open when extension activates
    const currentEditor = vscode.window.activeTextEditor;
    if (currentEditor && (0, utils_1.isRSpecFile)(currentEditor.document)) {
        autoFolder.scheduleAutoFold(currentEditor);
    }
}
function deactivate() {
    if (autoFolder) {
        autoFolder.dispose();
    }
}
//# sourceMappingURL=extension.js.map