#!/bin/bash
# Deploy ephemeris data: Download → Upload to DB → Extract to filesystem
#
# This script orchestrates the full ephemeris deployment pipeline:
# 1. Downloads .se1 files from Astrodienst
# 2. Uploads them to Postgres
# 3. Extracts them to the ephemeris directory for use
#
# Usage:
#   ./deploy_ephemeris.sh [--extended] [--force]

set -e  # Exit on error

# Parse arguments
EXTENDED=""
FORCE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --extended)
      EXTENDED="--extended"
      shift
      ;;
    --force)
      FORCE="--force"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--extended] [--force]"
      exit 1
      ;;
  esac
done

# Configuration from environment or defaults
EPHEMERIS_PATH="${EPHEMERIS_PATH:-/app/data/ephemeris}"
DATABASE_URL="${DATABASE_URL:-postgresql://localhost/chart_generator}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================"
echo "Ephemeris Data Deployment"
echo "========================================"
echo "Ephemeris Path: $EPHEMERIS_PATH"
echo "Database: $DATABASE_URL"
echo "Extended Range: ${EXTENDED:-no}"
echo ""

# Step 1: Download ephemeris files
echo "[1/3] Downloading ephemeris files..."
python3 "$SCRIPT_DIR/download_ephemeris.py" \
  --output-dir "$EPHEMERIS_PATH" \
  $EXTENDED

echo ""

# Step 2: Upload to database
echo "[2/3] Uploading files to database..."
python3 "$SCRIPT_DIR/upload_ephemeris_to_db.py" \
  --ephemeris-dir "$EPHEMERIS_PATH" \
  --database-url "$DATABASE_URL"

echo ""

# Step 3: Extract from database (verify round-trip)
echo "[3/3] Extracting files from database..."
python3 "$SCRIPT_DIR/load_ephemeris_from_db.py" \
  --database-url "$DATABASE_URL" \
  --output-dir "$EPHEMERIS_PATH" \
  $FORCE

echo ""
echo "========================================"
echo "✓ Deployment complete!"
echo "========================================"
echo ""
echo "Ephemeris files are now:"
echo "  1. Stored in Postgres for persistence"
echo "  2. Available on filesystem at: $EPHEMERIS_PATH"
echo ""
echo "To use in production:"
echo "  - On container startup, run: python3 scripts/load_ephemeris_from_db.py"
echo "  - This ensures ephemeris files are always available"
