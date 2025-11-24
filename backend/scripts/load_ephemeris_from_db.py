#!/usr/bin/env python3
"""
Load ephemeris files from Postgres to filesystem.

Extracts .se1 files from database to ephemeris directory at application startup.
"""

import os
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.models.ephemeris_storage import Base, EphemerisFile


def load_ephemeris_files(
    database_url: str,
    output_dir: str = "/app/data/ephemeris",
    force: bool = False
):
    """
    Extract ephemeris files from database to filesystem.

    Args:
        database_url: SQLAlchemy database URL
        output_dir: Directory to extract files to
        force: Overwrite existing files if True
    """
    # Create database engine and session
    engine = create_engine(database_url)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Get all ephemeris files from database
    files = session.query(EphemerisFile).all()

    if not files:
        print("WARNING: No ephemeris files found in database!")
        print("Run upload_ephemeris_to_db.py first to populate the database.")
        sys.exit(1)

    print(f"Found {len(files)} ephemeris files in database")
    print(f"Extracting to: {output_dir}")
    print("-" * 60)

    extracted = 0
    skipped = 0

    for ephemeris_file in files:
        dest_path = output_path / ephemeris_file.filename

        # Skip if exists and not forcing
        if dest_path.exists() and not force:
            print(f"⊙ Skipping {ephemeris_file.filename} (already exists)")
            skipped += 1
            continue

        # Write file data to disk
        dest_path.write_bytes(ephemeris_file.file_data)

        size_mb = ephemeris_file.file_size / (1024 * 1024)
        print(f"✓ Extracted {ephemeris_file.filename} ({size_mb:.2f} MB)")
        extracted += 1

    print("-" * 60)
    print(f"Extracted: {extracted}, Skipped: {skipped}, Total: {len(files)}")
    print(f"✓ Ephemeris files ready at: {output_dir}")

    session.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Load ephemeris files from database to filesystem"
    )
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL", "postgresql://localhost/chart_generator"),
        help="Database connection URL",
    )
    parser.add_argument(
        "--output-dir",
        default=os.getenv("EPHEMERIS_PATH", "/app/data/ephemeris"),
        help="Output directory for ephemeris files",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files",
    )

    args = parser.parse_args()

    try:
        load_ephemeris_files(
            database_url=args.database_url,
            output_dir=args.output_dir,
            force=args.force
        )
        sys.exit(0)

    except KeyboardInterrupt:
        print("\n\nExtraction cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
