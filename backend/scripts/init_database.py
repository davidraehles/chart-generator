#!/usr/bin/env python3
"""
Initialize database tables for email capture.

Creates lead_emails table with all required columns.
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from dotenv import load_dotenv

from src.models.ephemeris_storage import Base
from src.models.lead_email_db import LeadEmailDB

# Load environment variables
load_dotenv()


def init_database(database_url: str = None):
    """
    Initialize database tables.

    Args:
        database_url: Database connection URL (optional, defaults to env)
    """
    if database_url is None:
        database_url = os.getenv(
            "DATABASE_URL",
            "postgresql://chart_user:password@localhost:5432/chart_generator"
        )

    print(f"Connecting to database...")
    engine = create_engine(database_url)

    print("Creating tables...")
    Base.metadata.create_all(engine)

    print("Database initialization complete!")
    print(f"Tables created: {', '.join(Base.metadata.tables.keys())}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Initialize database tables"
    )
    parser.add_argument(
        "--database-url",
        help="Database connection URL (overrides env)",
    )

    args = parser.parse_args()

    try:
        init_database(database_url=args.database_url)
        sys.exit(0)

    except KeyboardInterrupt:
        print("\n\nInitialization cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
