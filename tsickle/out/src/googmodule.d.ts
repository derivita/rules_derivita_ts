/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { ModulesManifest } from './modules_manifest';
/**
 * Provides dependencies for and configures the goog namespace resolution
 * behavior.
 */
export interface GoogModuleProcessorHost {
    /**
     * Takes a context (ts.SourceFile.fileName of the current file) and the import
     * URL of an ES6 import and generates a googmodule module name for the
     * imported module.
     *
     * The import URL is guaranteed to point to another TypeScript file.
     * JavaScript imports are resolved using `jsPathToModuleName`.
     */
    pathToModuleName(context: string, importPath: string): string;
    /**
     * Takes the import URL of an ES6 import and returns the googmodule module
     * name for the imported module, iff the module is an original closure
     * JavaScript file.
     *
     * Warning: If this function is present, GoogModule won't produce diagnostics
     * for multiple provides.
     */
    jsPathToModuleName?(importPath: string): string | undefined;
    /**
     * Takes the import URL of an ES6 import and returns the property name that
     * should be stripped from the usage.
     *
     * Example:
     *
     *     // workspace/lib/bar.js
     *     goog.module('lib.Bar');
     *     exports = class Bar {};
     *     // workspace/main.ts
     *     import {Bar} from 'workspace/lib/bar';
     *     console.log(Bar);
     *
     * TypeScript transforms this into:
     *
     *     const bar_1 = require('workspace/lib/bar');
     *     console.log(bar_1.Bar);
     *
     * If jsPathToStripProperty() returns 'Bar', GoogModule transform this into:
     *
     *     const bar_1 = goog.require('lib.Bar');
     *     console.log(bar_1);
     */
    jsPathToStripProperty?(importPath: string): string | undefined;
    /**
     * If we do googmodule processing, we polyfill module.id, since that's
     * part of ES6 modules.  This function determines what the module.id will be
     * for each file.
     */
    fileNameToModuleId(fileName: string): string;
    /** Is the generated file meant for JSCompiler? */
    transformTypesToClosure?: boolean;
    options: ts.CompilerOptions;
    /**
     * What dynamic `import()` should be transformed to.
     * If 'closure', it's transformed to goog.requireDynamic().
     * If 'nodejs', it's the default behaviour, which is nodejs require.
     */
    transformDynamicImport: 'nodejs' | 'closure';
}
/**
 * Resolves an import path to its goog namespace, if it points to an original
 * closure JavaScript file.
 *
 * Forwards to the same function on the host if present, otherwise relies on
 * marker symbols in Clutz .d.ts files.
 */
export declare function jsPathToNamespace(host: GoogModuleProcessorHost, context: ts.Node, diagnostics: ts.Diagnostic[], importPath: string, getModuleSymbol: () => ts.Symbol | undefined): string | undefined;
/**
 * Resolves an import path to its goog namespace, if it points to an original
 * closure JavaScript file, using only local information.
 *
 * Forwards to `jsPathToModuleName` on the host if present.
 */
export declare function localJsPathToNamespace(host: GoogModuleProcessorHost, importPath: string): string | undefined;
/**
 * Resolves an import path and returns the property name that should be
 * stripped from usages.
 *
 * Forwards to the same function on the host if present, otherwise relies on
 * marker symbols in Clutz .d.ts files.
 */
export declare function jsPathToStripProperty(host: GoogModuleProcessorHost, importPath: string, getModuleSymbol: () => ts.Symbol | undefined): string | undefined;
/**
 * extractModuleMarker extracts the value of a well known marker symbol from the
 * given module symbol. It returns undefined if the symbol wasn't found.
 */
export declare function extractModuleMarker(symbol: ts.Symbol, name: '__clutz_actual_namespace' | '__clutz_multiple_provides' | '__clutz_actual_path' | '__clutz_strip_property' | '__clutz2_actual_path'): string | boolean | undefined;
/**
 * Returns the name of the goog.module, from which the given source file has
 * been generated.
 */
export declare function getOriginalGoogModuleFromComment(sf: ts.SourceFile): string | undefined;
/**
 * getAmbientModuleSymbol returns the module symbol for the module referenced
 * by the given URL. It special cases ambient module URLs that cannot be
 * resolved (e.g. because they exist on synthesized nodes) and looks those up
 * separately.
 */
export declare function getAmbientModuleSymbol(typeChecker: ts.TypeChecker, moduleUrl: ts.StringLiteral): ts.Symbol | undefined;
/**
 * commonJsToGoogmoduleTransformer returns a transformer factory that converts
 * TypeScript's CommonJS module emit to Closure Compiler compatible goog.module
 * and goog.require statements.
 */
export declare function commonJsToGoogmoduleTransformer(host: GoogModuleProcessorHost, modulesManifest: ModulesManifest, typeChecker: ts.TypeChecker): (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;
