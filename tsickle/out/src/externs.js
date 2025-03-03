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
exports.generateExterns = exports.getGeneratedExterns = void 0;
/**
 * @fileoverview Externs creates Closure Compiler #externs definitions from the
 * ambient declarations in a TypeScript file.
 *
 * (Note that we cannot write the "@" form of the externs tag, even in comments,
 * because the compiler greps for it in source files(!).  So we write #externs
 * instead.)
 *
 * For example, a
 *   declare interface Foo { bar: string; }
 *
 * Would generate a
 *   /.. #externs ./
 *   /.. @record ./
 *   var Foo = function() {};
 *   /.. @type {string} ./
 *   Foo.prototype.bar;
 *
 * The generated externs indicate to Closure Compiler that symbols are external
 * to the optimization process, i.e. they are provided by outside code. That
 * most importantly means they must not be renamed or removed.
 *
 * A major difficulty here is that TypeScript supports module-scoped external
 * symbols; `.d.ts` files can contain `export`s and `import` other files.
 * Closure Compiler does not have such a concept, so tsickle must emulate the
 * behaviour. It does so by following this scheme:
 *
 * 1. non-module .d.ts produces global symbols
 * 2. module .d.ts produce symbols namespaced to the module, by creating a
 *    mangled name matching the current file's path. tsickle expects outside
 *    code (e.g. build system integration or manually written code) to contain a
 *    goog.module/provide that references the mangled path.
 * 3. declarations in `.ts` files produce types that can be separately emitted
 *    in e.g. an `externs.js`, using `getGeneratedExterns` below.
 *    1. non-exported symbols produce global types, because that's what users
 *       expect and it matches TypeScripts emit, which just references `Foo` for
 *       a locally declared symbol `Foo` in a module. Arguably these should be
 *       wrapped in `declare global { ... }`.
 *    2. exported symbols are scoped to the `.ts` file by prefixing them with a
 *       mangled name. Exported types are re-exported from the JavaScript
 *       `goog.module`, allowing downstream code to reference them. This has the
 *       same problem regarding ambient values as above, it is unclear where the
 *       value symbol would be defined, so for the time being this is
 *       unsupported.
 *
 * The effect of this is that:
 * - symbols in a module (i.e. not globals) are generally scoped to the local
 *   module using a mangled name, preventing symbol collisions on the Closure
 *   side.
 * - importing code can unconditionally refer to and import any symbol defined
 *   in a module `X` as `path.to.module.X`, regardless of whether the defining
 *   location is a `.d.ts` file or a `.ts` file, and regardless whether the
 *   symbol is ambient (assuming there's an appropriate shim).
 * - if there is a shim present, tsickle avoids emitting the Closure namespace
 *   itself, expecting the shim to provide the namespace and initialize it to a
 *   symbol that provides the right value at runtime (i.e. the implementation of
 *   whatever third party library the .d.ts describes).
 */
const ts = __importStar(require("typescript"));
const annotator_host_1 = require("./annotator_host");
const enum_transformer_1 = require("./enum_transformer");
const googmodule_1 = require("./googmodule");
const jsdoc = __importStar(require("./jsdoc"));
const jsdoc_transformer_1 = require("./jsdoc_transformer");
const module_type_translator_1 = require("./module_type_translator");
const path = __importStar(require("./path"));
const transformer_util_1 = require("./transformer_util");
const type_translator_1 = require("./type_translator");
/**
 * Symbols that are already declared as externs in Closure, that should
 * be avoided by tsickle's "declare ..." => externs.js conversion.
 */
const PREDECLARED_CLOSURE_EXTERNS_LIST = [
    'exports',
    'global',
    'module',
    // ErrorConstructor is the interface of the Error object itself.
    // tsickle detects that this is part of the TypeScript standard library
    // and assumes it's part of the Closure standard library, but this
    // assumption is wrong for ErrorConstructor.  To properly handle this
    // we'd somehow need to map methods defined on the ErrorConstructor
    // interface into properties on Closure's Error object, but for now it's
    // simpler to just treat it as already declared.
    'ErrorConstructor',
    'Symbol',
    'WorkerGlobalScope',
];
/**
 * The header to be used in generated externs.  This is not included in the
 * output of generateExterns() because generateExterns() works one file at a
 * time, and typically you create one externs file from the entire compilation
 * unit.
 *
 * Suppressions:
 * - checkTypes: Closure's type system does not match TS'.
 * - const: for clashes of const variable assignments. This is needed to not
 *       conflict with the hand-written closure externs.
 * - duplicate: because externs might duplicate re-opened definitions from other
 *       JS files.
 * - missingOverride: There's no benefit to having closure-compiler warn us that
 *       we're overriding methods. Producing such warnings, if any, should be
 *       the job of the TS type system.
 */
