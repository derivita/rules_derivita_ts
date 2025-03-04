/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
/**
 * TypeScript has an API for JSDoc already, but it's not exposed.
 * https://github.com/Microsoft/TypeScript/issues/7393
 * For now we create types that are similar to theirs so that migrating
 * to their API will be easier.  See e.g. ts.JSDocTag and ts.JSDocComment.
 */
export interface Tag {
    /**
     * tagName is e.g. "param" in an @param declaration.  It is the empty string
     * for the plain text documentation that occurs before any @foo lines.
     */
    tagName: string;
    /**
     * parameterName is the the name of the function parameter, e.g. "foo"
     * in `\@param foo The foo param`
     */
    parameterName?: string;
    /**
     * The type of a JSDoc \@param, \@type etc tag, rendered in curly braces.
     * Can also hold the type of an \@suppress.
     */
    type?: string;
    /** optional is true for optional function parameters. */
    optional?: boolean;
    /** restParam is true for "...x: foo[]" function parameters. */
    restParam?: boolean;
    /**
     * destructuring is true for destructuring bind parameters, which require
     * non-null arguments on the Closure side.  Can likely remove this
     * once TypeScript nullable types are available.
     */
    destructuring?: boolean;
    /** Any remaining text on the tag, e.g. the description. */
    text?: string;
}
/**
 * Tags that conflict with \@type in Closure Compiler and must always be
 * escaped (e.g. \@param).
 */
export declare const TAGS_CONFLICTING_WITH_TYPE: Set<string>;
/**
 * Result of parsing a JSDoc comment. Such comments essentially are built of a list of tags.
 * In addition to the tags, this might also contain warnings to indicate non-fatal problems
 * while finding the tags.
 */
export interface ParsedJSDocComment {
    tags: Tag[];
    warnings?: string[];
}
/**
 * parse parses JSDoc out of a comment string.
 * Returns null if comment is not JSDoc.
 */
export declare function parse(comment: ts.SynthesizedComment): ParsedJSDocComment | null;
/**
 * Returns the input string with line endings normalized to '\n'.
 */
export declare function normalizeLineEndings(input: string): string;
/**
 * parseContents parses JSDoc out of a comment text.
 * Returns null if comment is not JSDoc.
 *
 * @param commentText a comment's text content, i.e. the comment w/o /* and * /.
 */
export declare function parseContents(commentText: string): ParsedJSDocComment | null;
/**
 * A synthesized comment that (possibly) includes the original comment range it was created from.
 */
export interface SynthesizedCommentWithOriginal extends ts.SynthesizedComment {
    /**
     * The original text range of the comment (relative to the source file's full text).
     */
    originalRange?: ts.TextRange;
}
/**
 * synthesizeLeadingComments parses the leading comments of node, converts them
 * to synthetic comments, and makes sure the original text comments do not get
 * emitted by TypeScript.
 */
export declare function synthesizeLeadingComments(node: ts.Node): SynthesizedCommentWithOriginal[];
/**
 * parseLeadingCommentRangesSynthesized parses the leading comment ranges out of the given text and
 * converts them to SynthesizedComments.
 * @param offset the offset of text in the source file, e.g. node.getFullStart().
 */
export declare function getLeadingCommentRangesSynthesized(text: string, offset?: number): SynthesizedCommentWithOriginal[];
/**
 * suppressCommentsRecursively prevents emit of leading comments on node, and any recursive nodes
 * underneath it that start at the same offset.
 */
export declare function suppressLeadingCommentsRecursively(node: ts.Node): void;
export declare function toSynthesizedComment(tags: Tag[], escapeExtraTags?: Set<string>, hasTrailingNewLine?: boolean): ts.SynthesizedComment;
/** Serializes a Comment out to a string, but does not include the start and end comment tokens. */
export declare function toStringWithoutStartEnd(tags: Tag[], escapeExtraTags?: Set<string>): string;
/** Serializes a Comment out to a string usable in source code. */
export declare function toString(tags: Tag[], escapeExtraTags?: Set<string>): string;
/** Merges multiple tags (of the same tagName type) into a single unified tag. */
export declare function merge(tags: Tag[]): Tag;
/**
 * Creates comment to be added in generated code to help map generated code
 * back to the original .ts or .d.ts file. It is used by other tools like
 * Kythe to produce cross-language references so it's exact text shouldn't
 * change without updating corresponding tools.
 */
export declare function createGeneratedFromComment(file: string): string;
/**
 * MutableJSDoc encapsulates a (potential) JSDoc comment on a specific node, and
 * allows code to modify (including delete) it.
 */
export declare class MutableJSDoc {
    private readonly node;
    private sourceComment;
    tags: Tag[];
    constructor(node: ts.Node, sourceComment: ts.SynthesizedComment | null, tags: Tag[]);
    updateComment(escapeExtraTags?: Set<string>): void;
}
/**
 * Parses and synthesizes comments on node, and returns the JSDoc from it, if
 * any.
 * @param diagnostics if set, will report warnings from parsing the JSDoc. Set
 *     to undefined if this is not the "main" location dealing with a node to
 *     avoid duplicated warnings.
 * @param sourceFile if diagnostics is set, will use sourceFile to determine
 *     diagnostic location.
 */
export declare function getJSDocTags(node: ts.Node, diagnostics?: ts.Diagnostic[], sourceFile?: ts.SourceFile): Tag[];
/**
 * Parses and synthesizes comments on node, and returns a MutableJSDoc from it.
 * @param diagnostics if set, will report warnings from parsing the JSDoc. Set
 *     to undefined if this is not the "main" location dealing with a node to
 *     avoid duplicated warnings.
 * @param sourceFile if diagnostics is set, will use sourceFile to determine
 *     diagnostic location.
 */
export declare function getMutableJSDoc(node: ts.Node, diagnostics?: ts.Diagnostic[], sourceFile?: ts.SourceFile): MutableJSDoc;
