load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test", "js_library")
load("@npm//typescript:index.bzl", "tsc")

licenses(["notice"])  # MIT

ts_library(
    name = "test_lib",
    srcs = glob(["*.ts"]),
    deps = [
        "@npm//@types/jasmine",
        "@npm//@types/node",
        "@npm//typescript",
    ],
    visibility = ["//visibility:private"],
)

# Test source files
_TEST_SRCS = glob([
    "*.ts",
])

# Compile test TypeScript files
tsc(
    name = "test_lib_js",
    outs = [k[:-3] + ".js" for k in _TEST_SRCS] + [k[:-3] + ".d.ts" for k in _TEST_SRCS],
    args = [
        "--project",
        "$(execpath tsconfig.json)",
        "--outDir",
        "$(RULEDIR)",
    ],
    data = [
        "tsconfig.json",
        "//tsickle:tsc",  # tsickle compiled sources
        "@npm//@types/jasmine",
        "@npm//@types/node",
        "@npm//typescript",
    ] + _TEST_SRCS,
    visibility = ["//visibility:private"],
)

js_library(
    name = "test_lib",
    srcs = [k[:-3] + ".js" for k in _TEST_SRCS],
    deps = [
        "@npm//@types/jasmine",
        "@npm//@types/node",
        "@npm//typescript",
    ],
    visibility = ["//visibility:private"],
)

# Main test suite
nodejs_test(
    name = "test",
    entry_point = "test_support.js",
    data = [
        ":test_lib",
        "//tsickle:tsickle",
        "//tsickle/test_files",
        "@npm//jasmine",
        "@npm//typescript",
    ],
)

# Golden file tests (separate target for easier debugging)
nodejs_test(
    name = "golden_test",
    entry_point = "golden_tsickle_test.js",
    data = [
        ":test_lib",
        "//tsickle:tsickle",
        "//tsickle/test_files",
        "@npm//jasmine",
        "@npm//typescript",
    ],
    # Allow updating golden files
    env = {
        "UPDATE_GOLDENS": "$(UPDATE_GOLDENS)",
    },
    tags = ["manual"],  # Don't run by default since it can modify files
)

# Individual test targets for easier debugging
nodejs_test(
    name = "tsickle_test",
    entry_point = "tsickle_test.js",
    data = [
        ":test_lib",
        "//tsickle:tsickle",
        "@npm//jasmine",
        "@npm//typescript",
    ],
)

nodejs_test(
    name = "googmodule_test",
    entry_point = "googmodule_test.js",
    data = [
        ":test_lib",
        "//tsickle:tsickle",
        "@npm//jasmine",
        "@npm//typescript",
    ],
)

nodejs_test(
    name = "jsdoc_test",
    entry_point = "jsdoc_test.js",
    data = [
        ":test_lib",
        "//tsickle:tsickle",
        "@npm//jasmine",
        "@npm//typescript",
    ],
)

nodejs_test(
    name = "type_translator_test",
    entry_point = "type_translator_test.js",
    data = [
        ":test_lib",
        "//tsickle:tsickle",
        "@npm//jasmine",
        "@npm//typescript",
    ],
)
