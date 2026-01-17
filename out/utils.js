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
exports.isRSpecFile = isRSpecFile;
const vscode = __importStar(require("vscode"));
const minimatch_1 = require("minimatch");
const path = __importStar(require("path"));
/**
 * Check if a document matches the RSpec file pattern
 */
function isRSpecFile(document) {
    // Must be a Ruby file
    if (document.languageId !== 'ruby') {
        return false;
    }
    // Must be a file (not untitled)
    if (document.uri.scheme !== 'file') {
        return false;
    }
    const config = vscode.workspace.getConfiguration('rspecFold');
    const pattern = config.get('filePattern', '**/spec/**/*_spec.rb');
    // Get relative path from workspace root
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    let filePath;
    if (workspaceFolder) {
        filePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
    }
    else {
        filePath = document.uri.fsPath;
    }
    // Normalize path separators for cross-platform compatibility
    filePath = filePath.replace(/\\/g, '/');
    return (0, minimatch_1.minimatch)(filePath, pattern, { matchBase: true });
}
//# sourceMappingURL=utils.js.map