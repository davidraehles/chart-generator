#!/usr/bin/env python3
"""
Download Swiss Ephemeris data files for Human Design calculations.

Downloads required .se1 files from Astrodienst and stores them in Postgres
for deployment and runtime access.
"""

import os
import sys
import httpx
import hashlib
from pathlib import Path
from typing import List, Tuple, Optional, Dict

# Swiss Ephemeris file URLs from Astrodienst
ASTRODIENST_BASE_URL = "https://www.astro.com/ftp/swisseph/ephe/"

# Required ephemeris files for comprehensive coverage (1800-2400 CE)
REQUIRED_FILES = [
    "seas_18.se1",  # Asteroids 1800-2400
    "semo_18.se1",  # Moon 1800-2400
    "sepl_18.se1",  # Planets 1800-2400
]

# Optional files for extended coverage
OPTIONAL_FILES = [
    "seplm48.se1",  # Planets -4800 to 2400 (extended range)
    "semom48.se1",  # Moon -4800 to 2400 (extended range)
]

# SHA-256 checksums for file integrity verification
# These should be updated when downloading new versions of ephemeris files
FILE_CHECKSUMS: Dict[str, Optional[str]] = {
    "seas_18.se1": None,  # Checksum to be added after verification
    "semo_18.se1": None,  # Checksum to be added after verification
    "sepl_18.se1": None,  # Checksum to be added after verification
    "seplm48.se1": None,  # Checksum to be added after verification
    "semom48.se1": None,  # Checksum to be added after verification
}


def validate_path(file_path: Path, base_dir: Path) -> Path:
    """
    Validate that a file path is within the base directory.

    Prevents path traversal attacks by ensuring the resolved path
    is a subdirectory of the base directory.

    Args:
        file_path: Path to validate
        base_dir: Base directory that file_path must be within

    Returns:
        Resolved absolute path

    Raises:
        ValueError: If path is outside base directory
    """
    # Resolve both paths to absolute paths
    resolved_base = base_dir.resolve()
    resolved_file = (base_dir / file_path.name).resolve()

    # Check if file path is within base directory
    try:
        resolved_file.relative_to(resolved_base)
    except ValueError:
        raise ValueError(
            f"Invalid path: {file_path} is outside base directory {base_dir}"
        )

    return resolved_file


def validate_output_directory(output_dir: str) -> Path:
    """
    Validate and sanitize output directory path.

    Args:
        output_dir: Directory path from user input or environment

    Returns:
        Validated Path object

    Raises:
        ValueError: If path is invalid or contains suspicious patterns
    """
    # Remove any null bytes (security check)
    if "\x00" in output_dir:
        raise ValueError("Invalid path: contains null bytes")

    # Convert to Path and resolve
    path = Path(output_dir).resolve()

    # Ensure path is absolute
    if not path.is_absolute():
        raise ValueError(f"Path must be absolute: {output_dir}")

    # Check for suspicious patterns
    suspicious_patterns = ["../", "..\\", "~"]
    for pattern in suspicious_patterns:
        if pattern in str(output_dir):
            raise ValueError(f"Invalid path: contains suspicious pattern '{pattern}'")

    return path


def calculate_sha256(file_path: Path) -> str:
    """
    Calculate SHA-256 checksum of a file.

    Args:
        file_path: Path to file

    Returns:
        Hexadecimal SHA-256 checksum
    """
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read in chunks to handle large files
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def verify_checksum(file_path: Path, expected_checksum: Optional[str]) -> Tuple[bool, str]:
    """
    Verify file checksum matches expected value.

    Args:
        file_path: Path to file to verify
        expected_checksum: Expected SHA-256 checksum (None to skip verification)

    Returns:
        Tuple of (success, message)
    """
    if expected_checksum is None:
        # Checksum not available - calculate and display for future use
        actual = calculate_sha256(file_path)
        return True, f"⚠ No checksum available (calculated: {actual[:16]}...)"

    actual = calculate_sha256(file_path)
    if actual == expected_checksum:
        return True, "✓ Checksum verified"
    else:
        return False, f"✗ Checksum mismatch! Expected {expected_checksum[:16]}..., got {actual[:16]}..."


