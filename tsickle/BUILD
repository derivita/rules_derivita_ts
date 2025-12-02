load("@build_bazel_rules_nodejs//:index.bzl", "js_library")
load("@npm//typescript:index.bzl", "tsc")

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
    srcs = _TSICKLE_JS_SRCS + _TSICKLE_DTS_SRCS + ["package.json"],
    visibility = ["//visibility:public"],
)

js_library(
    name = "closure_files",
    srcs = [
        "src/closure_externs.js",
    ],
    deps = [":tslib"],
    visibility = ["//tsickle/test:__pkg__"],
)

alias(
    name = "tslib",
    actual = "//tsickle/third_party/tslib:tslib",
    visibility = ["//visibility:public"],
)
