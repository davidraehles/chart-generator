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
from typing import List, Tuple

# Swiss Ephemeris file URLs from Astrodienst
ASTRODIENST_BASE_URL = "https://www.astro.com/ftp/swisseph/ephe/"

# Maximum allowed file size (100 MB) to prevent memory exhaustion attacks
MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

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


def download_file(url: str, dest_path: Path) -> Tuple[bool, str]:
    """
    Download a single ephemeris file with streaming and size limits.

    Args:
        url: URL to download from
        dest_path: Local path to save file

    Returns:
        Tuple of (success, message)
    """
    try:
        print(f"Downloading {dest_path.name}...")
        with httpx.Client(timeout=60.0) as client:
            # Stream the response to avoid loading large files into memory
            with client.stream('GET', url) as response:
                response.raise_for_status()

                # Check Content-Length header to prevent oversized downloads
                content_length = response.headers.get('content-length')
                if content_length:
                    file_size = int(content_length)
                    if file_size > MAX_FILE_SIZE_BYTES:
                        size_mb = file_size / (1024 * 1024)
                        max_mb = MAX_FILE_SIZE_BYTES / (1024 * 1024)
                        return False, f"✗ File too large: {size_mb:.2f} MB (max {max_mb:.0f} MB)"

                # Stream download with size limit enforcement
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                bytes_downloaded = 0
                sha256_hash = hashlib.sha256()

                with open(dest_path, 'wb') as f:
                    for chunk in response.iter_bytes(chunk_size=8192):
                        bytes_downloaded += len(chunk)

                        # Enforce size limit during download (defense in depth)
                        if bytes_downloaded > MAX_FILE_SIZE_BYTES:
                            f.close()
                            dest_path.unlink(missing_ok=True)  # Clean up partial file
                            size_mb = bytes_downloaded / (1024 * 1024)
                            max_mb = MAX_FILE_SIZE_BYTES / (1024 * 1024)
                            return False, f"✗ Download exceeded size limit: {size_mb:.2f} MB (max {max_mb:.0f} MB)"

                        f.write(chunk)
                        sha256_hash.update(chunk)

                size_mb = bytes_downloaded / (1024 * 1024)
                return True, f"✓ Downloaded {dest_path.name} ({size_mb:.2f} MB, SHA256: {sha256_hash.hexdigest()[:16]}...)"

    except httpx.HTTPStatusError as e:
        return False, f"✗ HTTP {e.response.status_code}: {url}"
    except Exception as e:
        return False, f"✗ Error: {str(e)}"


def download_ephemeris_files(
    output_dir: str = "/app/data/ephemeris",
    include_optional: bool = False
) -> List[Path]:
    """
    Download all required ephemeris files.

    Args:
        output_dir: Directory to save files
        include_optional: Whether to download optional extended files

    Returns:
        List of successfully downloaded file paths
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    files_to_download = REQUIRED_FILES.copy()
    if include_optional:
        files_to_download.extend(OPTIONAL_FILES)

    print(f"Downloading {len(files_to_download)} ephemeris files to {output_dir}...")
    print("-" * 60)

    downloaded_files = []
    failed_files = []

    for filename in files_to_download:
        url = f"{ASTRODIENST_BASE_URL}{filename}"
        dest = output_path / filename

        # Skip if already exists
        if dest.exists():
            size_mb = dest.stat().st_size / (1024 * 1024)
            print(f"⊙ Skipping {filename} (already exists, {size_mb:.2f} MB)")
            downloaded_files.append(dest)
            continue

        success, message = download_file(url, dest)
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
