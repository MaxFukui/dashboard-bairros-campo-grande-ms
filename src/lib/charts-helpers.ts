import type { IndicatorDef } from "@/lib/data"

/** Palette for non-categorical chart series. Oxford Navy + Gold + accents. */
export const CHART_PALETTE = [
  "#ffd60a",
  "#ffc300",
  "#003566",
  "#0891b2",
  "#7c3aed",
  "#dc2626",
  "#10b981",
  "#f97316",
  "#ec4899",
  "#0ea5e9",
  "#a855f7",
  "#14b8a6",
  "#fb7185",
  "#84cc16",
  "#eab308",
]

/** Long-form name of each Região Urbana → display string. */
export const REGIAO_NAMES: Record<string, string> = {
  "Região Urbana do Anhanduizinho": "Anhanduizinho",
  "Região Urbana do Bandeira": "Bandeira",
  "Região Urbana do Centro": "Centro",
  "Região Urbana do Imbirussú": "Imbirussú",
  "Região Urbana do Lagoa": "Lagoa",
  "Região Urbana do Prosa": "Prosa",
  "Região Urbana do Segredo": "Segredo",
}

/** Stable colour per Região Urbana (matches the choropleth region outlines). */
export const REGIAO_COLORS: Record<string, string> = {
  "Região Urbana do Anhanduizinho": "#ffd60a",
  "Região Urbana do Bandeira": "#ffc300",
  "Região Urbana do Centro": "#003566",
  "Região Urbana do Imbirussú": "#0891b2",
  "Região Urbana do Lagoa": "#7c3aed",
  "Região Urbana do Prosa": "#dc2626",
  "Região Urbana do Segredo": "#10b981",
}

export function shortRegiao(name: string): string {
  return REGIAO_NAMES[name] ?? name
}

export function regiaoColor(name: string): string {
  return REGIAO_COLORS[name] ?? "#ffc300"
}

/** Datum for the Região Urbana donut — value + bairro count per slice. */
export interface RegiaoDatum {
  name: string
  value: number
  bairrosCount: number
}

/** Format options the donut understands (forwarded from the indicator). */
export type ChartFormat = IndicatorDef["format"]

/** Default selected bairros for the side-by-side comparison tab. */
export function defaultPairState(): [string, string] {
  return ["CARANDÁ", "CENTRO OESTE"]
}