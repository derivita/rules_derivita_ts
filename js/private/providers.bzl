"""Providers for JavaScript rules."""

load("@rules_nodejs//nodejs:providers.bzl", _DeclarationInfo = "DeclarationInfo")

# Define JSEcmaScriptModuleInfo locally since it's not available in newer rules_nodejs
JSEcmaScriptModuleInfo = provider(
    doc = "Information about a JavaScript ES module",
    fields = {
        "direct_sources": "Depset of direct JavaScript source files",
        "sources": "Depset of all JavaScript source files including transitive dependencies",
    },
)

DeclarationInfo = _DeclarationInfo

ClosurePackageInfo = provider(
    doc = "Information about a ClosureCompiler package",
    fields = {
        "sources": "Depset of JavaScript source files",
        "deps": "Depset of direct and transitive dependencies",
        "module_name": "Name of the module",
        "hide_warnings": "Whether to hide warnings for files in this module",
        "extra_annotations": "Depset of extra JSDoc annotations",
        "es6_module_mappings": "Dict of module_name -> module_root mappings from rules_typescript system",
    },
)

