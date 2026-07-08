import ReactECharts from "echarts-for-react/esm/core"
import * as echarts from "echarts/core"
import {
  BarChart as EBarChart,
  ScatterChart as EScatterChart,
  RadarChart as ERadarChart,
  PieChart as EPieChart,
} from "echarts/charts"
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"

import { type BairroData, getVal, formatValue, type IndicatorDef } from "@/lib/data"
import { defaultSortOrder, sortByIndicator, isWorstFirst } from "@/lib/ranking"
import {
  CHART_PALETTE,
  shortRegiao,
  regiaoColor,
  type RegiaoDatum,
} from "@/lib/charts-helpers"

echarts.use([
  EBarChart,
  EScatterChart,
  ERadarChart,
  EPieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
])

interface BarChartProps {
  data: BairroData[]
  indicatorKey: string
  indicator: IndicatorDef
  limit?: number
  ascending?: boolean
}

export function BarChart({ data, indicatorKey, indicator, limit = 15, ascending }: BarChartProps) {
  const order = ascending ?? (defaultSortOrder(indicator) === "asc")
  // Negative indicators rank worst-first — color them as a warning, not a win.
  const worst = isWorstFirst(indicator)
  const barGradient = worst
    ? [
        { offset: 0, color: "#f87171" },
        { offset: 0.55, color: "#dc2626" },
        { offset: 1, color: "#450a0a" },
      ]
    : [
        { offset: 0, color: "#ffd60a" },
        { offset: 0.55, color: "#ffc300" },
        { offset: 1, color: "#7a4c00" },
      ]
  const glow = worst ? "rgba(220, 38, 38, 0.4)" : "rgba(255, 211, 0, 0.35)"
  const sorted = [...data]
    .sort((a, b) => {
      const va = getVal(a, indicatorKey)
      const vb = getVal(b, indicatorKey)
      return order ? va - vb : vb - va
    })
    .slice(0, limit)

  const names = sorted.map((b) => b.nome)
  const values = sorted.map((b) => getVal(b, indicatorKey))

  const option = {
    animationDuration: 900,
    animationEasing: "cubicOut" as const,
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "rgba(0, 8, 20, 0.92)",
      borderColor: "rgba(255, 214, 10, 0.4)",
      borderWidth: 1,
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0]
        return `<strong>${p.name}</strong><br/>${indicator.label}: ${formatValue(p.value, indicator.format)}`
      },
    },
    grid: { left: 8, right: 24, bottom: 8, top: 16, containLabel: true },
    xAxis: {
      type: "category" as const,
      data: names,
      axisLabel: {
        rotate: 40,
        fontSize: 10,
        interval: 0,
        color: "#cfd8e3",
      },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.18)" } },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        color: "#9aa7b6",
        formatter: (val: number) => {
          if (indicator.format === "percent") return `${val}%`
          if (indicator.format === "currency" && val >= 1000) return `${(val / 1000).toFixed(0)}k`
          return val.toLocaleString("pt-BR")
        },
        fontSize: 10,
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        type: "bar" as const,
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, barGradient),
            borderRadius: [8, 8, 2, 2],
            shadowColor: glow,
            shadowBlur: i === 0 ? 14 : 0,
          },
        })),
        barMaxWidth: 44,
      },
    ],
  }

  return <ReactECharts echarts={echarts} option={option} style={{ height: "100%", width: "100%" }} />
}

interface HorizontalBarProps {
  data: BairroData[]
  indicatorKey: string
  indicator: IndicatorDef
  limit?: number
}

