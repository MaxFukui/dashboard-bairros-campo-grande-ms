import { useEffect, useMemo, useState } from "react"
import { bairros, getVal } from "@/lib/data"
import { loadBairrosGeoJSON, type BairroFeatureCollection } from "@/lib/geo"
import type { RegiaoDatum } from "@/lib/charts-helpers"

/**
 * Loads the Campo Grande GeoJSON, joins it with `bairros.json` and
 * aggregates indicator values per Região Urbana. Returns:
 *   - `data`: array of `{ name, value, bairrosCount }` sorted by value desc.
 *   - `ready`: once the geo is loaded.
 *
 * The bairro → região join uses the numeric `id_bairro` shared by both
 * sources, so the 3 name typos (Jóckey Club / Centro-Oeste / Vilas Boas)
 * don't affect the result.
 */
export function useRegiaoAggregation(indicatorKey: string): {
  data: RegiaoDatum[]
  ready: boolean
} {
  const [geo, setGeo] = useState<BairroFeatureCollection | null>(null)

  useEffect(() => {
    let cancelled = false
    loadBairrosGeoJSON()
      .then((g) => {
        if (!cancelled) setGeo(g)
      })
      .catch(() => {
        /* swallow — render no data; map component surfaces the error */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const data = useMemo<RegiaoDatum[]>(() => {
    if (!geo) return []
    const byId = new Map<number, string>()
    for (const f of geo.features) byId.set(f.properties.id_bairro, f.properties.nm_subdist)

    const grouped = new Map<string, { value: number; bairrosCount: number }>()
    for (const b of bairros) {
      const regiao = byId.get(b.id)
      if (!regiao) continue
      const acc = grouped.get(regiao) ?? { value: 0, bairrosCount: 0 }
      acc.value += getVal(b, indicatorKey)
      acc.bairrosCount += 1
      grouped.set(regiao, acc)
    }

    return Array.from(grouped.entries())
      .map(([name, acc]) => ({ name, value: acc.value, bairrosCount: acc.bairrosCount }))
      .sort((a, b) => b.value - a.value)
  }, [geo, indicatorKey])

  return { data, ready: !!geo }
}