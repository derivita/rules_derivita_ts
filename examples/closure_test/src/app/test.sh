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

# Test ADVANCED compilation
echo "Testing ADVANCED compilation..."
ADVANCED_JS="$(rlocation closure_test/src/app/main_advanced.js)"

# Should be heavily optimized
check_contains "$ADVANCED_JS" "console.log"
check_not_contains "$ADVANCED_JS" "createGreeting"
check_not_contains "$ADVANCED_JS" "createFormalGreeting"
check_not_contains "$ADVANCED_JS" "LogLevel"

# Test DEBUG compilation
echo -e "\nTesting DEBUG compilation..."
DEBUG_JS="$(rlocation closure_test/src/app/main_debug.js)"

# Should preserve module structure but with mangled names
check_contains "$DEBUG_JS" "createGreeting.*module.*src.*lib.*greeter"
check_contains "$DEBUG_JS" "LogLevel.*module.*src.*lib.*logger"
check_contains "$DEBUG_JS" "console.log"
check_contains "$DEBUG_JS" '"Good day"'
check_contains "$DEBUG_JS" '"Direct Import"'

# Test WHITESPACE_ONLY compilation
echo -e "\nTesting WHITESPACE_ONLY compilation..."
WHITESPACE_JS="$(rlocation closure_test/src/app/main_whitespace.js)"

# Should preserve function names with module suffixes
check_contains "$WHITESPACE_JS" "createGreeting.*module.*src.*lib.*greeter"
check_contains "$WHITESPACE_JS" "createFormalGreeting.*module.*src.*lib.*greeter"
check_contains "$WHITESPACE_JS" "LogLevel.*module.*src.*lib.*logger"
check_contains "$WHITESPACE_JS" "console.log"
check_contains "$WHITESPACE_JS" '"Good day"'
check_contains "$WHITESPACE_JS" '"Direct Import"'

echo -e "\nAll tests passed! ✨"
