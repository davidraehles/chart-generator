#!/usr/bin/env python3
"""
Debug: HD chart calculation for Stefano, step by step.
Run: cd /Users/silkina/chart-generator/backend && venv/bin/python ../debug_chart.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__) + '/backend')

import pytz, swisseph as swe
from datetime import datetime, timedelta

ephe_path = os.path.dirname(__file__) + '/backend/data/ephemeris'
ephe_exists = os.path.isdir(ephe_path)
ephe_files = os.listdir(ephe_path) if ephe_exists else []
swe.set_ephe_path(ephe_path)

# 1) Timezone
tz = pytz.timezone("Europe/Rome")
birth_local = tz.localize(datetime(1963, 10, 21, 4, 50))
birth_utc   = birth_local.astimezone(pytz.UTC)
print(f"[TZ]  local={birth_local}  UTC={birth_utc}  offset={birth_local.utcoffset()}")

# 2) Julian Day
dt = birth_utc
jd = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60.0)
print(f"[JD]  {jd:.6f}  (expected ~2438323)")
print(f"[EPH] exists={ephe_exists}  files={ephe_files}")

# 3) Sun longitude at birth
res_s = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SPEED)
res_m = swe.calc_ut(jd, swe.SUN, swe.FLG_MOSEPH | swe.FLG_SPEED)
sun_s = res_s[0][0]
sun_m = res_m[0][0]
print(f"[SUN] Swiss={sun_s:.6f}°  Moshier={sun_m:.6f}°  (expected ~207°)")

# 4) Gate / line
def gate_line(lon):
    wheel = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,
             27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,
             31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,
             28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60]
    adj = (lon + 58.0) % 360.0
    gn  = int(adj / 5.625)
    pig = adj % 5.625
    ln  = int(pig / 0.9375) + 1
    return wheel[gn], ln

pg, pl = gate_line(sun_s)
print(f"[P-SUN] Gate {pg} Line {pl}  (expected Gate 50 Line 1)")

# 5) Design time
birth_sun = sun_s
design_dt = birth_utc - timedelta(days=88)
for i in range(10):
    d = design_dt
    d_jd = swe.julday(d.year, d.month, d.day, d.hour + d.minute/60.0)
    d_sun = swe.calc_ut(d_jd, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SPEED)[0][0]
    arc   = (birth_sun - d_sun) % 360.0
    print(f"  iter{i}: {d.strftime('%Y-%m-%d %H:%M')} UTC  d_sun={d_sun:.4f}°  arc={arc:.4f}°")
    if abs(arc - 88.0) < 0.01:
        break
    design_dt = design_dt + timedelta(days=arc - 88.0)

dg, dl = gate_line(d_sun)
print(f"[D-SUN] Gate {dg} Line {dl}  (expected Gate 56 Line 3)")
print(f"\n>>> Profile: {pl}/{dl}  (expected 1/3)")
