#!/usr/bin/env python3
"""
Download Swiss Ephemeris data files for Human Design calculations.

Downloads required .se1 files from Astrodienst and stores them in Postgres
for deployment and runtime access.
"""

import os
import sys
import httpx
from pathlib import Path
from typing import List, Tuple

# Swiss Ephemeris file URLs from GitHub mirror (Astrodienst FTP is blocked)
# Primary source: https://github.com/aloistr/swisseph (official Swiss Ephemeris GitHub repository)
GITHUB_BASE_URL = "https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/"

# Fallback source if primary fails
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


def download_file(url: str, dest_path: Path) -> Tuple[bool, str]:
    """
    Download a single ephemeris file.

    Args:
        url: URL to download from
        dest_path: Local path to save file

    Returns:
        Tuple of (success, message)
    """
    try:
        print(f"Downloading {dest_path.name}...")
        with httpx.Client(timeout=60.0) as client:
            response = client.get(url)
            response.raise_for_status()

            # Write to destination
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            dest_path.write_bytes(response.content)

            size_mb = len(response.content) / (1024 * 1024)
            return True, f"✓ Downloaded {dest_path.name} ({size_mb:.2f} MB)"

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
        dest = output_path / filename

        # Skip if already exists
        if dest.exists():
            size_mb = dest.stat().st_size / (1024 * 1024)
            print(f"⊙ Skipping {filename} (already exists, {size_mb:.2f} MB)")
            downloaded_files.append(dest)
            continue

        # Try GitHub mirror first (primary source)
        github_url = f"{GITHUB_BASE_URL}{filename}"
        success, message = download_file(github_url, dest)
        print(f"  {message}")

        # If GitHub fails, try Astrodienst as fallback
        if not success:
            print(f"  Trying fallback source...")
            astrodienst_url = f"{ASTRODIENST_BASE_URL}{filename}"
            success, message = download_file(astrodienst_url, dest)
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
