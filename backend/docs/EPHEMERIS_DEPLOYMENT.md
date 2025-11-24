# Ephemeris Data Deployment Guide

Complete guide for deploying Swiss Ephemeris data for Human Design chart calculations.

## Overview

The ephemeris system uses Swiss Ephemeris `.se1` binary files for astronomical calculations. These files are:
1. **Downloaded** from Astrodienst (official Swiss Ephemeris source)
2. **Stored** in Postgres for persistence across deployments
3. **Extracted** to filesystem at application startup for use by `pyswisseph`

## Quick Start

### One-Command Deployment

```bash
# From backend directory
./scripts/deploy_ephemeris.sh
```

This downloads, uploads to DB, and extracts files in one step.

### Options

```bash
# Include extended range files (-4800 to 2400 CE)
./scripts/deploy_ephemeris.sh --extended

# Force overwrite existing files
./scripts/deploy_ephemeris.sh --force
```

## Manual Deployment Steps

### Step 1: Download Ephemeris Files

```bash
python3 scripts/download_ephemeris.py \
  --output-dir /app/data/ephemeris
```

**What it does:**
- Downloads required `.se1` files from `https://www.astro.com/ftp/swisseph/ephe/`
- Files cover years 1800-2400 CE (standard range)
- Total size: ~50MB for standard range, ~150MB with extended

**Required files:**
- `seas_18.se1` - Asteroids 1800-2400
- `semo_18.se1` - Moon 1800-2400
- `sepl_18.se1` - Planets 1800-2400

### Step 2: Upload to Postgres

```bash
python3 scripts/upload_ephemeris_to_db.py \
  --ephemeris-dir /app/data/ephemeris \
  --database-url $DATABASE_URL
```

**What it does:**
- Reads `.se1` files from directory
- Stores as binary blobs in `ephemeris_files` table
- Calculates SHA256 hash for integrity verification
- Idempotent: skips files already in database

**Database schema:**
```sql
CREATE TABLE ephemeris_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  file_data BYTEA NOT NULL,
  file_size INTEGER NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL,
  source_url VARCHAR(512)
);
```

### Step 3: Extract at Runtime

```bash
python3 scripts/load_ephemeris_from_db.py \
  --database-url $DATABASE_URL \
  --output-dir /app/data/ephemeris
```

**What it does:**
- Extracts files from Postgres to filesystem
- Required at application startup (ephemeral containers)
- Fast: typically completes in <5 seconds
- Idempotent: skips existing files unless `--force`

## Production Deployment

### Container Startup Script

Add to your `Dockerfile` or startup script:

```dockerfile
# In Dockerfile
RUN mkdir -p /app/data/ephemeris

# In entrypoint.sh or startup command
python3 /app/backend/scripts/load_ephemeris_from_db.py && \
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 5000
```

### Environment Variables

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Ephemeris file location
EPHEMERIS_PATH=/app/data/ephemeris
```

### First-Time Setup

On **initial deployment only**, run the full deployment:

```bash
./scripts/deploy_ephemeris.sh
```

On **subsequent deploys**, only extract from DB:

```bash
python3 scripts/load_ephemeris_from_db.py
```

## Verification

### Check Files on Filesystem

```bash
ls -lh /app/data/ephemeris/*.se1
```

Expected output:
```
-rw-r--r-- 1 root root 8.2M  seas_18.se1
-rw-r--r-- 1 root root  23M  semo_18.se1
-rw-r--r-- 1 root root  18M  sepl_18.se1
```

### Check Database

```sql
SELECT filename, file_size, uploaded_at
FROM ephemeris_files
ORDER BY filename;
```

### Test Endpoint

```bash
curl -X POST http://localhost:5000/api/calculate-chart \
  -H "Content-Type: application/json" \
  -d '{
    "birth_datetime": "1990-05-15T14:30:00",
    "birth_timezone": "Europe/Berlin",
    "birth_latitude": 52.52,
    "birth_longitude": 13.405
  }'
```

Should return 26 planetary positions (13 personality + 13 design) with gate/line mappings.

## Troubleshooting

### Error: "Ephemeris data files not found"

**Cause:** Files not extracted to filesystem
**Fix:**
```bash
python3 scripts/load_ephemeris_from_db.py --force
```

### Error: "No ephemeris files found in database"

**Cause:** Files not uploaded to Postgres
**Fix:**
```bash
./scripts/deploy_ephemeris.sh
```

### Error: "File download failed"

**Cause:** Network issues or Astrodienst server unavailable
**Fix:** Retry after a few minutes, or manually download from:
- https://www.astro.com/ftp/swisseph/ephe/

### Performance Issues

If extraction takes >10 seconds:
- Check database connection latency
- Ensure adequate disk I/O on container
- Consider caching extracted files in volume mount

## Advanced: Extended Range

For calculations outside 1800-2400 CE:

```bash
./scripts/deploy_ephemeris.sh --extended
```

This downloads additional files covering -4800 to 2400 CE (~150MB total).

## Architecture

```
┌─────────────────────┐
│  Astrodienst CDN    │
│  (Swiss Ephemeris)  │
└──────────┬──────────┘
           │ download_ephemeris.py
           ▼
┌─────────────────────┐
│  Local Filesystem   │
│  (/app/data/ephem)  │
└──────────┬──────────┘
           │ upload_ephemeris_to_db.py
           ▼
┌─────────────────────┐
│  Postgres Database  │
│  (ephemeris_files)  │
└──────────┬──────────┘
           │ load_ephemeris_from_db.py
           ▼
┌─────────────────────┐
│  Runtime Filesystem │ ──> pyswisseph
│  (ephemeral)        │     (calculations)
└─────────────────────┘
```

## Security Considerations

- Ephemeris files are read-only after deployment
- SHA256 hashes verify file integrity
- No user input affects file paths (prevent path traversal)
- Files served only through calculation API (not direct access)

## License

Swiss Ephemeris files are licensed under GNU GPL v2 or Swiss Ephemeris Professional License.
See: https://www.astro.com/swisseph/swephinfo_e.htm
