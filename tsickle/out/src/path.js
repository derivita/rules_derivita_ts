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
exports.resolve = exports.normalize = exports.relative = exports.dirname = exports.join = exports.isAbsolute = void 0;
/**
 * @fileoverview Path manipulation functions.
 * These are the functions exposed by nodejs in the 'path' module.
 *
 * But we actually use the TypeScript path-manipulation logic because:
 * 1) we want the exact same behaviors as TS;
 * 2) we don't depend on node's 'path' module when running under a browser
 * So we poke into their private API for these.
 */
const ts = __importStar(require("typescript"));
function isAbsolute(path) {
    return ts.isRootedDiskPath(path);
}
exports.isAbsolute = isAbsolute;
function join(p1, p2) {
    return ts.combinePaths(p1, p2);
}
exports.join = join;
function dirname(path) {
    return ts.getDirectoryPath(path);
}
exports.dirname = dirname;
function relative(base, rel) {
    return ts.convertToRelativePath(rel, base, p => p);
}
exports.relative = relative;
function normalize(path) {
    return ts.resolvePath(path);
}
exports.normalize = normalize;
/** Wrapper around ts.resolvePath. */
function resolve(path, ...paths) {
    return ts.resolvePath(path, ...paths);
}
exports.resolve = resolve;
//# sourceMappingURL=path.js.map