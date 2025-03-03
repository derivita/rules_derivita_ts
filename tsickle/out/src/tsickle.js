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
exports.emit = exports.emitWithTsickle = exports.mergeEmitResults = exports.Type = exports.ModuleType = exports.FileSummary = exports.ModulesManifest = exports.getGeneratedExterns = exports.pathToModuleName = void 0;
const ts = __importStar(require("typescript"));
const cli_support_1 = require("./cli_support");
const clutz = __importStar(require("./clutz"));
const decorator_downlevel_transformer_1 = require("./decorator_downlevel_transformer");
const decorators_1 = require("./decorators");
const enum_transformer_1 = require("./enum_transformer");
const externs_1 = require("./externs");
const fileoverview_comment_transformer_1 = require("./fileoverview_comment_transformer");
const googmodule = __importStar(require("./googmodule"));
const jsdoc_transformer_1 = require("./jsdoc_transformer");
const modules_manifest_1 = require("./modules_manifest");
const ns_transformer_1 = require("./ns_transformer");
const transformer_util_1 = require("./transformer_util");
const tsmes = __importStar(require("./ts_migration_exports_shim"));
const tsickle_declaration_marker_1 = require("./tsickle_declaration_marker");
const fix_downleveled_decorators_1 = require("./fix_downleveled_decorators");
const export_star_transformer_1 = require("./export_star_transformer");
// Exported for users as a default impl of pathToModuleName.
var cli_support_2 = require("./cli_support");
Object.defineProperty(exports, "pathToModuleName", { enumerable: true, get: function () { return cli_support_2.pathToModuleName; } });
// Retained here for API compatibility.
var externs_2 = require("./externs");
Object.defineProperty(exports, "getGeneratedExterns", { enumerable: true, get: function () { return externs_2.getGeneratedExterns; } });
var modules_manifest_2 = require("./modules_manifest");
Object.defineProperty(exports, "ModulesManifest", { enumerable: true, get: function () { return modules_manifest_2.ModulesManifest; } });
var summary_1 = require("./summary");
Object.defineProperty(exports, "FileSummary", { enumerable: true, get: function () { return summary_1.FileSummary; } });
Object.defineProperty(exports, "ModuleType", { enumerable: true, get: function () { return summary_1.ModuleType; } });
Object.defineProperty(exports, "Type", { enumerable: true, get: function () { return summary_1.Type; } });
function mergeEmitResults(emitResults) {
    const diagnostics = [];
    let emitSkipped = true;
    const emittedFiles = [];
    const externs = {};
    const modulesManifest = new modules_manifest_1.ModulesManifest();
    const tsMigrationExportsShimFiles = new Map();
    const fileSummaries = new Map();
    for (const er of emitResults) {
        diagnostics.push(...er.diagnostics);
        emitSkipped = emitSkipped || er.emitSkipped;
        if (er.emittedFiles) {
            emittedFiles.push(...er.emittedFiles);
        }
        Object.assign(externs, er.externs);
        modulesManifest.addManifest(er.modulesManifest);
        for (const [k, v] of er.tsMigrationExportsShimFiles) {
            tsMigrationExportsShimFiles.set(k, v);
        }
        for (const [k, v] of er.fileSummaries) {
            fileSummaries.set(k, v);
        }
    }
    return {
        diagnostics,
        emitSkipped,
        emittedFiles,
        externs,
        tsMigrationExportsShimFiles,
        modulesManifest,
        fileSummaries,
    };
}
exports.mergeEmitResults = mergeEmitResults;
/**
 * @deprecated Exposed for backward compat with Angular.  Use emit() instead.
 */