export function HorizontalBar({ data, indicatorKey, indicator, limit = 20 }: HorizontalBarProps) {
  const worst = isWorstFirst(indicator)
  const sorted = sortByIndicator(data, indicator, limit)
  const reversed = [...sorted].reverse()
  const names = reversed.map((b) => b.nome)
  const values = reversed.map((b) => getVal(b, indicatorKey))
  const maxVal = Math.max(...values, 1)

  const option = {
    animationDuration: 900,
    animationEasing: "cubicOut" as const,
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "rgba(0, 8, 20, 0.92)",
      borderColor: "rgba(255, 214, 10, 0.4)",
      borderWidth: 1,
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0]
        return `<strong>${p.name}</strong><br/>${indicator.label}: ${formatValue(p.value, indicator.format)}`
      },
    },
    grid: { left: 120, right: 56, bottom: 8, top: 8, containLabel: false },
    xAxis: { type: "value" as const, show: false },
    yAxis: {
      type: "category" as const,
      data: names,
      axisLabel: { fontSize: 11, color: "#cfd8e3" },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar" as const,
        data: values.map((v) => {
          const ratio = v / maxVal
          let color = "#003566"
          if (worst) {
            if (ratio > 0.75) color = "#ef4444"
            else if (ratio > 0.5) color = "#f97316"
            else if (ratio > 0.25) color = "#991b1b"
          } else {
            if (ratio > 0.75) color = "#ffd60a"
            else if (ratio > 0.5) color = "#ffc300"
            else if (ratio > 0.25) color = "#1d4ed8"
          }
          return {
            value: v,
            itemStyle: { color, borderRadius: [0, 8, 8, 0] },
          }
        }),
        barMaxWidth: 22,
        label: {
          show: true,
          position: "right" as const,
          formatter: (params: { value: number }) => formatValue(params.value, indicator.format),
          fontSize: 10,
          color: "#e2e8f0",
        },
      },
    ],
  }

  return <ReactECharts echarts={echarts} option={option} style={{ height: "100%", width: "100%" }} />
}

interface ScatterChartProps {
  data: BairroData[]
  xKey: string
  yKey: string
  xLabel: string
  yLabel: string
  sizeKey?: string
  onPointClick?: (bairroName: string) => void
}

export function ScatterChart({ data, xKey, yKey, xLabel, yLabel, sizeKey, onPointClick }: ScatterChartProps) {
  const maxSize = sizeKey ? Math.max(...data.map((b) => getVal(b, sizeKey)), 1) : 1

  const chartData = data.map((b) => ({
    value: [
      getVal(b, xKey),
      getVal(b, yKey),
      sizeKey ? (getVal(b, sizeKey) / maxSize) * 38 + 6 : 14,
    ],
    name: b.nome,
  }))

  const option = {
    animationDuration: 1200,
    tooltip: {
      backgroundColor: "rgba(0, 8, 20, 0.92)",
      borderColor: "rgba(255, 214, 10, 0.4)",
      borderWidth: 1,
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: (params: { data: { name: string; value: number[] } }) => {
        const p = params.data
        return `<strong>${p.name}</strong><br/>${xLabel}: ${p.value[0].toLocaleString("pt-BR")}<br/>${yLabel}: ${p.value[1].toLocaleString("pt-BR")}`
      },
    },
    grid: { left: 8, right: 24, bottom: 8, top: 24, containLabel: true },
    xAxis: {
      type: "value" as const,
      name: xLabel,
      nameTextStyle: { fontSize: 11, color: "#9aa7b6" },
      axisLabel: { color: "#9aa7b6", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.18)" } },
    },
    yAxis: {
      type: "value" as const,
      name: yLabel,
      nameTextStyle: { fontSize: 11, color: "#9aa7b6" },
      axisLabel: { color: "#9aa7b6", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.18)" } },
    },
    series: [
      {
        type: "scatter" as const,
        data: chartData,
        symbolSize: (val: number[]) => val[2] || 14,
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: "rgba(255, 214, 10, 0.92)" },
            { offset: 0.7, color: "rgba(255, 195, 0, 0.55)" },
            { offset: 1, color: "rgba(0, 53, 102, 0.10)" },
          ]),
          shadowColor: "rgba(255, 214, 10, 0.45)",
          shadowBlur: 6,
        },
        emphasis: {
          itemStyle: { shadowBlur: 18, shadowColor: "rgba(255, 214, 10, 0.7)" },
          scale: 1.18,
        },
      },
    ],
  }

  return (
    <ReactECharts
      echarts={echarts}
      option={option}
      style={{ height: "100%", width: "100%" }}
      onEvents={{
        click: (params: { data?: { name?: string } }) => {
          const name = params.data?.name
          if (name && onPointClick) onPointClick(name)
        },
      }}
    />
  )
}

