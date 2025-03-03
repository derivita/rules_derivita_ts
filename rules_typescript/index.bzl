# Copyright 2017 The Bazel Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Public API surface is re-exported here.

Users should not load files under "/internal"
"""

load("//third_party/rules_typescript/devserver:concatjs_devserver.bzl", _concatjs_devserver = "concatjs_devserver_macro")
load("//third_party/rules_typescript/internal:build_defs.bzl", _ts_library = "ts_library_macro")
load("//third_party/rules_typescript/internal:ts_config.bzl", _ts_config = "ts_config")

concatjs_devserver = _concatjs_devserver
ts_library = _ts_library
ts_config = _ts_config
