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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixDownleveledDecorators = void 0;
const ts = __importStar(require("typescript"));
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
function fixDownleveledDecorators() {
    return (context) => {
        return (sourceFile) => {
            function visit(node) {
                // Check if the node is a VariableDeclarationList
                if (ts.isVariableDeclarationList(node)) {
                    for (const declaration of node.declarations) {
                        if (declaration.initializer &&
                            ts.isClassExpression(declaration.initializer)) {
                            const className = declaration.name;
                            // convert the class expression to a class declaration
                            const classDeclaration = ts.factory.createClassDeclaration(undefined, className.getText(), [], [], declaration.initializer.members);
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
exports.fixDownleveledDecorators = fixDownleveledDecorators;
//# sourceMappingURL=fix_downleveled_decorators.js.map