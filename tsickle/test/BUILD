load("@build_bazel_rules_nodejs//:index.bzl", "js_library", "nodejs_test")
load("@npm//@bazel/jasmine:index.bzl", "jasmine_node_test")
load("@npm//typescript:index.bzl", "tsc")
load("//rules_typescript:index.bzl", "ts_library")

licenses(["notice"])  # MIT

ts_library(
    name = "test_support",
    srcs = [
        "ast_printing_transform.ts",
        "closure.ts",
        "test_support.ts",
    ],
    devmode_module = "commonjs",
    devmode_target = "es2019",
    tsconfig = ":tsconfig.json",
    tsickle = False,
    visibility = ["//visibility:private"],
    deps = [
        "//tsickle",
        "@npm//@types/diff-match-patch",
        "@npm//@types/glob",
        "@npm//@types/jasmine",
        "@npm//@types/node",
        "@npm//@types/source-map-support",
        "@npm//diff-match-patch",
        "@npm//glob",
        "@npm//jasmine",
        "@npm//source-map-support",
        "@npm//tslib",
        "@npm//typescript",
    ],
)

ts_library(
    name = "decorator_downlevel_transformer",
    srcs = ["decorator_downlevel_transformer_test.ts"],
    devmode_module = "commonjs",
    tsconfig = ":tsconfig.json",
    tsickle = False,
    visibility = ["//visibility:private"],
    deps = [
        ":test_support",
        "//tsickle",
        "@npm//@types/node",
        "@npm//typescript",
    ],
)

jasmine_node_test(
    name = "decorator_downlevel_transformer_test",
    srcs = [],
    deps = [
        ":decorator_downlevel_transformer",
        "//tsickle/test_files",
        "@npm//jasmine",
    ],
)

ts_library(
    name = "e2e_closure",
    srcs = ["e2e_closure_test.ts"],
    data = ["googbase_fake.js"],
    devmode_module = "commonjs",
    tsconfig = ":tsconfig.json",
    tsickle = False,
    visibility = ["//visibility:private"],
    deps = [
        ":test_support",
        "//tsickle",
        "@npm//@types/node",
        "@npm//google-closure-compiler",
        "@npm//typescript",
    ],
)

jasmine_node_test(
    name = "e2e_closure_test",
    srcs = [],
    deps = [
        ":e2e_closure",
        "//tsickle:closure_files",
        "//tsickle/test_files",
        "@npm//jasmine",
    ],
)

ts_library(
    name = "golden_tsickle",
    srcs = ["golden_tsickle_test.ts"],
    devmode_module = "commonjs",
    tsconfig = ":tsconfig.json",
    tsickle = False,
    visibility = ["//visibility:private"],
    deps = [
        ":test_support",
        "//tsickle",
        "@npm//@types/node",
        "@npm//typescript",
    ],
)

jasmine_node_test(
    name = "golden_tsickle_test",
    srcs = [],
    deps = [
        ":golden_tsickle",
        "//tsickle/test_files",
        "@npm//jasmine",
    ],
)

ts_library(
    name = "googmodule",
    srcs = ["googmodule_test.ts"],
    devmode_module = "commonjs",
    tsconfig = ":tsconfig.json",
    tsickle = False,
    visibility = ["//visibility:private"],
    deps = [
        ":test_support",
        "//tsickle",
        "@npm//@types/node",
        "@npm//typescript",
    ],
)

jasmine_node_test(
    name = "googmodule_test",
    srcs = [],
    deps = [
        ":googmodule",
        "//tsickle/test_files",
        "@npm//jasmine",
    ],
)

ts_library(
    name = "jsdoc",
    srcs = ["jsdoc_test.ts"],
    devmode_module = "commonjs",
    tsconfig = ":tsconfig.json",
    tsickle = False,
    visibility = ["//visibility:private"],
    deps = [
        ":test_support",
        "//tsickle",
        "@npm//typescript",
    ],
)

jasmine_node_test(
    name = "jsdoc_test",
    srcs = [],
    deps = [
        ":jsdoc",
        "//tsickle/test_files",
        "@npm//jasmine",
    ],
)

ts_library(
    name = "tsickle",
    srcs = ["tsickle_test.ts"],
    devmode_module = "commonjs",
    tsconfig = ":tsconfig.json",
    tsickle = False,
    visibility = ["//visibility:private"],
    deps = [
        ":test_support",
        "//tsickle",
        "@npm//@types/node",
        "@npm//typescript",
    ],
)

jasmine_node_test(
    name = "tsickle_test",
    srcs = [],
    deps = [
        ":tsickle",
        "//tsickle/test_files",
        "@npm//jasmine",
    ],
)

ts_library(
    name = "type_translator",
    srcs = ["type_translator_test.ts"],
    devmode_module = "commonjs",
    tsconfig = ":tsconfig.json",
    tsickle = False,
    visibility = ["//visibility:private"],
    deps = [
        ":test_support",
        "//tsickle",
        "@npm//typescript",
    ],
)

jasmine_node_test(
    name = "type_translator_test",
    srcs = [],
    deps = [
        ":type_translator",
        "//tsickle/test_files",
        "@npm//jasmine",
    ],
)
