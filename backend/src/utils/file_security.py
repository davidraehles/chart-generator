"""
Security utilities for file operations.

Provides path validation to prevent directory traversal attacks.
"""

import os
from pathlib import Path
from typing import Optional


class PathTraversalError(ValueError):
    """Raised when a path contains traversal sequences."""
    pass


def validate_safe_filename(filename: str, allowed_extensions: Optional[list[str]] = None) -> str:
    """
    Validate that a filename is safe and doesn't contain path traversal sequences.

    Args:
        filename: The filename to validate
        allowed_extensions: Optional list of allowed file extensions (e.g., ['.se1'])

    Returns:
        The validated filename (basename only)

    Raises:
        PathTraversalError: If the filename contains path traversal sequences
        ValueError: If the filename is empty or has an invalid extension
    """
    if not filename:
        raise ValueError("Filename cannot be empty")

    # Check for path separators in original filename (before normalization)
    # This prevents attacks like '../../../etc/passwd.se1'
    dangerous_patterns = ['..', '/', '\\', '\x00']
    for pattern in dangerous_patterns:
        if pattern in filename:
            raise PathTraversalError(
                f"Filename contains invalid characters or path traversal sequence: {filename}"
            )

    # Convert to Path object for normalization
    path = Path(filename)

    # Extract just the filename (strips directory components)
    basename = path.name

    # Check for empty basename (happens with paths like '/')
    if not basename or basename != filename:
        raise PathTraversalError(
            f"Filename contains path components: {filename}"
        )

    # Validate extension if specified
    if allowed_extensions is not None:
        file_ext = path.suffix.lower()
        if file_ext not in allowed_extensions:
            raise ValueError(
                f"Invalid file extension '{file_ext}'. Allowed: {', '.join(allowed_extensions)}"
            )

    return basename


def validate_safe_path(base_dir: str, file_path: str) -> Path:
    """
    Validate that a file path is within the allowed base directory.

    Args:
        base_dir: The base directory that file_path must be within
        file_path: The file path to validate

    Returns:
        Resolved Path object that is guaranteed to be within base_dir

    Raises:
        PathTraversalError: If the resolved path is outside base_dir
    """
    base = Path(base_dir).resolve()
    target = (base / file_path).resolve()

    # Ensure the resolved path is within the base directory
    try:
        target.relative_to(base)
    except ValueError:
        raise PathTraversalError(
            f"Path '{file_path}' resolves outside allowed directory '{base_dir}'"
        )

    return target
