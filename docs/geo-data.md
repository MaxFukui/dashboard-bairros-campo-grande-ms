# Geo Data — Bairros de Campo Grande

Spatial data pipeline that turns the IBGE shapefile of Mato Grosso do Sul
neighborhoods into web-ready files used by the dashboard's choropleth map.

## Overview

- **Source:** `MS_bairros_CD2022.shp` — IBGE, Censo Demográfico 2022 (CD2022).
  Covers 18 municipalities of Mato Grosso do Sul, 296 neighborhoods total.
- **Output:** Two web-ready files for the 74 bairros of Campo Grande.
  Joined to the existing `src/data/bairros.json` via the numeric
  `id_bairro` (1–74).
- **Frontend:** ECharts `series-map` + `geo` component, lazy-loaded on the
  *Visão Geral* tab of the dashboard.

## What was done

1. **Filtered the CG shapefile** out of the state-level file using `pyshp`,
   selecting records where `NM_MUN == "Campo Grande"` (IBGE code `5002704`).
   Result: 74 polygons written to `public/shapefiles_bairros/CG_bairros_CD2022/`.
2. **Converted to GeoJSON** with RFC 7946 output (`lng, lat` order,
   `urn:ogc:def:crs:OGC:1.3:CRS84`). Added an `id_bairro` property (1–74)
   to every feature for direct join with the existing JSON. The original
   IBGE codes are preserved as `cd_bairro`, `cd_mun`, etc.
3. **Converted to TopoJSON** (quantization 1e5, ~1 m precision) for
   a 40% smaller file that can be used later with vector tiles, MapLibre,
   or any tool that prefers the TopoJSON format.
4. **Added TypeScript types and a loader** (`src/lib/geo.ts`) so the
   components are type-safe end to end.
5. **Built `ChoroplethMap`** — a reusable ECharts component that joins
   the GeoJSON features with the indicator values from `bairros.json`,
   colors each feature by the selected indicator, and outlines the
   7 Regiões Urbanas in distinct colors.
6. **Integrated into the dashboard** as a panel on *Visão Geral*,
   right after the KPI cards, with an inline indicator selector.

## File organization

```
public/
├── shapefiles_bairros/                        ← raw + filtered shapefiles
│   ├── MS_bairros_CD2022.cpg                  ← original state-level source
│   ├── MS_bairros_CD2022.dbf
│   ├── MS_bairros_CD2022.prj                  (SIRGAS 2000)
│   ├── MS_bairros_CD2022.shp
│   ├── MS_bairros_CD2022.shx
│   └── CG_bairros_CD2022/                      ← filtered to CG only (74 bairros)
│       ├── CG_bairros_CD2022.cpg
│       ├── CG_bairros_CD2022.dbf
│       ├── CG_bairros_CD2022.prj
│       ├── CG_bairros_CD2022.shp
│       └── CG_bairros_CD2022.shx
└── geo/                                       ← web-ready formats
    ├── bairros_campo_grande.geojson             320 KB  (source of truth)
    └── bairros_campo_grande.topojson             195 KB  (-40%, future use)

src/
├── lib/
│   ├── data.ts                               ← existing indicators & bairros (unchanged)
│   ├── bairros.d.ts                          ← existing JSON module decl (unchanged)
│   ├── utils.ts                              ← existing cn() helper (unchanged)
│   └── geo.ts                                ← NEW: types + loadBairrosGeoJSON()
└── components/
    ├── Charts.tsx                            ← existing bar/scatter/radar/pie (unchanged)
    ├── Dashboard.tsx                         ← +20 lines: imports + map panel
    └── ChoroplethMap.tsx                     ← NEW: reusable ECharts choropleth
```

### Why this layout

- `public/shapefiles_bairros/` keeps the **raw data** in its original
  format, untouched. Useful as a reference and for any tool that
  wants the shapefile directly (QGIS, ogr2ogr, etc.).
- `public/geo/` holds the **web-optimized** versions. The split between
  GeoJSON and TopoJSON keeps both formats available without forcing
  the dashboard to use the larger one.
- `src/lib/geo.ts` is colocated with the other data utilities so any
  component can `import { loadBairrosGeoJSON, ... }` without reaching
  into components or assets.
