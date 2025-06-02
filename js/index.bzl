load("//js/private:js_binary.bzl", _js_binary = "js_binary")
load("//js/private:js_library.bzl", _js_library = "js_library")

def js_library(name, module_name = None, module_root = None, **kwargs):
    """JavaScript library rule.

    Args:
        name: A unique name for this target.
        module_name: Name of the module. If not specified, defaults to workspace_name/package.
        module_root: Root directory for the module. If not specified, will be computed to include bin directory.
        **kwargs: Additional arguments to pass to the underlying rule.
    """
    # Provide a default module_name if none is specified
    if not module_name:
        package = native.package_name()
        workspace = native.repository_name()
        # Remove leading @ from repository name if present
        if workspace.startswith("@"):
            workspace = workspace[1:]
        # For the main workspace, use the module name instead of empty string
        if not workspace:
            workspace = native.module_name() or "main"

        if package:
            module_name = workspace + "/" + package
        else:
            module_name = workspace

    _js_library(
        name = name,
        module_name = module_name,
        module_root = module_root,
        **kwargs
    )

js_binary = _js_binary
