"""Rule for JavaScript libraries."""

load("//js/private:providers.bzl", "JSEcmaScriptModuleInfo", "DeclarationInfo")
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_file_to_bin_action")
load("@aspect_bazel_lib//lib:copy_file.bzl", "COPY_FILE_TOOLCHAINS")

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

    # Collect transitive sources and package mappings
    transitive_sources = []
    transitive_package_mappings = []
    transitive_hide_warnings_paths = []
    transitive_extra_annotations = []
    
    for dep in ctx.attr.deps:
        if JSEcmaScriptModuleInfo in dep:
            info = dep[JSEcmaScriptModuleInfo]
            transitive_sources.append(info.sources)
            transitive_package_mappings.append(info.package_mappings)
            if info.hide_warnings:
                transitive_hide_warnings_paths.append(info.hide_warnings)
            if info.extra_annotations:
                transitive_extra_annotations.append(info.extra_annotations)

    sources = depset(
        direct = js_sources,
        transitive = transitive_sources,
    )

    # Compute package name and path
    if ctx.attr.package_name:
        package_name = ctx.attr.package_name
        package_path = "/".join([
            ctx.bin_dir.path,
            ctx.label.workspace_root,
            ctx.label.package,
        ])
    else:
        package_name = ctx.attr.module_name or ctx.workspace_name
        package_path = "/".join([
            ctx.bin_dir.path,
            ctx.label.workspace_root,
        ])

    # Create package mapping
    package_mappings = depset(
        direct = [(package_name, package_path)],
        transitive = transitive_package_mappings,
    )

    # Collect hide warnings paths
    hide_warnings_paths = depset(
        direct = [package_path] if ctx.attr.hide_warnings else [],
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
        JSEcmaScriptModuleInfo(
            sources = sources,
            deps = depset(direct = ctx.attr.deps),
            module_name = package_name,
            hide_warnings = hide_warnings_paths,
            extra_annotations = extra_annotations,
            package_mappings = package_mappings,
        ),
        DeclarationInfo(
            declarations = declarations,
            transitive_declarations = declarations,
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
        ),
        "package_name": attr.string(
            doc = "Package name for this library. If not specified, defaults to module_name or workspace_name",
        ),
        "module_name": attr.string(
            doc = "Module name to use instead of workspace_name. Only used if package_name is not set.",
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
