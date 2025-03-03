/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview Transformer to convert namespaces with nested
 * types into a form that the JSCompiler understands.
 */
import * as ts from 'typescript';
import { AnnotatorHost } from './annotator_host';
/**
 * Transforms declaration merging namespaces.
 *
 * A (non-ambient) namespace NS that has the same name as a class OC adds all
 * its declarations to OC. Currently, only class and enum declarations inside NS
 * are supported. The declarations are renamed and hoisted to the file level. A
 * JSCompiler type alias property for each declaration in NS is added to class
 * OC. The alias introduces a qualified name for the inner class or enum. The
 * namespace is then eliminated so that tsickle does not generate an iife.
 *
 * Example:
 * class Outer { }
 * namespace Outer {
 *   export class InnerClass = { }
 *   export enum InnerEnum = { }
 * }
 *
 * The above is transformed into:
 *
 * class Outer { }
 * class Outer$InnerClass = { }
 * enum Outer$InnerEnum = { }
 * /** const * / Outer.InnerClass = Outer$InnerClass;  // JSCompiler type alias
 * /** const * / Outer.InnerEnum = Outer$InnerEnum;   // JSCompiler type alias
 *
 */
export declare function namespaceTransformer(host: AnnotatorHost, tsOptions: ts.CompilerOptions, typeChecker: ts.TypeChecker, diagnostics: ts.Diagnostic[]): ts.TransformerFactory<ts.SourceFile>;
