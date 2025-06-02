load("@rules_derivita_ts//js:index.bzl", "js_binary")
load("@rules_derivita_ts//rules_typescript:index.bzl", "ts_library")


js_binary(
    name = "test_bin",
    deps = [":test_lib"],
    entry_points = ["test.mjs"],
    browser_featureset_year = 2022,
    compilation_level = "ADVANCED",
    debug = False,
)

js_binary(
    name = "test_debug",
    deps = [":test_lib"],
    entry_points = ["test.mjs"],
    browser_featureset_year = 2022,
    compilation_level = "ADVANCED",
    debug = True,
)

ts_library(
    name = "test_lib",
    srcs = ["test.ts"],
    deps = [
        "@closure_library//closure/goog:base",
        "@closure_library//closure/goog",
        "@closure_library//closure/goog/functions",
    ]
)
