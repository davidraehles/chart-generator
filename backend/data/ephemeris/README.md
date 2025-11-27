# Swiss Ephemeris Data Files

This directory contains the ephemeris data files required for astronomical calculations.

## Required Files

Download the following files from https://www.astro.com/ftp/swisseph/ephe/:

- `seas_18.se1` - Main planets (1800-2399 CE) - ~10MB
- `semo_18.se1` - Moon (1800-2399 CE) - ~25MB
- `sepl_18.se1` - Additional bodies (1800-2399 CE) - ~15MB

Total size: ~50MB

## Download Instructions

### Using wget:

```bash
cd backend/data/ephemeris
wget https://www.astro.com/ftp/swisseph/ephe/seas_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1
```

### Using curl:

```bash
cd backend/data/ephemeris
curl -O https://www.astro.com/ftp/swisseph/ephe/seas_18.se1
curl -O https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
curl -O https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1
```

## Extended Range (Optional)

For dates outside 1800-2399 CE range, download additional files:
- `seas_m*.se1` for earlier centuries
- See quickstart.md for full instructions

## License

Swiss Ephemeris is GPL-licensed for non-commercial use.
See https://www.astro.com/swisseph/ for licensing details.
