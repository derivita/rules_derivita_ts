"""Rule for creating JavaScript binaries using Closure Compiler."""

load("//js/private:providers.bzl", "DeclarationInfo", "JSEcmaScriptModuleInfo", "JSInfo")

def _collect_js(deps):
    """Collect JS sources and their module names from dependencies."""
    sources = []  # List of source files
    hide_warnings_paths = []  # List of paths to hide warnings for
    extra_annotations = []  # List of JSDoc annotations
    package_mappings = []  # List of (package_name, package_path) pairs

    for dep in deps:
        if JSEcmaScriptModuleInfo in dep:
            info = dep[JSEcmaScriptModuleInfo]
            sources.extend(info.sources.to_list())
            if info.hide_warnings:
                hide_warnings_paths.extend(info.hide_warnings.to_list())
            if info.extra_annotations:
                extra_annotations.extend(info.extra_annotations.to_list())
            if info.package_mappings:
                package_mappings.extend(info.package_mappings.to_list())

    return sources, hide_warnings_paths, depset(extra_annotations).to_list(), package_mappings

def _js_binary_impl(ctx):
    # Collect all sources, warnings paths, annotations, and package mappings
    js_files, hide_warnings_paths, extra_annotations, package_mappings = _collect_js(ctx.attr.deps)

    # All input files for the compiler
    inputs = [f for f in js_files]

    # Create temporary output file for compiler
    temp_js = ctx.actions.declare_file(ctx.label.name + ".tmp.js")
    output_js = ctx.actions.declare_file(ctx.label.name + ".js")
    output_map = ctx.actions.declare_file(ctx.label.name + ".js.map")

    # Check for conflicts between output and source files
    output_path = output_js.path
    for src in js_files:
        if src.path == output_path:
            fail("Output file '%s' conflicts with source file '%s'. Please use a different name for the js_binary target." % (
                output_path,
                src.path,
            ))

    args = ctx.actions.args()

    # Basic compiler settings
    args.add("--assume_function_wrapper")
    args.add("--compilation_level=%s" % ctx.attr.compilation_level)
    args.add("--language_in=ECMASCRIPT_NEXT")
    args.add("--language_out=%s" % ctx.attr.language_out)
    args.add("--js_output_file=%s" % temp_js.path)
    args.add("--create_source_map=%s" % output_map.path)
    args.add("--source_map_include_content")
    args.add("--dependency_mode=PRUNE")
    args.add("--module_resolution=BROWSER_WITH_TRANSFORMED_PREFIXES")

    # Make source map paths relative to the output file
    args.add("--source_map_location_mapping=%s|%s" % (temp_js.path, output_js.basename))

    # Add conformance configs if specified
    if ctx.files.conformance_configs:
        for f in ctx.files.conformance_configs:
            args.add("--conformance_configs=%s" % f.path)
        inputs.extend(ctx.files.conformance_configs)

    # Handle output wrapper and isolation mode
    if ctx.attr.output_wrapper:
        args.add("--output_wrapper=%s" % ctx.attr.output_wrapper)
    else:
        args.add("--isolation_mode=IIFE")

    # Add package name prefix mappings
    for package_name, package_path in package_mappings:
        args.add("--browser_resolver_prefix_replacements=%s=%s" % (package_name, package_path))

    if ctx.attr.debug:
        args.add("--debug")
        args.add("--formatting=PRETTY_PRINT")
        args.add("--warning_level=VERBOSE")
    else:
        args.add("--define=goog.DEBUG=false")

    # Add js_module_root for each source directory
    js_module_roots = {}
    for f in js_files:
        root = f.root.path
        if root and root not in js_module_roots:
            js_module_roots[root] = True
            args.add("--js_module_root=%s" % root)

    # Entry points if specified
    if ctx.attr.entry_points:
        for entry_point in ctx.attr.entry_points:
            args.add("--entry_point=%s" % entry_point)
    else:
        args.add("--entry_point=main")  # Default entry point

    # Add all source files
    for f in js_files:
        args.add("--js=%s" % f.path)

    # Add paths to hide warnings for
    for path in hide_warnings_paths:
        args.add("--hide_warnings_for=%s" % path)

    # Add extra JSDoc annotations
    for name in extra_annotations:
        args.add("--extra_annotation_name=%s" % name)

    # Add externs if any
    if ctx.attr.externs:
        for f in ctx.files.externs:
            args.add("--externs=%s" % f.path)
        inputs.extend(ctx.files.externs)

    # Add any additional flags
    if ctx.attr.additional_flags:
        args.add_all(ctx.attr.additional_flags)

    # Run closure compiler
    ctx.actions.run(
        inputs = inputs,
        outputs = [temp_js, output_map],
        executable = ctx.executable.compiler,
        tools = [ctx.executable.compiler],
        arguments = [args],
        mnemonic = "ClosureCompiler",
        progress_message = "Compiling JavaScript %{label}",
        use_default_shell_env = True,
    )

    # Add sourceMappingURL comment and write to final output
    ctx.actions.run_shell(
        inputs = [temp_js],
        outputs = [output_js],
        command = "cat '%s' > '%s' && echo '//# sourceMappingURL=%s' >> '%s'" % (
            temp_js.path,
            output_js.path,
            output_map.basename,
            output_js.path,
        ),
        use_default_shell_env = True,
    )

    return [
        DefaultInfo(
            files = depset([output_js, output_map]),
        ),
        JSInfo(
            js = depset([output_js]),
            sourcemap = output_map,
            transitive_js = depset(
                direct = [output_js],
                transitive = [dep[JSInfo].transitive_js for dep in ctx.attr.deps if JSInfo in dep],
            ),
        ),
    ]

js_binary = rule(
    implementation = _js_binary_impl,
    attrs = {
        "deps": attr.label_list(
            doc = "js_library targets to compile",
            providers = [[JSEcmaScriptModuleInfo]],
        ),
        "entry_points": attr.string_list(
            doc = "Entry points to be included in the JS bundle",
        ),
        "externs": attr.label_list(
            doc = "Extern files for typing",
            allow_files = [".js"],
        ),
        "compilation_level": attr.string(
            doc = "Closure compilation level",
            default = "SIMPLE",
            values = ["BUNDLE", "WHITESPACE_ONLY", "SIMPLE", "ADVANCED"],
        ),
        "language_out": attr.string(
            doc = "Output language level",
            default = "ECMASCRIPT_2020",
        ),
        "debug": attr.bool(
            doc = "Whether to include debug information",
            default = False,
        ),
        "browser_featureset_year": attr.int(
            doc = "Target year for browser feature support",
            default = 2022,
        ),
        "conformance_configs": attr.label_list(
            doc = "JS Conformance configurations in text protocol buffer format",
            allow_files = True,
        ),
        "output_wrapper": attr.string(
            doc = "Interpolate output into this string at the place denoted by %output%. Use %output|jsstring% for js string escaping",
        ),
        "additional_flags": attr.string_list(
            doc = "Additional flags to pass directly to the Closure Compiler",
        ),
        # TODO: This should be a toolchain, but I couldn't get that to work.
        "compiler": attr.label(
            doc = "The closure compiler JAR file",
            executable = True,
            cfg = "exec",
            default = "//tools/closure_compiler",
        ),
    },
)
