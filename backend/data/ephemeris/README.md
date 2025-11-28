# Swiss Ephemeris Data Files

This directory contains the ephemeris data files required for astronomical calculations.

## Required Files

The following files are needed for accurate planetary calculations including Chiron:

- `seas_18.se1` - Asteroids including Chiron (1800-2400 CE) - ~0.2MB
- `semo_18.se1` - Moon positions (1800-2400 CE) - ~1.2MB
- `sepl_18.se1` - Planets (1800-2400 CE) - ~0.5MB

Total size: ~2MB

## Download Instructions

### Automated Download (Recommended):

Use the provided download script from the backend directory:

```bash
cd backend
python3 scripts/download_ephemeris.py --output-dir data/ephemeris
```

The script automatically downloads from GitHub mirror (primary) with fallback to Astrodienst.

### Manual Download:

#### Using GitHub mirror (recommended):

```bash
cd backend/data/ephemeris
curl -L -O https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/seas_18.se1
curl -L -O https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/semo_18.se1
curl -L -O https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/sepl_18.se1
```

#### Using Astrodienst (may be blocked by firewall):

```bash
cd backend/data/ephemeris
curl -O https://www.astro.com/ftp/swisseph/ephe/seas_18.se1
curl -O https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
curl -O https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1
```

## Extended Range (Optional)

For dates outside 1800-2400 CE range, download additional files using the script:

```bash
python3 scripts/download_ephemeris.py --output-dir data/ephemeris --extended
```

## Environment Configuration

Set the ephemeris path when running the backend:

```bash
export EPHEMERIS_PATH=/home/user/chart-generator/backend/data/ephemeris
uvicorn src.main:app --reload
```

Or use the default path `/app/data/ephemeris` in production.

## Data Sources

- **Primary**: GitHub mirror at https://github.com/aloistr/swisseph (reliable, no firewall issues)
- **Fallback**: Astrodienst FTP at https://www.astro.com/ftp/swisseph/ephe/ (may be blocked)

## License

Swiss Ephemeris is GPL-licensed for non-commercial use.
See https://www.astro.com/swisseph/ for licensing details.
