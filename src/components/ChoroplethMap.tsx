import { useEffect, useRef, useMemo, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type IndicatorDef, formatValue, bairros, getVal } from "@/lib/data"
import { loadBairrosGeoJSON, type BairroFeatureCollection } from "@/lib/geo"
import { shortRegiao, regiaoColor } from "@/lib/charts-helpers"

const MAP_CONTAINER_CLASS = "cg-bairro-map"

const REGION_PALETTE: Record<string, string> = {
  "Região Urbana do Anhanduizinho": "#ffd60a",
  "Região Urbana do Bandeira": "#ffc300",
  "Região Urbana do Centro": "#003566",
  "Região Urbana do Imbirussú": "#0891b2",
  "Região Urbana do Lagoa": "#7c3aed",
  "Região Urbana do Prosa": "#dc2626",
  "Região Urbana do Segredo": "#10b981",
}

const COLOR_RAMP = ["#001d3d", "#003566", "#1d4ed8", "#ffc300", "#ffd60a"]

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

function valueToColor(t: number): string {
  if (t <= 0) return COLOR_RAMP[0]
  if (t >= 1) return COLOR_RAMP[COLOR_RAMP.length - 1]
  const seg = t * (COLOR_RAMP.length - 1)
  const i = Math.floor(seg)
  return lerpColor(COLOR_RAMP[i], COLOR_RAMP[i + 1], seg - i)
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
  const readyRef = useRef(false)
  const lastSelectedRef = useRef<string | null>(null)
  const lastIndicatorKeyRef = useRef<string>("")
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

    return () => {
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
        L.marker(c, {
          icon: L.divIcon({
            className: "cg-label cg-label--small",
            html: `<span>${b.nome}</span>`,
            iconSize: [120, 16],
            iconAnchor: [60, 8],
          }),
          interactive: false,
        }).addTo(lg)
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
      const regiao = props ? (byId.get(props.id_bairro ?? -1)?.nm_subdist ?? "") : ""

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
        fillColor: valueToColor(t),
        fillOpacity: 0.55,
        color: regiao ? regiaoColor(regiao) : "rgba(255, 214, 10, 0.55)",
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
        },
        mouseout: (e) => {
          const l = e.target as L.Path
          geoJsonLayerRef.current?.resetStyle(l)
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

    lastIndicatorKeyRef.current = indicator.key
    lastSelectedRef.current = selected
  }, [indicator.key, indicator.format, rebuildLabels])


  useEffect(() => {
    if (!mapRef.current) return
    let cancelled = false

    loadBairrosGeoJSON()
      .then((geo) => {
        if (cancelled || !mapRef.current) return
        readyRef.current = true
        buildLayer(geo)
        fitToData(geo)
      })
      .catch((e) => {
        console.error("Failed to load CG GeoJSON for Leaflet map:", e)
      })

    return () => {
      cancelled = true
    }
  }, [buildLayer, fitToData])

  useEffect(() => {
    if (!readyRef.current || !mapRef.current) return
    loadBairrosGeoJSON().then((geo) => buildLayer(geo))
  }, [indicator.key, buildLayer])

  useEffect(() => {
    if (!readyRef.current || !mapRef.current) return
    if (lastSelectedRef.current === selectedBairro) return
    lastSelectedRef.current = selectedBairro
    loadBairrosGeoJSON().then((geo) => buildLayer(geo))
  }, [selectedBairro, buildLayer])


  const legendScale = useMemo(() => {
    const values = bairros.map((b) => getVal(b, indicator.key)).filter((v) => v !== 0)
    if (!values.length) return { min: 0, max: 1 }
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [indicator.key])

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{indicator.label} por bairro</CardTitle>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Object.entries(REGION_PALETTE).map(([name, color]) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{
                background: "rgba(0, 53, 102, 0.30)",
                color: "#cfd8e3",
                border: `1px solid ${color}55`,
              }}
            >
              <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
              {shortRegiao(name)}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className={`${MAP_CONTAINER_CLASS} cg-map-root`}
          style={{ height, width: "100%" }}
        />
        <div className="px-3 py-2 text-[10px] text-slate-500">
          <span className="text-gold/80 font-semibold">Como ler:</span>{" "}
          azul-marinho = baixo, dourado = alto · clique num bairro para abrir o perfil.
        </div>
      </CardContent>
      <div className="cg-legend" aria-hidden>
        <div className="cg-legend__bar" />
        <div className="cg-legend__labels">
          <span>{formatValue(legendScale.min, indicator.format)}</span>
          <span>{formatValue(legendScale.max, indicator.format)}</span>
        </div>
      </div>
    </Card>
  )
}

function featureCentroid(feat: BairroFeatureCollection["features"][number]): [number, number] | null {
  const g = feat.geometry
  if (!g) return null
  let coords: number[][] = []
  if (g.type === "Polygon") {
    coords = g.coordinates[0]
  } else if (g.type === "MultiPolygon") {
    let largest: number[][] = []
    for (const poly of g.coordinates) {
      if (poly[0].length > largest.length) largest = poly[0]
    }
    coords = largest
  }
  if (!coords.length) return null
  let sx = 0, sy = 0
  for (const [x, y] of coords) {
    sx += x
    sy += y
  }
  return [sy / coords.length, sx / coords.length]
}