const EXTERNS_HEADER = `/**
 * @${''}externs
 * @suppress {checkTypes,const,duplicate,missingOverride}
 */
// NOTE: generated by tsickle, do not edit.
`;
/**
 * Concatenate all generated externs definitions together into a string,
 * including a file comment header.
 *
 * @param rootDir Project root.  Emitted comments will reference paths relative
 *     to this root.
 */
function getGeneratedExterns(externs, rootDir) {
    let allExterns = EXTERNS_HEADER;
    for (const fileName of Object.keys(externs)) {
        const srcPath = path.relative(rootDir, fileName);
        allExterns += `// ${jsdoc.createGeneratedFromComment(srcPath)}\n`;
        allExterns += externs[fileName].output;
    }
    return allExterns;
}
exports.getGeneratedExterns = getGeneratedExterns;
/**
 * isInGlobalAugmentation returns true if declaration is the immediate child of a 'declare global'
 * block.
 */
function isInGlobalAugmentation(declaration) {
    // declare global { ... } creates a ModuleDeclaration containing a ModuleBlock containing the
    // declaration, with the ModuleDeclaration having the GlobalAugmentation flag set.
    if (!declaration.parent || !declaration.parent.parent)
        return false;
    return (declaration.parent.parent.flags & ts.NodeFlags.GlobalAugmentation) !== 0;
}
/**
 * generateExterns generates extern definitions for all ambient declarations in the given source
 * file. It returns a string representation of the Closure JavaScript, not including the initial
 * comment with \@fileoverview and #externs (see above for that).
 */
