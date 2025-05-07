#!/bin/bash

# --- begin runfiles.bash initialization v3 ---
# Copy-pasted from the Bazel Bash runfiles library v3.
set -uo pipefail; set +e; f=bazel_tools/tools/bash/runfiles/runfiles.bash
# shellcheck disable=SC1090
source "${RUNFILES_DIR:-/dev/null}/$f" 2>/dev/null || \
  source "$(grep -sm1 "^$f " "${RUNFILES_MANIFEST_FILE:-/dev/null}" | cut -f2- -d' ')" 2>/dev/null || \
  source "$0.runfiles/$f" 2>/dev/null || \
  source "$(grep -sm1 "^$f " "$0.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
  source "$(grep -sm1 "^$f " "$0.exe.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
  { echo>&2 "ERROR: cannot find $f"; exit 1; }; f=; set -e
# --- end runfiles.bash initialization v3 ---

# Function to check if a file contains a string
check_contains() {
    local file=$1
    local pattern=$2
    if grep -q "$pattern" "$file"; then
        echo "✓ Found '$pattern' in $file"
    else
        echo "✗ Did not find '$pattern' in $file"
        exit 1
    fi
}

# Function to check if a file does not contain a string
check_not_contains() {
    local file=$1
    local pattern=$2
    if ! grep -q "$pattern" "$file"; then
        echo "✓ Did not find '$pattern' in $file (good)"
    else
        echo "✗ Found '$pattern' in $file but should not have"
        exit 1
    fi
}

echo "Testing generated sources..."
JS="$(rlocation closure_test/src/generated_test/generated_test_bin.js)"

# Test that the generated message is included
check_contains "$JS" "Hello from generated file"

# Test that the greeting from generated file works
check_contains "$JS" "Generated: Test"

echo -e "\nAll tests passed! ✨"
