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
const jsdoc = __importStar(require("../src/jsdoc"));
describe('jsdoc.parse', () => {
    function parse(text) {
        const synth = jsdoc.getLeadingCommentRangesSynthesized(text);
        return jsdoc.parse(synth[0]);
    }
    it('does not get non-jsdoc values', () => {
        const source = '/* ordinary comment */';
        expect(parse(source)).toEqual(null);
    });
    it('grabs plain text from jsdoc', () => {
        const source = '/** jsdoc comment */';
        expect(parse(source)).toEqual({ tags: [{ tagName: '', text: 'jsdoc comment' }] });
    });
    it('gathers @tags from jsdoc', () => {
        const source = `/**
  * @param foo
  *   @param indented from line start.
  * @param bar multiple
  *    line comment
  * @return foobar
  * @nosideeffects
  * @nospacebeforebracket{text in bracket}
  */`;
        expect(parse(source)).toEqual({
            tags: [
                { tagName: 'param', parameterName: 'foo' },
                { tagName: 'param', parameterName: 'indented', text: 'from line start.' },
                {
                    tagName: 'param',
                    parameterName: 'bar',
                    text: 'multiple\n   line comment'
                },
                { tagName: 'return', text: 'foobar' },
                { tagName: 'nosideeffects' },
                { tagName: 'nospacebeforebracket', text: '{text in bracket}' },
            ]
        });
    });
    it('warns on type annotations in parameters', () => {
        const source = `/**
  * @param {string} foo
*/`;
        expect(parse(source)).toEqual({
            tags: [],
            warnings: [
                'the type annotation on @param is redundant with its TypeScript type, remove the {...} part'
            ]
        });
    });
    it('warns on @type annotations', () => {
        const source = `/** @type {string} foo */`;
        expect(parse(source)).toEqual({
            tags: [],
            warnings: ['@type annotations are redundant with TypeScript equivalents']
        });
    });
    it('allows @suppress annotations', () => {
        const source = `/** @suppress {checkTypes} I hate types */`;
        expect(parse(source)).toEqual({
            tags: [{ tagName: 'suppress', type: 'checkTypes', text: ' I hate types' }]
        });
        const malformed = `/** @suppress malformed */`;
        expect(parse(malformed)).toEqual({
            tags: [{ tagName: 'suppress', text: 'malformed' }],
            warnings: ['malformed @suppress tag: "malformed"'],
        });
    });
});
describe('jsdoc.toString', () => {
    it('filters duplicated @deprecated tags', () => {
        expect(jsdoc.toString([
            { tagName: 'deprecated' }, { tagName: 'param', parameterName: 'hello', text: 'world' },
            { tagName: 'deprecated' }
        ])).toBe(`/**
 * @deprecated
 * @param hello world
 */
`);
    });
    it('escapes @argument tags', () => {
        expect(jsdoc.toString([
            { tagName: 'argument', parameterName: 'hello', text: 'world' },
        ])).toBe(`/**
 * \\@argument hello world
 */
`);
    });
});
//# sourceMappingURL=jsdoc_test.js.map