function generateExterns(typeChecker, sourceFile, host) {
    let output = '';
    const diagnostics = [];
    const isDts = (0, transformer_util_1.isDtsFileName)(sourceFile.fileName);
    const isExternalModule = ts.isExternalModule(sourceFile);
    // .d.ts files declare symbols. The code below translates these into a form understood by Closure
    // Compiler, converting the type syntax, but also converting symbol names into a form accessible
    // to Closure Compiler.
    // Like regular .ts files, .d.ts can be either scripts or modules. Scripts declare symbols in the
    // global namespace, which has the same semantics in Closure and TypeScript, so the code below
    // emits those with the same name.
    // Modules however declare symbols scoped to the module that can be exported. Closure has no
    // concept of externs that are non-global, so tsickle needs to mangle the symbol names, both at
    // their declaration and at their use site.
    // This mangling happens by wrapping all declared symbols in a namespace based on the file name.
    // This namespace is then essentially the exports object for the ambient module (externs in
    // Closure terms). This namespace is called `moduleNamespace` below:
    let moduleNamespace = '';
    if (isExternalModule) {
        moduleNamespace = (0, annotator_host_1.moduleNameAsIdentifier)(host, sourceFile.fileName);
    }
    // Symbols are generated starting in rootNamespace. For script .d.ts with global symbols, this is
    // the empty string. For most module `.d.ts` files, this is the mangled namespace object. The
    // remaining special case are `.d.ts` files containing an `export = something;` statement. In
    // these, the effective exports object, i.e. the object containing the symbols that importing code
    // receives, is different from the main module scope.
    // tsickle handles the `export =` case by generating symbols in a different namespace (escaped
    // with a `_`) below, and then assigning whatever is actually exported into the `moduleNamespace`
    // below.
    let rootNamespace = moduleNamespace;
    // There can only be one export =, and if there is one, there cannot be any other exports.
    const exportAssignment = sourceFile.statements.find(ts.isExportAssignment);
    const hasExportEquals = exportAssignment && exportAssignment.isExportEquals;
    if (hasExportEquals) {
        // If so, move all generated symbols into a different sub-namespace, so that later on we can
        // control what exactly goes on the actual exported namespace.
        rootNamespace = rootNamespace + '_';
    }
    const mtt = new module_type_translator_1.ModuleTypeTranslator(sourceFile, typeChecker, host, diagnostics, /*isForExterns*/ true, 
    /*useInternalNamespaceForExterns=*/ hasExportEquals);
    for (const stmt of sourceFile.statements) {
        // Always collect alises for imported symbols.
        importsVisitor(stmt);
        if (!isDts && !(0, transformer_util_1.hasModifierFlag)(stmt, ts.ModifierFlags.Ambient)) {
            continue;
        }
        visitor(stmt, []);
    }
    /**
     * Convert a qualified name from a .d.ts file or declaration context into a mangled identifier.
     * E.g. for a qualified name in `export = someName;` or `import = someName;`.
     * If `someName` is `declare global { namespace someName {...} }`, tsickle must not qualify access
     * to it with the mangled module namespace as it is emitted in the global namespace. Similarly, if
     * the symbol is declared in a non-module context, it must not be mangled.
     */
    function qualifiedNameToMangledIdentifier(name) {
        const entityName = (0, transformer_util_1.getEntityNameText)(name);
        let symbol = typeChecker.getSymbolAtLocation(name);
        if (symbol) {
            // If this is an aliased name (e.g. from an import), use the alias to refer to it.
            if (symbol.flags & ts.SymbolFlags.Alias) {
                symbol = typeChecker.getAliasedSymbol(symbol);
            }
            const alias = mtt.symbolsToAliasedNames.get(symbol);
            if (alias)
                return alias;
            const isGlobalSymbol = symbol && symbol.declarations && symbol.declarations.some(d => {
                if (isInGlobalAugmentation(d))
                    return true;
                // If the declaration's source file is not a module, it must be global.
                // If it is a module, the identifier must be local to this file, or handled above via the
                // alias.
                return !ts.isExternalModule(d.getSourceFile());
            });
            if (isGlobalSymbol)
                return entityName;
        }
        return rootNamespace + '.' + entityName;
    }
    if (output && isExternalModule) {
        // If tsickle generated any externs and this is an external module, prepend the namespace
        // declaration for it.
        output = `/** @const */\nvar ${rootNamespace} = {};\n` + output;
        let exportedNamespace = rootNamespace;
        if (exportAssignment && hasExportEquals) {
            if (ts.isIdentifier(exportAssignment.expression) ||
                ts.isQualifiedName(exportAssignment.expression)) {
                // E.g. export = someName;
                // If someName is "declare global { namespace someName {...} }", tsickle must not qualify
                // access to it with module namespace as it is emitted in the global namespace.
                exportedNamespace = qualifiedNameToMangledIdentifier(exportAssignment.expression);
            }
            else {
                (0, transformer_util_1.reportDiagnostic)(diagnostics, exportAssignment.expression, `export = expression must be a qualified name, got ${ts.SyntaxKind[exportAssignment.expression.kind]}.`);
            }
            // Assign the actually exported namespace object (which lives somewhere under rootNamespace)
            // into the module's namespace.
            emit(`/**\n * export = ${exportAssignment.expression.getText()}\n * @const\n */\n`);
            emit(`var ${moduleNamespace} = ${exportedNamespace};\n`);
        }
        if (isDts && host.provideExternalModuleDtsNamespace) {
            // In a non-shimmed module, create a global namespace. This exists purely for backwards
            // compatiblity, in the medium term all code using tsickle should always use `goog.module`s,
            // so global names should not be neccessary.
            for (const nsExport of sourceFile.statements.filter(ts.isNamespaceExportDeclaration)) {
                const namespaceName = (0, transformer_util_1.getIdentifierText)(nsExport.name);
                emit(`// export as namespace ${namespaceName}\n`);
                writeVariableStatement(namespaceName, [], exportedNamespace);
            }
        }
    }
    return { output, diagnostics, moduleNamespace };
    function emit(str) {
        output += str;
    }
    /**
     * isFirstDeclaration returns true if decl is the first declaration
     * of its symbol.  E.g. imagine
     *   interface Foo { x: number; }
     *   interface Foo { y: number; }
     * we only want to emit the "\@record" for Foo on the first one.
     *
     * The exception are variable declarations, which - in externs - do not assign a value:
     *   /.. \@type {...} ./
     *   var someVariable;
     *   /.. \@type {...} ./
     *   someNamespace.someVariable;
     * If a later declaration wants to add additional properties on someVariable, tsickle must still
     * emit an assignment into the object, as it's otherwise absent.
     */
    function isFirstValueDeclaration(decl) {
        if (!decl.name)
            return true;
        const sym = typeChecker.getSymbolAtLocation(decl.name);
        if (!sym.declarations || sym.declarations.length < 2)
            return true;
        const earlierDecls = sym.declarations.slice(0, sym.declarations.indexOf(decl));
        // Either there are no earlier declarations, or all of them are variables (see above). tsickle
        // emits a value for all other declaration kinds (function for functions, classes, interfaces,
        // {} object for namespaces).
        return earlierDecls.length === 0 || earlierDecls.every(ts.isVariableDeclaration);
    }
    /** Writes the actual variable statement of a Closure variable declaration. */
    function writeVariableStatement(name, namespace, value) {
        const qualifiedName = namespace.concat([name]).join('.');
        if (namespace.length === 0)
            emit(`var `);
        emit(qualifiedName);
        if (value)
            emit(` = ${value}`);
        emit(';\n');
    }
    /**
     * Writes a Closure variable declaration, i.e. the variable statement with a leading JSDoc
     * comment making it a declaration.
     */
    function writeVariableDeclaration(decl, namespace) {
        if (decl.name.kind === ts.SyntaxKind.Identifier) {
            const name = (0, transformer_util_1.getIdentifierText)(decl.name);
            if (PREDECLARED_CLOSURE_EXTERNS_LIST.indexOf(name) >= 0)
                return;
            emit(jsdoc.toString([{ tagName: 'type', type: mtt.typeToClosure(decl) }]));
            emit('\n');
            writeVariableStatement(name, namespace);
        }
        else {
            errorUnimplementedKind(decl.name, 'externs for variable');
        }
    }
    /**
     * Emits a JSDoc declaration that merges the signatures of the given function declaration (for
     * overloads), and returns the parameter names chosen.
     */
    function emitFunctionType(decls, extraTags = []) {
        const { tags, parameterNames } = mtt.getFunctionTypeJSDoc(decls, extraTags);
        emit('\n');
        emit(jsdoc.toString(tags));
        return parameterNames;
    }
    function writeFunction(name, params, namespace) {
        const paramsStr = params.join(', ');
        if (namespace.length > 0) {
            let fqn = namespace.join('.');
            if (name.kind === ts.SyntaxKind.Identifier) {
                fqn += '.'; // computed names include [ ] in their getText() representation.
            }
            fqn += name.getText();
            emit(`${fqn} = function(${paramsStr}) {};\n`);
        }
        else {
            if (name.kind !== ts.SyntaxKind.Identifier) {
                (0, transformer_util_1.reportDiagnostic)(diagnostics, name, 'Non-namespaced computed name in externs');
            }
            emit(`function ${name.getText()}(${paramsStr}) {}\n`);
        }
    }
    function writeEnum(decl, namespace) {
        // E.g. /** @enum {number} */ var COUNTRY = {US: 1, CA: 1};
        const name = (0, transformer_util_1.getIdentifierText)(decl.name);
        let members = '';
        const enumType = (0, enum_transformer_1.getEnumType)(typeChecker, decl);
        // Closure enums members must have a value of the correct type, but the actual value does not
        // matter in externs.
        const initializer = enumType === 'string' ? `''` : 1;
        for (const member of decl.members) {
            let memberName;
            switch (member.name.kind) {
                case ts.SyntaxKind.Identifier:
                    memberName = (0, transformer_util_1.getIdentifierText)(member.name);
                    break;
                case ts.SyntaxKind.StringLiteral:
                    const text = member.name.text;
                    if ((0, type_translator_1.isValidClosurePropertyName)(text))
                        memberName = text;
                    break;
                default:
                    break;
            }
            if (!memberName) {
                members += `  /* TODO: ${ts.SyntaxKind[member.name.kind]}: ${(0, jsdoc_transformer_1.escapeForComment)(member.name.getText())} */\n`;
                continue;
            }
            members += `  ${memberName}: ${initializer},\n`;
        }
        emit(`\n/** @enum {${enumType}} */\n`);
        writeVariableStatement(name, namespace, `{\n${members}}`);
    }
    /**
     * The type translator translates intersection types as 'any'. If the type
     * intersection contains type literals, the property names in them do not
     * get recorded in the externs file, and JSCompiler may thus rename them
     * later. Here we collect all these property names and emit a dummy type
     * alias for them.
     */
    function handleLostProperties(decl, namespace) {
        let propNames = undefined;
        function collectPropertyNames(node) {
            if (ts.isTypeLiteralNode(node)) {
                for (const m of node.members) {
                    if (m.name && ts.isIdentifier(m.name)) {
                        propNames = propNames || new Set();
                        propNames.add((0, transformer_util_1.getIdentifierText)(m.name));
                    }
                }
            }
            ts.forEachChild(node, collectPropertyNames);
        }
        function findTypeIntersection(node) {
            if (ts.isIntersectionTypeNode(node)) {
                ts.forEachChild(node, collectPropertyNames);
            }
            else {
                ts.forEachChild(node, findTypeIntersection);
            }
        }
        ts.forEachChild(decl, findTypeIntersection);
        if (propNames) {
            const helperName = (0, transformer_util_1.getIdentifierText)(decl.name) + '_preventPropRenaming_doNotUse';
            emit(`\n/** @typedef {{${[...propNames].map(p => `${p}: ?`).join(', ')}}} */\n`);
            writeVariableStatement(helperName, namespace);
        }
    }
    function writeTypeAlias(decl, namespace) {
        const typeStr = mtt.typeToClosure(decl, undefined);
        emit(`\n/** @typedef {${typeStr}} */\n`);
        writeVariableStatement((0, transformer_util_1.getIdentifierText)(decl.name), namespace);
        handleLostProperties(decl, namespace);
    }
    function writeType(decl, namespace) {
        const name = decl.name;
        if (!name) {
            (0, transformer_util_1.reportDiagnostic)(diagnostics, decl, 'anonymous type in externs');
            return;
        }
        // gbigint, as defined in
        // google3/third_party/java_src/clutz/src/resources/closure.lib.d.ts, is
        // defined separately in TypeScript and JavaScript.
        if (name.escapedText === 'gbigint'
            // Just the terminal filename so we can test this.
            && decl.getSourceFile().fileName.endsWith('closure.lib.d.ts')) {
            return;
        }
        const typeName = namespace.concat([name.getText()]).join('.');
        if (PREDECLARED_CLOSURE_EXTERNS_LIST.indexOf(typeName) >= 0)
            return;
        if (isFirstValueDeclaration(decl)) {
            // Emit the 'function' that is actually the declaration of the interface
            // itself.  If it's a class, this function also must include the type
            // annotations of the constructor.
            let paramNames = [];
            const jsdocTags = [];
            let wroteJsDoc = false;
            (0, jsdoc_transformer_1.maybeAddHeritageClauses)(jsdocTags, mtt, decl);
            (0, jsdoc_transformer_1.maybeAddTemplateClause)(jsdocTags, decl);
            if (decl.kind === ts.SyntaxKind.ClassDeclaration) {
                // Translate class to a function to avoid redeclaration issues.
                jsdocTags.push({ tagName: 'constructor' }, { tagName: 'struct' });
                // Check for constructors in current and base classes
                const ctors = getCtors(decl);
                if (ctors.length) {
                    paramNames = emitFunctionType(ctors, jsdocTags);
                    wroteJsDoc = true;
                }
            }
            else {
                // Otherwise it's an interface; tag it as structurally typed.
                jsdocTags.push({ tagName: 'record' }, { tagName: 'struct' });
            }
            if (!wroteJsDoc)
                emit(jsdoc.toString(jsdocTags));
            writeFunction(name, paramNames, namespace);
        }
        // Process everything except
        // (MethodSignature|MethodDeclaration|Constructor|AccessorDeclaration)
        const methods = new Map();
        const accessors = new Map();
        for (const member of decl.members) {
            switch (member.kind) {
                case ts.SyntaxKind.PropertySignature:
                case ts.SyntaxKind.PropertyDeclaration:
                    const prop = member;
                    if (prop.name.kind === ts.SyntaxKind.Identifier) {
                        let type = mtt.typeToClosure(prop);
                        if (prop.questionToken && type === '?') {
                            // An optional 'any' type translates to '?|undefined' in Closure.
                            type = '?|undefined';
                        }
                        const isReadonly = (0, transformer_util_1.hasModifierFlag)(prop, ts.ModifierFlags.Readonly);
                        emit(jsdoc.toString([{ tagName: isReadonly ? 'const' : 'type', type }]));
                        if ((0, transformer_util_1.hasModifierFlag)(prop, ts.ModifierFlags.Static)) {
                            emit(`\n${typeName}.${prop.name.getText()};\n`);
                        }
                        else {
                            emit(`\n${typeName}.prototype.${prop.name.getText()};\n`);
                        }
                        continue;
                    }
                    // TODO: For now property names other than Identifiers are not handled; e.g.
                    //    interface Foo { "123bar": number }
                    break;
                case ts.SyntaxKind.GetAccessor:
                case ts.SyntaxKind.SetAccessor:
                    const accessor = member;
                    if (accessor.name.kind === ts.SyntaxKind.Identifier) {
                        const name = accessor.name.getText();
                        // A setter may take a more general type than the return type of the
                        // getter, but we always use the getter return type as the type
                        // of the extern property, if a getter exists. Both the setter and
                        // getter should give the same type when we query the compiler,
                        // but prefer the getter to ensure consistency.
                        if (!accessors.has(name) ||
                            accessor.kind === ts.SyntaxKind.GetAccessor) {
                            accessors.set(name, accessor);
                        }
                        continue;
                    }
                    break;
                case ts.SyntaxKind.MethodSignature:
                case ts.SyntaxKind.MethodDeclaration:
                    const method = member;
                    const isStatic = (0, transformer_util_1.hasModifierFlag)(method, ts.ModifierFlags.Static);
                    const methodSignature = `${method.name.getText()}$$$${isStatic ? 'static' : 'instance'}`;
                    if (methods.has(methodSignature)) {
                        methods.get(methodSignature).push(method);
                    }
                    else {
                        methods.set(methodSignature, [method]);
                    }
                    continue;
                case ts.SyntaxKind.Constructor:
                    continue; // Handled above.
                default:
                    // Members can include things like index signatures, for e.g.
                    //   interface Foo { [key: string]: number; }
                    // For now, just skip it.
                    break;
            }
            // If we get here, the member wasn't handled in the switch statement.
            let memberName = namespace;
            if (member.name) {
                memberName = memberName.concat([member.name.getText()]);
            }
            emit(`\n/* TODO: ${ts.SyntaxKind[member.kind]}: ${memberName.join('.')} */\n`);
        }
        // Handle accessors (get/set) separately so that we only emit one property
        // even if both are defined.
        for (const [name, accessor] of accessors.entries()) {
            const type = mtt.typeToClosure(accessor);
            // Even for getter-only properties, we use @type. @const would imply that
            // the property is not assignable *and doesn't change*. That is not true
            // in general for getters.
            emit(jsdoc.toString([{ tagName: 'type', type }]));
            if ((0, transformer_util_1.hasModifierFlag)(accessor, ts.ModifierFlags.Static)) {
                emit(`\n${typeName}.${name};\n`);
            }
            else {
                emit(`\n${typeName}.prototype.${name};\n`);
            }
        }
        // Handle method declarations/signatures separately, since we need to deal with overloads.
        for (const methodVariants of Array.from(methods.values())) {
            const firstMethodVariant = methodVariants[0];
            let parameterNames;
            if (methodVariants.length > 1) {
                parameterNames = emitFunctionType(methodVariants);
            }
            else {
                parameterNames = emitFunctionType([firstMethodVariant]);
            }
            const methodNamespace = namespace.concat([name.getText()]);
            // If the method is static, don't add the prototype.
            if (!(0, transformer_util_1.hasModifierFlag)(firstMethodVariant, ts.ModifierFlags.Static)) {
                methodNamespace.push('prototype');
            }
            writeFunction(firstMethodVariant.name, parameterNames, methodNamespace);
        }
    }
    function writeExportDeclaration(exportDeclaration, namespace) {
        if (!exportDeclaration.exportClause) {
            emit(`\n// TODO(tsickle): export * declaration in ${debugLocationStr(exportDeclaration, namespace)}\n`);
            return;
        }
        if (ts.isNamespaceExport(exportDeclaration.exportClause)) {
            // TODO(#1135): Support generating externs using this syntax.
            emit(`\n// TODO(tsickle): export * as declaration in ${debugLocationStr(exportDeclaration, namespace)}\n`);
            return;
        }
        for (const exportSpecifier of exportDeclaration.exportClause.elements) {
            // No need to do anything for properties exported under their original name.
            if (!exportSpecifier.propertyName)
                continue;
            emit('/** @const */\n');
            writeVariableStatement(exportSpecifier.name.text, namespace, namespace.join('.') + '.' + exportSpecifier.propertyName.text);
        }
    }
    /**
     * Returns the first non-zero argument constructor that can be found going
     * down the inheritance chain. This should work as a class can only extends a
     * single class and can only have one default constructor.
     */
    function getCtors(decl) {
        // Get ctors from current class
        const currentCtors = decl.members.filter((m) => m.kind === ts.SyntaxKind.Constructor);
        if (currentCtors.length) {
            return currentCtors;
        }
        // Or look at base classes
        if (decl.heritageClauses) {
            const baseSymbols = decl.heritageClauses
                .filter((h) => h.token === ts.SyntaxKind.ExtendsKeyword)
                .flatMap((h) => h.types)
                .filter((t) => t.expression.kind === ts.SyntaxKind.Identifier);
            for (const base of baseSymbols) {
                const sym = typeChecker.getSymbolAtLocation(base.expression);
                if (!sym || !sym.declarations)
                    return [];
                for (const d of sym.declarations) {
                    if (d.kind === ts.SyntaxKind.ClassDeclaration) {
                        return getCtors(d);
                    }
                }
            }
        }
        return [];
    }
    /**
     * Adds aliases for the symbols imported in the given declaration, so that their types get
     * printed as the fully qualified name, and not just as a reference to the local import alias.
     *
     * tsickle generates .js files that (at most) contain a `goog.provide`, but are not
     * `goog.module`s. These files cannot express an aliased import. However Closure Compiler allows
     * referencing types using fully qualified names in such files, so tsickle can resolve the
     * imported module URI and produce `path.to.module.Symbol` as an alias, and use that when
     * referencing the type.
     */
    function addImportAliases(decl) {
        var _a;
        // Side effect import, like "import 'somepath';" declares no local aliases.
        if (ts.isImportDeclaration(decl) && !decl.importClause)
            return;
        let moduleUri;
        if (ts.isImportDeclaration(decl)) {
            moduleUri = decl.moduleSpecifier;
        }
        else if (ts.isExternalModuleReference(decl.moduleReference)) {
            // import foo = require('./bar');
            moduleUri = decl.moduleReference.expression;
        }
        else {
            // import foo = bar.baz.bam;
            // handled at call site.
            return;
        }
        // Only report diagnostics for .d.ts files. Diagnostics for .ts files have
        // already been reported during JS emit.
        const importDiagnostics = isDts ? diagnostics : [];
        const moduleSymbol = typeChecker.getSymbolAtLocation(moduleUri);
        if (!moduleSymbol) {
            (0, transformer_util_1.reportDiagnostic)(importDiagnostics, moduleUri, `imported module has no symbol`);
            return;
        }
        const googNamespace = (0, googmodule_1.jsPathToNamespace)(host, moduleUri, importDiagnostics, moduleUri.text, () => moduleSymbol);
        const isDefaultImport = ts.isImportDeclaration(decl) && !!((_a = decl.importClause) === null || _a === void 0 ? void 0 : _a.name);
        if (googNamespace) {
            mtt.registerImportSymbolAliases(googNamespace, isDefaultImport, moduleSymbol, () => googNamespace);
        }
        else {
            mtt.registerImportSymbolAliases(
            /* googNamespace= */ undefined, isDefaultImport, moduleSymbol, getAliasPrefixForEsModule(moduleUri));
        }
    }
    /**
     * Returns a symbol alias prefix for export from an ECMAScript module (in
     * contrast to a goog module/provide file). The prefix may then be used to
     * reference the type in externs where import statements aren't allowed.
     */
    function getAliasPrefixForEsModule(moduleUri) {
        // Calls to moduleNameAsIdentifier and host.pathToModuleName can incur
        // file system accesses, which are slow. Make sure they are only called
        // once and if/when needed.
        const ambientModulePrefix = (0, annotator_host_1.moduleNameAsIdentifier)(host, moduleUri.text, sourceFile.fileName);
        const defaultPrefix = host.pathToModuleName(sourceFile.fileName, moduleUri.text);
        return (exportedSymbol) => {
            // While type_translator does add the mangled prefix for ambient
            // declarations, it only does so for non-aliased (i.e. not imported)
            // symbols. That's correct for its use in regular modules, which will have
            // a local symbol for the imported ambient symbol. However within an
            // externs file, there are no imports, so we need to make sure the alias
            // already contains the correct module name, which means the mangled
            // module name in case of imports symbols. This only applies to
            // non-Closure ('goog:') imports.
            const isAmbientModuleDeclaration = exportedSymbol.declarations &&
                exportedSymbol.declarations.some(d => (0, transformer_util_1.isAmbient)(d) || d.getSourceFile().isDeclarationFile);
            return isAmbientModuleDeclaration ? ambientModulePrefix : defaultPrefix;
        };
    }
    /**
     * Produces a compiler error that references the Node's kind. This is useful for the "else"
     * branch of code that is attempting to handle all possible input Node types, to ensure all cases
     * covered.
     */
    function errorUnimplementedKind(node, where) {
        (0, transformer_util_1.reportDiagnostic)(diagnostics, node, `${ts.SyntaxKind[node.kind]} not implemented in ${where}`);
    }
    /**
     * getNamespaceForLocalDeclaration returns the namespace that should be used for the given
     * declaration, deciding whether to namespace the symbol to the file or whether to create a
     * global name.
     *
     * The function covers these cases:
     * 1) a declaration in a .d.ts
     * 1a) where the .d.ts is an external module     --> namespace
     * 1b) where the .d.ts is not an external module --> global
     * 2) a declaration in a .ts file (all are treated as modules)
     * 2a) that is exported                          --> namespace
     * 2b) that is unexported                        --> global
     *
     * For 1), all symbols in .d.ts should generally be namespaced to the file to avoid collisions.
     * However .d.ts files that are not external modules do declare global names (1b).
     *
     * For 2), ambient declarations in .ts files must be namespaced, for the same collision reasons.
     * The exception is 2b), where in TypeScript, an unexported local "declare const x: string;"
     * creates a symbol that, when used locally, is emitted as just "x". That is, it behaves
     * like a variable declared in a 'declare global' block. Closure Compiler would fail the build if
     * there is no declaration for "x", so tsickle must generate a global external symbol, i.e.
     * without the namespace wrapper.
     */
    function getNamespaceForTopLevelDeclaration(declaration, namespace) {
        // Only use rootNamespace for top level symbols, any other namespacing (global names, nested
        // namespaces) is always kept.
        if (namespace.length !== 0)
            return namespace;
        // All names in a module (external) .d.ts file can only be accessed locally, so they always get
        // namespace prefixed.
        if (isDts && isExternalModule)
            return [rootNamespace];
        // Same for exported declarations in regular .ts files.
        if ((0, transformer_util_1.hasModifierFlag)(declaration, ts.ModifierFlags.Export))
            return [rootNamespace];
        // But local declarations in .ts files or .d.ts files (1b, 2b) are global, too.
        return [];
    }
    /**
     * Returns a string representation for the location: either the namespace, or, if empty, the
     * current source file name. This is intended to be included in the emit for warnings, so that
     * users can more easily find where a problematic definition is from.
     *
     * The code below does not use diagnostics to avoid breaking the build for harmless unhandled
     * cases.
     */
    function debugLocationStr(node, namespace) {
        // Use a regex to grab the filename without a path, to make the output stable
        // under bazel where sandboxes use different paths.
        return namespace.join('.') || node.getSourceFile().fileName.replace(/.*[/\\]/, '');
    }
    function importsVisitor(node) {
        switch (node.kind) {
            case ts.SyntaxKind.ImportEqualsDeclaration:
                const importEquals = node;
                if (importEquals.moduleReference.kind ===
                    ts.SyntaxKind.ExternalModuleReference) {
                    addImportAliases(importEquals);
                }
                break;
            case ts.SyntaxKind.ImportDeclaration:
                addImportAliases(node);
                break;
            default:
                // Ignore. This visitor is only concerned with imports.
                break;
        }
    }
    function visitor(node, namespace) {
        if (node.parent === sourceFile) {
            namespace = getNamespaceForTopLevelDeclaration(node, namespace);
        }
        switch (node.kind) {
            case ts.SyntaxKind.ModuleDeclaration:
                const decl = node;
                switch (decl.name.kind) {
                    case ts.SyntaxKind.Identifier:
                        if (decl.flags & ts.NodeFlags.GlobalAugmentation) {
                            // E.g. "declare global { ... }".  Reset to the outer namespace.
                            namespace = [];
                        }
                        else {
                            // E.g. "declare namespace foo {"
                            const name = (0, transformer_util_1.getIdentifierText)(decl.name);
                            if (isFirstValueDeclaration(decl)) {
                                emit('/** @const */\n');
                                writeVariableStatement(name, namespace, '{}');
                            }
                            namespace = namespace.concat(name);
                        }
                        if (decl.body)
                            visitor(decl.body, namespace);
                        break;
                    case ts.SyntaxKind.StringLiteral:
                        // E.g. "declare module 'foo' {" (note the quotes).
                        // We still want to emit externs for this module, but Closure doesn't provide a
                        // mechanism for module-scoped externs. Instead, we emit in a mangled namespace.
                        // The mangled namespace (after resolving files) matches the emit for an original module
                        // file, so effectively this augments any existing module.
                        const importName = decl.name.text;
                        const mangled = (0, annotator_host_1.moduleNameAsIdentifier)(host, importName, sourceFile.fileName);
                        emit(`// Derived from: declare module "${importName}"\n`);
                        namespace = [mangled];
                        // Declare "mangled$name" if it's not declared already elsewhere.
                        if (isFirstValueDeclaration(decl)) {
                            emit('/** @const */\n');
                            writeVariableStatement(mangled, [], '{}');
                        }
                        // Declare the contents inside the "mangled$name".
                        if (decl.body)
                            visitor(decl.body, [mangled]);
                        break;
                    default:
                        errorUnimplementedKind(decl.name, 'externs generation of namespace');
                        break;
                }
                break;
            case ts.SyntaxKind.ModuleBlock:
                const block = node;
                for (const stmt of block.statements) {
                    visitor(stmt, namespace);
                }
                break;
            case ts.SyntaxKind.ImportEqualsDeclaration:
                const importEquals = node;
                if (importEquals.moduleReference.kind === ts.SyntaxKind.ExternalModuleReference) {
                    // Handled in `importsVisitor`.
                    break;
                }
                const localName = (0, transformer_util_1.getIdentifierText)(importEquals.name);
                const qn = qualifiedNameToMangledIdentifier(importEquals.moduleReference);
                // @const so that Closure Compiler understands this is an alias.
                emit('/** @const */\n');
                writeVariableStatement(localName, namespace, qn);
                break;
            case ts.SyntaxKind.ClassDeclaration:
            case ts.SyntaxKind.InterfaceDeclaration:
                writeType(node, namespace);
                break;
            case ts.SyntaxKind.FunctionDeclaration:
                const fnDecl = node;
                const name = fnDecl.name;
                if (!name) {
                    (0, transformer_util_1.reportDiagnostic)(diagnostics, fnDecl, 'anonymous function in externs');
                    break;
                }
                // Gather up all overloads of this function.
                const sym = typeChecker.getSymbolAtLocation(name);
                const decls = sym.declarations.filter(ts.isFunctionDeclaration);
                // Only emit the first declaration of each overloaded function.
                if (fnDecl !== decls[0])
                    break;
                const params = emitFunctionType(decls);
                writeFunction(name, params, namespace);
                break;
            case ts.SyntaxKind.VariableStatement:
                for (const decl of node.declarationList.declarations) {
                    writeVariableDeclaration(decl, namespace);
                }
                break;
            case ts.SyntaxKind.EnumDeclaration:
                writeEnum(node, namespace);
                break;
            case ts.SyntaxKind.TypeAliasDeclaration:
                writeTypeAlias(node, namespace);
                break;
            case ts.SyntaxKind.ImportDeclaration:
                // Handled in `importsVisitor`.
                break;
            case ts.SyntaxKind.NamespaceExportDeclaration:
            case ts.SyntaxKind.ExportAssignment:
                // Handled on the file level.
                break;
            case ts.SyntaxKind.ExportDeclaration:
                const exportDeclaration = node;
                writeExportDeclaration(exportDeclaration, namespace);
                break;
            default:
                emit(`\n// TODO(tsickle): ${ts.SyntaxKind[node.kind]} in ${debugLocationStr(node, namespace)}\n`);
                break;
        }
    }
}
exports.generateExterns = generateExterns;
//# sourceMappingURL=externs.js.map