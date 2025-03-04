import * as ts from "typescript";
/**
 * Closure compiler cannot handle:
 *
 * ```
 * export * as namespace from "./module";
 * ```
 *
 * This transformer changes star namespace exports to the following:
 *
 * ```
 * import * as namespace from "./module";
 * export {namespace};
 * ```
 */
export declare function exportStarTransformer(): (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;
