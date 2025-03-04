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
exports.transformCode = void 0;
const ts = __importStar(require("typescript"));
/**
 * Helper function to test TypeScript transformers.
 * Takes a source code string and a transformer factory, applies the transformer,
 * and returns the transformed code as a string.
 */
function transformCode(input, transformerFactory) {
    const sourceFile = ts.createSourceFile('test.ts', input, ts.ScriptTarget.ES2015, true);
    const result = ts.transform(sourceFile, [transformerFactory]);
    const printer = ts.createPrinter();
    return printer.printFile(result.transformed[0]);
}
exports.transformCode = transformCode;
//# sourceMappingURL=transformer_util.js.map