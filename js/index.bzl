load("//js/private:js_binary.bzl", _js_binary = "js_binary")
load("//js/private:js_library.bzl", _js_library = "js_library")

def js_library(name, **kwargs):
    """JavaScript library rule.
    
    Args:
        name: A unique name for this target.
        **kwargs: Additional arguments to pass to the underlying rule.
    """
    _js_library(
        name = name,
        module_name = native.module_name(),
        **kwargs
    )

js_binary = _js_binary
