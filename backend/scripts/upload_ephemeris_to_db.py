#!/usr/bin/env python3
"""
Upload ephemeris files to Postgres database.

Stores Swiss Ephemeris .se1 files as binary blobs for deployment.
"""

import os
import sys
import hashlib
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.models.ephemeris_storage import Base, EphemerisFile
from src.utils.file_security import validate_safe_filename


def calculate_sha256(file_path: Path) -> str:
    """Calculate SHA256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)
    return sha256.hexdigest()


def upload_ephemeris_files(
    ephemeris_dir: str,
    database_url: str,
    source_url_base: str = "https://www.astro.com/ftp/swisseph/ephe/"
):
    """
    Upload all ephemeris files from directory to database.

    Args:
        ephemeris_dir: Directory containing .se1 files
        database_url: SQLAlchemy database URL
        source_url_base: Base URL where files were downloaded from
    """
    # Create database engine and session
    engine = create_engine(database_url)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    ephemeris_path = Path(ephemeris_dir)
    if not ephemeris_path.exists():
        print(f"ERROR: Ephemeris directory not found: {ephemeris_dir}")
        sys.exit(1)

    # Find all .se1 files
    se1_files = list(ephemeris_path.glob("*.se1"))
    if not se1_files:
        print(f"ERROR: No .se1 files found in {ephemeris_dir}")
        sys.exit(1)

    print(f"Found {len(se1_files)} ephemeris files to upload")
    print("-" * 60)

    uploaded = 0
    skipped = 0

    for file_path in se1_files:
        # Validate filename for path traversal attacks
        try:
            filename = validate_safe_filename(file_path.name, allowed_extensions=['.se1'])
        except (ValueError, Exception) as e:
            print(f"✗ Skipping {file_path.name}: {e}")
            continue

        # Check if already exists
        existing = session.query(EphemerisFile).filter_by(filename=filename).first()
        if existing:
            print(f"⊙ Skipping {filename} (already in database)")
            skipped += 1
            continue

        # Read file data
        file_data = file_path.read_bytes()
        file_size = len(file_data)
        sha256_hash = calculate_sha256(file_path)

        # Create database record
        ephemeris_file = EphemerisFile(
            filename=filename,
            file_data=file_data,
            file_size=file_size,
            sha256_hash=sha256_hash,
            source_url=f"{source_url_base}{filename}"
        )

        session.add(ephemeris_file)
        session.commit()

        size_mb = file_size / (1024 * 1024)
        print(f"✓ Uploaded {filename} ({size_mb:.2f} MB, SHA256: {sha256_hash[:16]}...)")
        uploaded += 1

    print("-" * 60)
    print(f"Uploaded: {uploaded}, Skipped: {skipped}, Total: {len(se1_files)}")
    print("✓ Ephemeris files stored in database!")

    session.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Upload ephemeris files to Postgres"
    )
    parser.add_argument(
        "--ephemeris-dir",
        default=os.getenv("EPHEMERIS_PATH", "/app/data/ephemeris"),
        help="Directory containing ephemeris files",
    )
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL", "postgresql://localhost/chart_generator"),
        help="Database connection URL",
    )

    args = parser.parse_args()

    try:
        upload_ephemeris_files(
            ephemeris_dir=args.ephemeris_dir,
            database_url=args.database_url
        )
        sys.exit(0)

    except KeyboardInterrupt:
        print("\n\nUpload cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