function emitWithTsickle(program, host, tsHost, tsOptions, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers = {}) {
    return emit(program, host, writeFile || tsHost.writeFile.bind(tsHost), targetSourceFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
}
exports.emitWithTsickle = emitWithTsickle;
function emit(program, host, writeFile, targetSourceFile, cancellationToken, emitOnlyDtsFiles, customTransformers = {}) {
    for (const sf of program.getSourceFiles()) {
        (0, cli_support_1.assertAbsolute)(sf.fileName);
    }
    let tsickleDiagnostics = [];
    const typeChecker = program.getTypeChecker();
    const tsOptions = program.getCompilerOptions();
    if (!tsOptions.rootDir) {
        // Various places within tsickle assume rootDir is always present,
        // so return an error here if it wasn't provided.
        return {
            emitSkipped: false,
            diagnostics: [{
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                    file: undefined,
                    start: undefined,
                    length: undefined,
                    messageText: 'TypeScript options must specify rootDir',
                }],
            modulesManifest: new modules_manifest_1.ModulesManifest(),
            externs: {},
            tsMigrationExportsShimFiles: new Map(),
            fileSummaries: new Map(),
        };
    }
    const modulesManifest = new modules_manifest_1.ModulesManifest();
    const tsMigrationExportsShimFiles = new Map();
    const tsickleSourceTransformers = [];
    const fileSummaries = new Map();
    tsickleSourceTransformers.push(tsmes.createTsMigrationExportsShimTransformerFactory(typeChecker, host, modulesManifest, tsickleDiagnostics, tsMigrationExportsShimFiles, fileSummaries));
    if (host.transformTypesToClosure) {
        // Only add @suppress {checkTypes} comments when also adding type
        // annotations.
        tsickleSourceTransformers.push((0, fileoverview_comment_transformer_1.transformFileoverviewCommentFactory)(tsOptions, tsickleDiagnostics, host.generateExtraSuppressions));
        if (host.useDeclarationMergingTransformation) {
            tsickleSourceTransformers.push((0, ns_transformer_1.namespaceTransformer)(host, tsOptions, typeChecker, tsickleDiagnostics));
        }
        tsickleSourceTransformers.push((0, jsdoc_transformer_1.jsdocTransformer)(host, tsOptions, typeChecker, tsickleDiagnostics));
        tsickleSourceTransformers.push((0, enum_transformer_1.enumTransformer)(typeChecker));
    }
    if (host.transformDecorators) {
        tsickleSourceTransformers.push((0, decorator_downlevel_transformer_1.decoratorDownlevelTransformer)(typeChecker, tsickleDiagnostics));
    }
    const tsTransformers = {
        before: [
            ...(tsickleSourceTransformers || [])
                .map(tf => skipTransformForSourceFileIfNeeded(host, tf)),
            ...(customTransformers.beforeTs || []),
        ],
        after: [...(customTransformers.afterTs || [])],
        afterDeclarations: [...(customTransformers.afterDeclarations || [])]
    };
    if (host.transformTypesToClosure) {
        // See comment on removeTypeAssertions.
        tsTransformers.before.push((0, jsdoc_transformer_1.removeTypeAssertions)());
    }
    if (host.googmodule) {
        tsTransformers.after.push(googmodule.commonJsToGoogmoduleTransformer(host, modulesManifest, typeChecker));
        tsTransformers.after.push((0, decorators_1.transformDecoratorsOutputForClosurePropertyRenaming)(tsickleDiagnostics));
        tsTransformers.after.push((0, decorators_1.transformDecoratorJsdoc)());
    }
    else if (host.transformTypesToClosure) {
        tsTransformers.after.push((0, export_star_transformer_1.exportStarTransformer)());
        tsTransformers.after.push((0, decorators_1.transformDecoratorsOutputForClosurePropertyRenaming)(tsickleDiagnostics, false));
        tsTransformers.after.push((0, decorators_1.transformDecoratorJsdoc)());
        tsTransformers.after.push((0, fix_downleveled_decorators_1.fixDownleveledDecorators)());
    }
    if (host.addDtsClutzAliases) {
        tsTransformers.afterDeclarations.push(clutz.makeDeclarationTransformerFactory(typeChecker, host));
    }
    // Adds a marker to the top of tsickle-generated .d.ts files, should always go
    // last
    tsTransformers.afterDeclarations.push((0, tsickle_declaration_marker_1.makeTsickleDeclarationMarkerTransformerFactory)(tsOptions));
    const { diagnostics: tsDiagnostics, emitSkipped, emittedFiles } = program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, tsTransformers);
    const externs = {};
    if (host.transformTypesToClosure) {
        const sourceFiles = targetSourceFile ? [targetSourceFile] : program.getSourceFiles();
        for (const sourceFile of sourceFiles) {
            const isDts = (0, transformer_util_1.isDtsFileName)(sourceFile.fileName);
            if (isDts && host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
                continue;
            }
            const { output, diagnostics, moduleNamespace } = (0, externs_1.generateExterns)(typeChecker, sourceFile, host);
            if (output) {
                externs[sourceFile.fileName] = { output, moduleNamespace };
            }
            if (diagnostics) {
                tsickleDiagnostics.push(...diagnostics);
            }
        }
    }
    // All diagnostics (including warnings) are treated as errors.
    // If the host decides to ignore warnings, just discard them.
    // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
    // warns and then fixes up the code to be Closure-compatible anyway.
    tsickleDiagnostics = tsickleDiagnostics.filter(d => d.category === ts.DiagnosticCategory.Error ||
        !host.shouldIgnoreWarningsForPath(d.file.fileName));
    return {
        modulesManifest,
        emitSkipped,
        emittedFiles: emittedFiles || [],
        diagnostics: [...tsDiagnostics, ...tsickleDiagnostics],
        externs,
        tsMigrationExportsShimFiles,
        fileSummaries,
    };
}
exports.emit = emit;
function skipTransformForSourceFileIfNeeded(host, delegateFactory) {
    return (context) => {
        const delegate = delegateFactory(context);
        return (sourceFile) => {
            if (host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
                return sourceFile;
            }
            return delegate(sourceFile);
        };
    };
}
//# sourceMappingURL=tsickle.js.map