interface RadarChartProps {
  data: BairroData[]
  indicators: IndicatorDef[]
  selected?: string[]
}

export function RadarChart({ data, indicators, selected }: RadarChartProps) {
  const selectedBairros = selected
    ? data.filter((b) => selected.includes(b.nome)).slice(0, 3)
    : data.slice(0, 3)

  const normalize = (key: string, bairroList: BairroData[]) => {
    const vals = bairroList.map((b) => getVal(b, key))
    return Math.max(...vals, 1)
  }

  const option = {
    tooltip: { trigger: "item" as const },
    legend: {
      data: selectedBairros.map((b) => b.nome),
      bottom: 0,
      textStyle: { fontSize: 11, color: "#cfd8e3" },
    },
    radar: {
      indicator: indicators.map((ind) => ({ name: ind.label, max: 100 })),
      shape: "polygon" as const,
      radius: "65%",
      axisName: { fontSize: 10, color: "#9aa7b6" },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.18)" } },
      splitArea: { areaStyle: { color: ["rgba(0,53,102,0.18)", "rgba(0,29,61,0.18)"] } },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.10)" } },
    },
    series: [
      {
        type: "radar" as const,
        data: selectedBairros.map((b) => ({
          value: indicators.map((ind) => {
            const raw = getVal(b, ind.key)
            const max = normalize(ind.key, data)
            return Math.round((raw / max) * 100)
          }),
          name: b.nome,
          areaStyle: { opacity: 0.2 },
        })),
      },
    ],
    color: CHART_PALETTE,
  }

  return <ReactECharts echarts={echarts} option={option} style={{ height: "100%", width: "100%" }} />
}

interface RegiaoDonutChartProps {
  data: RegiaoDatum[]
  format: IndicatorDef["format"]
  unit?: string
}

export function RegiaoDonutChart({ data: raw, format, unit }: RegiaoDonutChartProps) {
  const data = raw
    .filter((d) => d.value !== 0)
    .map((d) => ({
      name: shortRegiao(d.name),
      value: d.value,
      itemStyle: {
        color: regiaoColor(d.name),
        borderColor: "#000814",
        borderWidth: 2,
        borderRadius: 6,
      },
    }))

  const option = {
    animationDuration: 1100,
    animationEasing: "cubicOut" as const,
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "rgba(0, 8, 20, 0.92)",
      borderColor: "rgba(255, 214, 10, 0.4)",
      borderWidth: 1,
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: (params: { name: string; value: number; percent: number; data?: { bairrosCount?: number } }) => {
        const count = params.data?.bairrosCount
        return `${params.name}<br/>${formatValue(params.value, format)}${unit ? ` ${unit}` : ""} (${params.percent.toFixed(1)}%)${count ? `<br/><span style="opacity:0.7">${count} bairros</span>` : ""}`
      },
    },
    legend: {
      type: "scroll" as const,
      bottom: 0,
      textStyle: { fontSize: 11, color: "#cfd8e3" },
      itemStyle: { borderColor: "#000814", borderWidth: 1 },
    },
    series: [
      {
        type: "pie" as const,
        radius: ["44%", "72%"],
        center: ["50%", "47%"],
        avoidLabelOverlap: true,
        data,
        label: {
          formatter: "{b}\n{d}%",
          fontSize: 11,
          color: "#e2e8f0",
          lineHeight: 14,
        },
        labelLine: { length: 12, length2: 6, lineStyle: { color: "rgba(255,255,255,0.28)" } },
        emphasis: {
          itemStyle: { shadowBlur: 18, shadowColor: "rgba(255, 214, 10, 0.4)" },
          scale: true,
          scaleSize: 8,
        },
      },
    ],
  }

  return <ReactECharts echarts={echarts} option={option} style={{ height: "100%", width: "100%" }} notMerge />
}