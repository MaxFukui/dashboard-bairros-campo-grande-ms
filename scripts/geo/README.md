# Filter CG shapefile from MS shapefile

The first step. Reads `public/shapefiles_bairros/MS_bairros_CD2022.shp`
and writes only the 74 Campo Grande records to
`public/shapefiles_bairros/CG_bairros_CD2022/`. Run this once, then
keep using the filtered shapefile for all subsequent conversions.

```bash
# Either use the snippet in docs/geo-data.md (How to re-run the conversion)
# or the same logic inline. No script checked in for this step because
# it's a one-time filter.
```

# Convert shapefile to GeoJSON

```bash
python3 scripts/geo/shp_to_geojson.py
```

Output: `public/geo/bairros_campo_grande.geojson` (~320 KB)

Requires: `pyshp` (`pip install pyshp`).

# Convert GeoJSON to TopoJSON

```bash
node scripts/geo/geojson_to_topojson.mjs
```

Output: `public/geo/bairros_campo_grande.topojson` (~195 KB, 40% smaller)

Requires: `topojson-server` and `topojson-simplify` installed locally.

```bash
npm install --save-dev topojson-server topojson-simplify
```

# When to re-run

Re-run the conversion when:

- A new IBGE census is released (CD2030, etc.)
- The shapefile is updated with new neighborhoods or boundary changes
- The `src/data/bairros.json` file is updated with renamed bairros
  (the join logic in `shp_to_geojson.py` will pick up the new names)

After re-running, the dashboard picks up the new files on next page
load — no rebuild required since the files are served as static
assets from `public/`.
