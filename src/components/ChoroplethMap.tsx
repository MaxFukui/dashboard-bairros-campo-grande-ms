import { useEffect, useRef, useState, useMemo } from "react"
import ReactECharts from "echarts-for-react/esm/core"
import * as echarts from "echarts/core"
import { MapChart } from "echarts/charts"
import {
  GeoComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  VisualMapPiecewiseComponent,
  ToolboxComponent,
} from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type IndicatorDef, formatValue, bairros, getVal } from "@/lib/data"
import { loadBairrosGeoJSON, type BairroFeatureCollection } from "@/lib/geo"

echarts.use([
  MapChart,
  GeoComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  VisualMapPiecewiseComponent,
  ToolboxComponent,
  CanvasRenderer,
])

const MAP_NAME = "campo_grande_bairros"

const REGION_PALETTE: Record<string, string> = {
  "Região Urbana do Anhanduizinho": "#1d4ed8",
  "Região Urbana do Bandeira": "#059669",
  "Região Urbana do Centro": "#d97706",
  "Região Urbana do Imbirussú": "#dc2626",
  "Região Urbana do Lagoa": "#7c3aed",
  "Região Urbana do Prosa": "#0891b2",
  "Região Urbana do Segredo": "#be185d",
}

interface ChoroplethMapProps {
  indicator: IndicatorDef
  height?: number | string
  className?: string
}

export function ChoroplethMap({ indicator, height = 520, className }: ChoroplethMapProps) {
  const [geo, setGeo] = useState<BairroFeatureCollection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const registeredMap = useRef(false)

  useEffect(() => {
    let cancelled = false
    loadBairrosGeoJSON()
      .then((raw) => {
        if (cancelled) return
        const g: BairroFeatureCollection = {
          ...raw,
          features: raw.features.map((f) => ({
            ...f,
            properties: { ...f.properties, name: f.properties.nome },
          })),
        }
        if (!registeredMap.current) {
          echarts.registerMap(MAP_NAME, g)
          registeredMap.current = true
        }
        setGeo(g)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const { data, regionEntries, minVal, maxVal } = useMemo(() => {
    if (!geo) return { data: [], regionEntries: [] as Array<{ name: string[]; color: string }>, minVal: 0, maxVal: 1 }
    const byId = new Map<number, (typeof geo.features)[number]["properties"]>()
    for (const f of geo.features) byId.set(f.properties.id_bairro, f.properties)

    const seriesData = bairros.map((b) => {
      const props = byId.get(b.id)
      return {
        name: props?.nome ?? b.nome,
        value: getVal(b, indicator.key),
        regiao: props?.nm_subdist ?? "",
      }
    })

    const values = seriesData.map((d) => d.value).filter((v) => v != null)
    const lo = values.length ? Math.min(...values) : 0
    const hi = values.length ? Math.max(...values) : 1

    const grouped = new Map<string, string[]>()
    for (const f of geo.features) {
      const r = f.properties.nm_subdist
      if (!grouped.has(r)) grouped.set(r, [])
      grouped.get(r)!.push(f.properties.nome)
    }
    const entries = Array.from(grouped.entries())
      .filter(([r]) => r in REGION_PALETTE)
      .map(([r, names]) => ({ name: names, color: REGION_PALETTE[r] }))

    return { data: seriesData, regionEntries: entries, minVal: lo, maxVal: hi }
  }, [geo, indicator.key])

  if (error) {
    return (
      <Card className={className} style={{ height }}>
        <CardContent className="flex h-full items-center justify-center p-8">
          <p className="text-sm text-destructive">Erro ao carregar o mapa: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!geo) {
    return (
      <Card className={className} style={{ height }}>
        <CardContent className="flex h-full items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">Carregando mapa de Campo Grande…</p>
        </CardContent>
      </Card>
    )
  }

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "transparent",
      textStyle: { color: "#f1f5f9", fontSize: 12 },
      formatter: (params: { data?: { name: string; value: number; regiao: string }; name?: string }) => {
        const d = params.data
        if (!d) return params.name ?? ""
        const regiao = d.regiao ? `<br/><span style="opacity:0.7">${d.regiao}</span>` : ""
        return `<strong>${d.name}</strong><br/>${indicator.label}: ${formatValue(d.value, indicator.format)}${regiao}`
      },
    },
    visualMap: {
      min: minVal,
      max: maxVal,
      left: 16,
      bottom: 24,
      orient: "horizontal" as const,
      calculable: true,
      inRange: {
        color: ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"],
      },
      text: ["máx.", "mín."],
      textStyle: { fontSize: 10, color: "#475569" },
    },
    toolbox: {
      right: 16,
      top: 16,
      feature: {
        restore: { title: "Restaurar" },
        saveAsImage: { title: "Salvar imagem", pixelRatio: 2 },
      },
      iconStyle: { borderColor: "#64748b" },
    },
    geo: {
      map: MAP_NAME,
      roam: true,
      zoom: 1,
      label: { show: false },
      itemStyle: {
        areaColor: "#f1f5f9",
        borderColor: "#cbd5e1",
        borderWidth: 0.6,
      },
      emphasis: {
        itemStyle: { areaColor: "#cbd5e1" },
        label: { show: true, color: "#0f172a", fontSize: 10 },
      },
      regions: regionEntries.flatMap(({ name, color }) =>
        name.map((n) => ({ name: n, itemStyle: { borderColor: color, borderWidth: 1.4 } }))
      ),
    },
    series: [
      {
        type: "map" as const,
        map: MAP_NAME,
        geoIndex: 0,
        data,
        emphasis: {
          itemStyle: { areaColor: "#fbbf24", shadowBlur: 12, shadowColor: "rgba(0,0,0,0.3)" },
          label: { show: true, color: "#0f172a", fontWeight: 600, fontSize: 11 },
        },
      },
    ],
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{indicator.label} por bairro</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height }}>
          <ReactECharts
            echarts={echarts}
            option={option}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "canvas" }}
            notMerge
            lazyUpdate
          />
        </div>
      </CardContent>
    </Card>
  )
}

export { REGION_PALETTE, MAP_NAME }
