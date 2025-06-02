load("@build_bazel_rules_nodejs//:index.bzl", "js_library")
load("@npm//typescript:index.bzl", "tsc")
load("//js:index.bzl", closure_js_library = "js_library")

licenses(["notice"])  # MIT


_TSICKLE_SRCS = glob(["src/**/*.ts"])

_TSICKLE_JS_SRCS = [k[4:-3] + ".js" for k in _TSICKLE_SRCS]

_TSICKLE_DTS_SRCS = [k[4:-3] + ".d.ts" for k in _TSICKLE_SRCS]

tsc(
    name = "tsc",
    outs = _TSICKLE_JS_SRCS + _TSICKLE_DTS_SRCS,
    args = [
        "--project",
        "$(execpath tsconfig.json)",
        "--outDir",
        "$(RULEDIR)",
    ],
    data = [
        "tsconfig.json",
        "@npm//@types/node",
        # "@npm//glob",
        # "@npm//@types/glob",
    ] + _TSICKLE_SRCS,
    visibility = ["//visibility:public"],
)

js_library(
    name = "tsickle",
    package_name = "tsickle",
    srcs = _TSICKLE_JS_SRCS + _TSICKLE_DTS_SRCS,
    visibility = ["//visibility:public"],
)

# TODO: figure out how to get rid of this module name hack.
genrule(
    name = "copy_js",
    srcs = ["third_party/tslib/tslib.js"],
    outs = ["tslib.js"],
    cmd = "cat $<|sed -e \"s/'tslib'/'derivita.external.tsickle.tslib'/\" >$@",
)

closure_js_library(
    name = "tslib-closure",
    srcs = ["tslib.js"],
)

genrule(
    name = "copy_dts",
    srcs = ["@npm//:node_modules/tslib/tslib.d.ts"],
    outs = ["tslib.d.ts"],
    cmd = "cp $< $@",
)

closure_js_library(
    name = "tslib",
    srcs = ["tslib.d.ts"],
    module_name = "tslib",
    # module_root = "tslib.d.ts",
    visibility = ["//visibility:public"],
    deps = ["tslib-closure"],
)
