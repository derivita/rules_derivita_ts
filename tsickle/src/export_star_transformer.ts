import * as ts from "typescript";

/**
 * Closure compiler cannot handle:
 *
 * ```
 * export * as namespace from "./module";
 * ```
 *
 * This transformer changes star namespace exports to the following:
 *
 * ```
 * import * as namespace from "./module";
 * export {namespace};
 * ```
 */
export function exportStarTransformer() {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => {
      function visit(node: ts.Node): ts.Node | ts.Node[] {
        // Check if the node is a NamespaceExport (export * as NS from "module")
        if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamespaceExport(node.exportClause)) {
          const namespaceName = node.exportClause.name;
          const moduleSpecifier = node.moduleSpecifier;

          if (!moduleSpecifier) return node;

          // Create import * as namespace from "module"
          const importDecl = ts.factory.createImportDeclaration(
            undefined,
            ts.factory.createImportClause(
              false,
              undefined,
              ts.factory.createNamespaceImport(namespaceName)
            ),
            moduleSpecifier
          );

          // Create export {namespace}
          const exportDecl = ts.factory.createExportDeclaration(
            undefined,
            false,
            ts.factory.createNamedExports([
              ts.factory.createExportSpecifier(
                false,
                undefined,
                namespaceName
              )
            ])
          );

          return [importDecl, exportDecl];
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitEachChild(sourceFile, visit, context);
    };
  };
}
