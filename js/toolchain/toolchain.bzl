"""Toolchain definitions for Closure Compiler."""

ClosureCompilerInfo = provider(
    doc = "Information about how to invoke closure compiler",
    fields = {
        "compiler_jar": "The Closure Compiler JAR file",
        "java_executable": "The java executable",
    },
)

def _closure_compiler_toolchain_impl(ctx):
    java_toolchain_info = ctx.toolchains["@bazel_tools//tools/jdk:runtime_toolchain"]
    java_executable = java_toolchain_info.java_executable[DefaultInfo].files.to_list()[0]
    compiler_jar = ctx.file.compiler_jar

    toolchain_info = platform_common.ToolchainInfo(
        closure_compiler = ClosureCompilerInfo(
            compiler_jar = compiler_jar,
            java_executable = java_executable,
        ),
    )
    return [toolchain_info]

closure_compiler_toolchain = rule(
    implementation = _closure_compiler_toolchain_impl,
    attrs = {
        "compiler_jar": attr.label(
            doc = "The closure compiler JAR file",
            allow_single_file = True,
            cfg = "exec",
            mandatory = True,
        ),
    },
)