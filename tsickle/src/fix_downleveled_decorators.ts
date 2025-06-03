import * as ts from "typescript";

/**
 * This fixes the downleveled decorators so Closure doesn't have
 * trouble with them. The problem is that when `experimentalDecorators` is
 * enabled, we TSC ends up converting a class decorator like this:
 *
 * @classDecorator
 * export class Person { ... }
 *
 * to this:
 *
 * let Person = class Person { ... };
 *
 * as well as some calls to __decorate(Person, ...)
 *
 * The problem is that this causes Closure Compiler to fail with this error:
 * ERROR - [JSC_CANNOT_CONVERT_YET] Transpilation of 'Classes with possible name shadowing' is not yet implemented.
 * 21| let Person = class Person {
 *                  ^^^^^^^^^^^^^^
 *
 * This transformer fixes the problem by converting the class expression
 * to a class declaration.
 */
export function fixDownleveledDecorators() {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => {
      function visit(node: ts.Node): ts.Node {
        // Check if the node is a VariableDeclarationList
        if (ts.isVariableDeclarationList(node)) {
          for (const declaration of node.declarations) {
            if (
              declaration.initializer &&
              ts.isClassExpression(declaration.initializer)
            ) {
              const className = declaration.name;
              // convert the class expression to a class declaration
              const classDeclaration = ts.factory.createClassDeclaration(
                undefined,
                className.getText(),
                [],
                [],
                declaration.initializer.members
              );
              return classDeclaration;
            }
          }
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitEachChild(sourceFile, visit, context);
    };
  };
}
