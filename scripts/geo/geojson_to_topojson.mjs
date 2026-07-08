// geojson_to_topojson.mjs - Convert the dashboard's GeoJSON to a
// quantized TopoJSON, ~40% smaller. Useful for future MapLibre or
// vector-tile pipelines.
//
// Usage:
//   node scripts/geo/geojson_to_topojson.mjs
//
// Output:
//   public/geo/bairros_campo_grande.topojson
//
// Run from the project root. Requires topojson-server and
// topojson-simplify installed locally.

import { readFileSync, writeFileSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { topology } from "topojson-server"
import { presimplify, simplify } from "topojson-simplify"

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const SRC = join(ROOT, "public/geo/bairros_campo_grande.geojson")
const DST = join(ROOT, "public/geo/bairros_campo_grande.topojson")

const geo = JSON.parse(readFileSync(SRC, "utf8"))
console.log(`Loaded ${geo.features.length} features`)

// 1e5 = ~1m precision, plenty for a city-scale choropleth.
const topo = topology({ bairros: geo }, 1e5)

// minArea=0 keeps the full geometry. Raise to 1+ to drop more vertices.
const out = simplify(presimplify(topo), 0)
writeFileSync(DST, JSON.stringify(out))

const srcSize = statSync(SRC).size
const dstSize = statSync(DST).size
console.log(`GeoJSON:  ${(srcSize / 1024).toFixed(1)} KB`)
console.log(`TopoJSON: ${(dstSize / 1024).toFixed(1)} KB  (${((1 - dstSize / srcSize) * 100).toFixed(1)}% smaller)`)
console.log(`Arcs: ${out.arcs.length}, Features: ${out.objects.bairros.geometries.length}`)