- The geo data is **fetched at runtime**, not bundled. This keeps the
  Dashboard chunk size unchanged (the file is in `public/`, so Vite
  emits it as a static asset served by the dev/prod web server).

## Data schema

Every feature in `bairros_campo_grande.geojson` has these properties
(see `BairroProperties` in `src/lib/geo.ts`):

| Field          | Type   | Description                                                   |
| -------------- | ------ | ------------------------------------------------------------- |
| `id_bairro`    | number | Numeric id (1–74) — **the join key with `bairros.json`**      |
| `nome`         | string | Title-case neighborhood name, e.g. `"Aero Rancho"`            |
| `nome_upper`   | string | UPPERCASE form, matches the `Bairro` field in `bairros.json`  |
| `name`         | string | Alias of `nome` — added so ECharts' default `nameProperty`     |
|                |        | (`"name"`) works without extra config                          |
| `cd_bairro`    | string | IBGE neighborhood code, e.g. `"5002704035"`                   |
| `cd_mun`       | string | IBGE municipality code, always `"5002704"` (Campo Grande)     |
| `nm_mun`       | string | Always `"Campo Grande"`                                        |
| `cd_dist`      | string | IBGE district code                                             |
| `nm_dist`      | string | District name (same as municipality for CG)                    |
| `cd_subdist`   | string | IBGE sub-district code                                         |
| `nm_subdist`   | string | **Região Urbana** name, e.g. `"Região Urbana do Anhanduizinho"` |
| `cd_regiao`    | string | IBGE macro-region code (`"5"` = Centro-Oeste)                 |
| `nm_regiao`    | string | Macro-region name                                              |
| `cd_uf`        | string | State code, always `"50"` (MS)                                 |
| `nm_uf`        | string | State name, always `"Mato Grosso do Sul"`                      |
| `cd_rgint`     | string | IBGE integrated region code                                    |
| `nm_rgint`     | string | Integrated region name                                         |
| `cd_rgi`       | string | IBGE immediate region code                                     |
| `nm_rgi`       | string | Immediate region name                                          |
| `cd_concurb`   | string | Urban conurbation code                                         |
| `nm_concurb`   | string | Urban conurbation name                                         |

### CRS

SIRGAS 2000 (EPSG:4674), but the GeoJSON file declares
`urn:ogc:def:crs:OGC:1.3:CRS84` to comply with RFC 7946 (the WGS84
datum that ECharts and Leaflet expect). For a city-scale choropleth
the difference between SIRGAS 2000 and WGS84 is negligible (< 1 m).

## Frontend integration

### `src/lib/geo.ts`

Public API:

```ts
import {
  loadBairrosGeoJSON,   // () => Promise<BairroFeatureCollection>  (cached)
  CG_GEO_URL,            // "/geo/bairros_campo_grande.geojson"
  CG_TOPO_URL,            // "/geo/bairros_campo_grande.topojson"
  type BairroFeature,
  type BairroFeatureCollection,
  type BairroProperties,
} from "@/lib/geo"
```

- `loadBairrosGeoJSON()` is memoized — the file is fetched once per
  session and cached at the module level.
- The URL constants are exported so non-React code (e.g. service
  workers, future API endpoints) can use the same paths.

### `src/components/ChoroplethMap.tsx`

Props:

```ts
interface ChoroplethMapProps {
  indicator: IndicatorDef   // any indicator from src/lib/data.ts
  height?: number | string   // default: 520 (px)
  className?: string
}
```

Behavior:

- Lazy-loads the GeoJSON on first mount, then registers it as
  ECharts map `"campo_grande_bairros"`.
- Joins `bairros` (from `data.ts`) with the GeoJSON features by
  `id_bairro` to build the series data. Each data item has
  `{ name, value, regiao }` where `regiao` is the Região Urbana.
- Renders a `geo` component (pan/zoom enabled) plus a `series-map`
  with a `visualMap` for the color scale.
- Outlines the 7 Regiões Urbanas in distinct colors via
  `geo.regions`. See `REGION_PALETTE` in the component for the
  mapping. The colors are exported and can be reused in legends.
