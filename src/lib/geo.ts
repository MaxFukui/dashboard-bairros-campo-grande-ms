// Geo data types + runtime loader for Campo Grande neighborhoods.
// Data files live in /public/geo/ and are fetched at runtime so the
// initial JS bundle stays small.

export const CG_GEO_URL = "/geo/bairros_campo_grande.geojson"
export const CG_TOPO_URL = "/geo/bairros_campo_grande.topojson"

export interface GeoJSONPolygon {
  type: "Polygon"
  coordinates: number[][][]
}

export interface GeoJSONMultiPolygon {
  type: "MultiPolygon"
  coordinates: number[][][][]
}

export type GeoJSONGeometry = GeoJSONPolygon | GeoJSONMultiPolygon

export interface BairroProperties {
  id_bairro: number
  nome: string
  nome_upper: string
  cd_bairro: string
  cd_mun: string
  nm_mun: string
  cd_dist: string
  nm_dist: string
  cd_subdist: string
  nm_subdist: string
  cd_regiao: string
  nm_regiao: string
  cd_uf: string
  nm_uf: string
  cd_rgint: string
  nm_rgint: string
  cd_rgi: string
  nm_rgi: string
  cd_concurb: string
  nm_concurb: string
}

export interface BairroFeature {
  type: "Feature"
  id?: number
  properties: BairroProperties
  geometry: GeoJSONGeometry
}

export interface BairroFeatureCollection {
  type: "FeatureCollection"
  name: string
  crs?: { type: string; properties: { name: string } }
  metadata?: Record<string, unknown>
  features: BairroFeature[]
}

let geoCache: BairroFeatureCollection | null = null

export async function loadBairrosGeoJSON(): Promise<BairroFeatureCollection> {
  if (geoCache) return geoCache
  const r = await fetch(CG_GEO_URL)
  if (!r.ok) throw new Error(`Failed to load ${CG_GEO_URL}: ${r.status}`)
  geoCache = (await r.json()) as BairroFeatureCollection
  return geoCache
}
