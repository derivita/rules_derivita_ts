"""Rule for JavaScript libraries."""

load("//js/private:providers.bzl", "JSEcmaScriptModuleInfo", "DeclarationInfo", "ClosurePackageInfo")
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_file_to_bin_action")
load("@aspect_bazel_lib//lib:copy_file.bzl", "COPY_FILE_TOOLCHAINS")
load("//rules_typescript/internal:common/module_mappings.bzl", "get_module_mappings", "module_mappings_aspect")

def _js_library_impl(ctx):
    # Split srcs into JS sources and declarations
    js_sources = []
    declarations = []
    for src in ctx.files.srcs:
        if src.extension == "ts" and src.basename.endswith(".d.ts"):
            declarations.append(src)
        else:
            # Copy source files to bin directory
            if src.is_source:
                src = copy_file_to_bin_action(ctx, src)
            js_sources.append(src)

    # Collect transitive sources and hide warnings paths and extra annotations
    transitive_sources = []
    transitive_hide_warnings_paths = []
    transitive_extra_annotations = []

    for dep in ctx.attr.deps:
        if ClosurePackageInfo in dep:
            info = dep[ClosurePackageInfo]
            transitive_sources.append(info.sources)
            if info.hide_warnings:
                transitive_hide_warnings_paths.append(info.hide_warnings)
            if info.extra_annotations:
                transitive_extra_annotations.append(info.extra_annotations)

    sources = depset(
        direct = js_sources,
        transitive = transitive_sources,
    )

    # Get module mappings using the standardized system from rules_typescript
    module_mappings = get_module_mappings(ctx.label, ctx.attr, js_sources)

    # Determine the module root path for this target (used for hide_warnings)
    module_root = "/".join([
        ctx.bin_dir.path,
        ctx.label.workspace_root,
        ctx.label.package,
    ])

    # Collect hide warnings paths
    hide_warnings_paths = depset(
        direct = [module_root] if ctx.attr.hide_warnings else [],
        transitive = transitive_hide_warnings_paths,
    )

    # Collect extra annotations
    extra_annotations = depset(
        direct = ctx.attr.extra_annotations,
        transitive = transitive_extra_annotations,
    )

    # Collect declarations
    declarations = depset(
        direct = declarations,
        transitive = [dep[DeclarationInfo].declarations for dep in ctx.attr.deps if DeclarationInfo in dep],
    )

    return [
        ClosurePackageInfo(
            sources = sources,
            deps = depset(direct = ctx.attr.deps),
            module_name = ctx.attr.module_name or ctx.label.name,
            hide_warnings = hide_warnings_paths,
            extra_annotations = extra_annotations,
            es6_module_mappings = module_mappings,
        ),
        JSEcmaScriptModuleInfo(
            direct_sources = js_sources,
            sources = sources,
        ),
        DeclarationInfo(
            declarations = declarations,
            transitive_declarations = declarations,
            type_blocklisted_declarations = depset(),
        ),
    ]

js_library = rule(
    implementation = _js_library_impl,
    attrs = {
        "srcs": attr.label_list(
            doc = "JavaScript source files and TypeScript declaration files",
            allow_files = [".js", ".mjs", ".d.ts"],
        ),
        "deps": attr.label_list(
            doc = "Other js_library targets that this library depends on",
            providers = [[JSEcmaScriptModuleInfo], [DeclarationInfo]],
            aspects = [module_mappings_aspect],
        ),
        "module_name": attr.string(
            doc = "Name of the module. If not specified, defaults to the target name.",
        ),
        "module_root": attr.string(
            doc = "Root directory for the module. If not specified, defaults to the package directory.",
        ),
        "hide_warnings": attr.bool(
            doc = "Whether to hide warnings for all files in this library",
            default = False,
        ),
        "extra_annotations": attr.string_list(
            doc = "Extra JSDoc annotation names used in this library",
        ),
    },
    toolchains = COPY_FILE_TOOLCHAINS,
)
