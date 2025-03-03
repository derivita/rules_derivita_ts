import * as ts from 'typescript';
/**
 * Helper function to test TypeScript transformers.
 * Takes a source code string and a transformer factory, applies the transformer,
 * and returns the transformed code as a string.
 */
export declare function transformCode(input: string, transformerFactory: (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>): string;
