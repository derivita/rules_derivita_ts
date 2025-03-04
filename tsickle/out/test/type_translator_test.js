"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
const ts = __importStar(require("typescript"));
const typeTranslator = __importStar(require("../src/type_translator"));
describe('isBuiltinLibDTS', () => {
    it('matches builtins', () => {
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('lib.d.ts')))
            .toBe(true);
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('lib.es6.d.ts')))
            .toBe(true);
    });
    it('doesn\'t match others', () => {
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('lib.ts')))
            .toBe(false);
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('libfoo.d.tts')))
            .toBe(false);
        expect(typeTranslator.isDeclaredInBuiltinLibDTS(createNodeInSourceFile('lib.a/b.d.tts')))
            .toBe(false);
    });
});
function createNodeInSourceFile(sourceFileName) {
    const sF = ts.createSourceFile(sourceFileName, `export const a = 'hello world';`, ts.ScriptTarget.ES5);
    return sF.getChildAt(0);
}
//# sourceMappingURL=type_translator_test.js.map