"""Providers for JavaScript rules."""

JSEcmaScriptModuleInfo = provider(
    doc = "Information about a JavaScript ECMAScript module",
    fields = {
        "sources": "Depset of JavaScript source files",
        "deps": "Depset of direct and transitive dependencies",
        "module_name": "Name of the module",
        "hide_warnings": "Whether to hide warnings for files in this module",
        "extra_annotations": "Depset of extra JSDoc annotations",
        "package_mappings": "Depset of (package_name, package_path) pairs for module resolution",
    },
)

DeclarationInfo = provider(
    doc = "Information about TypeScript declaration files",
    fields = {
        "declarations": "Depset of declaration files",
        "transitive_declarations": "Depset of transitive declaration files",
    },
)

JSInfo = provider(
    doc = "Information about JavaScript files",
    fields = {
        "js": "Depset of JavaScript files",
        "sourcemap": "Source map file",
        "transitive_js": "Depset of transitive JavaScript files",
    },
)
