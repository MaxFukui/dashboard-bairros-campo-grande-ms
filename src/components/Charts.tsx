import ReactECharts from "echarts-for-react/esm/core"
import * as echarts from "echarts/core"
import { BarChart as EBarChart, ScatterChart as EScatterChart, RadarChart as ERadarChart, PieChart as EPieChart } from "echarts/charts"
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"
echarts.use([EBarChart, EScatterChart, ERadarChart, EPieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

import { type BairroData, getVal, formatValue, type IndicatorDef } from "@/lib/data"

const COLORS = [
  "#1d4ed8", "#059669", "#d97706", "#dc2626", "#7c3aed",
  "#0891b2", "#be185d", "#4338ca", "#15803d", "#b45309",
  "#9333ea", "#0369a1", "#c2410c", "#6d28d9", "#047857",
]

interface BarChartProps {
  data: BairroData[]
  indicatorKey: string
  indicator: IndicatorDef
  limit?: number
  ascending?: boolean
}

export function BarChart({ data, indicatorKey, indicator, limit = 15, ascending = false }: BarChartProps) {
  const sorted = [...data].sort((a, b) => {
    const va = getVal(a, indicatorKey)
    const vb = getVal(b, indicatorKey)
    return ascending ? va - vb : vb - va
  }).slice(0, limit)

  const names = sorted.map((b) => b.nome)
  const values = sorted.map((b) => getVal(b, indicatorKey))

  const option = {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0]
        return `<strong>${p.name}</strong><br/>${indicator.label}: ${formatValue(p.value, indicator.format)}`
      },
    },
    grid: { left: 8, right: 24, bottom: 8, top: 16, containLabel: true },
    xAxis: {
      type: "category" as const,
      data: names,
      axisLabel: { rotate: 40, fontSize: 10, interval: 0 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (val: number) => {
          if (indicator.format === "percent") return `${val}%`
          if (indicator.format === "currency" && val >= 1000) return `${(val / 1000).toFixed(0)}k`
          return val.toLocaleString("pt-BR")
        },
        fontSize: 10,
      },
    },
    series: [{
      type: "bar" as const,
      data: values,
      itemStyle: {
        color: (params: { dataIndex: number }) => COLORS[params.dataIndex % COLORS.length],
        borderRadius: [4, 4, 0, 0],
      },
      barMaxWidth: 40,
    }],
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
  const sorted = [...data]
    .sort((a, b) => getVal(a, indicatorKey) - getVal(b, indicatorKey))
    .slice(0, limit)

  const names = sorted.map((b) => b.nome)
  const values = sorted.map((b) => getVal(b, indicatorKey))
  const maxVal = Math.max(...values, 1)

  const option = {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0]
        return `<strong>${p.name}</strong><br/>${indicator.label}: ${formatValue(p.value, indicator.format)}`
      },
    },
    grid: { left: 120, right: 24, bottom: 8, top: 8, containLabel: false },
    xAxis: { type: "value" as const, show: false },
    yAxis: {
      type: "category" as const,
      data: names,
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: "bar" as const,
      data: values,
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const ratio = values[params.dataIndex] / maxVal
          if (ratio > 0.75) return "#dc2626"
          if (ratio > 0.5) return "#d97706"
          if (ratio > 0.25) return "#059669"
          return "#1d4ed8"
        },
        borderRadius: [0, 4, 4, 0],
      },
      barMaxWidth: 20,
      label: {
        show: true,
        position: "right" as const,
        formatter: (params: { value: number }) => formatValue(params.value, indicator.format),
        fontSize: 10,
      },
    }],
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
}

export function ScatterChart({ data, xKey, yKey, xLabel, yLabel, sizeKey }: ScatterChartProps) {
  const maxSize = sizeKey ? Math.max(...data.map((b) => getVal(b, sizeKey)), 1) : 1

  const chartData = data.map((b) => ({
    value: [getVal(b, xKey), getVal(b, yKey), sizeKey ? (getVal(b, sizeKey) / maxSize) * 40 + 5 : 15],
    name: b.nome,
  }))

  const option = {
    tooltip: {
      formatter: (params: { data: { name: string; value: number[] } }) => {
        const p = params.data
        return `<strong>${p.name}</strong><br/>${xLabel}: ${p.value[0].toLocaleString("pt-BR")}<br/>${yLabel}: ${p.value[1].toLocaleString("pt-BR")}`
      },
    },
    grid: { left: 8, right: 24, bottom: 8, top: 24, containLabel: true },
    xAxis: { type: "value" as const, name: xLabel, nameTextStyle: { fontSize: 11 } },
    yAxis: { type: "value" as const, name: yLabel, nameTextStyle: { fontSize: 11 } },
    series: [{
      type: "scatter" as const,
      data: chartData,
      symbolSize: (val: number[]) => val[2] || 15,
      itemStyle: { color: "#1d4ed8", opacity: 0.7 },
    }],
  }

  return <ReactECharts echarts={echarts} option={option} style={{ height: "100%", width: "100%" }} />
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
      textStyle: { fontSize: 11 },
    },
    radar: {
      indicator: indicators.map((ind) => ({ name: ind.label, max: 100 })),
      shape: "polygon" as const,
      radius: "65%",
      axisName: { fontSize: 10 },
    },
    series: [{
      type: "radar" as const,
      data: selectedBairros.map((b) => ({
        value: indicators.map((ind) => {
          const raw = getVal(b, ind.key)
          const max = normalize(ind.key, data)
          return Math.round((raw / max) * 100)
        }),
        name: b.nome,
      })),
    }],
    color: COLORS,
  }

  return <ReactECharts echarts={echarts} option={option} style={{ height: "100%", width: "100%" }} />
}

interface PieChartProps {
  data: BairroData[]
  indicatorKey: string
  limit?: number
  title?: string
}

export function PieChart({ data, indicatorKey, limit = 8, title }: PieChartProps) {
  const sorted = [...data].sort((a, b) => getVal(b, indicatorKey) - getVal(a, indicatorKey))
  const top = sorted.slice(0, limit)
  const rest = sorted.slice(limit)
  const restSum = rest.reduce((acc, b) => acc + getVal(b, indicatorKey), 0)

  const pieData = [
    ...top.map((b) => ({ name: b.nome, value: getVal(b, indicatorKey) })),
    ...(restSum > 0 ? [{ name: "Outros", value: restSum }] : []),
  ]

  const option = {
    title: title ? { text: title, left: "center" as const, textStyle: { fontSize: 14 } } : undefined,
    tooltip: {
      trigger: "item" as const,
      formatter: (params: { name: string; value: number; percent: number }) => {
        return `${params.name}: ${params.value.toLocaleString("pt-BR")} (${params.percent.toFixed(1)}%)`
      },
    },
    legend: { type: "scroll" as const, bottom: 0, textStyle: { fontSize: 10 } },
    series: [{
      type: "pie" as const,
      radius: ["30%", "65%"],
      center: ["50%", "48%"],
      data: pieData,
      label: { fontSize: 10 },
    }],
    color: COLORS,
  }

  return <ReactECharts echarts={echarts} option={option} style={{ height: "100%", width: "100%" }} />
}