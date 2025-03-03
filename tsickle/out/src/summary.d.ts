/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** The Type of an import, as used in JsTrimmer. */
export declare enum Type {
    UNKNOWN = 0,
    /** The symbol type for Closure namespace. */
    CLOSURE = 1,
    /** The symbol type for a GSS namespace. */
    GSS = 2,
    /** The symbol type for a Soy namespace. */
    SOY = 3,
    /** The symbol type for an extensionless google3-relative CSS/GSS path. */
    CSSPATH = 4,
    /** The symbol type for a google3-relative ES module path. */
    ESPATH = 5
}
/** The module system used by a file. */
export declare enum ModuleType {
    UNKNOWN = 0,
    GOOG_PROVIDE = 1,
    GOOG_MODULE = 2,
    ES_MODULE = 3
}
/** A single imported symbol. */
export interface Symbol {
    type: Type;
    name: string;
}
/**
 * The JsTrimmer file summary for a single file.  Contains imported and
 * exported symbols, as well as some other information required for sorting and
 * pruning files.
 */
export declare class FileSummary {
    private readonly provideSet;
    private readonly strongRequireSet;
    private readonly weakRequireSet;
    private readonly dynamicRequireSet;
    private readonly modSet;
    private readonly enhancedSet;
    toggles: string[];
    modName: string | undefined;
    autochunk: boolean;
    enhanceable: boolean;
    moduleType: ModuleType;
    private stringify;
    addProvide(provide: Symbol): void;
    get provides(): Symbol[];
    addStrongRequire(strongRequire: Symbol): void;
    get strongRequires(): Symbol[];
    addWeakRequire(weakRequire: Symbol): void;
    get weakRequires(): Symbol[];
    addDynamicRequire(dynamicRequire: Symbol): void;
    get dynamicRequires(): Symbol[];
    addMods(mods: Symbol): void;
    get mods(): Symbol[];
    addEnhanced(enhanced: Symbol): void;
    get enhanced(): Symbol[];
}
/** Provides dependencies for file generation. */
export interface SummaryGenerationProcessorHost {
    /** @deprecated use unknownTypesPaths instead */
    typeBlackListPaths?: Set<string>;
    /** If provided, a set of paths whose types should always generate as {?}. */
    unknownTypesPaths?: Set<string>;
    /** See compiler_host.ts */
    rootDirsRelative(fileName: string): string;
    /**
     * Whether to convert CommonJS require() imports to goog.module() and
     * goog.require() calls.
     */
    googmodule: boolean;
}
