import * as vscode from 'vscode';
import { detectItBlocks, detectDescribeBlocks } from './blockDetector';
import { isRSpecFile } from './utils';

export class RSpecFoldingRangeProvider implements vscode.FoldingRangeProvider {

    provideFoldingRanges(
        document: vscode.TextDocument,
        context: vscode.FoldingContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FoldingRange[]> {

        // Only provide folding ranges for RSpec files
        if (!isRSpecFile(document)) {
            return [];
        }

        if (token.isCancellationRequested) {
            return [];
        }

        const itBlocks = detectItBlocks(document);
        const describeBlocks = detectDescribeBlocks(document);

        const itRanges = itBlocks.map(block => new vscode.FoldingRange(
            block.startLine,
            block.endLine,
            vscode.FoldingRangeKind.Region
        ));

        const describeRanges = describeBlocks.map(block => new vscode.FoldingRange(
            block.startLine,
            block.endLine,
            vscode.FoldingRangeKind.Region
        ));

        return [...itRanges, ...describeRanges];
    }
}
