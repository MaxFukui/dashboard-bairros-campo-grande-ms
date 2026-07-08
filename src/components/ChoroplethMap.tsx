import { useEffect, useRef, useMemo, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type IndicatorDef, formatValue, bairros, getVal } from "@/lib/data"
import { loadBairrosGeoJSON, type BairroFeatureCollection } from "@/lib/geo"
import { shortRegiao } from "@/lib/charts-helpers"
import { cn } from "@/lib/utils"

const MAP_CONTAINER_CLASS = "cg-bairro-map"

// One border color for every bairro. Per-região borders looked broken:
// dark ones (navy) disappeared against the basemap, leaving "invisible"
// limits between some neighborhoods.
const BORDER_COLOR = "rgba(241, 245, 249, 0.75)"

// Positive/neutral indicators: navy → gold (high = notable/good).
// Negative indicators: navy → red (high = worst) so hotspots read as warnings.
const COLOR_RAMP_GOOD = ["#001d3d", "#003566", "#1d4ed8", "#ffc300", "#ffd60a"]
const COLOR_RAMP_BAD = ["#001d3d", "#003566", "#991b1b", "#dc2626", "#f97316"]

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`
}

function valueToColor(t: number, ramp: string[]): string {
  if (t <= 0) return ramp[0]
  if (t >= 1) return ramp[ramp.length - 1]
  const seg = t * (ramp.length - 1)
  const i = Math.floor(seg)
  return lerpColor(ramp[i], ramp[i + 1], seg - i)
}

interface ChoroplethMapProps {
  indicator: IndicatorDef
  height?: number | string
  className?: string
  onBairroClick?: (bairroName: string) => void
  selectedBairro?: string | null
  selectable?: boolean
}

export function ChoroplethMap({
  indicator,
  height = 520,
  className,
  onBairroClick,
  selectedBairro = null,
  selectable = false,
}: ChoroplethMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const labelLayerRef = useRef<L.LayerGroup | null>(null)
  const labelMarkersRef = useRef<Map<number, L.Marker>>(new Map())
  const readyRef = useRef(false)
  const onBairroClickRef = useRef(onBairroClick)
  const selectedRef = useRef(selectedBairro)
  const selectableRef = useRef(selectable)

  onBairroClickRef.current = onBairroClick
  selectedRef.current = selectedBairro
  selectableRef.current = selectable

  const onZoomChangeRef = useRef<(z: number) => void>(() => {})

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [-20.4697, -54.6201],
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: false,
      scrollWheelZoom: true,
    })
    mapRef.current = map

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution:
          "Imagery &copy; Esri, Maxar, Earthstar Geographics ·Dados IBGE 2022",
      },
    ).addTo(map)

    map.attributionControl.setPrefix("Leaflet")

    labelLayerRef.current = L.layerGroup().addTo(map)

    map.on("zoomend", () => {
      onZoomChangeRef.current(map.getZoom())
    })

    // Bento grid / mobile rotation can resize the card after Leaflet
    // measured it — keep the map in sync or tiles render misaligned.
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      geoJsonLayerRef.current = null
      labelLayerRef.current = null
      readyRef.current = false
    }
  }, [])

  const rebuildLabels = useCallback((geo: BairroFeatureCollection, zoom: number) => {
    const lg = labelLayerRef.current
    if (!lg) return
    lg.clearLayers()
    labelMarkersRef.current.clear()

    // Labels rest dimmed so the map isn't cluttered; the hovered/tapped
    // bairro's label comes to full opacity. More zoom = more room = more
    // resting visibility.
    const dim = zoom >= 14 ? "0.7" : zoom === 13 ? "0.4" : "0.25"
    mapRef.current?.getContainer().style.setProperty("--cg-label-dim", dim)

    const selected = selectedRef.current

    if (selected) {
      const feat = geo.features.find((f) => {
        const b = bairros.find((b) => b.id === f.properties.id_bairro)
        return b?.nome === selected
      })
      if (feat) {
        const centroid = featureCentroid(feat)
        if (centroid) {
          L.marker(centroid, {
            icon: L.divIcon({
              className: "cg-label cg-label--selected",
              html: `<span>${selected}</span>`,
              iconSize: [200, 28],
              iconAnchor: [100, 14],
            }),
            interactive: false,
          }).addTo(lg)
        }
      }
    }

    if (zoom >= 12) {
      for (const f of geo.features) {
        const b = bairros.find((b) => b.id === f.properties.id_bairro)
        if (!b) continue
        if (b.nome === selected) continue
        const c = featureCentroid(f)
        if (!c) continue
        const marker = L.marker(c, {
          icon: L.divIcon({
            className: "cg-label cg-label--small",
            html: `<span>${b.nome}</span>`,
            iconSize: [120, 16],
            iconAnchor: [60, 8],
          }),
          interactive: false,
        }).addTo(lg)
        labelMarkersRef.current.set(f.properties.id_bairro, marker)
      }
    }
  }, [])

  const updateLabelVisibility = useCallback((zoom: number) => {
    if (!readyRef.current) return
    loadBairrosGeoJSON().then((geo) => rebuildLabels(geo, zoom))
  }, [rebuildLabels])

  useEffect(() => {
    onZoomChangeRef.current = updateLabelVisibility
  }, [updateLabelVisibility])

  const fitToData = useCallback((geo: BairroFeatureCollection) => {
    const map = mapRef.current
    if (!map) return
    try {
      const layer = L.geoJSON(geo as unknown as GeoJSON.GeoJsonObject)
      const b = layer.getBounds()
      if (b.isValid()) map.fitBounds(b.pad(0.04))
    } catch {
      /* bounds failed — keep default center */
    }
  }, [])

  const buildLayer = useCallback((geo: BairroFeatureCollection) => {
    const map = mapRef.current
    if (!map) return

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current)
      geoJsonLayerRef.current = null
    }

    const byId = new Map<number, (typeof geo.features)[number]["properties"]>()
    for (const f of geo.features) byId.set(f.properties.id_bairro, f.properties)

    const values = bairros.map((b) => getVal(b, indicator.key)).filter((v) => v !== 0)
    const minVal = values.length ? Math.min(...values) : 0
    const maxVal = values.length ? Math.max(...values) : 1

    const selected = selectedRef.current
    const onSelect = onBairroClickRef.current

    const styleFor: L.StyleFunction = (feature) => {
      const props = (feature?.properties ?? {}) as { id_bairro?: number; nome?: string }
      const bairro = bairros.find((b) => b.id === props.id_bairro)
      const value = bairro ? getVal(bairro, indicator.key) : 0
      const t = maxVal > minVal ? (value - minVal) / (maxVal - minVal) : 0.5
      const isSelected = !!selected && !!bairro && bairro.nome === selected

      if (isSelected) {
        return {
          fillColor: "#ffd60a",
          fillOpacity: 0.85,
          color: "#ffffff",
          weight: 2.6,
          dashArray: "",
        }
      }

      return {
        fillColor: valueToColor(t, indicator.higherIsBetter === false ? COLOR_RAMP_BAD : COLOR_RAMP_GOOD),
        fillOpacity: 0.55,
        color: BORDER_COLOR,
        weight: 1.1,
        opacity: 0.9,
      }
    }

    const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
      const props = (feature.properties ?? {}) as { id_bairro?: number; nome?: string }
      const bairro = bairros.find((b) => b.id === props.id_bairro)
      const name = bairro?.nome ?? props.nome ?? "—"
      const value = bairro ? getVal(bairro, indicator.key) : 0
      const regiao = byId.get(props.id_bairro ?? -1)?.nm_subdist ?? ""

      const tooltipHtml =
        `<div class="cg-tip">` +
        `<div class="cg-tip__name">${name}</div>` +
        `<div class="cg-tip__val">${formatValue(value, indicator.format)}</div>` +
        (regiao ? `<div class="cg-tip__sub">${shortRegiao(regiao)}</div>` : "") +
        (selectableRef.current ? `<div class="cg-tip__hint">clique para abrir o perfil</div>` : "") +
        `</div>`

      layer.bindTooltip(tooltipHtml, {
        sticky: true,
        direction: "top",
        offset: [0, -10],
        className: "cg-tip-wrap",
        opacity: 1,
      })

      layer.on({
        click: () => {
          if (onSelect && bairro) onSelect(name)
        },
        mouseover: (e) => {
          const l = e.target as L.Path
          l.setStyle({ weight: 2.4, color: "#ffd60a", dashArray: "" })
          l.bringToFront()
          labelMarkersRef.current
            .get(props.id_bairro ?? -1)
            ?.getElement()
            ?.classList.add("cg-label--hot")
        },
        mouseout: (e) => {
          const l = e.target as L.Path
          geoJsonLayerRef.current?.resetStyle(l)
          labelMarkersRef.current
            .get(props.id_bairro ?? -1)
            ?.getElement()
            ?.classList.remove("cg-label--hot")
        },
      })
    }

    const layer = L.geoJSON(geo as unknown as GeoJSON.GeoJsonObject, {
      style: styleFor,
      onEachFeature,
    })
    layer.addTo(map)
    geoJsonLayerRef.current = layer

    rebuildLabels(geo, map.getZoom())
  }, [indicator.key, indicator.format, rebuildLabels])


  const fittedRef = useRef(false)

  // One effect covers first load, indicator switches (buildLayer identity
  // changes) and selection changes. fitBounds only runs once so changing
  // the indicator doesn't yank the user's zoom back out.
  useEffect(() => {
    if (!mapRef.current) return
    let cancelled = false

    loadBairrosGeoJSON()
      .then((geo) => {
        if (cancelled || !mapRef.current) return
        readyRef.current = true
        buildLayer(geo)
        if (!fittedRef.current) {
          fitToData(geo)
          fittedRef.current = true
        }
      })
      .catch((e) => {
        console.error("Failed to load CG GeoJSON for Leaflet map:", e)
      })

    return () => {
      cancelled = true
    }
  }, [buildLayer, fitToData, selectedBairro])


  const legendScale = useMemo(() => {
    const values = bairros.map((b) => getVal(b, indicator.key)).filter((v) => v !== 0)
    if (!values.length) return { min: 0, max: 1 }
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [indicator.key])

  const isBad = indicator.higherIsBetter === false
  const ramp = isBad ? COLOR_RAMP_BAD : COLOR_RAMP_GOOD
  const legendGradient = `linear-gradient(90deg, ${ramp
    .map((c, i) => `${c} ${(i / (ramp.length - 1)) * 100}%`)
    .join(", ")})`

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle>{indicator.label} por bairro</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="cg-map-root" style={{ height, width: "100%" }}>
          <div
            ref={containerRef}
            className={MAP_CONTAINER_CLASS}
            style={{ height: "100%", width: "100%" }}
          />
          <div className="cg-legend" aria-hidden>
            <div className="cg-legend__title" style={isBad ? { color: "#f87171" } : undefined}>
              {indicator.label}
            </div>
            <div className="cg-legend__bar" style={{ background: legendGradient }} />
            <div className="cg-legend__labels">
              <span>{formatValue(legendScale.min, indicator.format)}</span>
              <span>{formatValue(legendScale.max, indicator.format)}</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 text-[10px] text-slate-500">
          <span className={`${isBad ? "text-red-400/90" : "text-gold/80"} font-semibold`}>
            Como ler:
          </span>{" "}
          {isBad
            ? "azul-marinho = baixo, vermelho = alto (pior)"
            : "azul-marinho = baixo, dourado = alto"}{" "}
          · clique num bairro para abrir o perfil.
        </div>
      </CardContent>
    </Card>
  )
}

// Area-weighted (shoelace) centroid of one ring. A plain vertex average
// drifts toward vertex-dense edges, which put labels visibly off-center.
function ringCentroid(ring: number[][]): { area: number; x: number; y: number } | null {
  if (ring.length < 3) return null
  let a = 0, cx = 0, cy = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[j]
    const [x2, y2] = ring[i]
    const f = x1 * y2 - x2 * y1
    a += f
    cx += (x1 + x2) * f
    cy += (y1 + y2) * f
  }
  if (a === 0) return null
  return { area: Math.abs(a / 2), x: cx / (3 * a), y: cy / (3 * a) }
}

function featureCentroid(feat: BairroFeatureCollection["features"][number]): [number, number] | null {
  const g = feat.geometry
  if (!g) return null

  let best: { area: number; x: number; y: number } | null = null
  const rings = g.type === "Polygon" ? [g.coordinates[0]] : g.coordinates.map((poly) => poly[0])
  for (const ring of rings) {
    const c = ringCentroid(ring)
    if (c && (!best || c.area > best.area)) best = c
  }
  if (best) return [best.y, best.x]

  // Degenerate geometry — fall back to a vertex average.
  const coords = rings.flat()
  if (!coords.length) return null
  let sx = 0, sy = 0
  for (const [x, y] of coords) {
    sx += x
    sy += y
  }
  return [sy / coords.length, sx / coords.length]
}