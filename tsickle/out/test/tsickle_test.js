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
const path = __importStar(require("path"));
const ts = __importStar(require("typescript"));
const cli_support_1 = require("../src/cli_support");
const tsickle = __importStar(require("../src/tsickle"));
const testSupport = __importStar(require("./test_support"));
describe('emitWithTsickle', () => {
    function emitWithTsickle(tsSources, tsConfigOverride = {}, tsickleHostOverride = {}, customTransformers) {
        const tsCompilerOptions = Object.assign(Object.assign(Object.assign({}, testSupport.compilerOptions), { target: ts.ScriptTarget.ES5 }), tsConfigOverride);
        const sources = new Map();
        for (const fileName of Object.keys(tsSources)) {
            sources.set(path.join(tsCompilerOptions.rootDir, fileName), tsSources[fileName]);
        }
        const { program } = testSupport.createProgramAndHost(sources, tsCompilerOptions);
        testSupport.expectDiagnosticsEmpty(ts.getPreEmitDiagnostics(program));
        const tsickleHost = Object.assign(Object.assign({ generateExtraSuppressions: false, googmodule: false, transformDecorators: true, transformTypesToClosure: true, generateTsMigrationExportsShim: false, logWarning: (diag) => { }, shouldSkipTsickleProcessing: (fileName) => {
                (0, cli_support_1.assertAbsolute)(fileName);
                return !sources.has(fileName);
            }, shouldIgnoreWarningsForPath: () => false, pathToModuleName: (context, importPath) => {
                importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
                if (importPath[0] === '.') {
                    importPath = path.join(path.dirname(context), importPath);
                }
                return importPath.replace(/\/|\\/g, '.');
            }, fileNameToModuleId: (fileName) => fileName.replace(/^\.\//, '') }, tsickleHostOverride), { options: tsCompilerOptions, rootDirsRelative: testSupport.relativeToTsickleRoot, transformDynamicImport: 'closure' });
        const jsSources = {};
        tsickle.emit(program, tsickleHost, (fileName, data) => {
            jsSources[path.relative(tsCompilerOptions.rootDir, fileName)] = data;
        }, 
        /* sourceFile */ undefined, 
        /* cancellationToken */ undefined, /* emitOnlyDtsFiles */ undefined, customTransformers);
        return jsSources;
    }
    it('should run custom transformers for files with skipTsickleProcessing', () => {
        function transformValue(context) {
            return (sourceFile) => {
                return visitNode(sourceFile);
                function visitNode(node) {
                    if (node.kind === ts.SyntaxKind.NumericLiteral) {
                        return ts.factory.createNumericLiteral(2);
                    }
                    return ts.visitEachChild(node, visitNode, context);
                }
            };
        }
        const tsSources = {
            'a.ts': `export const x = 1;`,
        };
        const jsSources = emitWithTsickle(tsSources, undefined, {
            shouldSkipTsickleProcessing: () => true,
        }, { beforeTs: [transformValue] });
        expect(jsSources['a.js']).toContain('exports.x = 2;');
    });
    it('should export const enums when preserveConstEnums is true', () => {
        const tsSources = {
            'a.ts': `export const enum Foo { Bar };`,
            'b.ts': `export * from './a';`,
        };
        const jsSources = emitWithTsickle(tsSources, {
            preserveConstEnums: true,
            module: ts.ModuleKind.ES2015,
        }, { googmodule: false });
        expect(jsSources['b.js']).toContain(`export { Foo } from './a';`);
    });
    it('should not go into an infinite loop with a self-referential type', () => {
        const tsSources = {
            'a.ts': `export function f() : typeof f { return f; }`,
        };
        const jsSources = emitWithTsickle(tsSources, {
            module: ts.ModuleKind.ES2015,
        });
        expect(jsSources['a.js']).toContain(`
/**
 * @return {function(): ?}
 */
export function f() { return f; }
`);
    });
    describe('regressions', () => {
        it('should produce correct .d.ts files when expanding `export *` with es2015 module syntax', () => {
            const tsSources = {
                'a.ts': `export const x = 1;`,
                'b.ts': `export * from './a';\n`,
            };
            const jsSources = emitWithTsickle(tsSources, {
                declaration: true,
                module: ts.ModuleKind.ES2015,
            }, { googmodule: false });
            expect(jsSources['b.d.ts'])
                .toEqual(`//!! generated by tsickle from b.ts
export * from './a';\n`);
        });
    });
});
//# sourceMappingURL=tsickle_test.js.map