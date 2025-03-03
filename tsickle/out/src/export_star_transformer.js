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
exports.exportStarTransformer = void 0;
const ts = __importStar(require("typescript"));
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
function exportStarTransformer() {
    return (context) => {
        return (sourceFile) => {
            function visit(node) {
                // Check if the node is a NamespaceExport (export * as NS from "module")
                if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamespaceExport(node.exportClause)) {
                    const namespaceName = node.exportClause.name;
                    const moduleSpecifier = node.moduleSpecifier;
                    if (!moduleSpecifier)
                        return node;
                    // Create import * as namespace from "module"
                    const importDecl = ts.factory.createImportDeclaration(undefined, ts.factory.createImportClause(false, undefined, ts.factory.createNamespaceImport(namespaceName)), moduleSpecifier);
                    // Create export {namespace}
                    const exportDecl = ts.factory.createExportDeclaration(undefined, false, ts.factory.createNamedExports([
                        ts.factory.createExportSpecifier(false, undefined, namespaceName)
                    ]));
                    return [importDecl, exportDecl];
                }
                return ts.visitEachChild(node, visit, context);
            }
            return ts.visitEachChild(sourceFile, visit, context);
        };
    };
}
exports.exportStarTransformer = exportStarTransformer;
//# sourceMappingURL=export_star_transformer.js.map