"""
This module provides functions for handling workspace names
bzlmod makes things return "_main" but we want "derivita" when that is the case
"""

def get_workspace_name(ctx):
    return "derivita" if ctx.workspace_name == "_main" else ctx.workspace_name