- Tooltip shows the bairro name, formatted value, and Região Urbana.
- Toolbox in the top-right corner: restore view, save as PNG
  (pixelRatio 2).

### Wiring

`Dashboard.tsx` (Visão Geral tab) was extended with a small wrapper:

```tsx
const [mapIndicatorKey, setMapIndicatorKey] = useState("POPULACAO")
const mapIndicator = indicators.find((i) => i.key === mapIndicatorKey) ?? indicators[0]

<PanelBox title="Mapa dos bairros" Icon={Map}>
  <Select value={mapIndicatorKey} onValueChange={setMapIndicatorKey}>
    {/* all 46 indicators from data.ts */}
  </Select>
  <ChoroplethMap indicator={mapIndicator} height={520} />
</PanelBox>
```

## Usage examples

### Show the default choropleth

```tsx
import { ChoroplethMap } from "@/components/ChoroplethMap"
import { indicators } from "@/lib/data"

export function MyView() {
  return <ChoroplethMap indicator={indicators[0]} height={500} />
}
```

### Show a different indicator with a custom size

```tsx
const renda = indicators.find((i) => i.key === "RENDA_ESTIMADA_2025")!

<ChoroplethMap indicator={renda} height="60vh" className="my-4" />
```

### Read the raw geo data from a service worker / API route

```ts
import { CG_GEO_URL } from "@/lib/geo"
const res = await fetch(CG_GEO_URL)
```

## How to re-run the conversion

If a new shapefile is released (e.g. Census 2030), update the geo data
with the scripts in `scripts/geo/`. See [`scripts/geo/README.md`](../scripts/geo/README.md)
for the full workflow. Quick reference:

```bash
# 1. Filter the state-level shapefile to CG only (one-time, see README)
# 2. Convert to GeoJSON
python3 scripts/geo/shp_to_geojson.py

# 3. Convert to TopoJSON
node scripts/geo/geojson_to_topojson.mjs
```

The scripts read from the committed shapefiles and write to
`public/geo/`. No other files need to change — the dashboard picks
up the new files on next page load.

## Known issues & decisions

### 3 name mismatches between the shapefile and `bairros.json`

The IBGE shapefile and the existing `bairros.json` disagree on 3 names:

| IBGE shapefile (`NM_BAIRRO`) | `bairros.json` (`Bairro`) |
| --------------------------- | ------------------------- |
| `JÓCKEY CLUB`               | `JOCKEY CLUB` (no accent) |
| `CENTRO-OESTE`              | `CENTRO OESTE` (no hyphen) |
| `VILAS BOAS`                | `VILASBOAS` (no space)    |

The choropleth **does not** match by name — it matches by the numeric
`id_bairro` (1–74), which is identical across both sources. So these
mismatches are harmless for the map. They may show up if you try to
join by name elsewhere; if you do, normalize with
`strip_diacritics → upper → replace("-", " ") → strip_all_whitespace`.

### Why a GeoJSON **and** a TopoJSON?

- **GeoJSON** (320 KB) is the source of truth and is what ECharts
  consumes today. It's the format you'll inspect in the browser
  dev tools.
- **TopoJSON** (195 KB, 40% smaller) is kept for future use. If you
  later switch to MapLibre/Mapbox GL, vector tiles, or any pipeline
  that prefers TopoJSON, the file is ready. It also reduces
  cold-start bandwidth for users on slow connections.

### Why fetch at runtime instead of bundling?

The 320 KB GeoJSON would bloat the Dashboard JS chunk by 25% if
bundled. Fetching from `public/geo/` keeps the JS chunk unchanged,
lets the browser cache the file across navigations, and supports
HTTP range requests if you ever want to slice it.

## Verification log

- `npx tsc --noEmit -p tsconfig.app.json` → clean
- `npm run build` → clean, 1.04 MB Dashboard chunk (313 KB gzip),
  no size increase from the map component
- `npm run lint` → no new warnings in `geo.ts` or `ChoroplethMap.tsx`
- Headless Chromium test → 0 console errors, choropleth renders
  correctly for both `POPULACAO` and `RENDA_ESTIMADA_2025`, tooltip
  works on hover
