/**
 * Indicator helpers — sort direction, ranking labels, region aggregation.
 */
import type { IndicatorDef, BairroData } from "@/lib/data"
import { bairros, getVal } from "@/lib/data"

/**
 * Rankings always surface the informative extreme: largest values first.
 * For negative indicators (higherIsBetter === false) the largest values
 * are the worst cases — sorting ascending would "top" the chart with
 * rows of zeros (e.g. every fully-paved bairro under "vias não
 * pavimentadas"), which carries no insight.
 */
export function defaultSortOrder(indicator: IndicatorDef): "asc" | "desc" {
  void indicator
  return "desc"
}

/** True when the top of the ranking shows the worst cases (negative indicator). */
export function isWorstFirst(indicator: IndicatorDef): boolean {
  return indicator.higherIsBetter === false
}

/** Label for a ranking prefix given the sort order: "Piores" when the worst is on top. */
export function rankingPrefix(indicator: IndicatorDef): string {
  return isWorstFirst(indicator) ? "Piores" : "Maiores"
}

/** Title prefix used on bar charts and KPI strip. */
export function rankingTitle(indicator: IndicatorDef, limit: number): string {
  return `${rankingPrefix(indicator)} ${limit}`
}

/** Sort bairros by an indicator respecting higherIsBetter. */
export function sortByIndicator(
  list: BairroData[] = bairros,
  indicator: IndicatorDef,
  limit?: number,
): BairroData[] {
  const order = defaultSortOrder(indicator)
  const sorted = [...list].sort((a, b) => {
    const va = getVal(a, indicator.key)
    const vb = getVal(b, indicator.key)
    return order === "desc" ? vb - va : va - vb
  })
  return limit ? sorted.slice(0, limit) : sorted
}

/** Quantile threshold (0–1) — used to color "best" vs "worst" ranks. */
export function quantileOf(value: number, all: number[]): number {
  if (!all.length) return 0.5
  const arr = [...all].sort((a, b) => a - b)
  const pos = arr.findIndex((v) => v >= value)
  return pos === -1 ? 1 : pos / arr.length
}