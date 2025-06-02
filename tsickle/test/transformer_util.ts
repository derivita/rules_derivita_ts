import * as ts from 'typescript';

/**
 * Helper function to test TypeScript transformers.
 * Takes a source code string and a transformer factory, applies the transformer,
 * and returns the transformed code as a string.
 */
export function transformCode(
    input: string,
    transformerFactory: (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>): string {
  const sourceFile = ts.createSourceFile(
      'test.ts', input, ts.ScriptTarget.ES2015, true);
  const result = ts.transform(sourceFile, [transformerFactory]);
  const printer = ts.createPrinter();
  return printer.printFile(result.transformed[0]);
}