def download_file(url: str, dest_path: Path, base_dir: Path) -> Tuple[bool, str]:
    """
    Download a single ephemeris file with security validation.

    Args:
        url: URL to download from
        dest_path: Local path to save file
        base_dir: Base directory for path validation

    Returns:
        Tuple of (success, message)
    """
    try:
        # Validate destination path to prevent path traversal
        validated_path = validate_path(dest_path, base_dir)

        print(f"Downloading {validated_path.name}...")
        with httpx.Client(timeout=60.0) as client:
            response = client.get(url)
            response.raise_for_status()

            # Write to validated destination
            validated_path.parent.mkdir(parents=True, exist_ok=True)
            validated_path.write_bytes(response.content)

            size_mb = len(response.content) / (1024 * 1024)

            # Verify checksum if available
            expected_checksum = FILE_CHECKSUMS.get(validated_path.name)
            checksum_ok, checksum_msg = verify_checksum(validated_path, expected_checksum)

            if not checksum_ok:
                # Delete file with bad checksum
                validated_path.unlink()
                return False, f"✗ {validated_path.name}: {checksum_msg}"

            return True, f"✓ Downloaded {validated_path.name} ({size_mb:.2f} MB) - {checksum_msg}"

    except ValueError as e:
        return False, f"✗ Security error: {str(e)}"
    except httpx.HTTPStatusError as e:
        return False, f"✗ HTTP {e.response.status_code}: {url}"
    except Exception as e:
        return False, f"✗ Error: {str(e)}"


def download_ephemeris_files(
    output_dir: str = "/app/data/ephemeris",
    include_optional: bool = False
) -> List[Path]:
    """
    Download all required ephemeris files with security validation.

    Args:
        output_dir: Directory to save files (must be absolute path)
        include_optional: Whether to download optional extended files

    Returns:
        List of successfully downloaded file paths

    Raises:
        ValueError: If output_dir is invalid or insecure
    """
    # Validate output directory to prevent path traversal
    output_path = validate_output_directory(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    files_to_download = REQUIRED_FILES.copy()
    if include_optional:
        files_to_download.extend(OPTIONAL_FILES)

    print(f"Downloading {len(files_to_download)} ephemeris files to {output_path}...")
    print("-" * 60)

    downloaded_files = []
    failed_files = []

    for filename in files_to_download:
        url = f"{ASTRODIENST_BASE_URL}{filename}"
        dest = output_path / filename

        # Skip if already exists and passes checksum
        if dest.exists():
            size_mb = dest.stat().st_size / (1024 * 1024)
            expected_checksum = FILE_CHECKSUMS.get(filename)
            checksum_ok, checksum_msg = verify_checksum(dest, expected_checksum)

            if checksum_ok:
                print(f"⊙ Skipping {filename} (already exists, {size_mb:.2f} MB) - {checksum_msg}")
                downloaded_files.append(dest)
                continue
            else:
                print(f"⚠ Re-downloading {filename} due to checksum issue")

        success, message = download_file(url, dest, output_path)
        print(f"  {message}")

        if success:
            downloaded_files.append(dest)
        else:
            failed_files.append(filename)

    print("-" * 60)
    print(f"Downloaded {len(downloaded_files)}/{len(files_to_download)} files")

    if failed_files:
        print(f"Failed: {', '.join(failed_files)}")
        return downloaded_files

    print("✓ All ephemeris files downloaded successfully!")
    return downloaded_files


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Download Swiss Ephemeris data files"
    )
    parser.add_argument(
        "--output-dir",
        default=os.getenv("EPHEMERIS_PATH", "/app/data/ephemeris"),
        help="Output directory for ephemeris files",
    )
    parser.add_argument(
        "--extended",
        action="store_true",
        help="Download extended range files (-4800 to 2400 CE)",
    )

    args = parser.parse_args()

    try:
        files = download_ephemeris_files(
            output_dir=args.output_dir,
            include_optional=args.extended
        )

        if not files:
            print("ERROR: No files were downloaded!")
            sys.exit(1)

        print(f"\nEphemeris files ready at: {args.output_dir}")
        sys.exit(0)

    except KeyboardInterrupt:
        print("\n\nDownload cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFATAL ERROR: {e}")
        sys.exit(1)
