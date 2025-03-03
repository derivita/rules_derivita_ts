"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSummary = exports.ModuleType = exports.Type = void 0;
/** The Type of an import, as used in JsTrimmer. */
var Type;
(function (Type) {
    Type[Type["UNKNOWN"] = 0] = "UNKNOWN";
    /** The symbol type for Closure namespace. */
    Type[Type["CLOSURE"] = 1] = "CLOSURE";
    /** The symbol type for a GSS namespace. */
    Type[Type["GSS"] = 2] = "GSS";
    /** The symbol type for a Soy namespace. */
    Type[Type["SOY"] = 3] = "SOY";
    /** The symbol type for an extensionless google3-relative CSS/GSS path. */
    Type[Type["CSSPATH"] = 4] = "CSSPATH";
    /** The symbol type for a google3-relative ES module path. */
    Type[Type["ESPATH"] = 5] = "ESPATH";
})(Type || (exports.Type = Type = {}));
/** The module system used by a file. */
var ModuleType;
(function (ModuleType) {
    ModuleType[ModuleType["UNKNOWN"] = 0] = "UNKNOWN";
    ModuleType[ModuleType["GOOG_PROVIDE"] = 1] = "GOOG_PROVIDE";
    ModuleType[ModuleType["GOOG_MODULE"] = 2] = "GOOG_MODULE";
    ModuleType[ModuleType["ES_MODULE"] = 3] = "ES_MODULE";
})(ModuleType || (exports.ModuleType = ModuleType = {}));
/**
 * The JsTrimmer file summary for a single file.  Contains imported and
 * exported symbols, as well as some other information required for sorting and
 * pruning files.
 */
class FileSummary {
    constructor() {
        // These sets are implemented as Maps of jsonified Symbol to Symbol because
        // JavaScript Sets use object address, not object contents.  Similarly, we use
        // getters and setters for these to hide this implementation detail.
        this.provideSet = new Map();
        this.strongRequireSet = new Map();
        this.weakRequireSet = new Map();
        this.dynamicRequireSet = new Map();
        this.modSet = new Map();
        this.enhancedSet = new Map();
        this.toggles = [];
        this.autochunk = false;
        this.enhanceable = false;
        this.moduleType = ModuleType.UNKNOWN;
    }
    stringify(symbol) {
        return JSON.stringify(symbol);
    }
    addProvide(provide) {
        this.provideSet.set(this.stringify(provide), provide);
    }
    get provides() {
        return [...this.provideSet.values()];
    }
    addStrongRequire(strongRequire) {
        this.strongRequireSet.set(this.stringify(strongRequire), strongRequire);
    }
    get strongRequires() {
        return [...this.strongRequireSet.values()];
    }
    addWeakRequire(weakRequire) {
        this.weakRequireSet.set(this.stringify(weakRequire), weakRequire);
    }
    get weakRequires() {
        const weakRequires = [];
        for (const [k, v] of this.weakRequireSet.entries()) {
            if (this.strongRequireSet.has(k))
                continue;
            weakRequires.push(v);
        }
        return weakRequires;
    }
    addDynamicRequire(dynamicRequire) {
        this.dynamicRequireSet.set(this.stringify(dynamicRequire), dynamicRequire);
    }
    get dynamicRequires() {
        return [...this.dynamicRequireSet.values()];
    }
    addMods(mods) {
        this.modSet.set(this.stringify(mods), mods);
    }
    get mods() {
        return [...this.modSet.values()];
    }
    addEnhanced(enhanced) {
        this.enhancedSet.set(this.stringify(enhanced), enhanced);
    }
    get enhanced() {
        return [...this.enhancedSet.values()];
    }
}
exports.FileSummary = FileSummary;
//# sourceMappingURL=summary.js.map